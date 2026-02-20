import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { getPayload } from "payload";
import config from "@payload-config";
import { generateAuthCookie } from "@/modules/auth/utils";

// Validate required environment variables
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "NEXTAUTH_SECRET is required. Add it to your .env.local file. " +
    "You can generate one with: openssl rand -base64 32"
  );
}

if (!process.env.NEXTAUTH_URL) {
  console.warn(
    "NEXTAUTH_URL is not set. Defaulting to http://localhost:3000. " +
    "Set it in .env.local for production."
  );
}

const { handlers } = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !user.email) {
        return false;
      }

      try {
        const payload = await getPayload({ config });
        
        // Check if user exists by email
        const existingUsers = await payload.find({
          collection: "users",
          where: {
            email: {
              equals: user.email,
            },
          },
          limit: 1,
        });

        const existingUser = existingUsers.docs[0];

        if (existingUser) {
          // Link OAuth account to existing user
          const oauthData: any = {};
          
          // Update name if not set or if OAuth provides a name
          if (user.name && !(existingUser as any).name) {
            oauthData.name = user.name;
          }
          
          if (account.provider === "google") {
            oauthData["oauthProviders.google.id"] = account.providerAccountId;
            oauthData["oauthProviders.google.email"] = user.email;
          } else if (account.provider === "facebook") {
            oauthData["oauthProviders.facebook.id"] = account.providerAccountId;
            oauthData["oauthProviders.facebook.email"] = user.email;
          }

          if (user.image) {
            oauthData.profilePicture = user.image;
          }

          // For OAuth login, we need to ensure the user has a password to log in with Payload CMS
          // Generate a password if user doesn't have one (OAuth-only users)
          const userHasPassword = !!(existingUser as any).password;
          
          let loginPassword: string;
          
          if (!userHasPassword) {
            // User doesn't have a password (OAuth-only user), generate one
            loginPassword = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
            oauthData.password = loginPassword;
          } else {
            // User has existing password - we can't retrieve it, so generate a new one for OAuth sessions
            // Note: This will allow OAuth login but user will need to reset password for email/password login
            loginPassword = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
            oauthData.password = loginPassword;
          }

          // Update user with OAuth data and password
          await payload.update({
            collection: "users",
            id: existingUser.id,
            data: oauthData,
          });

          // Always log in the user with Payload CMS after OAuth authentication
          const loginData = await payload.login({
            collection: "users",
            data: {
              email: user.email!,
              password: loginPassword,
            },
          });

          if (loginData.token) {
            await generateAuthCookie({
              prefix: payload.config.cookiePrefix,
              value: loginData.token,
            });
          }
        } else {
          // Create new user with OAuth data
          const baseUsername = user.name
            ? user.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
            : user.email.split("@")[0].toLowerCase();

          // Ensure username is unique
          let username = baseUsername;
          let counter = 1;
          let isUnique = false;

          while (!isUnique) {
            const checkUser = await payload.find({
              collection: "users",
              where: {
                username: {
                  equals: username,
                },
              },
              limit: 1,
            });

            if (checkUser.docs.length === 0) {
              isUnique = true;
            } else {
              username = `${baseUsername}${counter}`;
              counter++;
            }
          }

          const userData: any = {
            email: user.email,
            username: username,
            roles: ["user"],
          };

          // Save user's full name if available
          if (user.name) {
            userData.name = user.name;
          }

          if (account.provider === "google") {
            userData["oauthProviders.google.id"] = account.providerAccountId;
            userData["oauthProviders.google.email"] = user.email;
          } else if (account.provider === "facebook") {
            userData["oauthProviders.facebook.id"] = account.providerAccountId;
            userData["oauthProviders.facebook.email"] = user.email;
          }

          if (user.image) {
            userData.profilePicture = user.image;
          }

          // Generate random password for OAuth users
          const randomPassword = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
          userData.password = randomPassword;

          const newUser = await payload.create({
            collection: "users",
            data: userData,
          });

          // Generate Payload auth token
          const loginData = await payload.login({
            collection: "users",
            data: {
              email: user.email!,
              password: randomPassword,
            },
          });

          if (loginData.token) {
            await generateAuthCookie({
              prefix: payload.config.cookiePrefix,
              value: loginData.token,
            });
          }
        }

        return true;
      } catch (error) {
        console.error("OAuth sign in error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      // Redirect to homepage after successful login
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});

export const { GET, POST } = handlers;

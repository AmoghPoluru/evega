import { TRPCError } from "@trpc/server";
// @ts-expect-error - Next.js headers module works at runtime with NodeNext resolution
import { headers as getHeaders } from "next/headers";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

import { generateAuthCookie, clearAuthCookie } from "../utils";
import { loginSchema, registerSchema } from "../schemas";

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();

    const session = await ctx.db.auth({ headers });

    return session;
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ input, ctx }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      const existingUser = existingData.docs[0];

      if (existingUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already taken",
        });
      }

      // Check if email already exists
      const existingEmailData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          email: {
            equals: input.email,
          },
        },
      });

      const existingEmailUser = existingEmailData.docs[0];

      if (existingEmailUser) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email already registered",
        });
      }

      // Create user
      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          username: input.username,
          password: input.password, // This will be hashed by Payload
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Failed to login",
        });
      }

      await generateAuthCookie({
        prefix: ctx.db.config.cookiePrefix,
        value: data.token,
      });
    }),
    login: baseProcedure
    .input(loginSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const data = await ctx.db.login({
          collection: "users",
          data: {
            email: input.email,
            password: input.password,
          },
        });

        if (!data.token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid email or password",
          });
        }

        await generateAuthCookie({
          prefix: ctx.db.config.cookiePrefix,
          value: data.token,
        });

        return data;
      } catch (error) {
        // Re-throw TRPCErrors as-is (they already have user-friendly messages)
        if (error instanceof TRPCError) {
          throw error;
        }

        // For any other errors (including Payload authentication errors),
        // throw a user-friendly error message
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password",
        });
      }
    }),
  logout: baseProcedure.mutation(async ({ ctx }) => {
    await clearAuthCookie({
      prefix: ctx.db.config.cookiePrefix,
    });
    return { success: true };
  }),
});

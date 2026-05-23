/**
 * Reset (or create) the app admin user password in MongoDB.
 *
 * Usage:
 *   npm run db:reset-admin-password
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='YourNewPass1!' npm run db:reset-admin-password
 */
import 'dotenv/config';
import { getPayload } from 'payload';
import config from '@payload-config';

const email = process.env.ADMIN_EMAIL?.trim() || 'admin@example.com';
const password = process.env.ADMIN_PASSWORD?.trim() || 'admin123';

async function main() {
  if (!process.env.DATABASE_URL?.trim() && process.env.MONGODB_URI?.trim()) {
    process.env.DATABASE_URL = process.env.MONGODB_URI.trim();
  }
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('❌ Set DATABASE_URL (or MONGODB_URI) in .env');
    process.exit(1);
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  });

  if (existing.docs.length > 0) {
    const user = existing.docs[0];
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        password,
        role: 'admin',
        oauthProvider: 'email',
        username: 'admin',
      },
      overrideAccess: true,
    });
    console.log(`✅ Password updated for ${email}`);
    console.log(`   role: admin (id: ${user.id})`);
  } else {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        username: 'admin',
        role: 'admin',
        oauthProvider: 'email',
      },
      overrideAccess: true,
    });
    console.log(`✅ Admin user created: ${email}`);
  }

  console.log(`\n🔑 Sign in with email + password (not username alone):`);
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`\n   Change defaults: ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run db:reset-admin-password`);
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});

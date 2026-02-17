import "dotenv/config";
import { getPayload } from "payload";
import config from "@payload-config";

// ==================== SEED USERS FUNCTION ====================

const seedUsers = async () => {
  try {
    console.log("🌱 Starting users collection refresh...");
    const payload = await getPayload({ config });

    // Delete all existing users
    const existingUsers = await payload.find({
      collection: "users",
      limit: 1000, // Get all users
    });

    if (existingUsers.docs.length > 0) {
      console.log(`Found ${existingUsers.docs.length} existing user(s), deleting...`);
      for (const user of existingUsers.docs) {
        await payload.delete({
          collection: "users",
          id: user.id,
        });
      }
      console.log("✓ All existing users deleted");
    } else {
      console.log("No existing users found");
    }

    // Create admin user with sample addresses
    const adminUser = await payload.create({
      collection: "users",
      data: {
        email: "admin@example.com",
        password: "admin123",
        username: "admin",
        roles: ["super-admin"],
        shippingAddresses: [
          {
            label: "Home",
            isDefault: true,
            fullName: "Admin User",
            phone: "+1-555-123-4567",
            street: "123 Main Street, Apt 4B",
            city: "Nashville",
            state: "TN",
            zipcode: "37217",
          },
          {
            label: "Work",
            isDefault: false,
            fullName: "Admin User",
            phone: "+1-555-987-6543",
            street: "456 Business Park Drive, Suite 200",
            city: "Nashville",
            state: "TN",
            zipcode: "37203",
          },
        ],
      },
    });
    console.log("✓ Admin user created: admin@example.com / admin123");
    console.log("✓ Added 2 shipping addresses (Home - default, Work)");

    console.log("\n" + "=".repeat(50));
    console.log("✅ Users collection refresh completed successfully!");
    console.log("=".repeat(50));
  } catch (error) {
    console.error("❌ Users refresh failed:", error);
    process.exit(1);
  }
};

seedUsers();

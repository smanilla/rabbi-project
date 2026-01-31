const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const uri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`;
const client = new MongoClient(uri);

// Admin credentials
const adminUser = {
  email: "admin@drone.com",
  password: "admin123", // Will be hashed
  name: "Admin User",
  role: "admin"
};

async function seedAdmin() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const database = client.db(process.env.DB_NAME || "drone");
    const authCollection = database.collection("auth");
    const userCollection = database.collection("users");

    // Check if admin already exists
    const existingAuth = await authCollection.findOne({ email: adminUser.email });
    const existingUser = await userCollection.findOne({ email: adminUser.email });

    if (existingAuth || existingUser) {
      console.log("⚠️  Admin user already exists. Updating role and password to ensure credentials work.");
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      if (existingAuth) {
        await authCollection.updateOne(
          { email: adminUser.email },
          { $set: { password: hashedPassword, name: adminUser.name, emailVerified: true } }
        );
        console.log("✅ Password reset in auth collection");
      }
      if (existingUser) {
        await userCollection.updateOne(
          { email: adminUser.email },
          { $set: { role: "admin", name: adminUser.name, updatedAt: new Date() } }
        );
        console.log("✅ Admin role confirmed in users collection");
      }
      console.log("\n📧 Email:    " + adminUser.email);
      console.log("🔑 Password: " + adminUser.password);
      await client.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Create admin in auth collection (pre-verified)
    const authResult = await authCollection.insertOne({
      email: adminUser.email,
      password: hashedPassword,
      name: adminUser.name,
      emailVerified: true,
      createdAt: new Date()
    });

    // Create admin in users collection
    const userResult = await userCollection.insertOne({
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    " + adminUser.email);
    console.log("🔑 Password: " + adminUser.password);
    console.log("👤 Name:     " + adminUser.name);
    console.log("🔐 Role:     " + adminUser.role);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n💡 You can now login with these credentials!");
    console.log("📍 Go to: http://localhost:3000/login (or your frontend URL)");
    console.log("🎯 Then navigate to: /dashboard to access admin panel\n");

  } catch (error) {
    console.error("❌ Error seeding admin:", error);
  } finally {
    await client.close();
    console.log("🔌 Database connection closed");
  }
}

seedAdmin();

// Quick test script to verify admin user and checkAdmin endpoint
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`;
const client = new MongoClient(uri);

async function testAdmin() {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME || "drone");
    const userCollection = database.collection("users");
    const authCollection = database.collection("auth");

    const email = "admin@drone.com";
    
    console.log("🔍 Checking admin user...\n");
    
    // Check users collection
    const user = await userCollection.findOne({ email });
    console.log("📋 User in 'users' collection:");
    console.log(JSON.stringify(user, null, 2));
    
    // Check auth collection
    const auth = await authCollection.findOne({ email });
    console.log("\n🔐 User in 'auth' collection:");
    console.log(JSON.stringify({ ...auth, password: "***hidden***" }, null, 2));
    
    // Test the checkAdmin logic
    if (user) {
      const isAdmin = user.role === "admin";
      console.log("\n✅ Admin check result:");
      console.log(`   Email: ${email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Is Admin: ${isAdmin ? "✅ YES" : "❌ NO"}`);
      
      if (!isAdmin) {
        console.log("\n⚠️  WARNING: User exists but role is not 'admin'!");
        console.log("   Run: npm run seed-admin");
      }
    } else {
      console.log("\n❌ ERROR: Admin user not found!");
      console.log("   Run: npm run seed-admin");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await client.close();
  }
}

testAdmin();

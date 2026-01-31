const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`;
const client = new MongoClient(uri);

const dummyProducts = [
  {
    title: "DJI Mavic 3 Pro",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 2199,
    descrip: "Professional drone with 4K camera, 46-minute flight time, and advanced obstacle avoidance. Perfect for aerial photography and videography.",
    category: "Professional",
    inStock: true,
    rating: 4.8
  },
  {
    title: "DJI Mini 4 Pro",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 759,
    descrip: "Ultra-lightweight foldable drone under 250g. Features 4K video, 34-minute flight time, and intelligent tracking modes.",
    category: "Consumer",
    inStock: true,
    rating: 4.7
  },
  {
    title: "Autel EVO Lite+",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 1299,
    descrip: "6K camera drone with 40-minute flight time. Features night vision capabilities and 3-way obstacle avoidance.",
    category: "Professional",
    inStock: true,
    rating: 4.6
  },
  {
    title: "Parrot Anafi AI",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 6999,
    descrip: "Enterprise-grade drone with AI capabilities. Designed for inspection, mapping, and surveillance applications.",
    category: "Enterprise",
    inStock: true,
    rating: 4.9
  },
  {
    title: "DJI Air 3",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 1099,
    descrip: "Dual-camera drone with 3x optical zoom. Features 46-minute flight time and omnidirectional obstacle sensing.",
    category: "Consumer",
    inStock: true,
    rating: 4.8
  },
  {
    title: "Skydio 2+",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 999,
    descrip: "Autonomous drone with 360° obstacle avoidance. Perfect for action sports and dynamic tracking scenarios.",
    category: "Consumer",
    inStock: true,
    rating: 4.7
  },
  {
    title: "DJI Phantom 4 Pro V2.0",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 1599,
    descrip: "Professional photography drone with 1-inch 20MP sensor. Features mechanical shutter and 4K video at 60fps.",
    category: "Professional",
    inStock: true,
    rating: 4.9
  },
  {
    title: "Autel X-Star Premium",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 899,
    descrip: "4K UHD camera drone with 25-minute flight time. Includes 3-axis gimbal and intelligent flight modes.",
    category: "Consumer",
    inStock: true,
    rating: 4.5
  },
  {
    title: "DJI Inspire 2",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 3299,
    descrip: "Cinematic drone for professional filmmakers. Supports multiple camera systems and dual-operator control.",
    category: "Professional",
    inStock: true,
    rating: 4.9
  },
  {
    title: "Holy Stone HS720E",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 299,
    descrip: "GPS drone with 4K camera and 26-minute flight time. Great for beginners with intelligent flight modes.",
    category: "Beginner",
    inStock: true,
    rating: 4.4
  },
  {
    title: "Potensic Dreamer Pro",
    img: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=500&h=500&fit=crop",
    price: 399,
    descrip: "4K GPS drone with 25-minute flight time. Features follow me mode and waypoint navigation.",
    category: "Consumer",
    inStock: true,
    rating: 4.3
  },
  {
    title: "DJI FPV Combo",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
    price: 1299,
    descrip: "First-person view racing drone with 4K camera. Experience immersive flight with goggles and controller.",
    category: "Racing",
    inStock: true,
    rating: 4.6
  }
];

async function seedProducts() {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME || "drone");
    const collection = database.collection("products");

    // Clear existing products (optional - comment out if you want to keep existing)
    // await collection.deleteMany({});

    // Insert dummy products
    const result = await collection.insertMany(dummyProducts);
    console.log(`✅ Successfully inserted ${result.insertedCount} products`);
    
    // Display inserted products
    const products = await collection.find({}).toArray();
    console.log("\n📦 Products in database:");
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - $${product.price}`);
    });
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await client.close();
  }
}

seedProducts();

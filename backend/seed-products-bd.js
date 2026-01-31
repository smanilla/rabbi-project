const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`;
const client = new MongoClient(uri);

// Bangladesh-based drone products with prices in Taka
const bangladeshProducts = [
  {
    title: "DJI Mavic 3 Pro - Professional Drone",
    img: "/product1.jpg.jpeg",
    price: 185000, // ৳185,000 Taka
    originalPrice: 210000,
    descrip: "Professional 4K camera drone with 46-minute flight time. Perfect for aerial photography and videography in Bangladesh. Ideal for wedding photography, real estate, and commercial projects.",
    category: "Professional Drone",
    featured: true,
    stock: 5,
    inStock: true,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Mini 4 Pro - Consumer Drone",
    img: "/product3.jpg.jpeg",
    price: 65000, // ৳65,000 Taka
    originalPrice: 75000,
    descrip: "Ultra-lightweight foldable drone under 250g. Features 4K video, 34-minute flight time. Perfect for hobbyists and content creators in Dhaka and other cities.",
    category: "Consumer Drone",
    featured: true,
    stock: 12,
    inStock: true,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Air 3 - Dual Camera Drone",
    img: "/product6.jpg.jpeg",
    price: 95000, // ৳95,000 Taka
    originalPrice: 105000,
    descrip: "Dual-camera drone with 3x optical zoom. Features 46-minute flight time and omnidirectional obstacle sensing. Great for travel photography across Bangladesh.",
    category: "Consumer Drone",
    featured: false,
    stock: 8,
    inStock: true,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Phantom 4 Pro V2.0",
    img: "/product7.jpg.jpeg",
    price: 140000, // ৳140,000 Taka
    originalPrice: 160000,
    descrip: "Professional photography drone with 1-inch 20MP sensor. Features mechanical shutter and 4K video at 60fps. Used by professional photographers in Bangladesh.",
    category: "Professional Drone",
    featured: true,
    stock: 3,
    inStock: true,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI FPV Combo - Racing Drone",
    img: "/product8.jpg.jpeg",
    price: 115000, // ৳115,000 Taka
    originalPrice: 130000,
    descrip: "First-person view racing drone with 4K camera. Experience immersive flight with goggles and controller. Popular among drone racing enthusiasts in Bangladesh.",
    category: "Racing Drone",
    featured: false,
    stock: 6,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Autel EVO Lite+ - 6K Camera Drone",
    img: "/product9.jpg.jpeg",
    price: 110000, // ৳110,000 Taka
    originalPrice: 125000,
    descrip: "6K camera drone with 40-minute flight time. Features night vision capabilities and 3-way obstacle avoidance. Ideal for professional videography in Bangladesh.",
    category: "Professional Drone",
    featured: false,
    stock: 4,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Inspire 2 - Cinematic Drone",
    img: "/product10.jpg.jpeg",
    price: 280000, // ৳280,000 Taka
    originalPrice: 320000,
    descrip: "Cinematic drone for professional filmmakers. Supports multiple camera systems and dual-operator control. Used by film production companies in Bangladesh.",
    category: "Professional Drone",
    featured: true,
    stock: 2,
    inStock: true,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Holy Stone HS720E - GPS Drone",
    img: "/product11.jpg.jpeg",
    price: 25000, // ৳25,000 Taka
    originalPrice: 30000,
    descrip: "GPS drone with 4K camera and 26-minute flight time. Great for beginners with intelligent flight modes. Perfect entry-level drone for Bangladesh market.",
    category: "Beginner Drone",
    featured: false,
    stock: 15,
    inStock: true,
    rating: 4.4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Potensic Dreamer Pro - 4K GPS Drone",
    img: "/product12.jpg.jpeg",
    price: 35000, // ৳35,000 Taka
    originalPrice: 40000,
    descrip: "4K GPS drone with 25-minute flight time. Features follow me mode and waypoint navigation. Popular choice for outdoor adventures in Bangladesh.",
    category: "Consumer Drone",
    featured: false,
    stock: 10,
    inStock: true,
    rating: 4.3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Skydio 2+ - Autonomous Drone",
    img: "/product13.jpg.jpeg",
    price: 85000, // ৳85,000 Taka
    originalPrice: 95000,
    descrip: "Autonomous drone with 360° obstacle avoidance. Perfect for action sports and dynamic tracking scenarios. Great for capturing events in Bangladesh.",
    category: "Consumer Drone",
    featured: false,
    stock: 7,
    inStock: true,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Autel X-Star Premium - 4K UHD Drone",
    img: "/product15.jpg.jpeg",
    price: 78000, // ৳78,000 Taka
    originalPrice: 88000,
    descrip: "4K UHD camera drone with 25-minute flight time. Includes 3-axis gimbal and intelligent flight modes. Suitable for intermediate users in Bangladesh.",
    category: "Consumer Drone",
    featured: false,
    stock: 9,
    inStock: true,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Mavic Air 2S - Advanced Consumer",
    img: "/product16.jpg.jpeg",
    price: 88000, // ৳88,000 Taka
    originalPrice: 98000,
    descrip: "Advanced consumer drone with 1-inch sensor and 5.4K video. Features 31-minute flight time and obstacle sensing. Popular among content creators in Bangladesh.",
    category: "Consumer Drone",
    featured: true,
    stock: 11,
    inStock: true,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Parrot Anafi AI - Enterprise Drone",
    img: "/product17.jpg.jpeg",
    price: 600000, // ৳600,000 Taka
    originalPrice: 650000,
    descrip: "Enterprise-grade drone with AI capabilities. Designed for inspection, mapping, and surveillance applications. Used by government and commercial sectors in Bangladesh.",
    category: "Enterprise Drone",
    featured: true,
    stock: 1,
    inStock: true,
    rating: 4.9,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "DJI Mini 3 - Compact Drone",
    img: "/product18.jpg.jpeg",
    price: 55000, // ৳55,000 Taka
    originalPrice: 65000,
    descrip: "Compact and portable drone with 4K camera. Perfect for travel and everyday photography. Lightweight design ideal for exploring Bangladesh's beautiful landscapes.",
    category: "Consumer Drone",
    featured: false,
    stock: 14,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Camera Accessories Kit",
    img: "/shutterstock_197786339.jpg.jpeg",
    price: 8500, // ৳8,500 Taka
    originalPrice: 10000,
    descrip: "Complete accessories kit including extra batteries, propellers, carrying case, and memory cards. Essential for drone enthusiasts in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 25,
    inStock: true,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Professional Drone Gimbal Stabilizer",
    img: "/shutterstock_291448271.jpg.jpeg",
    price: 12000, // ৳12,000 Taka
    originalPrice: 15000,
    descrip: "3-axis gimbal stabilizer for smooth video recording. Compatible with most professional drones. Perfect for professional videography in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 18,
    inStock: true,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Battery Pack - Extended Flight",
    img: "/shutterstock_309081578.jpg.jpeg",
    price: 6500, // ৳6,500 Taka
    originalPrice: 8000,
    descrip: "High-capacity battery pack for extended flight time. Compatible with DJI and other major brands. Essential for long photography sessions in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 30,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Propeller Set - 4 Pairs",
    img: "/shutterstock_344454695.jpg.jpeg",
    price: 3500, // ৳3,500 Taka
    originalPrice: 4500,
    descrip: "Replacement propeller set with 4 pairs. High-quality carbon fiber construction. Must-have spare parts for drone owners in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 40,
    inStock: true,
    rating: 4.4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Carrying Case - Professional",
    img: "/shutterstock_359803616.jpg.jpeg",
    price: 5500, // ৳5,500 Taka
    originalPrice: 7000,
    descrip: "Hard-shell carrying case with foam padding. Protects your drone during travel across Bangladesh. Fits most consumer and professional drones.",
    category: "Accessories",
    featured: false,
    stock: 20,
    inStock: true,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "FPV Drone Goggles - First Person View",
    img: "/shutterstock_360798107.jpg.jpeg",
    price: 18000, // ৳18,000 Taka
    originalPrice: 22000,
    descrip: "High-quality FPV goggles for immersive drone flying experience. Low latency and HD display. Popular among racing drone enthusiasts in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 12,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Landing Pad - Portable",
    img: "/shutterstock_371332447.jpg.jpeg",
    price: 2500, // ৳2,500 Taka
    originalPrice: 3500,
    descrip: "Portable landing pad for safe takeoff and landing. Waterproof and foldable design. Perfect for outdoor drone operations in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 35,
    inStock: true,
    rating: 4.3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Memory Card - 128GB High Speed",
    img: "/shutterstock_374683993.jpg.jpeg",
    price: 4200, // ৳4,200 Taka
    originalPrice: 5500,
    descrip: "High-speed 128GB memory card for 4K video recording. Class 10 UHS-I compatible. Perfect for capturing long videos in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 50,
    inStock: true,
    rating: 4.6,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Remote Controller - Advanced",
    img: "/shutterstock_376470163.jpg.jpeg",
    price: 15000, // ৳15,000 Taka
    originalPrice: 18000,
    descrip: "Advanced remote controller with extended range and better ergonomics. Features built-in screen and customizable buttons. Upgrade for serious drone pilots in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 8,
    inStock: true,
    rating: 4.8,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Sunshade - Screen Protector",
    img: "/shutterstock_379389916.jpg.jpeg",
    price: 1800, // ৳1,800 Taka
    originalPrice: 2500,
    descrip: "Sunshade for controller screen to improve visibility in bright sunlight. Essential for outdoor flying in Bangladesh's sunny weather.",
    category: "Accessories",
    featured: false,
    stock: 45,
    inStock: true,
    rating: 4.4,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Propeller Guards - Safety",
    img: "/shutterstock_382554793.jpg.jpeg",
    price: 2800, // ৳2,800 Taka
    originalPrice: 4000,
    descrip: "Safety propeller guards to protect propellers and prevent accidents. Recommended for beginners learning to fly drones in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 32,
    inStock: true,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Charging Hub - Multi Battery",
    img: "/shutterstock_388250224.jpg.jpeg",
    price: 8500, // ৳8,500 Taka
    originalPrice: 11000,
    descrip: "Multi-battery charging hub for fast charging. Charges up to 4 batteries simultaneously. Time-saving solution for professional drone operators in Bangladesh.",
    category: "Accessories",
    featured: false,
    stock: 15,
    inStock: true,
    rating: 4.7,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: "Drone Storage Bag - Waterproof",
    img: "/shutterstock_389888689.jpg.jpeg",
    price: 3200, // ৳3,200 Taka
    originalPrice: 4500,
    descrip: "Waterproof storage bag for drone and accessories. Protects equipment from rain and humidity. Essential for Bangladesh's monsoon season.",
    category: "Accessories",
    featured: false,
    stock: 38,
    inStock: true,
    rating: 4.5,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedBangladeshProducts() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");
    
    const database = client.db(process.env.DB_NAME || "drone");
    const collection = database.collection("products");

    // Clear existing products (optional - comment out if you want to keep existing)
    console.log("🗑️  Clearing existing products...");
    await collection.deleteMany({});
    console.log("✅ Existing products cleared");

    // Insert Bangladesh products
    console.log("\n📦 Inserting Bangladesh products...");
    const result = await collection.insertMany(bangladeshProducts);
    console.log(`✅ Successfully inserted ${result.insertedCount} products`);
    
    // Display inserted products
    const products = await collection.find({}).toArray();
    console.log("\n📋 Products in database:");
    console.log("=".repeat(80));
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ৳${product.price.toLocaleString('en-BD')} (${product.category})`);
    });
    
    console.log("\n✅ Bangladesh products seeded successfully!");
    console.log("💰 All prices are in Bangladeshi Taka (BDT)");
    console.log("📍 Products are tailored for Bangladesh market");
  } catch (error) {
    console.error("❌ Error seeding products:", error);
  } finally {
    await client.close();
    console.log("\n🔌 Database connection closed");
  }
}

seedBangladeshProducts();

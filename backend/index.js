const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Serve uploaded files statically
app.use("/uploads", express.static(uploadsDir));

// MongoDB connection - supports both local and Atlas
const uri = process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`;
const client = new MongoClient(uri);

// Global database reference
let database;
let pakageCollection;
let orderCollection;
let ratingCollection;
let userCollection;
let authCollection;

// Helper function to get collections
function getCollections() {
  if (!database) {
    return null;
  }
  return {
    productsCollection: database.collection("products"),
    orderCollection: database.collection("orders"),
    ratingCollection: database.collection("rating"),
    userCollection: database.collection("users"),
    authCollection: database.collection("auth"),
    cartCollection: database.collection("carts"),
    wishlistCollection: database.collection("wishlists"),
    categoriesCollection: database.collection("categories")
  };
}

// Middleware to check database connection
function checkDatabase(req, res, next) {
  if (!database) {
    return res.status(503).json({ 
      error: "Database not connected. Please check MongoDB connection." 
    });
  }
  next();
}

// ========== API ROUTES ==========

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Drone server is running",
    database: database ? "connected" : "disconnected"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    database: database ? "connected" : "disconnected",
    timestamp: new Date().toISOString()
  });
});

// ========== FILE UPLOAD ENDPOINTS ==========

// Upload product image
app.post("/upload/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Return the file URL
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Delete uploaded image
app.delete("/upload/image/:filename", (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: "Image deleted successfully" });
    } else {
      res.status(404).json({ error: "File not found" });
    }
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ error: "Failed to delete image" });
  }
});

// GET Products API with filtering, search, and pagination
app.get("/products", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    
    // Query parameters
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      page = 1,
      limit = 12
    } = req.query;
    
    // Build query
    const query = {};
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await productsCollection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();
    
    const total = await productsCollection.countDocuments(query);
    
    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST Product API
app.post("/products", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    const product = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      sales: 0
    };
    const result = await productsCollection.insertOne(product);
    res.status(201).json({ 
      success: true, 
      productId: result.insertedId,
      message: "Product created successfully"
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

// GET Featured Products (must come before /products/:id)
app.get("/products/featured", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    const products = await productsCollection
      .find({ featured: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray();
    
    // If no featured products, get latest products
    if (products.length === 0) {
      const latestProducts = await productsCollection
        .find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .toArray();
      return res.json(latestProducts);
    }
    
    res.json(products);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    res.status(500).json({ error: "Failed to fetch featured products" });
  }
});

// GET Single Product (must come after /products/featured)
app.get("/products/:id", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    const id = req.params.id;
    
    // Don't treat "featured" as an ID
    if (id === "featured") {
      return res.status(404).json({ error: "Use /products/featured endpoint" });
    }
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const query = { _id: new ObjectId(id) };
    const product = await productsCollection.findOne(query);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Increment views
    await productsCollection.updateOne(query, { $inc: { views: 1 } });
    
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// POST ORDER API
app.post("/orders", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection, cartCollection } = collections;
    const order = req.body;
    
    // Generate tracking number
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create order with tracking and status
    const orderData = {
      ...order,
      trackingNumber,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          status: "Pending",
          date: new Date(),
          description: "Order placed successfully"
        }
      ]
    };
    
    const result = await orderCollection.insertOne(orderData);
    
    // Clear cart after order
    if (order.email) {
      await cartCollection.updateOne(
        { email: order.email },
        { $set: { items: [] } }
      );
    }
    
    console.log("Order created:", result.insertedId);
    res.json({ 
      ...result, 
      trackingNumber,
      orderId: result.insertedId
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET Orders API with filtering
app.get("/orders", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection } = collections;
    const { email, status } = req.query;
    
    const query = {};
    if (email) query.email = email;
    if (status) query.status = status;
    
    const orders = await orderCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// DELETE API Manage Order
app.delete("/orders/:id", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection } = collections;
    const id = req.params.id;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    
    const query = { _id: new ObjectId(id) };
    const result = await orderCollection.deleteOne(query);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// PUT Update Product
app.put("/products/:id", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Product updated successfully",
      ...result
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE Product
app.delete("/products/:id", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { productsCollection } = collections;
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }
    
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    res.json({ 
      success: true, 
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// POST Rating API
app.post("/ratings", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { ratingCollection, productsCollection } = collections;
    const rating = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await ratingCollection.insertOne(rating);
    
    // Update product rating average
    if (rating.productId) {
      const ratings = await ratingCollection.find({ productId: rating.productId }).toArray();
      const avgRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
      await productsCollection.updateOne(
        { _id: new ObjectId(rating.productId) },
        { $set: { averageRating: avgRating, totalRatings: ratings.length } }
      );
    }
    
    res.status(201).json({ 
      success: true, 
      ratingId: result.insertedId,
      message: "Rating added successfully"
    });
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({ error: "Failed to create rating" });
  }
});

// GET Rating API
app.get("/ratings", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { ratingCollection } = collections;
    const { productId } = req.query;
    
    const query = productId ? { productId } : {};
    const ratings = await ratingCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

// POST User Info
app.post("/addUserInfo", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const userData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await userCollection.insertOne(userData);
    res.status(201).json({ 
      success: true, 
      userId: result.insertedId,
      message: "User info added successfully"
    });
  } catch (error) {
    console.error("Error adding user info:", error);
    res.status(500).json({ error: "Failed to add user info" });
  }
});

// PUT User Info
app.put("/addUserInfo", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const user = {
      ...req.body,
      updatedAt: new Date()
    };
    const filter = { email: user.email };
    const options = { upsert: true };
    const updateDoc = { $set: user };
    const result = await userCollection.updateOne(filter, updateDoc, options);
    res.json({ 
      success: true, 
      message: "User info updated successfully",
      ...result
    });
  } catch (error) {
    console.error("Error updating user info:", error);
    res.status(500).json({ error: "Failed to update user info" });
  }
});

// Make Admin
app.put("/makeAdmin", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const filter = { email: req.body.email };
    const user = await userCollection.findOne(filter);
    
    if (user) {
      const result = await userCollection.updateOne(filter, {
        $set: { 
          role: "admin",
          updatedAt: new Date()
        },
      });
      res.json({ success: true, message: "Admin role updated successfully" });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error making admin:", error);
    res.status(500).json({ error: "Failed to make admin" });
  }
});

// Check Admin
app.get("/checkAdmin/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const user = await userCollection.findOne({ email: req.params.email });
    
    if (user) {
      res.json({ 
        isAdmin: user.role === "admin",
        user: {
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } else {
      res.json({ isAdmin: false, user: null });
    }
  } catch (error) {
    console.error("Error checking admin:", error);
    res.status(500).json({ error: "Failed to check admin status" });
  }
});

// ========== AUTHENTICATION ENDPOINTS ==========

// Register new user (Simple email/password signup)
app.post("/register", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { authCollection, userCollection } = collections;
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name are required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Check if user already exists
    const existingUser = await authCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in auth collection
    const authResult = await authCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date()
    });

    // Create user info in users collection
    await userCollection.insertOne({
      email,
      name,
      role: "user",
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "User registered successfully",
      userId: authResult.insertedId
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login user (Simple email/password signin)
app.post("/login", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { authCollection, userCollection } = collections;
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await authCollection.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Get user info
    const userInfo = await userCollection.findOne({ email });

    res.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        displayName: user.name,
        role: userInfo?.role || "user"
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Get current user
app.get("/user/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const { email } = req.params;
    const user = await userCollection.findOne({ email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// ========== CART ENDPOINTS ==========

// Add to cart (must come before /cart/:email to avoid route conflicts)
app.post("/cart/add", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ 
        error: "Database not connected. Please check MongoDB connection.",
        success: false
      });
    }
    const { cartCollection } = collections;
    const { email, product, quantity = 1, variation } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ error: "Email is required", success: false });
    }
    if (!product || !product._id) {
      return res.status(400).json({ error: "Product information is required", success: false });
    }

    let cart = await cartCollection.findOne({ email });
    
    if (!cart) {
      cart = { email, items: [], updatedAt: new Date(), createdAt: new Date() };
    }

    const existingItemIndex = cart.items.findIndex(
      item => (item.productId === product._id && item.variation === variation) || 
              (item.productId === product._id && !item.variation && !variation)
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        title: product.title || "Unknown Product",
        img: product.img || product.image || "",
        price: variation && product.variations ? 
          product.variations.find(v => v.name === variation)?.price || product.price : 
          product.price,
        quantity: quantity,
        variation: variation || null
      });
    }

    cart.updatedAt = new Date();

    const result = await cartCollection.updateOne(
      { email },
      { $set: cart },
      { upsert: true }
    );

    // Fetch updated cart to return
    const updatedCart = await cartCollection.findOne({ email });

    res.json({ 
      success: true, 
      cart: updatedCart ? updatedCart.items : [],
      message: "Item added to cart successfully"
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ 
      error: "Failed to add to cart: " + error.message,
      success: false
    });
  }
});

// Get user cart (must come after /cart/add to avoid route conflicts)
app.get("/cart/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { cartCollection } = collections;
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    const cart = await cartCollection.findOne({ email });
    res.json(cart && cart.items ? cart.items : []);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart: " + error.message });
  }
});

// Update cart item quantity
app.put("/cart/update", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { cartCollection } = collections;
    const { email, productId, quantity, variation } = req.body;

    const cart = await cartCollection.findOne({ email });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.productId === productId && item.variation === variation
    );
    
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    cart.updatedAt = new Date();
    await cartCollection.updateOne({ email }, { $set: cart });
    res.json({ success: true, cart: cart.items });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

// Remove from cart
app.delete("/cart/remove", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { cartCollection } = collections;
    const { email, productId, variation } = req.body;

    const cart = await cartCollection.findOne({ email });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => !(item.productId === productId && item.variation === variation)
    );
    
    cart.updatedAt = new Date();
    await cartCollection.updateOne({ email }, { $set: cart });
    res.json({ success: true, cart: cart.items });
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Clear cart
app.delete("/cart/clear/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { cartCollection } = collections;
    const { email } = req.params;
    await cartCollection.updateOne(
      { email }, 
      { $set: { items: [], updatedAt: new Date() } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

// ========== WISHLIST ENDPOINTS ==========

// Get user wishlist
app.get("/wishlist/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { wishlistCollection } = collections;
    const { email } = req.params;
    const wishlist = await wishlistCollection.findOne({ email });
    res.json(wishlist ? wishlist.items : []);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// Add to wishlist
app.post("/wishlist/add", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { wishlistCollection } = collections;
    const { email, productId } = req.body;

    let wishlist = await wishlistCollection.findOne({ email });
    
    if (!wishlist) {
      wishlist = { email, items: [], createdAt: new Date() };
    }

    if (!wishlist.items.includes(productId)) {
      wishlist.items.push(productId);
      wishlist.updatedAt = new Date();
      
      await wishlistCollection.updateOne(
        { email },
        { $set: wishlist },
        { upsert: true }
      );
    }

    res.json({ success: true, wishlist: wishlist.items });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
});

// Remove from wishlist
app.delete("/wishlist/remove", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { wishlistCollection } = collections;
    const { email, productId } = req.body;

    const wishlist = await wishlistCollection.findOne({ email });
    if (!wishlist) {
      return res.status(404).json({ error: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(id => id !== productId);
    wishlist.updatedAt = new Date();
    
    await wishlistCollection.updateOne({ email }, { $set: wishlist });
    res.json({ success: true, wishlist: wishlist.items });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
});

// Check if product is in wishlist
app.get("/wishlist/:email/check/:productId", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { wishlistCollection } = collections;
    const { email, productId } = req.params;
    const wishlist = await wishlistCollection.findOne({ email });
    const isInWishlist = wishlist ? wishlist.items.includes(productId) : false;
    res.json({ isInWishlist });
  } catch (error) {
    console.error("Error checking wishlist:", error);
    res.status(500).json({ error: "Failed to check wishlist" });
  }
});

// ========== CATEGORIES ENDPOINTS ==========

// Get all categories
app.get("/categories", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { categoriesCollection, productsCollection } = collections;
    
    // Get categories from collection or extract from products
    let categories = await categoriesCollection.find({}).toArray();
    
    if (categories.length === 0) {
      // Extract unique categories from products
      const products = await productsCollection.find({}).toArray();
      const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];
      categories = uniqueCategories.map(cat => ({ name: cat, slug: cat.toLowerCase().replace(/\s+/g, '-') }));
    }
    
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

// ========== ORDER TRACKING ENDPOINTS ==========

// Update order status
app.put("/orders/:id/status", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection } = collections;
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const updateDoc = { 
      $set: { 
        status,
        updatedAt: new Date()
      },
      $push: {
        statusHistory: {
          status,
          date: new Date(),
          description: `Order status changed to ${status}`
        }
      }
    };

    if (trackingNumber) {
      updateDoc.$set.trackingNumber = trackingNumber;
    }

    const result = await orderCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: "Order status updated" });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get order by tracking number
app.get("/orders/track/:trackingNumber", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection } = collections;
    const { trackingNumber } = req.params;
    const order = await orderCollection.findOne({ trackingNumber });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Get order with status history
app.get("/orders/:id/details", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { orderCollection } = collections;
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }
    
    const order = await orderCollection.findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

// ========== DATABASE CONNECTION ==========

async function run() {
  try {
    await client.connect();
    database = client.db(process.env.DB_NAME || "drone");
    console.log("✅ Connected to MongoDB");
    console.log("📦 Database:", process.env.DB_NAME || "drone");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

// Initialize database connection
run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log("🚀 Server running at port", port);
  console.log("📍 API endpoints available at http://localhost:" + port);
});

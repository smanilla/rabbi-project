const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const crypto = require("crypto");
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

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
    
    // Send order confirmation & invoice email (non-blocking; order still succeeds if email fails)
    const recipientEmail = order.shippingAddress?.email || order.email;
    if (recipientEmail) {
      sendOrderConfirmationEmail(recipientEmail, orderData).catch((err) =>
        console.error("Order email error:", err.message)
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

// DELETE Rating/Review (admin)
app.delete("/ratings/:id", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { ratingCollection } = collections;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid review ID" });
    }

    const result = await ratingCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting rating:", error);
    res.status(500).json({ error: "Failed to delete review" });
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

// ========== EMAIL VERIFICATION ==========

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const VERIFY_EXPIRY_HOURS = 24;

function getEmailTransporter() {
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
  if (user && pass) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || "gmail",
      auth: { user, pass },
    });
  }
  return null;
}

const SITE_NAME = process.env.SITE_NAME || "Drone";
const SITE_DESCRIPTION = process.env.SITE_DESCRIPTION || "Your trusted destination for drones, cameras, and aerial solutions.";

async function sendVerificationEmail(email, name, token) {
  const transporter = getEmailTransporter();
  if (!transporter) {
    throw new Error("EMAIL_NOT_CONFIGURED");
  }

  const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email - ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">${SITE_NAME}</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;line-height:1.4;">${SITE_DESCRIPTION}</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 16px;color:#333;font-size:16px;line-height:1.6;">Hi ${(name || "User").replace(/</g, "&lt;")},</p>
              <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.6;">Thanks for signing up. Please verify your email address by clicking the button below so you can access your account.</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 24px;">
                <tr>
                  <td>
                    <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:#0d6efd;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;border-radius:8px;">Verify Email</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#888;font-size:13px;">Or copy and paste this link into your browser:</p>
              <p style="margin:0 0 24px;word-break:break-all;color:#0d6efd;font-size:13px;">${verifyUrl}</p>
              <p style="margin:0;color:#888;font-size:13px;">This link expires in ${VERIFY_EXPIRY_HOURS} hours.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;padding:24px 40px;border-top:1px solid #eee;">
              <p style="margin:0 0 8px;color:#666;font-size:13px;line-height:1.5;">You received this email because you signed up at <strong>${SITE_NAME}</strong>.</p>
              <p style="margin:0;color:#999;font-size:12px;">If you did not create an account, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `"${SITE_NAME}" <noreply@drone.com>`,
    to: email,
    subject: `Verify your email - ${SITE_NAME}`,
    html,
  });
}

// Send order confirmation & invoice email
async function sendOrderConfirmationEmail(toEmail, orderData) {
  const transporter = getEmailTransporter();
  if (!transporter || !toEmail) return;

  const items = orderData.items || [];
  const shipping = orderData.shippingAddress || {};
  const payment = orderData.payment || {};
  const trackingNumber = orderData.trackingNumber || "";
  const orderDate = orderData.createdAt
    ? new Date(orderData.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
  const subtotal = Number(orderData.subtotal) || 0;
  const shippingCost = Number(orderData.shippingCost) || 0;
  const total = Number(orderData.total) || subtotal + shippingCost;

  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px;border-bottom:1px solid #eee;color:#333;">${(item.title || "Item").replace(/</g, "&lt;")}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity || 1}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">৳${Number(item.price || 0).toLocaleString("en-BD")}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">৳${(Number(item.price || 0) * (item.quantity || 1)).toLocaleString("en-BD")}</td>
    </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - ${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">${SITE_NAME}</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:14px;">Order Confirmation & Invoice</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 20px;color:#333;font-size:16px;">Thank you for your order. Below are your order details.</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;background:#f8f9fa;border-radius:8px;padding:16px;">
                <tr>
                  <td style="padding:4px 0;"><strong style="color:#555;">Order / Tracking:</strong></td>
                  <td style="padding:4px 0;color:#0d6efd;font-weight:600;">${trackingNumber}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong style="color:#555;">Date:</strong></td>
                  <td style="padding:4px 0;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;"><strong style="color:#555;">Payment:</strong></td>
                  <td style="padding:4px 0;">${(payment.method || "N/A").replace(/</g, "&lt;")}</td>
                </tr>
              </table>
              <h3 style="margin:0 0 12px;color:#333;font-size:16px;">Shipping Address</h3>
              <p style="margin:0 0 20px;color:#555;font-size:14px;line-height:1.6;">
                ${(shipping.fullName || "").replace(/</g, "&lt;")}<br/>
                ${(shipping.address || "").replace(/</g, "&lt;")}<br/>
                ${(shipping.city || "").replace(/</g, "&lt;")}${shipping.postalCode ? " - " + shipping.postalCode : ""}<br/>
                ${(shipping.country || "").replace(/</g, "&lt;")}<br/>
                ${(shipping.phone || "").replace(/</g, "&lt;")}
              </p>
              <h3 style="margin:0 0 12px;color:#333;font-size:16px;">Order Items</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #eee;border-radius:8px;margin-bottom:20px;">
                <thead>
                  <tr style="background:#f8f9fa;">
                    <th style="padding:12px;text-align:left;border-bottom:1px solid #eee;color:#555;font-size:13px;">Product</th>
                    <th style="padding:12px;text-align:center;border-bottom:1px solid #eee;color:#555;font-size:13px;">Qty</th>
                    <th style="padding:12px;text-align:right;border-bottom:1px solid #eee;color:#555;font-size:13px;">Unit Price</th>
                    <th style="padding:12px;text-align:right;border-bottom:1px solid #eee;color:#555;font-size:13px;">Total</th>
                  </tr>
                </thead>
                <tbody>${itemsRows}</tbody>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:16px;">
                <tr><td style="padding:6px 0;color:#555;">Subtotal</td><td style="padding:6px 0;text-align:right;">৳${subtotal.toLocaleString("en-BD")}</td></tr>
                <tr><td style="padding:6px 0;color:#555;">Shipping</td><td style="padding:6px 0;text-align:right;">৳${shippingCost.toLocaleString("en-BD")}</td></tr>
                <tr style="border-top:2px solid #333;"><td style="padding:12px 0;font-weight:700;color:#333;">Total</td><td style="padding:12px 0;text-align:right;font-weight:700;">৳${total.toLocaleString("en-BD")}</td></tr>
              </table>
              ${orderData.notes ? `<p style="margin:0;color:#888;font-size:13px;"><strong>Note:</strong> ${(orderData.notes || "").replace(/</g, "&lt;")}</p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="background:#f8f9fa;padding:20px 40px;border-top:1px solid #eee;">
              <p style="margin:0;color:#666;font-size:13px;">You received this email because you placed an order at <strong>${SITE_NAME}</strong>.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || `"${SITE_NAME}" <noreply@drone.com>`,
      to: toEmail,
      subject: `Order Confirmation - ${trackingNumber} - ${SITE_NAME}`,
      html,
    });
    console.log("Order confirmation email sent to:", toEmail);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
  }
}

// ========== AUTHENTICATION ENDPOINTS ==========

// Register new user (with real email verification)
app.post("/register", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }

    // Require email service for real verification emails
    if (!getEmailTransporter()) {
      return res.status(503).json({
        error: "Email service is not configured. Verification emails cannot be sent. Please contact the administrator.",
        code: "EMAIL_NOT_CONFIGURED",
      });
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

    // Verification token (expires in 24h)
    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create user in auth collection (unverified)
    const authResult = await authCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      emailVerified: false,
      emailVerifyToken,
      emailVerifyExpires,
      createdAt: new Date()
    });

    // Create user info in users collection
    await userCollection.insertOne({
      email,
      name,
      role: "user",
      createdAt: new Date()
    });

    // Send real verification email
    await sendVerificationEmail(email, name, emailVerifyToken);

    res.json({ 
      success: true, 
      message: "Registration successful. Please check your email to verify your account.",
      userId: authResult.insertedId,
      emailSent: true
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message === "EMAIL_NOT_CONFIGURED") {
      return res.status(503).json({
        error: "Email service is not configured. Please contact the administrator.",
        code: "EMAIL_NOT_CONFIGURED",
      });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify email (user clicks link in email)
app.get("/verify-email/:token", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { authCollection } = collections;
    const { token } = req.params;

    const auth = await authCollection.findOne({
      emailVerifyToken: token,
      emailVerifyExpires: { $gt: new Date() },
    });

    if (!auth) {
      return res.status(400).json({ error: "Invalid or expired verification link. Please request a new one." });
    }

    await authCollection.updateOne(
      { email: auth.email },
      {
        $set: { emailVerified: true, updatedAt: new Date() },
        $unset: { emailVerifyToken: "", emailVerifyExpires: "" },
      }
    );

    res.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Resend verification email
app.post("/resend-verification-email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    if (!getEmailTransporter()) {
      return res.status(503).json({
        error: "Email service is not configured. Please contact the administrator.",
        code: "EMAIL_NOT_CONFIGURED",
      });
    }

    const { authCollection } = collections;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const auth = await authCollection.findOne({ email });
    if (!auth) {
      return res.status(404).json({ error: "No account found with this email" });
    }
    if (auth.emailVerified) {
      return res.status(400).json({ error: "Email is already verified. You can log in." });
    }

    const emailVerifyToken = crypto.randomBytes(32).toString("hex");
    const emailVerifyExpires = new Date(Date.now() + VERIFY_EXPIRY_HOURS * 60 * 60 * 1000);

    await authCollection.updateOne(
      { email },
      { $set: { emailVerifyToken, emailVerifyExpires, updatedAt: new Date() } }
    );

    await sendVerificationEmail(email, auth.name, emailVerifyToken);

    res.json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to send verification email" });
  }
});

// Login user (requires verified email)
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

    // Require email verification (allow legacy users who have no emailVerified field)
    if (user.emailVerified === false) {
      return res.status(403).json({
        error: "Please verify your email before logging in. Check your inbox or request a new verification link.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // Get user info
    const userInfo = await userCollection.findOne({ email });

    // Block deactivated accounts
    if (userInfo && userInfo.active === false) {
      return res.status(403).json({
        error: "Your account has been deactivated. Please contact support.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

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

// ========== MANAGE USERS (admin) ==========

// List all users (for admin manage users)
app.get("/users", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const users = await userCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    // Return without sensitive data; include active (default true if missing)
    const list = users.map((u) => ({
      _id: u._id,
      email: u.email,
      name: u.name,
      role: u.role || "user",
      active: u.active !== false,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
    res.json(list);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Update user status (activate/deactivate)
app.put("/users/status", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { userCollection } = collections;
    const { email, active } = req.body;
    if (!email || typeof active !== "boolean") {
      return res.status(400).json({ error: "Email and active (boolean) are required" });
    }
    const result = await userCollection.updateOne(
      { email },
      { $set: { active, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ success: true, message: active ? "User activated" : "User deactivated" });
  } catch (error) {
    console.error("Error updating user status:", error);
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete user (removes from auth, users, cart, wishlist)
app.delete("/users/:email", checkDatabase, async (req, res) => {
  try {
    const collections = getCollections();
    if (!collections) {
      return res.status(503).json({ error: "Database not connected" });
    }
    const { authCollection, userCollection, cartCollection, wishlistCollection } = collections;
    const email = decodeURIComponent(req.params.email);
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const userExists = await userCollection.findOne({ email }) || await authCollection.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }
    await authCollection.deleteOne({ email });
    await userCollection.deleteOne({ email });
    await cartCollection.deleteOne({ email });
    await wishlistCollection.deleteOne({ email });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
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
  const dbName = process.env.DB_NAME || "drone";
  const displayUri = (process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "27017"}`)
    .replace(/\/\/([^:]+):([^@]+)@/, "//$1:****@"); // hide password in logs
  console.log("🔄 Connecting to MongoDB:", displayUri);
  try {
    await client.connect();
    database = client.db(dbName);
    console.log("✅ Connected to MongoDB");
    console.log("📦 Database:", dbName);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("   Make sure MongoDB is running (local or Atlas) and the URI in .env is correct.");
  }
}

// Initialize database connection
run().catch(console.dir);

// Start server
app.listen(port, () => {
  console.log("🚀 Server running at port", port);
  console.log("📍 API endpoints available at http://localhost:" + port);
});

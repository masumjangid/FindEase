const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const lostRoutes = require("./routes/lost");
const authRoutes = require("./routes/auth");
const claimsRoutes = require("./routes/claims");
const User = require("./models/User");

const app = express();

const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// CORS – allow frontend origin(s) from env or all in dev
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN
      ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
      : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    dbReady: mongoose.connection.readyState === 1,
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/lost", lostRoutes);
app.use("/api/claims", claimsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

// Global error handler (must have 4 args for Express to treat as error handler)
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({
    message: "Unhandled server error.",
    error: err?.message,
  });
});

async function start() {
  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env file");
    process.exit(1);
  }

  if (MONGODB_URI.includes("<cluster>") || MONGODB_URI.includes("<dbName>")) {
    console.error("❌ Replace <cluster> and <dbName> in server/.env with your real MongoDB Atlas values.");
    console.error("   Get the full URI from: MongoDB Atlas → your cluster → Connect → Drivers → Node.js");
    console.error("   It should look like: mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/findease?retryWrites=...");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      bufferCommands: false,
    });
    console.log("✅ MongoDB connected");

    const adminEmail = process.env.ADMIN_EMAIL || "admin@poornima.edu.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";
    const existingAdmin = await User.findOne({ role: "admin" });
    if (!existingAdmin) {
      await User.create({
        name: "FindEase Admin",
        email: adminEmail.trim().toLowerCase(),
        password: adminPassword,
        role: "admin",
      });
      console.log("✅ Admin user created. Login with ADMIN_EMAIL and ADMIN_PASSWORD from .env (default: admin@poornima.edu.in / Admin@123)");
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log("\n🛑 Shutting down...");
      server.close(() => {
        mongoose.connection.close(false).then(() => {
          console.log("✅ Server and DB closed");
          process.exit(0);
        });
      });
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

start();

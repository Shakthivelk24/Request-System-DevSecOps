import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";

import connectDB from "./config/db.js";

import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";

import register from "./metrics/metrics.js";
import httpMetrics from "./metrics/httpMetrics.js";

const app = express();

// ============================================================
// Middleware
// ============================================================

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// ============================================================
// Prometheus HTTP Metrics
// ============================================================

app.use(httpMetrics);

// ============================================================
// Health Check
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "backend",
  });
});

// ============================================================
// Prometheus Metrics
// ============================================================

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// ============================================================
// Routes
// ============================================================

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

// ============================================================
// Start Server
// ============================================================

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);
  }
};

startServer();
import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";
import "dotenv/config.js";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import register from "./metrics/metrics.js";
import httpMetrics from "./metrics/httpMetrics.js";

connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
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
// Prometheus Metrics Endpoint
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

const port = process.env.PORT;

app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running at http://localhost:${port}`);
});
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config.js";

import userRoutes from "./routes/user.routes.js";
import requestRoutes from "./routes/request.routes.js";

import register from "./metrics/metrics.js";
import httpMetrics from "./metrics/httpMetrics.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(httpMetrics);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "backend",
  });
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);

export default app;
import request from "supertest";
import app from "../app.js";

describe("Backend API", () => {
  test("GET /api/health should return service status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: "UP",
      service: "backend",
    });
  });

  test("GET /metrics should return Prometheus metrics", async () => {
    const response = await request(app).get("/metrics");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/plain");
  });
});
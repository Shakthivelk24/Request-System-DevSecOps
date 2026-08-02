import { jest } from "@jest/globals";

const httpRequestsTotal = {
  inc: jest.fn(),
};

const endTimer = jest.fn();

const httpRequestDuration = {
  startTimer: jest.fn(() => endTimer),
};

const serverErrorCounter = {
  inc: jest.fn(),
};

jest.unstable_mockModule("../metrics/metrics.js", () => ({
  httpRequestsTotal,
  httpRequestDuration,
  serverErrorCounter,
}));

const { default: httpMetrics } = await import("../metrics/httpMetrics.js");

describe("HTTP Metrics Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should record successful request metrics", () => {
    const listeners = {};

    const req = {
      method: "GET",
      originalUrl: "/users",
    };

    const res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
    };

    const next = jest.fn();

    httpMetrics(req, res, next);

    expect(next).toHaveBeenCalled();

    listeners.finish();

    expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
      method: "GET",
      route: "/users",
      status: 200,
    });

    expect(endTimer).toHaveBeenCalledWith({
      method: "GET",
      route: "/users",
      status: 200,
    });

    expect(serverErrorCounter.inc).not.toHaveBeenCalled();
  });

  test("should increment server error counter for 500 response", () => {
    const listeners = {};

    const req = {
      method: "POST",
      originalUrl: "/login",
    };

    const res = {
      statusCode: 500,
      on: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
    };

    const next = jest.fn();

    httpMetrics(req, res, next);

    listeners.finish();

    expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
      method: "POST",
      route: "/login",
      status: 500,
    });

    expect(endTimer).toHaveBeenCalledWith({
      method: "POST",
      route: "/login",
      status: 500,
    });

    expect(serverErrorCounter.inc).toHaveBeenCalledTimes(1);
  });

  test("should use req.route.path when available", () => {
    const listeners = {};

    const req = {
      method: "GET",
      route: {
        path: "/users/:id",
      },
      originalUrl: "/users/1",
    };

    const res = {
      statusCode: 200,
      on: jest.fn((event, callback) => {
        listeners[event] = callback;
      }),
    };

    httpMetrics(req, res, jest.fn());

    listeners.finish();

    expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
      method: "GET",
      route: "/users/:id",
      status: 200,
    });
  });
  test("should use req.path when route and originalUrl are unavailable", () => {
  const listeners = {};

  const req = {
    method: "GET",
    path: "/health",
  };

  const res = {
    statusCode: 200,
    on: jest.fn((event, callback) => {
      listeners[event] = callback;
    }),
  };

  const next = jest.fn();

  httpMetrics(req, res, next);

  listeners.finish();

  expect(httpRequestsTotal.inc).toHaveBeenCalledWith({
    method: "GET",
    route: "/health",
    status: 200,
  });

  expect(endTimer).toHaveBeenCalledWith({
    method: "GET",
    route: "/health",
    status: 200,
  });

  expect(next).toHaveBeenCalled();
});
});
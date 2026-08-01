import { jest } from "@jest/globals";

const mockVerify = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    verify: mockVerify,
  },
}));

const { default: isAuth } = await import("../middleware/auth.js");

const createRes = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

describe("Authentication Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secret";
  });

  test("should authenticate valid token", async () => {
    mockVerify.mockReturnValue({
      id: "user123",
    });

    const req = {
      cookies: {
        token: "jwt-token",
      },
    };

    const res = createRes();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(mockVerify).toHaveBeenCalledWith(
      "jwt-token",
      "secret"
    );

    expect(req.userId).toBe("user123");

    expect(next).toHaveBeenCalled();
  });

  test("should return unauthorized when token is missing", async () => {
    const req = {
      cookies: {},
    };

    const res = createRes();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should return unauthorized for invalid token", async () => {
    mockVerify.mockImplementation(() => {
      throw new Error("Invalid Token");
    });

    const req = {
      cookies: {
        token: "invalid-token",
      },
    };

    const res = createRes();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });

    expect(next).not.toHaveBeenCalled();
  });

  test("should return unauthorized when jwt throws", async () => {
    mockVerify.mockImplementation(() => {
  throw new Error("JWT Error");
});

    const req = {
      cookies: {
        token: "jwt-token",
      },
    };

    const res = createRes();

    const next = jest.fn();

    await isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);

    expect(res.json).toHaveBeenCalledWith({
      message: "Unauthorized",
    });
  });
});
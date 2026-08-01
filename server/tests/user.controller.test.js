import { jest } from "@jest/globals";

const mockUser = jest.fn();

mockUser.findOne = jest.fn();
mockUser.findById = jest.fn();
mockUser.prototype.save = jest.fn();

const mockGenerateToken = jest.fn();

const mockBcrypt = {
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
};

jest.unstable_mockModule("../models/user.model.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../config/token.js", () => ({
  default: mockGenerateToken,
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: mockBcrypt,
}));

jest.unstable_mockModule("../metrics/authMetrics.js", () => ({
  recordSuccessfulLogin: jest.fn(),
  recordFailedLogin: jest.fn(),
  recordUserRegistration: jest.fn(),
  recordUserLogout: jest.fn(),
}));

jest.unstable_mockModule("../metrics/dbMetrics.js", () => ({
  recordDatabaseQuery: jest.fn(),
}));

const {
  signUp,
  signIn,
  signOut,
} = await import("../controllers/user.controller.js");

const createRes = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);

  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("User Controller", () => {
    test("should register a new user", async () => {
  mockUser.findOne.mockResolvedValue(null);

  mockBcrypt.genSalt.mockResolvedValue("salt");
  mockBcrypt.hash.mockResolvedValue("hashedPassword");

  mockUser.prototype.save.mockResolvedValue(true);

  mockGenerateToken.mockResolvedValue("jwt-token");

  const req = {
    body: {
      username: "Shakthi",
      email: "test@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signUp(req, res);

  expect(mockUser.findOne).toHaveBeenCalled();

  expect(res.cookie).toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(201);

  expect(res.json).toHaveBeenCalledWith({
    message: "Signup success",
  });
});

test("should return user already exists", async () => {
  mockUser.findOne.mockResolvedValue({
    email: "test@test.com",
  });

  const req = {
    body: {
      username: "Shakthi",
      email: "test@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signUp(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "User already exists",
  });
});

test("should reject short password", async () => {
  mockUser.findOne.mockResolvedValue(null);

  const req = {
    body: {
      username: "Shakthi",
      email: "test@test.com",
      password: "123",
    },
  };

  const res = createRes();

  await signUp(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Password length must be 6 or more",
  });
});
});

test("should login successfully", async () => {
  mockUser.findOne.mockResolvedValue({
    _id: "1",
    password: "hashedPassword",
  });

  mockBcrypt.compare.mockResolvedValue(true);

  mockGenerateToken.mockResolvedValue("jwt-token");

  const req = {
    body: {
      email: "test@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signIn(req, res);

  expect(mockUser.findOne).toHaveBeenCalledWith({
    email: "test@test.com",
  });

  expect(mockBcrypt.compare).toHaveBeenCalledWith(
    "123456",
    "hashedPassword"
  );

  expect(res.cookie).toHaveBeenCalled();

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith({
    message: "Signin success",
  });
});

test("should return user not found", async () => {
  mockUser.findOne.mockResolvedValue(null);

  const req = {
    body: {
      email: "abc@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signIn(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "User not found",
  });
});

test("should return wrong credentials", async () => {
  mockUser.findOne.mockResolvedValue({
    password: "hashedPassword",
  });

  mockBcrypt.compare.mockResolvedValue(false);

  const req = {
    body: {
      email: "test@test.com",
      password: "wrongpassword",
    },
  };

  const res = createRes();

  await signIn(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    message: "Wrong credentials",
  });
});

test("should return server error during login", async () => {
  mockUser.findOne.mockRejectedValue(new Error("Database error"));

  const req = {
    body: {
      email: "test@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signIn(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Server issue",
  });
});

test("should logout successfully", async () => {
  const req = {};
  const res = createRes();

  await signOut(req, res);

  expect(res.clearCookie).toHaveBeenCalledWith("token");

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith({
    message: "Logout success",
  });
});

test("should handle logout error", async () => {
  const req = {};

  const res = createRes();

  res.clearCookie.mockImplementation(() => {
    throw new Error("Cookie error");
  });

  await signOut(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Server issue",
  });
});
test("should return server error during signup", async () => {
  mockUser.findOne.mockRejectedValue(new Error("Database error"));

  const req = {
    body: {
      username: "Shakthi",
      email: "test@test.com",
      password: "123456",
    },
  };

  const res = createRes();

  await signUp(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Server issue",
  });
});
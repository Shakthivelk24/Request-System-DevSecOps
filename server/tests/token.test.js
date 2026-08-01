import { jest } from "@jest/globals";

const mockSign = jest.fn();

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
  },
}));

const { default: generateToken } = await import("../config/token.js");

describe("Generate Token", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "secret";
  });

  test("should generate JWT token", async () => {
    mockSign.mockResolvedValue("jwt-token");

    const token = await generateToken("user123");

    expect(mockSign).toHaveBeenCalledWith(
      { id: "user123" },
      "secret",
      { expiresIn: "10d" }
    );

    expect(token).toBe("jwt-token");
  });

  test("should handle JWT generation error", async () => {
    const error = new Error("JWT Error");

    mockSign.mockRejectedValue(error);

    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const token = await generateToken("user123");

    expect(logSpy).toHaveBeenCalledWith(
      "Error generating token",
      error
    );

    expect(token).toBeUndefined();

    logSpy.mockRestore();
  });
});
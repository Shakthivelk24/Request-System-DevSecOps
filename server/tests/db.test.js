import { jest } from "@jest/globals";

const mockConnect = jest.fn();

jest.unstable_mockModule("mongoose", () => ({
  default: {
    connect: mockConnect,
  },
}));

const { default: connectDB } = await import("../config/db.js");

describe("Database Connection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MONGODB_URL = "mongodb://localhost/test";
  });

  test("should connect to MongoDB successfully", async () => {
    mockConnect.mockResolvedValueOnce({});

    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await connectDB();

    expect(mockConnect).toHaveBeenCalledWith(
      "mongodb://localhost/test",
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    expect(logSpy).toHaveBeenCalledWith(
      "✅ MongoDB connected successfully"
    );

    logSpy.mockRestore();
  });

  test("should retry after connection failure", async () => {
    jest.useFakeTimers();

    mockConnect
      .mockRejectedValueOnce(new Error("Connection failed"))
      .mockResolvedValueOnce({});

    const logSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    const errorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const promise = connectDB();

    // Advance the 5-second retry timer
    await jest.advanceTimersByTimeAsync(5000);

    await promise;

    expect(mockConnect).toHaveBeenCalledTimes(2);

    expect(errorSpy).toHaveBeenCalledWith(
      "❌ MongoDB connection failed"
    );

    expect(logSpy).toHaveBeenCalledWith(
      "🔄 Retrying MongoDB connection in 5 seconds..."
    );

    expect(logSpy).toHaveBeenCalledWith(
      "✅ MongoDB connected successfully"
    );

    jest.useRealTimers();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
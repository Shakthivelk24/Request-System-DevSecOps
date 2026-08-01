import { jest } from "@jest/globals";

const mockUser = {
  findById: jest.fn(),
  findOne: jest.fn(),
};

const mockRequest = jest.fn();

mockRequest.find = jest.fn();
mockRequest.countDocuments = jest.fn();
mockRequest.findOneAndUpdate = jest.fn();
mockRequest.prototype.save = jest.fn();

jest.unstable_mockModule("../models/user.model.js", () => ({
  default: mockUser,
}));

jest.unstable_mockModule("../models/request.model.js", () => ({
  default: mockRequest,
}));

jest.unstable_mockModule("../metrics/requestMetrics.js", () => ({
  recordRequestCreated: jest.fn(),
  updateRequestMetrics: jest.fn(),
}));

jest.unstable_mockModule("../metrics/dbMetrics.js", () => ({
  recordDatabaseQuery: jest.fn(),
}));

const {
  getCurrentUser,
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  updateRequestStatus,
} = await import("../controllers/request.controller.js");

const createRes = () => {
  const res = {};

  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Request Controller", () => {
    test("should return current user", async () => {
  const user = {
    _id: "1",
    username: "Shakthi",
    email: "test@test.com",
  };

  mockUser.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(user),
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getCurrentUser(req, res);

  expect(mockUser.findById).toHaveBeenCalledWith("1");

  expect(res.status).toHaveBeenCalledWith(200);

  expect(res.json).toHaveBeenCalledWith(user);
});

test("should return 404 if user not found", async () => {
  mockUser.findById.mockReturnValue({
    select: jest.fn().mockResolvedValue(null),
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getCurrentUser(req, res);

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    message: "User not found",
  });
});
});

test("should return 404 if receiver is not found", async () => {
  mockUser.findOne.mockResolvedValue(null);

  const req = {
    userId: "1",
    body: {
      receiverEmail: "abc@test.com",
      message: "Hello",
    },
  };

  const res = createRes();

  await sendRequest(req, res);

  expect(mockUser.findOne).toHaveBeenCalledWith({
    email: "abc@test.com",
  });

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    success: false,
    error: "Receiver not found",
  });
});

test("should not allow sending request to yourself", async () => {
  mockUser.findOne.mockResolvedValue({
    _id: {
      toString: () => "1",
    },
  });

  const req = {
    userId: "1",
    body: {
      receiverEmail: "self@test.com",
      message: "Hello",
    },
  };

  const res = createRes();

  await sendRequest(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    success: false,
    error: "You cannot send a request to yourself",
  });
});
test("should send request successfully", async () => {
  mockUser.findOne.mockResolvedValue({
    _id: {
      toString: () => "2",
    },
  });

  mockRequest.prototype.save.mockResolvedValue();

  mockRequest.countDocuments
    .mockResolvedValueOnce(2)
    .mockResolvedValueOnce(3)
    .mockResolvedValueOnce(1);

  const req = {
    userId: "1",
    body: {
      receiverEmail: "receiver@test.com",
      message: "Hello",
    },
  };

  const res = createRes();

  await sendRequest(req, res);

  expect(mockRequest.prototype.save).toHaveBeenCalled();

  expect(mockRequest.countDocuments).toHaveBeenCalledTimes(3);

  expect(res.status).toHaveBeenCalledWith(201);

  expect(res.json).toHaveBeenCalledWith({
    success: true,
    request: expect.any(Object),
  });
});
test("should return received requests", async () => {
  const requests = [
    {
      _id: "1",
      message: "Hello",
    },
  ];

  mockRequest.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(requests),
    }),
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getReceivedRequests(req, res);

  expect(res.json).toHaveBeenCalledWith(requests);
});
test("should handle getReceivedRequests error", async () => {
  mockRequest.find.mockImplementation(() => {
    throw new Error("DB Error");
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getReceivedRequests(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    error: "DB Error",
  });
});
test("should return sent requests", async () => {
  const requests = [
    {
      _id: "1",
      message: "Hello",
    },
  ];

  mockRequest.find.mockReturnValue({
    populate: jest.fn().mockReturnValue({
      sort: jest.fn().mockResolvedValue(requests),
    }),
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getSentRequests(req, res);

  expect(res.json).toHaveBeenCalledWith(requests);
});
test("should handle getSentRequests error", async () => {
  mockRequest.find.mockImplementation(() => {
    throw new Error("DB Error");
  });

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getSentRequests(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    error: "DB Error",
  });
});

test("should return server error when getCurrentUser fails", async () => {
  mockUser.findById.mockImplementation(() => ({
    select: jest.fn().mockRejectedValue(new Error("DB Error")),
  }));

  const req = {
    userId: "1",
  };

  const res = createRes();

  await getCurrentUser(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    message: "Server error",
  });
});

test("should return server error when sendRequest fails", async () => {
  mockUser.findOne.mockResolvedValue({
    _id: {
      toString: () => "2",
    },
  });

  mockRequest.prototype.save.mockRejectedValue(new Error("DB Error"));

  const req = {
    userId: "1",
    body: {
      receiverEmail: "receiver@test.com",
      message: "Hello",
    },
  };

  const res = createRes();

  await sendRequest(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    success: false,
    error: "DB Error",
  });
});

test("should reject invalid request status", async () => {
  const req = {
    body: {
      status: "invalid",
    },
    params: {
      requestId: "1",
    },
    userId: "1",
  };

  const res = createRes();

  await updateRequestStatus(req, res);

  expect(res.status).toHaveBeenCalledWith(400);

  expect(res.json).toHaveBeenCalledWith({
    error: "Invalid status value",
  });
});

test("should return 404 when request is not found", async () => {
  mockRequest.findOneAndUpdate.mockReturnValue({
    populate: jest.fn().mockResolvedValue(null),
  });

  const req = {
    body: {
      status: "accepted",
    },
    params: {
      requestId: "1",
    },
    userId: "1",
  };

  const res = createRes();

  await updateRequestStatus(req, res);

  expect(res.status).toHaveBeenCalledWith(404);

  expect(res.json).toHaveBeenCalledWith({
    error: "Request not found or unauthorized",
  });
});

test("should update request status successfully", async () => {
  const updatedRequest = {
    _id: "1",
    status: "accepted",
  };

  mockRequest.findOneAndUpdate.mockReturnValue({
    populate: jest.fn().mockResolvedValue(updatedRequest),
  });

  mockRequest.countDocuments
    .mockResolvedValueOnce(1)
    .mockResolvedValueOnce(2)
    .mockResolvedValueOnce(0);

  const req = {
    body: {
      status: "accepted",
    },
    params: {
      requestId: "1",
    },
    userId: "1",
  };

  const res = createRes();

  await updateRequestStatus(req, res);

  expect(mockRequest.countDocuments).toHaveBeenCalledTimes(3);

  expect(res.json).toHaveBeenCalledWith({
    message: "Status updated successfully",
    request: updatedRequest,
  });
});

test("should handle updateRequestStatus error", async () => {
  mockRequest.findOneAndUpdate.mockImplementation(() => {
    throw new Error("DB Error");
  });

  const req = {
    body: {
      status: "accepted",
    },
    params: {
      requestId: "1",
    },
    userId: "1",
  };

  const res = createRes();

  await updateRequestStatus(req, res);

  expect(res.status).toHaveBeenCalledWith(500);

  expect(res.json).toHaveBeenCalledWith({
    error: "DB Error",
  });
});
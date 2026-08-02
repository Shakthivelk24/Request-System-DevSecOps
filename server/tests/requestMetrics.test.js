import { jest } from "@jest/globals";

const requestCreatedCounter = {
  inc: jest.fn(),
};

const approvedRequestsGauge = {
  set: jest.fn(),
};

const rejectedRequestsGauge = {
  set: jest.fn(),
};

const pendingRequestsGauge = {
  set: jest.fn(),
};

jest.unstable_mockModule("../metrics/metrics.js", () => ({
  requestCreatedCounter,
  approvedRequestsGauge,
  rejectedRequestsGauge,
  pendingRequestsGauge,
}));

const {
  recordRequestCreated,
  updateRequestMetrics,
} = await import("../metrics/requestMetrics.js");

describe("Request Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should record request creation", () => {
    recordRequestCreated();

    expect(requestCreatedCounter.inc).toHaveBeenCalledTimes(1);
  });

  test("should update request metrics", () => {
    updateRequestMetrics({
      pending: 5,
      approved: 3,
      rejected: 2,
    });

    expect(pendingRequestsGauge.set).toHaveBeenCalledWith(5);
    expect(approvedRequestsGauge.set).toHaveBeenCalledWith(3);
    expect(rejectedRequestsGauge.set).toHaveBeenCalledWith(2);
  });

  test("should use default metric values", () => {
    updateRequestMetrics({});

    expect(pendingRequestsGauge.set).toHaveBeenCalledWith(0);
    expect(approvedRequestsGauge.set).toHaveBeenCalledWith(0);
    expect(rejectedRequestsGauge.set).toHaveBeenCalledWith(0);
  });
});
import { jest } from "@jest/globals";

const loginCounter = {
  inc: jest.fn(),
};

const failedLoginCounter = {
  inc: jest.fn(),
};

const registrationCounter = {
  inc: jest.fn(),
};

const activeUsersGauge = {
  inc: jest.fn(),
  dec: jest.fn(),
  get: jest.fn(),
};

jest.unstable_mockModule("../metrics/metrics.js", () => ({
  loginCounter,
  failedLoginCounter,
  registrationCounter,
  activeUsersGauge,
}));

const {
  recordSuccessfulLogin,
  recordFailedLogin,
  recordUserRegistration,
  recordUserLogout,
} = await import("../metrics/authMetrics.js");

describe("Auth Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should record successful login", () => {
    recordSuccessfulLogin();

    expect(loginCounter.inc).toHaveBeenCalledTimes(1);
    expect(activeUsersGauge.inc).toHaveBeenCalledTimes(1);
  });

  test("should record failed login", () => {
    recordFailedLogin();

    expect(failedLoginCounter.inc).toHaveBeenCalledTimes(1);
  });

  test("should record user registration", () => {
    recordUserRegistration();

    expect(registrationCounter.inc).toHaveBeenCalledTimes(1);
  });

  test("should decrement active users on logout", () => {
    activeUsersGauge.get.mockReturnValue(5);

    recordUserLogout();

    expect(activeUsersGauge.get).toHaveBeenCalledTimes(1);
    expect(activeUsersGauge.dec).toHaveBeenCalledTimes(1);
  });

  test("should not decrement when active users is zero", () => {
    activeUsersGauge.get.mockReturnValue(0);

    recordUserLogout();

    expect(activeUsersGauge.get).toHaveBeenCalledTimes(1);
    expect(activeUsersGauge.dec).not.toHaveBeenCalled();
  });
});
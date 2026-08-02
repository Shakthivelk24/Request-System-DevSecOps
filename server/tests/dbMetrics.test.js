import { jest } from "@jest/globals";

const databaseQueriesCounter = {
  inc: jest.fn(),
};

jest.unstable_mockModule("../metrics/metrics.js", () => ({
  databaseQueriesCounter,
}));

const {
  recordDatabaseQuery,
  recordDatabaseQueries,
} = await import("../metrics/dbMetrics.js");

describe("Database Metrics", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should record a single database query", () => {
    recordDatabaseQuery();

    expect(databaseQueriesCounter.inc).toHaveBeenCalledTimes(1);
    expect(databaseQueriesCounter.inc).toHaveBeenCalledWith();
  });

  test("should record multiple database queries", () => {
    recordDatabaseQueries(5);

    expect(databaseQueriesCounter.inc).toHaveBeenCalledTimes(1);
    expect(databaseQueriesCounter.inc).toHaveBeenCalledWith(5);
  });

  test("should record one database query by default", () => {
    recordDatabaseQueries();

    expect(databaseQueriesCounter.inc).toHaveBeenCalledWith(1);
  });
});
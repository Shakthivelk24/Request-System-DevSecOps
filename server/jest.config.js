export default {
  testEnvironment: "node",

  transform: {},

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageReporters: ["text", "lcov", "html"],

  collectCoverageFrom: [
  "**/*.js",
  "!server.js",
  "!config/db.js",
  "!config/token.js",
  "!node_modules/**",
  "!coverage/**",
  "!jest.config.js",
],
  testMatch: [
    "**/?(*.)+(spec|test).js"
  ]
};
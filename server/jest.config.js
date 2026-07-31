export default {
  testEnvironment: "node",

  collectCoverage: true,

  coverageDirectory: "coverage",

  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],

  collectCoverageFrom: [
    "**/*.js",
    "!node_modules/**",
    "!coverage/**",
    "!jest.config.js"
  ],

  testMatch: [
    "**/?(*.)+(spec|test).js"
  ]
};
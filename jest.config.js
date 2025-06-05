module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.js"],
  testMatch: ["**/*.test.js"],
  maxWorkers: 1,
  maxConcurrency: 1,
};

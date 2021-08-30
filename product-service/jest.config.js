/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  globals: {
    allowSyntheticDefaultImports: true,
  },
  testEnvironment: "node",
  moduleNameMapper: {
    "^@libs/(.*)$": "<rootDir>/src/libs/$1",
    "^@service/(.*)$": "<rootDir>/src/service/$1",
  },
};

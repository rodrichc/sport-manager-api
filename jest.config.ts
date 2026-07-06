/** @type {import('ts-jest').JestConfigWithTsJest} */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/**/*.test.ts'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  transformIgnorePatterns: [
    'node_modules/(?!(@scure|otplib|@otplib)/)'
  ],
  moduleNameMapper: {
    '^otplib$': '<rootDir>/__mocks__/otplib.ts',
    '^@scure/base$': '<rootDir>/__mocks__/scure-base.ts'
  },
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: {
          types: ['node', 'jest'],
          isolatedModules: true,
          allowJs: true,
        },
        diagnostics: {
          ignoreCodes: [151002],
        },
      },
    ],
  },
};
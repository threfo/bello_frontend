module.exports = {
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  testMatch: ['<rootDir>/packages/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/projects/']
}

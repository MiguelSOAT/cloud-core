import type { JestConfigWithTsJest } from 'ts-jest'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.test' })

const jestConfig: JestConfigWithTsJest = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  testEnvironment: 'node',
  watchPathIgnorePatterns: ['<rootDir>/src/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  verbose: true
}

export default jestConfig

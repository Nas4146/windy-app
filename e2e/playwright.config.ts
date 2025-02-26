import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env.test') });

// Verify required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_CLIENT_EMAIL',
  'VITE_FIREBASE_PRIVATE_KEY',
  'TEST_USER_EMAIL',
  'TEST_USER_PASSWORD',
  'AUTH0_DOMAIN',
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
  }
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
      baseURL: 'http://localhost:4173',
      trace: 'on-first-retry',
  },
  webServer: {
      command: 'npm run build && npm run preview',
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
  },
  expect: {
      timeout: 15000
  },
  timeout: 60000
});
import { setupTestData } from './data/testData';

async function globalSetup() {
  await setupTestData();
}

export default globalSetup;
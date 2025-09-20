import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Clean up any global resources here
  // For example, close any remaining browser instances, clean up temp files, etc.

  console.log('✅ Global teardown completed');
}

export default globalTeardown;

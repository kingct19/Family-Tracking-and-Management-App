import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Start a browser instance for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the dev server to be ready
    await page.goto(config.projects[0].use?.baseURL || 'http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    console.log('✅ Dev server is ready');
  } catch (error) {
    console.error('❌ Failed to connect to dev server:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;

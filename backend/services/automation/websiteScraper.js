/**
 * Website Scraper Service
 * Uses Puppeteer to scrape website content for data extraction
 */

async function scrapeWebsite(url) {
  try {
    // Dynamically import puppeteer (only when needed)
    const puppeteer = await import('puppeteer');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set a reasonable timeout
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Extract text content from the page
    const content = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, nav, footer, header');
      scripts.forEach(el => el.remove());
      
      // Get main content
      const body = document.body.innerText || '';
      const title = document.title || '';
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      
      // Try to find product-specific sections
      const productSections = [];
      const productSelectors = [
        '[class*="product"]',
        '[class*="solution"]',
        '[class*="service"]',
        '[id*="product"]',
        '[id*="solution"]',
        '[id*="service"]',
        'section h2, section h3',
      ];
      
      productSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && text.length > 20 && text.length < 500) {
              productSections.push(text);
            }
          });
        } catch (e) {
          // Ignore selector errors
        }
      });
      
      return {
        title,
        metaDescription,
        body: body.substring(0, 15000), // Limit to 15k characters
        productSections: productSections.slice(0, 20), // Limit to 20 product sections
      };
    });
    
    await browser.close();
    
    return JSON.stringify(content);
  } catch (error) {
    console.error("Error scraping website:", error);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
}

module.exports = {
  scrapeWebsite
};

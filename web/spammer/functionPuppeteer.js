const screenView = { width: 1366, height: 768 }
const chromePath = './chrome-linux64/chrome';
const url = 'https://web.telegram.org/a/'


async function startBrowser(puppeteer) {
  async function launchBrowser(chromePath, puppeteer) {
    return await puppeteer.launch({
      headless: false,
      // headless: 'new',
      executablePath: chromePath,
      args: ['--window-size=1800,1200', '--max-old-space-size=1024']
    });
  }

  async function initializePage(browser) {
    const page = await browser.newPage();
    await page.setViewport(screenView);
    await page.goto(url);
    await page.waitForSelector('button.Button');
    return page;
  }

  const browser = await launchBrowser(chromePath, puppeteer);
  const page = await initializePage(browser);
  return page;
}


module.exports = { 
    startBrowser,
};
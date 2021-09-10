import * as puppeteer from 'puppeteer'

export async function openBrowser(url?: string) {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  })

  if (url) {
    console.log(`launching ${url}`)
    const page = await browser.newPage()
    page.goto(url)
  }
}


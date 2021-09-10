import * as puppeteer from 'puppeteer'

const common_args = [
  '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-dev-shm-usage',
  '--disable-setuid-sandbox',
  '--no-sandbox',
]

export async function openBrowser(url?: string) {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: common_args,
  })

  if (url) {
    console.log(`launching ${url}`)
    const page = await browser.newPage()
    page.goto(url)
  }
}

export async function getBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    args: common_args,
  })

  return browser
}
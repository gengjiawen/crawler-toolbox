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
    page.goto(url, {
      timeout: 0,
    })
  }
}

export async function getBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    devtools: true,
    args: common_args,
  })

  return browser
}

export async function getContent(url: string) {
  const browser = await getBrowser()
  const page = await browser.newPage()
  page.goto(url, {
    timeout: 0,
    waitUntil: 'networkidle2',
  })
  console.log(page.content())
}

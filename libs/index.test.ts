import * as fs from 'fs'
import { getArticle, getData, getUrlEntity, initDB, patchDom, toMarkdown } from './index'

try {
  fs.mkdirSync('build')
} catch (error) {}


test('test record update', async () => {
  let url = 'https://httpbin.org/get'
  await initDB()
  await getUrlEntity().delete({ url })

  let result = await getData(url, { cache: true })
  expect(result.cache).toBeFalsy()

  result = await getData(url, { cache: false })
  expect(result.cache).toBeFalsy()
})

it('test cache', async () => {
  let url = 'https://www.sqlitetutorial.net/sqlite-count-function/'
  await initDB()
  await getUrlEntity().delete({ url })

  // cache if not exists
  let result = await getData(url, { cache: true })
  expect(result.cache).toBeFalsy()

  // test cache working
  result = await getData(url, { cache: true })
  expect(result.cache).toBeTruthy()
})

it('test readability', async () => {
  let url = 'https://www.sqlitetutorial.net/sqlite-count-function/'
  await initDB()

  let result = await getData(url, { cache: true })
  const article = getArticle(result.content)
  let content = article!.content

  patchDom(content, ($) => {
    // https://stackoverflow.com/a/48379445/1713757
    $('div[data-title]').remove()
    content = $.html()
  })

  fs.writeFileSync('build/count-func.html', content)
  expect(content).toBeTruthy()
})

it('test markdown', async () => {
  let url = 'https://www.sqlitetutorial.net/sqlite-count-function/'
  await initDB()

  let result = await getData(url, { cache: true })
  const article = getArticle(result.content)
  let content = article!.content

  patchDom(content, ($) => {
    $('div[data-title]').remove()
    content = $.html()
  })
  let md = toMarkdown(content)
  fs.writeFileSync('build/count-func.md', md)
  expect(md).toBeTruthy()
})

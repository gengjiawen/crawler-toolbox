import { getArticle } from './utils'
import { Urls } from './entity/urls'
import { getData, initDB } from './index'

it('test cache', async () => {
  let url = 'https://www.sqlitetutorial.net/sqlite-count-function/'
  await initDB()
  await Urls.delete({ url })

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
  expect(article?.content).toBeTruthy()
})

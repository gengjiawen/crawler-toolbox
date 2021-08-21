import { getData } from './index'

it('with cache', async () => {
  let a = await getData(
    'https://www.sqlitetutorial.net/sqlite-count-function/',
    { cache: true }
  )

  console.log(a)
})

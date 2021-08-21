import axios from 'axios'
import * as cheerio from 'cheerio'
// import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

import { createConnection } from 'typeorm'
import { Urls } from './entity/urls'

let connection:any 

export async function initDB() {
  connection = await createConnection({
    name: 'default',
    type: 'better-sqlite3',
    database: path.join(os.homedir(), 'crawler.db'),
    entities: [__dirname + '/entity/**/*.ts'],
    synchronize: true,
  })
}

export type CrawlerOptions = {
  cache: boolean
}

export async function getData(url: string, options?: CrawlerOptions) {
  const cache = options?.cache
  if (cache) {
    if (!connection) {
        await initDB()
    }

    const content = await Urls.findOne({url})

    if (content) {
        console.log('didi', content)
      return content
    }
  }

  return axios.get(url).then(async (i) => {
    console.log(i)
    if (cache) {
      await Urls.create({
        url,
        content: i.data,
      }).save()
    }
    const $ = cheerio.load(i.data)
    console.log($)
    return $
  })
}

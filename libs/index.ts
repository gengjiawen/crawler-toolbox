import axios from 'axios'
// import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { createConnection } from 'typeorm'
import { Urls } from './entity/urls'

let connection: any

export async function initDB() {
  if (connection) {
    return
  }
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

    const item = await Urls.findOne({ url })

    if (item) {
      return {
        content: item.content,
        cache: true,
      }
    }
  }

  return axios.get(url).then(async (i) => {
    let content = i.data
    if (cache) {
      await Urls.create({
        url,
        content,
      }).save()
    }
    return {
      content,
      cache: false,
    }
  })
}

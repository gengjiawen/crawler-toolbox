import axios, { AxiosRequestConfig } from 'axios'
// import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Connection, createConnection } from 'typeorm'
import { Urls } from './entity/urls'

export let dbConnection: null | Connection

let dbLocation =
  process.env.CRAWLER_DB_LOCATION ?? path.join(os.homedir(), 'crawler.db')

export async function initDB() {
  if (dbConnection) {
    return
  }
  dbConnection = await createConnection({
    name: 'default',
    type: 'better-sqlite3',
    database: dbLocation,
    entities: [__dirname + '/entity/**/*.{js,ts}'],
    synchronize: true,
  })
}

export type CrawlerOptions = {
  cache: boolean
  axiosConfig? : AxiosRequestConfig
}

export async function getData(url: string, options?: CrawlerOptions) {
  const cache = options?.cache
  if (cache) {
    if (!dbConnection) {
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

  return axios({
    method: 'GET',
    url,
    ...options?.axiosConfig
  }).then(async (i) => {
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

export * from './utils'

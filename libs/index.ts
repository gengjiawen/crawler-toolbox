import axios, { AxiosRequestConfig } from 'axios'
// import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Connection, createConnection, getConnection } from 'typeorm'
import { Urls } from './entity/urls'

export let dbConnection: null | Connection

const connectionName = 'crawler-connection'

export async function initDB() {
  let dbLocation =
    process.env.CRAWLER_DB_LOCATION ?? path.join(os.homedir(), 'crawler.db')
  if (dbConnection) {
    return
  }
  dbConnection = await createConnection({
    name: connectionName,
    type: 'better-sqlite3',
    database: dbLocation,
    entities: [__dirname + '/entity/**/*.{js,ts}'],
    synchronize: true,
  })
}

export type CrawlerOptions = {
  cache: boolean
  axiosConfig?: AxiosRequestConfig
}

export function getManagers() {
  return getConnection(connectionName).manager
}

export function getUrlEntity() {
  return getConnection(connectionName).manager.getRepository(Urls)
}

export async function getData(url: string, options?: CrawlerOptions) {
  const cache = options?.cache
  if (cache) {
    if (!dbConnection) {
      await initDB()
    }

    const item = await getUrlEntity().findOne({ url })

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
    ...options?.axiosConfig,
  }).then(async (i) => {
    let content = i.data
    if (cache) {
      const urls = getUrlEntity();
      const record = urls.create({
        url,
        content,
      })
      await urls.save(record)
    }
    return {
      content,
      cache: false,
    }
  })
}

export * from './utils'

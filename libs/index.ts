import axios, { AxiosRequestConfig } from 'axios'
// import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Urls } from './entity/urls'

export let dbConnection: null | DataSource

const connectionName = 'crawler-connection'

export async function initDB() {
  let dbLocation =
    process.env.CRAWLER_DB_LOCATION ?? path.join(os.homedir(), 'crawler.db')
  if (dbConnection) {
    return
  }
  dbConnection = new DataSource({
    name: connectionName,
    type: 'better-sqlite3',
    database: dbLocation,
    entities: [__dirname + '/entity/**/*.{js,ts}'],
    synchronize: true,
  })
  await dbConnection.initialize()
}

export type CrawlerOptions = {
  cache: boolean
  axiosConfig?: AxiosRequestConfig
}

export function getManagers() {
  if (!dbConnection) {
    throw new Error('Database connection has not been initialized. Call initDB() first.')
  }
  return dbConnection.manager
}

export function getUrlEntity() {
  if (!dbConnection) {
    throw new Error('Database connection has not been initialized. Call initDB() first.')
  }
  return dbConnection.getRepository(Urls)
}

export async function getData(url: string, options?: CrawlerOptions) {
  const cache = options?.cache
  if (cache) {
    if (!dbConnection) {
      await initDB()
    }

    // In TypeORM v0.3+ the `findOne` API expects a `where` condition object.
    const item = await getUrlEntity().findOne({ where: { url } })

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
    if (typeof content === 'object' && content !== null) {
      content = JSON.stringify(content)
    }
    if (cache) {
      const urls = getUrlEntity()
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

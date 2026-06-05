import * as path from 'path'
import * as os from 'os'
import { DatabaseSync } from 'node:sqlite'
import { Urls } from './entity/urls'

export let dbConnection: null | DatabaseSync = null

type FindOneOptions = {
  where: Partial<Pick<Urls, 'id' | 'url'>>
}

type DeleteResult = {
  affected: number
}

class UrlRepository {
  constructor(private readonly database: DatabaseSync) {}

  async findOne(options: FindOneOptions) {
    const { id, url } = options.where
    if (typeof id === 'number') {
      return this.findById(id)
    }
    if (typeof url === 'string') {
      return this.findByUrl(url)
    }
    return null
  }

  async delete(criteria: Partial<Pick<Urls, 'id' | 'url'>>) {
    let result: { changes: number | bigint }
    if (typeof criteria.id === 'number') {
      result = this.database
        .prepare('DELETE FROM urls WHERE id = ?')
        .run(criteria.id)
    } else if (typeof criteria.url === 'string') {
      result = this.database
        .prepare('DELETE FROM urls WHERE url = ?')
        .run(criteria.url)
    } else {
      throw new Error('delete requires an id or url criteria')
    }
    const deleteResult: DeleteResult = {
      affected: Number(result.changes),
    }
    return deleteResult
  }

  create(record: Pick<Urls, 'url' | 'content'>) {
    return {
      ...record,
    } as Urls
  }

  async save(record: Pick<Urls, 'id' | 'url' | 'content'>) {
    if (typeof record.id === 'number') {
      this.database
        .prepare(
          `UPDATE urls
           SET url = ?, content = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`
        )
        .run(record.url, record.content, record.id)
      return (await this.findById(record.id)) ?? (record as Urls)
    }

    this.database
      .prepare(
        `INSERT INTO urls (url, content)
         VALUES (?, ?)
         ON CONFLICT(url) DO UPDATE SET
           content = excluded.content,
           updated_at = CURRENT_TIMESTAMP`
      )
      .run(record.url, record.content)
    return (await this.findByUrl(record.url)) ?? (record as Urls)
  }

  private async findById(id: number) {
    const record = this.database
      .prepare(
        `SELECT id, url, content, created_at, updated_at
         FROM urls
         WHERE id = ?`
      )
      .get(id) as Urls | undefined
    return record ?? null
  }

  private async findByUrl(url: string) {
    const record = this.database
      .prepare(
        `SELECT id, url, content, created_at, updated_at
         FROM urls
         WHERE url = ?`
      )
      .get(url) as Urls | undefined
    return record ?? null
  }
}

let urlRepository: UrlRepository | null = null

export async function initDB() {
  let dbLocation =
    process.env.CRAWLER_DB_LOCATION ?? path.join(os.homedir(), 'crawler.db')
  if (dbConnection) {
    return
  }
  dbConnection = new DatabaseSync(dbLocation)
  dbConnection.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL UNIQUE,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  urlRepository = new UrlRepository(dbConnection)
}

export type CrawlerOptions = {
  cache?: boolean
  fetchConfig?: RequestInit
}

export function getManagers() {
  if (!dbConnection) {
    throw new Error(
      'Database connection has not been initialized. Call initDB() first.'
    )
  }
  return dbConnection
}

export function getUrlEntity() {
  if (!urlRepository) {
    throw new Error(
      'Database connection has not been initialized. Call initDB() first.'
    )
  }
  return urlRepository
}

export async function getData(url: string, options?: CrawlerOptions) {
  const cache = options?.cache
  if (cache) {
    if (!dbConnection) {
      await initDB()
    }

    const item = await getUrlEntity().findOne({ where: { url } })

    if (item) {
      return {
        content: item.content,
        cache: true,
      }
    }
  }

  const response = await fetch(url, {
    method: 'GET',
    ...options?.fetchConfig,
  })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`
    )
  }

  const content = await getResponseContent(response)
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
}

export * from './utils'

async function getResponseContent(response: Response) {
  const content = await response.text()
  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('json')) {
    try {
      return JSON.stringify(JSON.parse(content))
    } catch {
      return content
    }
  }
  return content
}

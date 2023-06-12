import * as cheerio from 'cheerio'
import { Readability } from '@mozilla/readability'
import { getData } from '.'

type patchFunction = (a: cheerio.Root) => any

export function patchDom(content: string, func: patchFunction) {
  const $ = cheerio.load(content)
  return func($)
}

export function getArticle(
  content: string,
  url: string = 'https://example.com/'
) {
  const JSDOM = require('jsdom').JSDOM
  const doc = new JSDOM(content, {
    url,
  })
  let reader = new Readability(doc.window.document)
  let article = reader.parse()
  return article
}

export function toMarkdown(content: string) {
  const turndownPluginGfm = require('turndown-plugin-gfm')
  const gfm = turndownPluginGfm.gfm
  const TurndownService = require('turndown')
  const turndownService = new TurndownService()
  turndownService.use(gfm)

  const markdown = turndownService.turndown(content)
  return markdown
}

export async function getArticleMarkdown(url: string) {
  const result = await getData(url)
  const article = getArticle(result.content, url)
  const markdown = toMarkdown(article!.content)
  return markdown
}

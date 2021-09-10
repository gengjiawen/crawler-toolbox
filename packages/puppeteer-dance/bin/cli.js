#!/usr/bin/env node

const program = require('commander')

const { openBrowser } = require('../build')

program
  .version(require('../package.json').version)
  .command('start')
  .description('start puppetter')
  .option('-u, --url [url]', 'browser init url, can be null')
  .action((options, c) => {
      openBrowser(options.url)
  })

program.parse(process.argv)
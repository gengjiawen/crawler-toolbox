
## Usage
In cli

```bash
npx puppeteer-dance start -u https://httpbin.org/
```

Caution: the default args include `disable-web-security` to get resources
without restriction.

Also this package is compatible with docker usage.

## API

```js
import { getBrowser } from 'puppeteer-dance'
```

## Setup

```
npm install
npm start
```

Project generated by [gengjiawen/ts-scaffold](https://github.com/gengjiawen/ts-scaffold)
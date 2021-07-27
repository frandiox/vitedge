import path from 'path'
import chalk from 'chalk'
import { promises as fs } from 'fs'
import { createRequire } from 'module'
import build from './index.js'
import { meta, getProjectInfo } from '../config.js'
import { requireJson } from '../utils/files.js'
import { findWranglerFilePath } from '../utils/wrangler.js'

const defaultPort = '5000'

export default async function preview({
  mode,
  ssr,
  entry,
  buildWatch,
  wranglerConfig,
  port = defaultPort,
  https,
  debug: logDebug,
  ...options
}) {
  if (buildWatch) {
    await build({ ...options, mode, ssr, entry, watch: true })
  }

  const { rootDir } = await getProjectInfo(mode)
  wranglerConfig = await findWranglerFilePath(rootDir, wranglerConfig)

  if (!wranglerConfig) {
    // TODO -- Implement 'preview' for Node.js servers

    throw new Error(
      'Wrangler TOML file not found. Node.js servers are not supported in preview mode.'
    )
  }

  const viteInternals = await getViteInternals()
  const { Miniflare } = await import('miniflare')
  const mfPkg = requireJson('miniflare/package.json')

  const httpsOptions = Object.entries(options)
    .filter(([key]) => key.startsWith('https'))
    .map(([key, value]) => [
      key.replace(/^https([A-Z])/, (_, s1) => s1.toLowerCase()),
      value,
    ])

  const mf = new Miniflare({
    ...options,
    scriptPath: path.resolve(
      meta.outDir,
      meta.workerOutDir,
      meta.workerOutFile
    ),
    sitePath: path.resolve(meta.outDir, meta.clientOutDir),
    disableCache: !!buildWatch,
    watch: !!buildWatch,
    port: Number(port),
    log: createLogger({ logDebug, prefix: '[miniflare]' }),
    https: httpsOptions.length > 0 ? Object.fromEntries(httpsOptions) : https,
  })

  console.log('') // New line

  mf.getOptions()
    .then(async ({ host, port = Number(defaultPort), processedHttps }) => {
      const secure = processedHttps !== undefined

      const server = await mf.createServer(secure)

      server.listen(port, host, async () => {
        const protocol = secure ? 'https' : 'http'

        mf.log.log(
          chalk.cyan(`\n  miniflare v${mfPkg.version}`),
          chalk.green(`server running at:\n`)
        )

        viteInternals.printServerUrls(
          viteInternals.resolveHostname(host),
          protocol,
          port,
          '',
          (...strings) => mf.log.log(...strings)
        )

        mf.log.log(
          '\n -- Preview mode' +
            (buildWatch ? '. Waiting for updates' : '') +
            '\n'
        )
      })
    })
    .catch((err) => mf.log.error(err))
}

function createLogger({ logDebug = false, colors, prefix }) {
  const colorMap = {
    debug: 'grey',
    info: 'cyan',
    warn: 'yellow',
    error: 'red',
    ...colors,
  }

  return new Proxy(
    {},
    {
      get(target, key) {
        if (key === 'log') return console.log.bind(console)

        const isDebug = key === 'debug'
        const tag = colorMap[key]
          ? chalk[colorMap[key]].bold((prefix || `[${key}]`).padEnd(7, ' '))
          : ''

        return (...strings) =>
          isDebug || logDebug
            ? console.log(
                chalk.dim(new Date().toLocaleTimeString()),
                tag,
                ...(isDebug
                  ? strings.map((s) => chalk[colorMap[key]](s))
                  : strings)
              )
            : undefined
      },
    }
  )
}

async function getViteInternals() {
  try {
    /* This is just to reuse Vite styles and some logic */
    const require = createRequire(import.meta.url)
    const vitePath = require.resolve('vite')
    let tmp = await fs.readFile(vitePath, 'utf-8')
    const [, chunk] = tmp.match(/require\('(\.\/chunks\/.+)'\)/) || []
    tmp = null

    let internals = await import(path.resolve(path.dirname(vitePath), chunk))
    internals = internals.default || internals

    return internals
  } catch (error) {
    console.warn(
      '\nCould not import internal Vite module. This likely means Vite internals have been updated in a new version.\n'
    )

    throw error
  }
}

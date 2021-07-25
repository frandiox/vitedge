import path from 'path'
import { networkInterfaces } from 'os'
import build from './index.js'
import { meta, getProjectInfo } from '../config.js'
import { lookupFile } from '../utils/files.js'

const defaultPort = '5000'

export default async function preview({
  mode,
  ssr,
  entry,
  buildWatch,
  wranglerConfig,
  port = defaultPort,
  https,
  debug,
  ...options
}) {
  if (buildWatch) {
    await build({ mode, ssr, entry, watch: true })
  }

  const { rootDir } = await getProjectInfo(mode)

  let wranglerDir = rootDir
  let wranglerFile = 'wrangler.toml'

  if (wranglerConfig) {
    wranglerDir = path.dirname(wranglerConfig)
    wranglerFile = path.basename(wranglerConfig)
  }

  wranglerConfig = lookupFile({
    dir: wranglerDir,
    formats: [wranglerFile],
    pathOnly: true,
    bubble: false,
  })

  if (wranglerConfig) {
    const { Miniflare, ConsoleLog } = await import('miniflare')

    const httpsOptions = Object.entries(options)
      .filter(([key]) => key.startsWith('https'))
      .map(([key, value]) => [
        key.replace(/^https([A-Z])/, (_, s1) => s1.toLowerCase()),
        value,
      ])

    const mf = new Miniflare({
      ...options,
      scriptPath: path.resolve(meta.outDir, meta.workerOutFile),
      sitePath: path.resolve(meta.outDir, meta.clientOutDir),
      watch: !!buildWatch,
      port: Number(port),
      log: new ConsoleLog(!!debug),
      https: httpsOptions.length > 0 ? Object.fromEntries(httpsOptions) : https,
    })

    console.log('\n')

    mf.getOptions()
      .then(async ({ host, port = Number(defaultPort), processedHttps }) => {
        const secure = processedHttps !== undefined

        ;(await mf.createServer(secure)).listen(port, host, async () => {
          const protocol = secure ? 'https' : 'http'

          mf.log.info(
            `${
              buildWatch ? ' Waiting for build updates. ' : ''
            }Preview ready at:`
          )

          if (host) {
            mf.log.info(`- ${protocol}://${host}:${port}`)
          } else {
            for (const accessibleHost of getAccessibleHosts(true)) {
              mf.log.info(`- ${protocol}://${accessibleHost}:${port}`)
            }
          }
        })
      })
      .catch((err) => mf.log.error(err))
  } else {
    // TODO -- Implement 'preview' for Node.js servers

    throw new Error(
      'Wrangler TOML file not found. Node.js servers are not supported in preview mode.'
    )
  }
}

function getAccessibleHosts(ipv4 = false) {
  const hosts = []
  Object.values(networkInterfaces()).forEach((net) =>
    net?.forEach(({ family, address }) => {
      if (!ipv4 || family === 'IPv4') hosts.push(address)
    })
  )

  return hosts
}

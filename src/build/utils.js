import path from 'path'
import chalk from 'chalk'
import { promises as fs } from 'fs'
import { createRequire } from 'module'

export async function printBundleResult(logger, outDir, fileName) {
  const stat = await fs.stat(path.resolve(outDir, fileName))
  const kbs = stat.size / 1000
  const sizeColor = kbs > 1000 ? chalk.yellow : chalk.dim

  logger.info(
    `${chalk.gray(chalk.white.dim(outDir + '/'))}${chalk.cyan(
      fileName
    )}  ${sizeColor(`${kbs.toFixed(2)} KiB`)}`
  )
}

// Used for printing server info in preview for Vite <= 2.5.x
export async function getViteInternals() {
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

export function createLogger({ logDebug = false, colors, prefix }) {
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

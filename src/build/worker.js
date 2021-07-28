import path from 'path'
import chalk from 'chalk'
import { promises as fs } from 'fs'
import { build } from 'esbuild'
import esbuildAlias from 'esbuild-plugin-alias'
import esbuildGlobals from 'esbuild-plugin-globals'
import { meta } from '../config.js'
import { requireJson } from '../utils/files.js'

const getNegativeFlagValue = (option, flag) =>
  flag === true ? false : option === undefined ? true : option

export default async function buildWorker({
  platform,
  watch,
  inputPath,
  outputPath,
  fileName,
  viteConfig: { root, logger },
  noBundle,
  noMinify,
  noSourcemap,
  target = 'es2019',
  format = 'esm',
  esbuildOptions = {},
}) {
  const aliases = meta.resolveAliases(root)

  // ESBuild does not resolve entry point looking at package.json
  const pkg = requireJson(aliases.__vitedge_meta__)
  aliases.__vitedge_router__ = path.join(aliases.__vitedge_router__, pkg.main)

  const isWorker = platform === 'worker'

  await build({
    // Configurable:
    sourceRoot: root,
    format,
    target,
    platform: isWorker ? 'browser' : 'node',
    ...esbuildOptions,
    define: {
      // Minified version of Vue contains this global
      __VUE_PROD_DEVTOOLS__: false,
      ...esbuildOptions.define,
    },
    // stream is imported in vue@3
    plugins: [
      esbuildAlias(aliases),
      ...(isWorker ? [esbuildGlobals({ stream: '{}' })] : []),
      ...(esbuildOptions.plugins || []),
    ],

    // CLI flags:
    bundle: getNegativeFlagValue(esbuildOptions.bundle, noBundle),
    minify: getNegativeFlagValue(esbuildOptions.minify, noMinify),
    sourcemap: getNegativeFlagValue(esbuildOptions.sourcemap, noSourcemap),

    // Not configurable:
    entryPoints: [inputPath],
    outfile: path.resolve(outputPath, fileName),
    watch: watch
      ? {
          onRebuild: (error) =>
            error
              ? logger.error(error)
              : printBundleResult(logger, outputPath, fileName),
        }
      : false,
  })

  await printBundleResult(logger, outputPath, fileName)
}

async function printBundleResult(logger, outDir, fileName) {
  const stat = await fs.stat(path.resolve(outDir, fileName))
  const kbs = stat.size / 1000
  const sizeColor = kbs > 1000 ? chalk.yellow : chalk.dim

  logger.info(
    `${chalk.gray(chalk.white.dim(outDir + '/'))}${chalk.cyan(
      fileName
    )}  ${sizeColor(`${kbs.toFixed(2)}kb`)}`
  )
}

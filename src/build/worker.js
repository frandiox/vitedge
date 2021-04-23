import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import virtual from '@rollup/plugin-virtual'
import replace from '@rollup/plugin-replace'
import { resolveEnvVariables } from './env.js'

export default async function ({
  mode,
  workerInputPath,
  workerOutputPath,
  fnsOutputPath,
  ssrOutputPath,
}) {
  const bundle = await rollup({
    input: workerInputPath,
    plugins: [
      replace({
        values: resolveEnvVariables({ mode }),
        preventAssignment: true,
      }),
      alias({
        entries: [
          { find: '__vitedge_functions__', replacement: fnsOutputPath },
          { find: '__vitedge_router__', replacement: ssrOutputPath },
          {
            find: '__vitedge_meta__',
            replacement: ssrOutputPath + '/package.json',
          },
        ],
      }),
      // Vue/server-renderer does not tree-shake the `stream` dependency
      // so we need to stub it here. It won't be used at run time.
      virtual({ stream: `export default function() {}` }),
      nodeResolve({
        browser: true,
        mainFields: ['browser', 'main', 'module'],
        preferBuiltins: false,
        extensions: ['.mjs', '.js', '.json', '.node', '.ts'],
      }),
      commonjs(),
      esbuild({ minify: true }),
      json({ compact: true }),
    ],
  })

  await bundle.write({
    file: workerOutputPath,
    format: 'es',
    exports: 'named',
    sourcemap: true,
  })
}

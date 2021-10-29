import { terser } from 'rollup-plugin-terser'
// 为了将引入的 npm 包，也打包进最终结果中
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

import pkg from './package.json'

// 一段自定义的内容，以下内容会添加到打包结果中
const footer = `
if(typeof window !== 'undefined') {
  window._TrackVersion = '${pkg.version}'
}`

export default {
  input: './src/index.ts',
  output: [
    {
      file: pkg.main,
      format: 'umd',
      footer,
      name: 'Track',
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  context: 'window',
  plugins: [resolve(), typescript()]
}

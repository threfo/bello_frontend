import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
// 为了将引入的 npm 包，也打包进最终结果中
import resolve from 'rollup-plugin-node-resolve'

export default ({ pkg, name, input = './src/index.ts', format = 'umd', context = 'window' }) => {
  const { main: file, version } = pkg || {}
  return {
    input,
    output: [
      {
        file,
        format,
        footer: `
        if(typeof window !== 'undefined') {
          window.${name}Version = '${version}'
        }`,
        name,
        sourcemap: true,
        plugins: [terser()]
      }
    ],
    context,
    plugins: [resolve(), typescript()]
  }
}

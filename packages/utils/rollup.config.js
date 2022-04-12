import initRollup from '../../plugin/rollupPkg'
import pkg from './package.json'
const { name } = pkg
export default initRollup({
  name,
  pkg
})

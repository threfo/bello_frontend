import initRollup from '../../build/rollupPkg'

import pkg from './package.json'

export default initRollup({
  name: 'BelloAuth',
  pkg
})

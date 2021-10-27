/* eslint-disable @typescript-eslint/no-var-requires */
const { removeAll } = require('./dependenciesCache')
const getAuthJson = require('./getAuthJson')
const args = process.argv

// console.log(JSON.stringify(args))

const [, , routesPath, menuPath, buildJsonPath = '/build'] = args

console.log('routesPath', routesPath)
console.log('menuPath', menuPath)

removeAll()

if (routesPath && menuPath) {
  getAuthJson({
    routesPath,
    menuPath,
    buildJsonPath
  })
}

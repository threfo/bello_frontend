/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
const fs = require('fs')

const safeStringify = (obj, indent = 2) => {
  let cache = []
  const retVal = JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === 'object' && value !== null) {
        // Duplicate reference found, discard key
        if (cache.includes(value)) return

        // Store value in our collection
        cache.push(value)
      }
      return value
    },
    indent
  )
  cache = null
  return retVal
}

module.exports = {
  saveFile: (fileName, data, pathName = __dirname) => {
    const willSetPath = path.resolve(pathName, fileName)
    const arr = willSetPath.split('/')

    const willMkdirArr = []
    arr.pop()
    let checkDir = arr.join('/')

    while (!fs.existsSync(checkDir)) {
      willMkdirArr.push(checkDir)
      arr.pop()
      checkDir = arr.join('/')
    }

    if (willMkdirArr.length) {
      do {
        const willMkdir = willMkdirArr.pop()
        fs.mkdirSync(willMkdir)
      } while (willMkdirArr.length)
    }
    const savePath = path.resolve(pathName, fileName)

    const willSaveData = safeStringify(data)
    const fsProps = { encoding: 'utf8' }

    let needSave = true
    if (fs.existsSync(savePath)) {
      console.log(`${savePath} 已存在`)
      const oldData = fs.readFileSync(savePath, fsProps)
      needSave = oldData !== willSaveData
    }

    if (needSave) {
      console.log(`${savePath} 内容已变化`)
      fs.writeFile(savePath, willSaveData, fsProps, err => {
        console.error(err)
      })
    } else {
      console.log(`${savePath} 不需要更新`)
    }
  }
}

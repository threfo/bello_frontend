/* eslint-disable @typescript-eslint/no-var-requires */
// const axios = require('axios')
// const { name: projectName } = require('package.json')
// const fs = require('fs')
const path = require('path')
// const addFile = require('../utils/file')

// const getAuthJson = require('./getAuthJson')
const childProcess = require('child_process')
const pluginName = 'BuildAuthTreePlugin'

// const { removeAll } = require('./dependenciesCache')

// const VueFileTransform = require('./VueFileTransform')

// const isDebug = false

module.exports = class BuildAuthTreePlugin {
  constructor({ routesPath, menuPath, buildJsonPath = '/build' } = {}) {
    console.log(`
    BuildAuthTreePlugin
    routesPath: ${routesPath}
    menuPath: ${menuPath}
    buildJsonPath: ${buildJsonPath}
    `)
    this.routesPath = routesPath // 路由文件路径
    this.menuPath = menuPath
    this.buildJsonPath = buildJsonPath
  }
  apply(compiler) {
    // console.log('BuildAuthTreePlugin apply', compiler)
    // compiler.hooks.entry
    compiler.hooks.done.tapAsync(pluginName, (_, callback) => {
      console.log(`${pluginName} done, auth json 构建开始解析`)
      if (this.lastChildProcess) {
        this.lastChildProcess.kill()
      }
      this.buildAuthJson()
      callback()
    })
  }

  buildAuthJson() {
    // getRoutesList(this.routesPath)
    // new VueFileTransform({
    //   path: '/Users/thomaslau/Projects/auth_demo/src/views/Home.vue'
    // })
    // new VueFileTransform({
    //   path: '/Users/thomaslau/Projects/auth_demo/src/components/HelloWorld.vue'
    // })
    // const test = new VueFileTransform({
    //   path: '/Users/thomaslau/Projects/auth_demo/src/views/test/test_2.vue'
    // })
    // console.log('buildAuthJson', test.eleAuthList)
    const { routesPath, menuPath, buildJsonPath } = this

    const child = childProcess.fork(path.resolve(__dirname, './run.js'), [
      routesPath,
      menuPath,
      buildJsonPath
    ])

    const { pid } = child
    // child.stdout.setEncoding('utf8')
    // child.stdout.on('data', function(data) {
    //   console.log('child.stdout.on data:', data)
    // })
    console.log('child pid', pid)
    this.lastChildProcess = child
    // getAuthJson({
    //   routesPath,
    //   menuPath,
    //   buildJsonPath
    // })
  }

  // async workWechatMsg(content = '') {
  //   if (isDebug) {
  //     console.log(content)
  //     return
  //   }

  //   const data = {
  //     msgtype: 'markdown',
  //     markdown: { content }
  //   }
  //   try {
  //     await axios({
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //       url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${this.key}`,
  //       data
  //     })
  //   } catch (error) {
  //     console.error('workWechatMsg err', error)
  //   }
  // }
}

/* eslint-disable @typescript-eslint/no-var-requires */
const nodePathUitl = require('path')
const fs = require('fs')
const babel = require('@babel/core')
const babelParser = require('@babel/parser')
const traverse = require('babel-traverse').default
const t = require('@babel/types')
const _ = require('lodash')

const { parse, compileTemplate } = require('@vue/component-compiler-utils')
const compiler = require('vue-template-compiler')

const dependenciesCache = require('./dependenciesCache')

// const AstTransform = require('./AstTransform')

class VueFileTransform {
  constructor({ path }) {
    this.debug = false
    // console.log('解析：path = ', path)
    dependenciesCache.setValue(path, this)

    this.path = path
    this.path2Ast(path)
    this.localName2ImportedName = {}
    this.componentsNameMap = {}
    this.eleAuthList = []
    this.authFuncList = []
    this.trackFuncList = []

    this.usedComponents = []

    this.initScript()
    this.initTemplate()

    this.getUsedComponentsAuthList()

    dependenciesCache.setValue(path, this)
  }

  log(...a) {
    if (this.debug) {
      console.log(this.path, ...a)
    }
  }

  errorLog(...a) {
    console.error(this.path, ...a)
  }

  path2Ast(path) {
    // this.log('path', path)
    // 获取文件内容
    const source = fs.readFileSync(path, { encoding: 'utf-8', flag: 'r' })
    this.source = source

    // this.log('source', source)

    // 使用 @vue/component-compiler-utils 读 .vue 格式的文件
    const filename = nodePathUitl.basename(path)
    const sourceRoot = nodePathUitl.dirname(path).split('/src')[0]

    // this.log('sourceRoot', sourceRoot)

    this.filename = filename
    this.rootPath = sourceRoot
    const descriptor = parse({
      source,
      compiler,
      filename,
      sourceRoot,
      needMap: false
    })

    // this.log('descriptor', descriptor)
    // 把 template 部分 使用 vue 官方的 @vue/component-compiler-utils 的 compileTemplate 做转换 解析成 ast
    const { template } = descriptor || {}
    const { content: contentSource } = template

    const compileResult = compileTemplate({
      source: contentSource,
      filename: path,
      compiler
    })
    // const { ast: templateAst } = compileResult
    this.templateAst = babelParser.parse(compileResult.code, {
      sourceType: 'module'
    })

    // this.log('compileResult.code', compileResult.code)

    const { script } = descriptor
    const { content = '', lang } = script || {}
    let porps = {
      presets: ['@babel/preset-typescript']
    }
    if (lang === 'ts') {
      porps = {
        presets: [
          [
            '@babel/preset-typescript',
            {
              allExtensions: true
            }
          ]
        ],
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-proposal-class-properties', { loose: true }],
          ['@babel/plugin-proposal-private-methods', { loose: true }],
          ['@babel/plugin-proposal-private-property-in-object', { loose: true }]
        ]
      }
    }

    this.scriptAst = this.content2Ast(content, porps)

    // this.log('templateAst: ', this.templateAst)
    // this.log('scriptAst: ', this.scriptAst)
  }

  content2Ast(content, morePorps) {
    // this.log('content2Ast content:', content)
    const porps = {
      filename: this.filename,
      root: this.rootPath,
      ...morePorps
    }
    const transForm = babel.transformSync(content, porps) // 这里报错
    // this.log('content2Ast transForm:', transForm)

    const { code } = transForm
    // this.log('content2Ast code:', code)

    return babelParser.parse(code, {
      sourceType: 'module'
    })
  }

  getPathExt(path) {
    const ext = nodePathUitl.extname(path)
    return ext
  }

  pushUsedComponents(tagName) {
    if (!this.usedComponents.includes(tagName)) {
      this.usedComponents.push(tagName)
    }
  }

  initTemplate() {
    // this.log('templateAst = ', this.templateAst)
    // this.log('templateAst body = ', this.templateAst.program.body)

    traverse(this.templateAst, {
      CallExpression: ({ node }) => {
        // this.log('initTemplate CallExpression', node)
        this.getAuthFunc(node)
        this.getAuthList(node)

        // this.getExpressionStatementValue(node)
      }
    })

    this.log('eleAuthList = ', this.eleAuthList)
    this.log('usedComponents = ', this.usedComponents)
  }

  fixComponentPath(path) {
    let newPath = path
    if (Array.isArray(path) && path.length === 1) {
      newPath = path[0]
    }

    if (_.isString(newPath)) {
      if (newPath.indexOf('@') === 0) {
        newPath = nodePathUitl.resolve(
          this.rootPath,
          newPath.replace('@', './src')
        )
      } else if (newPath.indexOf('.') === 0) {
        newPath = nodePathUitl.resolve(nodePathUitl.dirname(this.path), path)
      } else {
        // pass 第三方的
        return ''
      }
      const ext = this.getPathExt(newPath)
      if (ext === '') {
        const extArr = ['/index.vue', '.vue']
        const nextExt = extArr.find(item => fs.existsSync(`${newPath}${item}`))
        if (nextExt) {
          newPath = `${newPath}${nextExt}`
        } else {
          this.errorLog(`not find file ${newPath}`)
        }
      }
    }
    return newPath
  }

  getUsedComponentsAuthList() {
    this.usedComponents.forEach(name => {
      const dependenciesName =
        this.componentsNameMap[name] ||
        this.componentsNameMap[_.snakeCase(name)] ||
        this.componentsNameMap[_.upperFirst(_.camelCase(name))]

      this.log(
        `getUsedComponentsAuthList name: ${name} ,dependenciesName: ${dependenciesName}`
      )

      if (dependenciesName) {
        const dependenciesPath = this.dependenciesMap[dependenciesName]

        // this.log(
        //   `getUsedComponentsAuthList dependenciesName: ${dependenciesName} ,dependenciesPath: ${dependenciesPath} `
        // )
        if (dependenciesPath) {
          const path = this.fixComponentPath(dependenciesPath)
          // this.log('getUsedComponentsAuthList path', path)
          if (path) {
            let dependenciesFile = dependenciesCache.getValue(path)
            if (!dependenciesFile) {
              dependenciesFile = new VueFileTransform({
                path
              })
              dependenciesCache.setValue(path, dependenciesFile)
            }

            const { eleAuthList, authFuncList, trackFuncList } =
              dependenciesFile
            if (eleAuthList.length) {
              // this.log(
              //   `getUsedComponentsAuthList ${path} eleAuthList`,
              //   eleAuthList
              // )

              this.eleAuthList.push(...eleAuthList)
            }
            if (authFuncList.length) {
              this.authFuncList.push(...authFuncList)
            }
            if (trackFuncList.length) {
              this.trackFuncList.push(...trackFuncList)
            }
          }
        }
      }
    })

    // this.log('getUsedComponentsAuthList finish eleAuthList', this.eleAuthList)
  }

  isHFunc(node) {
    const { callee: calleeNode } = node

    return t.isIdentifier(calleeNode) && calleeNode.name === '_c'
  }

  getTagName(node) {
    const isHFunc = this.isHFunc(node)
    // this.log('getTagName isHFunc:', isHFunc)
    if (isHFunc) {
      const { arguments: argumentsNodes } = node
      const [first] = argumentsNodes
      let tagName
      if (t.isStringLiteral(first)) {
        tagName = first.value
        if (tagName) {
          this.pushUsedComponents(tagName)
        }
      }
      return tagName
    }
  }

  getEleAuth(node) {
    if (t.isObjectExpression(node)) {
      const { properties: propertiesNodes } = node

      // 历遍 <auth> 标签 的 attrs 属性
      if (propertiesNodes.length) {
        const eleAuth = {}

        propertiesNodes.forEach(propertieNode => {
          // this.log('getEleAuth propertieNode', propertieNode)

          const { key: keyNode, value: valueNode } = propertieNode

          const { value: keyNodeValue, name: keyNodeName } = keyNode
          const key = keyNodeValue || keyNodeName
          const { value } = valueNode
          eleAuth[_.camelCase(key)] = value
        })
        return eleAuth
      }
    }

    this.errorLog('getEleAuth not cover', node)
  }

  getAuthList(node) {
    // this.log('getAuthList node', node)

    if (t.isCallExpression(node)) {
      // 找出 <auth> 标签
      const tagName = this.getTagName(node)
      if (tagName === 'auth') {
        // 找出 <auth> 标签 的 attrs 属性
        const { arguments: argumentsNodes } = node
        const [, attrNode] = argumentsNodes
        // this.log('getAuthList attrNode', attrNode)

        if (t.isObjectExpression(attrNode)) {
          const { properties: propertiesNodes } = attrNode
          if (propertiesNodes.length) {
            const attsKeyNode = propertiesNodes.find(propertieNode => {
              // this.log('getAuthList propertieNode', propertieNode)
              const { key: keyNode } = propertieNode
              // this.log('getAuthList propertieNode keyNode', keyNode)

              const { name, value } = keyNode || {}

              return (value || name) === 'attrs'
            })

            // this.log('getAuthList attsKeyNode', attsKeyNode)

            const { value: valueNode } = attsKeyNode

            const eleAuth = this.getEleAuth(valueNode)
            if (eleAuth) {
              this.eleAuthList.push(eleAuth)
              return
            }
          }
        }
      }
    }

    // this.errorLog('getAuthList not cover', node)
  }

  initScript() {
    // this.log('scriptAst = ', this.scriptAst)
    // this.log('scriptAst body = ', this.scriptAst.program.body)
    traverse(this.scriptAst, {
      // `Ecmascript`模块相当简单,因为它们是静态的. 这意味着你不能`import`一个变量,
      // 或者有条件地`import`另一个模块.
      // 每次我们看到`import`声明时,我们都可以将其数值视为`依赖性`.
      ImportDeclaration: ({ node }) => {
        // 我们将依赖关系数组推入我们导入的值. ⬅️
        this.dependenciesMap = {
          ...(this.dependenciesMap || {}),
          ...this.getImportDeclarationKeyAndPath(node)
        }
      },
      ExportDefaultDeclaration: ({ node }) => {
        this.getComponents(node)
      },
      CallExpression: ({ node }) => {
        // this.log('CallExpression', node)
        this.getAuthFunc(node)
        this.getTrackList(node)
      }
    })

    // TODO 历遍 componentsNameMap 把里面所有的权限标签获取

    this.log('dependenciesMap = ', this.dependenciesMap)
    this.log('componentsNameMap = ', this.componentsNameMap)
  }
  getAuthFunc(node) {
    // this.log('CallExpression', node)
    const { callee, arguments: callArguments } = node
    const { type: calleeType, property: calleeProperty } = callee || {}
    const { name: calleePropertyName } = calleeProperty || {}
    // this.log('calleePropertyName', calleePropertyName)
    if (calleeType === 'MemberExpression' && calleePropertyName === '$auth') {
      const [key, msg] = callArguments.map(({ value }) => value)
      // this.log('authType, msg', key, msg)
      if (key) {
        this.authFuncList.push({ key, msg })
      }
    }
  }
  getTrackList(node) {
    const { callee, arguments: callArguments } = node
    const { type: calleeType, property: calleeProperty } = callee || {}
    const { name: calleePropertyName } = calleeProperty || {}

    if (
      calleeType === 'MemberExpression' &&
      calleePropertyName === '$trackReport'
    ) {
      const trackFuncParamsList = callArguments.map(
        ({ properties }) => properties
      )
      trackFuncParamsList.forEach(singleParam => {
        const singleParamList = singleParam.map(({ value }) => value)
        const [eventKey, msg] = singleParamList.map(({ value }) => value)
        if (eventKey) {
          this.trackFuncList.push({ key: eventKey, msg })
        }
      })
      // this.log('trackFuncList = ', this.trackFuncList)
    }
  }
  getImportDeclarationKeyAndPath(node) {
    const { source, specifiers } = node
    const keyPathMap = {}
    if (specifiers.length) {
      const { value: path } = source

      specifiers.forEach(specifier => {
        const { local: localNode, imported: importedNode } = specifier
        const { name: localName } = localNode || {}
        const { name: importedName } = importedNode || {}

        if (t.isImportDefaultSpecifier(specifier)) {
          keyPathMap[localName] = path
        } else if (t.isImportSpecifier(specifier)) {
          this.localName2ImportedName[localName] = importedName

          if (localName === importedName) {
            keyPathMap[localName] = path
          } else {
            keyPathMap[localName] = {
              imported: importedName,
              path
            }
          }
        } else if (t.isImportNamespaceSpecifier(specifier)) {
          keyPathMap[localName] = path
        } else {
          this.errorLog(
            'getImportDeclarationKeyAndPath not cover',
            specifier,
            node
          )
        }
      })
    }
    return keyPathMap
  }

  findKeyPropertieNode(node, key) {
    if (t.isObjectExpression(node)) {
      const { properties: propertiesNodes } = node
      // this.log('findKeyPropertieNode propertiesNodes = ', propertiesNodes)
      if (propertiesNodes.length) {
        return propertiesNodes.find(propertieNode => {
          const { key: keyNode } = propertieNode
          // this.log('findKeyPropertieNode key', keyNode)
          return t.isIdentifier(keyNode) && keyNode.name === key
        })
      }
    }
    this.errorLog('findKeyPropertieNode not cover', node)
  }

  isVueExtend(node) {
    if (t.isCallExpression(node)) {
      const { callee: calleeNode } = node
      if (t.isMemberExpression(calleeNode)) {
        const { object: objectNode, property: propertyNode } = calleeNode
        return objectNode.name === 'Vue' && propertyNode.name === 'extend'
      }
    }

    return false
  }

  propertiesNodes2ComponentsNameMap(propertiesNodes) {
    propertiesNodes.forEach(objectProperty => {
      const { key: keyNode, value: valueNode } = objectProperty

      const { name: keyNodeName, value: keyNodeValue } = keyNode
      const keyName = keyNodeName || keyNodeValue

      if (t.isIdentifier(valueNode)) {
        const { name: valueName } = valueNode
        this.componentsNameMap[keyName] = valueName
      } else {
        this.errorLog(`getComponents propertiesNodes not cover`, objectProperty)
      }
    })
  }

  componentsIsObjectSpread(node) {
    let isCover = true
    if (t.isCallExpression(node)) {
      const { callee: calleeNode, arguments: argumentsNodes } = node

      const { name } = calleeNode || {}
      if (name === '_objectSpread') {
        ;(argumentsNodes || []).forEach(argumentsNode => {
          if (t.isObjectExpression(argumentsNode)) {
            const { properties: propertiesNodes } = argumentsNode
            this.propertiesNodes2ComponentsNameMap(propertiesNodes)
          } else if (
            t.isIdentifier(argumentsNode) &&
            argumentsNode.name === 'components'
          ) {
            // 忽略这种批量引入
          } else if (t.isCallExpression(argumentsNode)) {
            const argumentsNodeIsCover =
              this.componentsIsObjectSpread(argumentsNode)
            if (!argumentsNodeIsCover) {
              this.log(
                'componentsIsObjectSpread CallExpression argumentsNode ='
              )
              isCover = false
            }
          } else {
            isCover = false
          }
        })

        return isCover
      }
    }

    return false
  }

  getComponents(node) {
    if (t.isExportDefaultDeclaration(node)) {
      // this.log('getComponents node', node)

      let isNotComponents = false

      const { declaration: declarationNode } = node
      let checkNode = declarationNode

      if (this.isVueExtend(declarationNode)) {
        const { arguments: argumentsNodes } = declarationNode
        const [firstArgument] = argumentsNodes || []

        checkNode = firstArgument
      }

      const componentsPropertieNode = this.findKeyPropertieNode(
        checkNode,
        'components'
      )
      if (componentsPropertieNode) {
        // this.log('getComponents componentsPropertieNode = ', componentsPropertieNode)
        const { value: valueNode } = componentsPropertieNode
        if (t.isObjectExpression(valueNode)) {
          const { properties: propertiesNodes } = valueNode
          // this.log('getComponents propertiesNodes =', propertiesNodes)

          if (propertiesNodes.length) {
            this.propertiesNodes2ComponentsNameMap(propertiesNodes)
            return
          } else {
            isNotComponents = true
          }
        } else if (t.isCallExpression(valueNode)) {
          const isCover = this.componentsIsObjectSpread(valueNode)
          if (isCover) return
          this.log('getComponents CallExpression valueNode =', valueNode)
        }
      } else {
        isNotComponents = true
      }

      if (isNotComponents) {
        this.log(`${this.path} file not components`)
        return
      }
    }
    this.errorLog('getComponents not cover', node)
  }

  init() {
    // this.log('ast = ', this.ast)
    // this.log('ast = ', this.ast.program.body)

    traverse(this.ast, {
      // `Ecmascript`模块相当简单,因为它们是静态的. 这意味着你不能`import`一个变量,
      // 或者有条件地`import`另一个模块.
      // 每次我们看到`import`声明时,我们都可以将其数值视为`依赖性`.
      ImportDeclaration: ({ node }) => {
        // 我们将依赖关系数组推入我们导入的值. ⬅️
        this.dependenciesMap = {
          ...(this.dependenciesMap || {}),
          ...this.getImportDeclarationKeyAndPath(node)
        }
      },
      ExportDefaultDeclaration: ({ node }) => {
        this.getComponents(node)
      },
      VariableDeclaration: ({ node }) => {
        // this.log('VariableDeclaration node', node.declarations)
        this.getVariableDeclarationValue(node)
      },
      ExportNamedDeclaration: ({ node }) => {
        this.getExportNamedMap(node)
      },
      ExpressionStatement: ({ node }) => {
        // this.log('ExpressionStatement', node)

        this.getExpressionStatementValue(node)
      }
    })
  }
}

module.exports = VueFileTransform

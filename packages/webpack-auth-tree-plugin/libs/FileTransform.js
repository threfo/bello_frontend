/* eslint-disable @typescript-eslint/no-var-requires */
const nodePathUtils = require('path')
const fs = require('fs')
const babel = require('@babel/core')
const babelParser = require('@babel/parser')
const traverse = require('babel-traverse').default
const t = require('@babel/types')
const _ = require('lodash')

const dependenciesCache = require('./dependenciesCache')

/**
 * 对一个js/ts 文件进行解析，把执行结果及相关的变量，导出，依赖关系构建起来
 */
class FileTransform {
  constructor({ path }) {
    this.debug = false
    // this.log('path = ', path)

    this.path = path
    this.ast = this.path2Ast(path)
    this.variableMap = {} // 变量
    this.dependenciesMap = {} // 依赖
    this.exportsValueMap = {} // 导出的变量
    this.localName2ImportedName = {} // 引入的依赖 变量名 和 本地的引用别名 关系
    this.init()

    dependenciesCache.setValue(path, this)
  }

  log(...a) {
    if (this.debug) {
      // if (this.path.indexOf('routes.ts') > 0) {
      console.log(this.path, ...a)
    }
  }

  errorLog(...a) {
    console.error(this.path, ...a)
  }

  path2Ast(path) {
    const porps = {}
    const ext = this.getPathExt(path)
    if (ext === '.ts') {
      porps.presets = ['@babel/preset-typescript']
    }
    const transForm = babel.transformFileSync(path, porps)
    // this.log('path2Ast transForm:', transForm)

    const { code, options } = transForm
    const { root } = options
    this.rootPath = root

    this.log('path2Ast 1 code:', code)

    return babelParser.parse(code, {
      sourceType: 'module'
    })
  }

  getPathExt(path) {
    const ext = nodePathUtils.extname(path)
    return ext
  }

  init() {
    // this.log('ast = ', this.ast)
    // this.log('ast = ', this.ast.program.body)

    traverse(this.ast, {
      ImportDeclaration: ({ node }) => {
        // 获取所有的依赖地址
        this.dependenciesMap = {
          ...(this.dependenciesMap || {}),
          ...this.getImportDeclarationKeyAndPath(node)
        }
      },
      ExportDefaultDeclaration: ({ node }) => {
        // 解析出 export default 导出的值
        this.setExportDefault(node)
      },
      VariableDeclaration: ({ node }) => {
        // 解析出 该文件内的全局变量
        // this.log('VariableDeclaration node', node.declarations)
        this.getVariableDeclarationValue(node)
      },
      ExportNamedDeclaration: ({ node }) => {
        // 解析出 export 导出的变量
        this.getExportNamedMap(node)
      },
      ExpressionStatement: ({ node }) => {
        // this.log('ExpressionStatement', node)
        // 执行 定义的 立即执行代码块
        this.getExpressionStatementValue(node)
      }
    })

    this.log('variableMap = ', this.variableMap)
    this.log('dependenciesMap = ', this.dependenciesMap)
    this.log('exportsValueMap = ', this.exportsValueMap)
    this.log('exportDefault = ', this.exportDefault)
  }

  getExportNamedMap(node) {
    if (t.isExportNamedDeclaration(node)) {
      const { declaration: declarationNode } = node
      const map = this.getNodeValue(declarationNode)

      // this.log('map', map)

      if (map) {
        this.exportsValueMap = {
          ...(this.exportsValueMap || {}),
          ...map
        }
        return map
      }
    }
    this.errorLog('getExportNamedMap not cover', node)
  }

  setExportDefault(node) {
    if (t.isExportDefaultDeclaration(node)) {
      const { declaration: declarationNode } = node

      let val = this.getNodeValue(declarationNode)

      if (t.isIdentifier(declarationNode)) {
        val = this.getVariableValue(val)
      }

      if (val) {
        this.exportDefault = val
        return val
      }
    }
    this.errorLog('setExportDefault not cover', node)
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

  setVariableMap(map) {
    Object.keys(map).forEach(key => {
      this.variableMap[key] = map[key]
    })
  }

  getVariableDeclarationValue(node) {
    if (t.isVariableDeclaration(node)) {
      const { declarations = [], range } = node

      let map = {}
      if (declarations.length) {
        declarations.forEach(declarationNode => {
          const variable = this.getNodeValue(declarationNode)
          // this.log('getVariableDeclarationValue', variable)
          if (variable) {
            map = {
              ...map,
              ...variable
            }
          }
        })

        if (range) {
          console.warn('getVariableDeclarationValue have range')
        } else {
          // 全局变量
          this.setVariableMap(map)
        }
        return map
      }
    }
    this.errorLog('getVariableDeclarationValue not cover', node)
  }

  getVariableDeclaratorValue(node) {
    if (t.isVariableDeclarator(node)) {
      const { id: idNode, init: initNode } = node

      const { name } = idNode || {}
      if (!name) {
        this.errorLog('idNode not name', node)
        return
      }
      if (initNode === null) {
        console.warn(`name: ${name} initNode is null`)
        return {
          [name]: null
        }
      }

      let value = this.getNodeValue(initNode)
      // this.log('name: ', name)
      // this.log('value: ', value)

      if (value) {
        if (value.funcName === 'concat' && Array.isArray(value.value)) {
          value = value.value
        }
      }

      return {
        [name]: value
      }
    }

    this.errorLog('getVariableDeclaratorValue not cover', node)
  }

  getNodeValue(node) {
    if (t.isArrayExpression(node)) {
      return this.getArrayExpressionValue(node)
    } else if (t.isCallExpression(node)) {
      return this.getCallExpressionValue(node)
    } else if (t.isObjectExpression(node)) {
      return this.getObjectExpressionValue(node)
    } else if (t.isFunctionExpression(node)) {
      return this.getFunctionExpressionValue(node)
    } else if (t.isIdentifier(node)) {
      return this.getIdentifierValue(node)
    } else if (t.isBlockStatement(node)) {
      return this.getBlockStatementValue(node)
    } else if (t.isReturnStatement(node)) {
      return this.getReturnStatementValue(node)
    } else if (t.isNumericLiteral(node) || t.isStringLiteral(node)) {
      return node.value
    } else if (t.isImport(node)) {
      return 'Import'
    } else if (t.isMemberExpression(node)) {
      return this.getMemberExpressionValue(node)
    } else if (t.isVariableDeclarator(node)) {
      return this.getVariableDeclaratorValue(node)
    } else if (t.isVariableDeclaration(node)) {
      return this.getVariableDeclarationValue(node)
    } else if (t.isExpressionStatement(node)) {
      return this.getExpressionStatementValue(node)
    } else if (t.isAssignmentExpression(node)) {
      return this.getAssignmentExpressionValue(node)
    } else {
      this.errorLog('getNodeValue not cover node', node)
    }
  }

  getAssignmentExpressionValue(node) {
    if (t.isAssignmentExpression(node)) {
      const { left: leftNode, right: rightNode, operator } = node
      const rightValue = this.getNodeValue(rightNode)
      if (operator === '=') {
        if (t.isMemberExpression(leftNode)) {
          const { object: objectNode, property: propertyNode } = leftNode
          const propertyNodeValue = this.getNodeValue(propertyNode)
          if (propertyNodeValue) {
            if (t.isIdentifier(objectNode)) {
              const { range, name } = objectNode
              if (!range) {
                _.set(
                  this.variableMap,
                  `${name}.${propertyNodeValue}`,
                  rightValue
                )
                if (this.exportsValueMap[name] !== undefined) {
                  this.exportsValueMap[name] = this.variableMap[name]
                }

                return this.variableMap
              }
            }
          }
        }
      }
    }

    this.errorLog('getAssignmentExpressionValue not cover', node)
  }

  getExpressionStatementValue(node) {
    if (t.isExpressionStatement(node)) {
      const { expression: expressionNode } = node
      const val = this.getNodeValue(expressionNode)
      if (val) {
        return val
      }
    }
    this.errorLog('getExpressionStatementValue not cover', node)
  }

  getMemberExpressionValue(node) {
    if (t.isMemberExpression(node)) {
      const { object: objectNode, property: propertyNode } = node

      // this.log('getMemberExpressionValue', node)

      const objectNodeValue = this.getNodeValue(objectNode)
      const propertyNodeValue = this.getNodeValue(propertyNode)

      if (t.isIdentifier(objectNode) && t.isIdentifier(propertyNode)) {
        const val = this.getVariableValue(objectNodeValue)
        if (val) {
          return val[propertyNodeValue]
        }
      }

      // this.log('objectNodeValue:', objectNodeValue)
      // this.log('propertyNodeValue:', propertyNodeValue)

      return {
        funcName: propertyNodeValue,
        obj: objectNodeValue
      }
    }
    this.errorLog('getMemberExpressionValue not cover node', node)
  }

  getReturnStatementValue(node) {
    if (t.isReturnStatement(node)) {
      const { argument } = node
      return this.getNodeValue(argument)
    }
    this.errorLog('getReturnStatementValue not cover node', node)
  }

  getBlockStatementValue(node) {
    if (t.isBlockStatement(node)) {
      const { body = [] } = node
      if (body.length) {
        if (body.length === 1) {
          const [firstNode] = body
          return this.getNodeValue(firstNode)
        } else {
          const hadReturn = body.find(item => t.isReturnStatement(item))
          if (hadReturn) {
            // TODO
            this.errorLog('getBlockStatementValue not cover hadReturn', node)
          } else {
            // vold function
            return 'voldFunc'
          }
        }
      }
    }

    // this.errorLog('getBlockStatementValue not cover node', node)
  }

  getIdentifierValue(node) {
    if (t.isIdentifier(node)) {
      const { name } = node
      if (name) {
        return name
      }
    }
    this.errorLog('getIdentifierValue node not name', node)
  }

  getFunctionExpressionValue(node) {
    if (t.isFunctionExpression(node)) {
      const { id: idNode, body: bodyNode } = node

      const idValue = this.getNodeValue(idNode)
      const bodyNodeValue = this.getNodeValue(bodyNode)
      // this.log('bodyNodeValue =', bodyNodeValue)

      if (bodyNodeValue) {
        if (bodyNodeValue === 'voldFunc') {
          return 'voldFunc'
        }

        const { funcName, value } = bodyNodeValue
        if (funcName === 'Import') {
          this.dependenciesMap = {
            ...this.dependenciesMap,
            [idValue]: value
          }

          return value
        }
      }
    }
    this.errorLog('getFunctionExpressionValue not cover', node)
  }

  getObjectExpressionValue(node) {
    if (t.isObjectExpression(node)) {
      const obj = {}

      const { properties } = node

      if (properties) {
        properties.forEach(propertieItem => {
          const { key, value, valueNode } =
            this.getObjectPropertyValue(propertieItem) || {}
          if (key && value !== undefined) {
            obj[key] = value
          } else {
            const val = this.getNodeValue(valueNode)

            if (val !== undefined) {
              if (t.isIdentifier(valueNode)) {
                obj[key] = this.getVariableValue(val)
              } else {
                obj[key] = val
              }
            }
          }
        })
      }
      return obj
    }
  }

  getObjectPropertyValue = node => {
    if (t.isObjectProperty(node)) {
      let key
      let value
      const { key: keyNode, value: valueNode } = node
      if (keyNode) {
        key = keyNode.name
      }

      if (valueNode) {
        value = valueNode.value
      }
      return { key, value, keyNode, valueNode }
    }
  }

  getArrayExpressionValue(node) {
    if (t.isArrayExpression(node)) {
      const arr = []
      const { elements } = node
      if (elements) {
        elements.forEach(ele => {
          const obj = this.getNodeValue(ele)

          if (obj !== undefined) {
            if (t.isIdentifier(ele)) {
              arr.push(this.getVariableValue(obj))
            } else {
              arr.push(obj)
            }
          } else {
            console.warn('ele cant to obj', ele)
          }
        })
      }
      return arr
    }
  }

  getCallExpressionValue(node) {
    if (t.isCallExpression(node)) {
      const { callee } = node

      const callFuncMap = {
        _toConsumableArray: this.toConsumableArrayFunc,
        load: this.loadFunc,
        Import: this.importFunc,
        concat: this.arrayConcatFunc
      }
      let funcName
      let args
      if (_.isString(callee)) {
        funcName = callFuncMap[callee]
      } else {
        const calleeValue = this.getNodeValue(callee)
        if (_.isString(calleeValue)) {
          if (
            ['voldFunc', 'getMenuList', 'require', 'console.log'].includes(
              calleeValue
            )
          ) {
            return 'voldFunc'
          }
          funcName = calleeValue
        } else if (calleeValue) {
          // MemberExpression 的情况
          const { funcName: calleeValueFuncName, obj } = calleeValue
          if (calleeValueFuncName) {
            funcName = calleeValueFuncName
            args = obj
          }
        }
      }

      const func = callFuncMap[funcName]

      if (func) {
        const value = func.call(this, node, args)
        if (funcName === '_toConsumableArray') {
          return value
        } else if (funcName === 'concat') {
          return value
        }
        return {
          funcName,
          value
        }
      } else {
        this.errorLog(`this node func no cover funcName:`, funcName, node)
      }
    }
  }

  getVariableValue(key) {
    let val = (this.variableMap || {})[key]
    if (!val) {
      const dependenciesPath = (this.dependenciesMap || {})[key]
      if (dependenciesPath) {
        val = this.getDependenciesValue(dependenciesPath, key)
      } else if (['console'].includes(key)) {
        return { log: 'console.log' }
      } else {
        this.errorLog(
          `getVariableValue name: '${key}' not in variableMap`,
          this.variableMap
        )
      }
    }

    return val
  }

  fixPath(path) {
    let newPath = path
    if (Array.isArray(path) && path.length === 1) {
      newPath = path[0]
    }

    if (_.isString(newPath)) {
      if (newPath.indexOf('@') === 0) {
        newPath = nodePathUtils.resolve(
          this.rootPath,
          newPath.replace('@', './src')
        )
      } else if (newPath.indexOf('.') === 0) {
        newPath = nodePathUtils.resolve(nodePathUtils.dirname(this.path), path)
      }
      const ext = this.getPathExt(newPath)
      if (ext === '') {
        const extArr = ['.ts', '.js']
        const nextExt = extArr.find(item => fs.existsSync(`${newPath}${item}`))
        if (nextExt) {
          newPath = `${newPath}${nextExt}`
        } else {
          this.errorLog(`not find file ${newPath}, rootPath: ${this.rootPath}`)
        }
      }
      if (ext === '.vue') {
        // TODO 解析 vue
      }
    }
    return newPath
  }

  getDependenciesValue(path, key) {
    const filePath = this.fixPath(path)
    // this.log('path', filePath)

    let dependenciesFile = dependenciesCache.getValue(filePath)
    if (!dependenciesFile) {
      dependenciesFile = new FileTransform({
        path: filePath
      })
      dependenciesCache.setValue(filePath, dependenciesFile)
    }

    let val

    const importedName = this.localName2ImportedName[key]
    if (importedName) {
      val = dependenciesFile.exportsValueMap[importedName]
    } else {
      val = dependenciesFile.exportDefault
    }

    if (val) {
      return val
    }

    this.errorLog(
      `getDependenciesValue not cover path: ${path}, key: ${key}, dependenciesFile:`,
      dependenciesFile
    )
  }

  getArgsValue(nodes) {
    const values = []

    nodes.forEach(node => {
      if (t.isIdentifier(node)) {
        values.push(this.getVariableValue(node.name))
      } else if (node.value) {
        values.push(node.value)
      } else {
        const val = this.getNodeValue(node)

        if (val) {
          values.push(val)
        } else {
          this.errorLog('getArgsValue not cover', node)
        }
      }
    })

    return values
  }

  toConsumableArrayFunc(node) {
    if (node.arguments) {
      const values = this.getArgsValue(node.arguments) || {}
      if (values && values.length === 1) {
        return values[0]
      }
    }
    this.errorLog('toConsumableArray not cover', node)
  }

  loadFunc(node) {
    if (node.arguments) {
      const values = this.getArgsValue(node.arguments) || {}
      if (values) {
        return values
      }
    }
    this.errorLog('loadFunc cant get the value', node)
  }

  importFunc(node) {
    if (node.arguments) {
      const values = this.getArgsValue(node.arguments) || {}
      if (values) {
        return values
      }
    }
    this.errorLog('importFunc not cover', node)
  }

  arrayConcatFunc(node, arr = []) {
    if (node.arguments) {
      const values = this.getArgsValue(node.arguments) || {}
      if (values) {
        // this.log('arrayConcatFunc arr', arr)
        // this.log('arrayConcatFunc values', values)
        return arr.concat(...values)
      }
    }
  }
}

module.exports = FileTransform

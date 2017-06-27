const cheerio = require('cheerio')
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')
const vm = require('vm')

const prop = (obj, propPath) => propPath.split('.').reduce((o, p) => o[p], obj)

const evaluate = (js, varName) => {
  try {
    const sandbox = { window: {} }
    const script = new vm.Script(`${varName}=${js}`)
    const ctx = new vm.createContext(sandbox)
    const value = script.runInContext(ctx)
    return {
      value,
      sandbox
    }
  } catch (ex) {
    throw new Error(`could not eval ${js}\nexception: ${ex}`)
  }
}

const getVarNameFromAssignmentExpression = (e, str = '') => {
  return e.type === 'MemberExpression'
    ? getVarNameFromAssignmentExpression(
        e.object,
        `${e.property.name}${str ? `.${str}` : ''}`
      )
    : `${e.name}.${str}`
}

module.exports = function getScriptTagVars (html, vars) {
  let varsArray = Array.isArray(vars) ? vars : [vars]
  const opts = {
    format: {
      json: true,
      quotes: 'double'
    }
  }
  const retVal = varsArray.reduce((acc, v) => {
    acc[v] = undefined
    return acc
  }, {})
  const $ = cheerio.load(html)
  const scripts = $('script').get()
  let varName
  for (let script of scripts) {
    let js = $(script).html()
    let ast = esprima.parse(js)
    estraverse.traverse(ast, {
      enter: function (node) {
        if (node.type === 'VariableDeclarator') {
          varName = node.id.name
          if (~varsArray.indexOf(varName)) {
            let str = escodegen.generate(node.init, opts)
            retVal[varName] = evaluate(str).value
          }
        }
        if (node.type === 'AssignmentExpression') {
          varName = `${node.left.object.name}.${node.left.property.name}`
          let propName = getVarNameFromAssignmentExpression(node.left)
          if (~varsArray.indexOf(propName)) {
            let str = escodegen.generate(node.right, opts)
            let res = evaluate(str, varName)
            retVal[varName] = prop(res.sandbox, varName)
          }
        }
      }
    })
  }
  return Array.isArray(vars) ? retVal : retVal[varName]
}

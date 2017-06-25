const cheerio = require('cheerio')
const esprima = require('esprima')
const estraverse = require('estraverse')
const escodegen = require('escodegen')

const evaluate = (js) => {
  try {
    let retVal = eval(`(${js})`)
    return retVal
  } catch (ex) {
    throw new Error(`could not eval ${js}\nexception: ${ex}`)
  }
}

const getVarNameFromAssignmentExpression = (e, str = '') => {
  return e.type === 'MemberExpression'
    ? getVarNameFromAssignmentExpression(e.object, `${e.property.name}${str ? `.${str}` : ''}`)
    : `${e.name}.${str}`
}

module.exports = function getScriptTagVars (html, vars) {
  let varsArray = Array.isArray(vars)
    ? vars
    : [vars]
  const opts = {
    format: {
      json: true,
      quotes: 'double',
    }
  }
  const retVal = varsArray.reduce((acc, v) => { acc[v] = undefined; return acc }, {})
  const $ = cheerio.load(html)
  const scripts = $('script').get()
  for (let script of scripts) {
    let js = $(script).html()
    let ast = esprima.parse(js)
    estraverse.traverse(ast, {
      enter: function (node) {
        if (node.type === 'VariableDeclarator') {
          const varName = node.id.name
          if (~varsArray.indexOf(varName)) {
            let str = escodegen.generate(node.init, opts)
            retVal[varName] = evaluate(str)
          }
        }
        if (node.type === 'AssignmentExpression') {
          const varName = `${node.left.object.name}.${node.left.property.name}`
          let propName = getVarNameFromAssignmentExpression(node.left)
          if (~varsArray.indexOf(propName)) {
            let str = escodegen.generate(node.right, opts)
            retVal[varName] = evaluate(str)
          }
        }
      }
    })
  }
  return retVal
}

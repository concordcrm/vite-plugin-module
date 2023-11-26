import babelTraverse from '@babel/traverse'
import t from '@babel/types'

const traverse = babelTraverse.default

// route "showAlert" to Innoclapps.success|info|error()
export default function (ast) {
  let replaced = false

  traverse(ast, {
    CallExpression(path) {
      const node = path.node

      if (
        t.isIdentifier(node.callee) &&
        node.callee.name === 'showAlert' &&
        node.arguments.length > 1 &&
        t.isStringLiteral(node.arguments[0])
      ) {
        const alertType = node.arguments[0].value // get the type of alert ('success', 'error', 'info')

        if (['success', 'error', 'info'].includes(alertType)) {
          node.callee = t.memberExpression(
            t.identifier('Innoclapps'),
            t.identifier(alertType) // set the method name based on the alert type
          )
          node.arguments.shift() // remove the first argument, which is the alert type
          replaced = true
        }
      }
    },
  })

  return replaced
}

import babelTraverse from '@babel/traverse'
import t from '@babel/types'

const traverse = babelTraverse.default

// route "scriptConfig" to Innoclapps.config()
export default function (ast) {
  let replaced = false
  traverse(ast, {
    CallExpression(path) {
      const node = path.node

      if (t.isIdentifier(node.callee) && node.callee.name === 'scriptConfig') {
        replaced = true
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.identifier('Innoclapps'),
              t.identifier('config')
            ),
            node.arguments
          )
        )
      }
    },
  })

  return replaced
}

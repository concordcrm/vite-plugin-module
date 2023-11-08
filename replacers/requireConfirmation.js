import babelTraverse from '@babel/traverse'
import t from '@babel/types'

const traverse = babelTraverse.default

// route "requireConfirmation" to Innoclapps.dialog().confirm()
export default function (ast) {
  let replaced = false

  traverse(ast, {
    CallExpression(path) {
      const node = path.node

      if (
        t.isIdentifier(node.callee) &&
        node.callee.name === 'requireConfirmation'
      ) {
        replaced = true
        // Replace with Innoclapps.dialog().confirm()
        path.replaceWith(
          t.callExpression(
            t.memberExpression(
              t.callExpression(
                t.memberExpression(
                  t.identifier('Innoclapps'),
                  t.identifier('dialog')
                ),
                []
              ),
              t.identifier('confirm')
            ),
            node.arguments // pass along any arguments
          )
        )
      }
    },
  })

  return replaced
}

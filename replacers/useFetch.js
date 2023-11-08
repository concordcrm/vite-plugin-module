import babelTraverse from '@babel/traverse'
import t from '@babel/types'

const traverse = babelTraverse.default

// route "useFetch" to Innoclapps.request()
export default function (ast) {
  let replaced = false
  traverse(ast, {
    CallExpression(path) {
      const node = path.node

      if (t.isIdentifier(node.callee) && node.callee.name === 'useFetch') {
        replaced = true

        if (node.arguments.length === 0) {
          // No arguments: replace with Innoclapps.request() with no args
          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.identifier('Innoclapps'),
                t.identifier('request')
              ),
              []
            )
          )
        } else {
          // Create the object argument for Innoclapps.request
          const objectProperties = [
            t.objectProperty(t.identifier('method'), t.stringLiteral('get')),
          ]

          const firstArg = node.arguments[0]

          if (firstArg) {
            if (t.isStringLiteral(firstArg) || t.isTemplateLiteral(firstArg)) {
              objectProperties.push(
                t.objectProperty(t.identifier('url'), firstArg)
              )
            } else if (t.isObjectExpression(firstArg)) {
              // If it's an object, assume it should be spread into the request options
              objectProperties.push(t.spreadElement(firstArg))
            }
          }

          const requestOptions = t.objectExpression(objectProperties)

          // Replace the call expression
          path.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.identifier('Innoclapps'),
                t.identifier('request')
              ),
              [requestOptions]
            )
          )
        }
      }
    },
  })

  return replaced
}

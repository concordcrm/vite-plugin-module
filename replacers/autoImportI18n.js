import babelTraverse from '@babel/traverse'
import t from '@babel/types'

const traverse = babelTraverse.default

export default function (ast) {
  let hasUseI18nImport = false
  let imported = false

  traverse(ast, {
    ImportDeclaration(path) {
      // First pass to check for any "useI18n" import
      const source = path.node.source.value

      if (source === 'vue-i18n' || source === 'core/i18n') {
        hasUseI18nImport = true
      }
    },
    VariableDeclarator(path) {
      const node = path.node

      if (
        !hasUseI18nImport &&
        t.isObjectPattern(node.id) &&
        t.isCallExpression(node.init) &&
        t.isIdentifier(node.init.callee) &&
        node.init.callee.name === 'useI18n'
      ) {
        imported = true

        node.init = t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier('_app_'), t.identifier('i18n')),
            t.identifier('useI18n')
          ),
          [] // arguments to the function call, empty in this case
        )
      }
    },
  })

  return imported
}

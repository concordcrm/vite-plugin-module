import t from '@babel/types'

export default function (ast) {
  let replaced = false

  ast.program.body.forEach((node, index, object) => {
    if (t.isImportDeclaration(node)) {
      const libName = node.source.value

      const handleCoreImport = (
        coreKey,
        specificImport = null,
        nest = true
      ) => {
        replaced = true
        let namedImports = node.specifiers.filter(t.isImportSpecifier)
        let defaultImport = node.specifiers.find(t.isImportDefaultSpecifier)
        let newSpecifiers = []

        if (namedImports.length > 0) {
          namedImports.forEach(named => {
            let useThisKey = specificImport
              ? named.imported.name === specificImport
              : true

            let coreBase

            if (coreKey === 'Vue') {
              coreBase = t.identifier('Vue') // Global Vue
            } else {
              coreBase = nest
                ? t.memberExpression(
                    t.identifier('_app_'),
                    t.identifier(coreKey)
                  )
                : t.identifier('_app_')
            }

            if (useThisKey) {
              newSpecifiers.push(
                t.variableDeclarator(
                  t.identifier(named.local.name),
                  t.memberExpression(
                    coreBase,
                    t.identifier(named.imported.name)
                  )
                )
              )
            }
          })
        }

        if (defaultImport) {
          let defaultImportIdentifier = specificImport || coreKey

          let coreBase

          if (coreKey === 'Vue') {
            coreBase = t.identifier('Vue') // Global Vue
          } else {
            coreBase = t.memberExpression(
              t.identifier('_app_'),
              t.identifier(defaultImportIdentifier)
            )
          }

          newSpecifiers.push(
            t.variableDeclarator(
              t.identifier(defaultImport.local.name),
              coreBase
            )
          )
        }

        object[index] = t.variableDeclaration('const', newSpecifiers)
      }

      if (libName === 'vue') {
        handleCoreImport('Vue')
      } else if (libName === 'core/store' || libName === 'vuex') {
        handleCoreImport('store')
      } else if (libName === 'core/i18n' || libName === 'vue-i18n') {
        handleCoreImport('i18n')
      } else if (libName === 'core/route') {
        handleCoreImport('router', 'useRoute')
      } else if (libName === 'core/router' || libName === 'vue-router') {
        handleCoreImport('router')
      }
    }
  })

  return replaced
}

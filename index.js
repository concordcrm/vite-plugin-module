import babelGenerator from '@babel/generator'
import parser from '@babel/parser'
import path from 'path'
import { fileURLToPath } from 'url'
import GlobalVue from '@concordcrm/vite-plugin-global-vue'

import autoImportI18n from './replacers/autoImportI18n'
import coreImports from './replacers/core'
import requireConfirmation from './replacers/requireConfirmation'
import scriptConfig from './replacers/scriptConfig'
import showAlert from './replacers/showAlert'
import useFetch from './replacers/useFetch'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const generate = babelGenerator.default
const projectRootDir = path.resolve(__dirname, '../../../')

const moduleAliasRegex = /~\/([a-zA-Z]+)\/(.*)/

const replacers = [
  autoImportI18n,
  coreImports,
  requireConfirmation,
  scriptConfig,
  showAlert,
  useFetch,
]

// eslint-disable-next-line no-unused-vars
export default function AppPlugin(moduleName) {
  return {
    name: 'vite-plugin-app',
    config: () => ({
      plugins: [GlobalVue('3.3.8')],

      resolve: {
        alias: [
          {
            find: moduleAliasRegex,
            replacement: projectRootDir + '/modules/$1/resources/js/$2',
          },
        ],
      },
      build: {
        rollupOptions: {
          external: [
            'vuex',
            'vue-i18n',
            'vue-router',
            'core/i18n',
            'core/store',
            'core/route',
            'core/router',
          ],
        },
      },
    }),
    transform(code, id) {
      // Check if the file is a JavaScript or Vue file
      if (!/\.(js|jsx|ts|tsx|vue)$/.test(id)) {
        return
      }

      if (id.includes('node_modules')) {
        return
      }

      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx'],
      })

      let hasChanges = false

      replacers.forEach(replacer => {
        if (replacer(ast)) {
          hasChanges = true
        }
      })

      if (hasChanges) {
        const output = generate(ast, {})

        return output.code
      }
    },
  }
}

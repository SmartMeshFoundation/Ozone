// Configuration for your app

module.exports = function (ctx) {
  return {
    // app plugins (/src/plugins)
    plugins: ['axios', 'vuelidate', 'global', 'components', 'i18n'],
    css: ['app.styl'],
    extras: [
      ctx.theme.mat ? 'roboto-font' : null,
      'material-icons',
      'fontawesome'
    ],
    supportIE: false,

    build: {
      scopeHoisting: true,
      vueRouterMode: 'history',
      // gzip: true,
      // analyze: true,
      // extractCSS: false,
      // useNotifier: false,
      extendWebpack (cfg) {
        cfg.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules|quasar)/
        })
      }
    },
    devServer: {
      // https: true,
      // port: 8080,
      open: true // opens browser window automatically
    },
    // framework: 'all' --- includes everything; for dev only!
    framework: {
      i18n: 'en-us',
      components: [
        'QLayout',
        'QLayoutHeader',
        'QLayoutDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QBtnGroup',
        'QBtn',
        'QIcon',
        'QList',
        'QListHeader',
        'QItem',
        'QItemMain',
        'QItemSide',
        'QItemTile',
        'QModal',
        'QModalLayout',
        'QSearch',
        'QInput',
        'QField',
        'QChip',
        'QTooltip',
        'QSelect',
        'QSpinner',
        'QSpinnerBars',
        'QSpinnerGears',
        'QProgress',
        'QAlert',
        'QToggle',
        'QInnerLoading',
        'QTable',
        'QBreadcrumbs',
        'QBreadcrumbsEl',
        'QSlider',
        'QPopover',
        'QCollapsible'
      ],
      directives: ['Ripple', 'CloseOverlay'],
      // Quasar plugins
      plugins: ['Notify', 'Loading', 'Dialog']
    },
    animations: 'all',
    electron: {
      extendWebpack (cfg) {
        // do something with cfg
      },
      beforePackaging: function (opts) {
        // do nothings
      },

      // electron-builder options
      builder: {
        appId: 'io.smartmesh.ozone',
        mac: {
          category: 'public.app-category.productivity',
          icon: 'src-electron/icons/icon.icns',
          target: 'dmg',
          artifactName: '${productName}-macosx-${version}.${ext}'
        },
        win: {
          icon: 'src-electron/icons/icon.ico',
          target: 'nsis',
          artifactName: '${productName}-win64-${version}.${ext}'
        },
        //for windows package
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          runAfterFinish: true
        },
        linux: {
          category: 'Utility',
          icon: 'src-electron/icons/icon.png',
          target: 'zip',
          artifactName: '${productName}-linux64-${version}.${ext}'
        }
      }
    },

    // leave this here for Quasar CLI
    starterKit: '1.0.2'
  }
}

const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  productionSourceMap: false,
  
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }),
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 10240,
        minRatio: 0.8
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          qrcode: {
            name: 'chunk-qrcode',
            test: /[\\/]node_modules[\\/]qrcode[\\/]/,
            priority: 20
          },
          opencc: {
            name: 'chunk-opencc',
            test: /[\\/]node_modules[\\/]opencc-js[\\/]/,
            priority: 20
          },
          pdf: {
            name: 'chunk-pdf',
            test: /[\\/]node_modules[\\/](pdfjs-dist|jspdf|pdf-lib)[\\/]/,
            priority: 20
          },
          common: {
            name: 'chunk-common',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
  },
  
  css: {
    extract: true,
    sourceMap: false
  },
  
  chainWebpack: config => {
    config.module
      .rule('images')
      .set('parser', {
        dataUrlCondition: {
          maxSize: 10 * 1024
        }
      })

    // pdfjs-dist 的 legacy build 已預先編譯供舊瀏覽器使用，
    // 若再經 babel（transpileDependencies: true）會注入 core-js 裸模組路徑，
    // 導致其 worker 於瀏覽器動態載入時無法解析，故排除其轉譯。
    config.module
      .rule('js')
      .exclude
      .add(/node_modules[\\/]\.pnpm[\\/]pdfjs-dist@[^\\/]+[\\/]node_modules[\\/]pdfjs-dist/)
      .add(/node_modules[\\/]pdfjs-dist/)
      .end()
  }
})

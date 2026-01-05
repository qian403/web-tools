const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = defineConfig({
  transpileDependencies: true,
  
  // 生產環境不產生 source map
  productionSourceMap: false,
  
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(true),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }),
      // Gzip 壓縮
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
          // 第三方套件獨立打包
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          // QRCode 獨立打包（較大）
          qrcode: {
            name: 'chunk-qrcode',
            test: /[\\/]node_modules[\\/]qrcode[\\/]/,
            priority: 20
          },
          // OpenCC 獨立打包（較大）
          opencc: {
            name: 'chunk-opencc',
            test: /[\\/]node_modules[\\/]opencc-js[\\/]/,
            priority: 20
          },
          // 共用元件
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
  
  // CSS 優化
  css: {
    extract: true,
    sourceMap: false
  },
  
  chainWebpack: config => {
    // 圖片壓縮
    config.module
      .rule('images')
      .set('parser', {
        dataUrlCondition: {
          maxSize: 10 * 1024 // 10KB 以下轉 base64
        }
      })
  }
})

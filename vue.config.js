// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://backend.digantara.dev',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/v1'
        }
      }
    }
  }
};

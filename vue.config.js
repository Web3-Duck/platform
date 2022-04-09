const path = require('path');
module.exports = {
  publicPath: './', //配置本地引用目录文件,如不配置，默认为`/`
  devServer: {
    open: true,
    port: 8080,
    hot: true,
    proxy: {
      '/data.json': {
        target: `http://daolauncher.info`,
        // target: `https://wax.defibox.io`,
        ws: false,
        changeOrigin: true,
      },
    },
  },
  pluginOptions: {},
  css: {},
};

module.exports = {
  // Tell Vue CLI to transpile this dependency (it uses modern JS syntax like `??`)
  transpileDependencies: [
    'chartjs-plugin-zoom'
  ],

  // Extend webpack config to use vue-template-babel-compiler
  chainWebpack: config => {
    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.compiler = require('vue-template-babel-compiler');
        return options;
      });
  }
};
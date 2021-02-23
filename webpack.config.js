/* eslint-env node */
const path = require('path');
const webpack = require('webpack');

module.exports = (env, argv) => {
  const PROD = argv.mode === 'production';
  return {
    entry: './src/index.js',
    devServer: {
      publicPath: '/dist/',
    },
    output: {
      path: path.join(__dirname, 'dist'),
      filename: 'cytoscape-elk.js',
      library: 'cytoscapeElk',
      libraryTarget: 'umd',
      libraryExport: 'default',
      globalObject: 'this',
    },
    module: {
      rules: [{ test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }],
    },
    optimization: {
      minimize: false,
    },
    externals: PROD
      ? {
          'elkjs/lib/elk.bundled.js': {
            commonjs: 'elkjs',
            commonjs2: 'elkjs',
            amd: 'elkjs',
            root: 'ELK',
          },
        }
      : [],
  };
};

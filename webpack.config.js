const path = require('path');
const pkg = require('./package.json');
const camelcase = require('camelcase');
const process = require('process');
const webpack = require('webpack');
const env = process.env;
const NODE_ENV = env.NODE_ENV;
const MIN = env.MIN;
const PROD = NODE_ENV === 'production';

let config = {
  devtool: PROD ? false : 'inline-source-map',
  entry: './src/index.js',
  devServer: {
    publicPath: '/dist/'
  },
  output: {
    path: path.join( __dirname, 'dist' ),
    filename: pkg.name + '.js',
    library: camelcase( pkg.name ),
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }
    ]
  },
  externals: PROD ? {
    'elkjs/lib/elk.bundled.js': {
      commonjs: 'elkjs',
      commonjs2: 'elkjs',
      amd: 'elkjs',
      root: 'ELK'
    },
  } : [],
  plugins: MIN ? [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: false,
      }
    })
  ] : []
};

module.exports = config;

/* eslint-env node */
const path = require('path');
const process = require('process');
const webpack = require('webpack');
const {env} = process;
const {NODE_ENV, MIN} = env;
const PROD = NODE_ENV === 'production';

const config = {
  devtool: PROD ? false : 'inline-source-map',
  entry: './src/index.js',
  devServer: {
    publicPath: '/dist/',
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'cytoscape-elk.js',
    library: 'cytoscapeElk',
    libraryTarget: 'umd',
  },
  module: {
    rules: [{ test: /\.js$/, exclude: /node_modules/, use: 'babel-loader' }],
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
  plugins: MIN
    ? [
        new webpack.optimize.UglifyJsPlugin({
          compress: {
            warnings: false,
            drop_console: false,
          },
        }),
      ]
    : [],
};

module.exports = config;

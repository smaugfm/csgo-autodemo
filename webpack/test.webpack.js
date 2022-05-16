const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: './test/test.ts',
  devtool: 'source-map',
  target: 'node',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, '../.webpack/test'),
    filename: 'test.js',
  },
  module: {
    rules: require('./common-loaders'),
  },
};

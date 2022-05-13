module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  target: 'web',
  devtool: 'cheap-module-source-map',
  module: {
    rules: require('./common-loaders').concat([
      {
        test: /\.(css|sass|scss)$/,
        use: ['style-loader', 'css-loader'],
      },
    ]),
  },
};

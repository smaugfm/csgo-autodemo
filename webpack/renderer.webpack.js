module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
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

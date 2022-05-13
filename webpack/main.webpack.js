module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: './electron/main.ts',
  module: {
    rules: require('./common-loaders').concat([
      {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: '@vercel/webpack-asset-relocator-loader',
          options: {
            outputAssetBase: 'native_modules',
          },
        },
      },
    ]),
  },
};

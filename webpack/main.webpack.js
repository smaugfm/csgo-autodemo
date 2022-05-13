const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  entry: './electron/main.ts',
  target: 'electron-main',
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'assets/gamestate_integration_autodemo.cfg',
          to: 'gamestate_integration_autodemo.cfg',
        },
      ],
    }),
  ],
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

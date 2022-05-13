module.exports = [
  {
    test: /native_modules\/.+\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(js|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
    },
  },
  {
    test: /\.(png|jpe?g|gif|svg|woff(2)?|ttf|eot)$/i,
    type: 'asset/resource',
  },
];

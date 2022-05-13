module.exports = {
  packagerConfig: {
    icon: 'assets/app',
    extraResource: ['assets/app.png', 'assets/app.svg'],
  },
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack/main.webpack.js',
        renderer: {
          config: './webpack/renderer.webpack.js',
          entryPoints: [
            {
              html: './public/index.html',
              js: './src/index.tsx',
              name: 'main_window',
              preload: {
                js: './electron/preload.ts',
              },
            },
          ],
        },
      },
    ],
  ],
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Autodemo',
        overwrite: true,
      },
    },
  ],
};

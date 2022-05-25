const packageJson = require('./package.json');

module.exports = {
  packagerConfig: {
    icon: 'assets/app',
    extraResource: ['assets/app.png', 'assets/app@2x.png', 'assets/app.svg'],
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
      platforms: ['darwin'],
      config: {
        name: packageJson.prettyName,
        overwrite: true,
      },
    },
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        name: packageJson.prettyName,
        overwrite: true,
      },
    },
    {
      name: '@electron-forge/maker-zip',
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      platforms: ['darwin', 'win32'],
      config: {
        repository: {
          owner: packageJson.owner,
          name: packageJson.name,
        },
        draft: true,
      },
    },
  ],
};

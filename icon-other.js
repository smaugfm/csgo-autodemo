const sharp = require('sharp');
(async () => {
  await sharp('assets/app.svg')
    .resize({
      width: 256,
      height: 256,
    })
    .png()
    .toFile('assets/app.png');
})();

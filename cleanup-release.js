(async () => {
  require('dotenv').config();
  const { Octokit } = require('@octokit/rest');

  const packageJson = require('./package.json');

  const options = {
    repo: packageJson.name,
    owner: packageJson.owner,
  };

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const latestReleases = await octokit.repos.listReleases(options);
  const latest = latestReleases.data?.[0];
  if (!latest) {
    console.log('No releases, nothing to cleanup');
    return;
  }

  const assets = (
    await octokit.rest.repos.listReleaseAssets({
      ...options,
      release_id: latest.id,
    })
  ).data;

  const dmg = assets.find(x => x.name === `${packageJson.productName}.dmg`);
  if (dmg) {
    const newName = `${packageJson.productName}-${process.arch}-${packageJson.version}.dmg`;
    console.log(`Renaming ${dmg.name} to ${newName}`);
    await octokit.rest.repos.updateReleaseAsset({
      ...options,
      asset_id: dmg.id,
      name: newName,
    });
  }
})();

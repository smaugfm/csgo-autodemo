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

  const fileReleases = assets.find(x => x.name === 'RELEASES');
  if (fileReleases) {
    console.log('Removing RELEASES file...');
    await octokit.rest.repos.deleteReleaseAsset({
      ...options,
      asset_id: fileReleases.id,
    });
  }

  const nupkgFiles = assets.filter(x => x.name.endsWith('.nupkg'));
  if (nupkgFiles.length > 0) {
    console.log('Removing *.nupkg files...');
    await Promise.all(
      nupkgFiles.map(file => {
        return octokit.rest.repos.deleteReleaseAsset({
          ...options,
          asset_id: file.id,
        });
      }),
    );
  }

  const dmg = assets.find(x => x.name === `${packageJson.prettyName}.dmg`);
  if (dmg) {
    const newName = `${packageJson.prettyName}-${process.arch}-${packageJson.version}.dmg`;
    console.log(`Renaming ${dmg.name} to ${newName}`);
    await octokit.rest.repos.updateReleaseAsset({
      ...options,
      asset_id: dmg.id,
      name: newName,
    });
  }

  const repoNameFiles = assets.filter(x => x.name.startsWith(options.repo));
  if (repoNameFiles.length > 0) {
    console.log(
      `Renaming ${options.repo}* files to ${packageJson.prettyName}* files...`,
    );
    await Promise.all(
      repoNameFiles.map(file => {
        const newName =
          packageJson.prettyName + file.name.substring(packageJson.name.length);
        return octokit.rest.repos.updateReleaseAsset({
          ...options,
          asset_id: file.id,
          name: newName,
        });
      }),
    );
  }
})();

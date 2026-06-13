const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const ora = require('ora');

module.exports = {
  check: async () => {
    const res = await fetch("https://api.github.com/repos/Harinrayanan-TR/sysvewi/releases/latest", {
      headers: { Authorization: `token ${process.env.GH_TOKENS}` }
    });
    const data = await res.json();
    const version = data.tag_name;
    if (version.startsWith("v1.1.") && version <= "v1.1.9") return version;
    return null;
  },
  download: async (version) => {
    const spinner = ora(`Downloading ${version}...`).start();
    const res = await fetch(`https://github.com/Harinrayanan-TR/sysvewi/archive/${version}.zip`, {
      headers: { Authorization: `token ${process.env.GH_TOKENS}` }
    });
    const filePath = path.join(__dirname, `../updates/${version}.zip`);
    const stream = fs.createWriteStream(filePath);
    await new Promise((resolve, reject) => {
      res.body.pipe(stream);
      res.body.on("error", reject);
      stream.on("finish", resolve);
    });
    spinner.succeed(`Update ${version} downloaded successfully.`);
  }
};

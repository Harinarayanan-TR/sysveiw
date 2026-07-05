const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function verify(options = {}) {
  return new Promise((resolve) => {
    try {
      const rootDir = options.rootDir || __dirname;
      const manifestPath = options.manifestPath || path.join(rootDir, 'hash-manifest.json');

      if (!fs.existsSync(manifestPath)) {
        resolve(false);
        return;
      }

      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!Array.isArray(manifest)) {
        resolve(false);
        return;
      }

      for (const entry of manifest) {
        const filePath = path.join(rootDir, entry.file);
        if (!fs.existsSync(filePath)) {
          resolve(false);
          return;
        }
        if (sha256(filePath) !== entry.sha256) {
          resolve(false);
          return;
        }
      }

      resolve(true);
    } catch (err) {
      console.error('Hash verification failed:', err.message);
      resolve(false);
    }
  });
}

module.exports = { verify, sha256 };

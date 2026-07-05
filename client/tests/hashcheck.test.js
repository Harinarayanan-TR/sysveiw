const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const hashcheck = require('../hashcheck');

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sysveiw-hash-'));
  const manifestPath = path.join(tempDir, 'hash-manifest.json');
  const missingResult = await hashcheck.verify({ manifestPath: path.join(tempDir, 'missing.json') });
  assert.strictEqual(missingResult, false);

  fs.writeFileSync(manifestPath, JSON.stringify([{ file: 'demo.txt', sha256: 'abc' }], null, 2));
  fs.writeFileSync(path.join(tempDir, 'demo.txt'), 'demo');

  const result = await hashcheck.verify({ manifestPath, rootDir: tempDir });
  assert.strictEqual(result, false);
  console.log('hashcheck tests passed');
})();

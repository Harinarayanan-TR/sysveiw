const fs = require('fs-extra');
const path = require('path');
const vm = require('vm');
const bugDb = require('./bugdb');

function walkDirectory(rootPath, collected = []) {
  const entries = fs.readdirSync(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'bug_reports.json' || entry.name === 'bug_reports.bin') {
      continue;
    }
    const fullPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      walkDirectory(fullPath, collected);
    } else if (entry.isFile() && (fullPath.endsWith('.js') || fullPath.endsWith('.json'))) {
      collected.push(fullPath);
    }
  }
  return collected;
}

function compileJavaScript(content, filePath) {
  try {
    new vm.Script(content, { filename: filePath });
    return null;
  } catch (err) {
    return err.message;
  }
}

function parseJson(content, filePath) {
  try {
    JSON.parse(content);
    return null;
  } catch (err) {
    return err.message;
  }
}

function getMissingRequireIssues(content, filePath, rootPath) {
  const issues = [];
  const requirePattern = /require\(['"](.+?)['"]\)/g;
  let match;
  while ((match = requirePattern.exec(content))) {
    const target = match[1];
    if (target.startsWith('.') || target.startsWith('/')) {
      const candidate = path.resolve(path.dirname(filePath), target);
      const resolved = findExistingFile(candidate);
      if (!resolved) {
        issues.push(buildIssue('BUG0003', {
          file: filePath,
          line: getLineNumber(content, match.index),
          message: `Require target missing: ${target}`
        }));
      }
    }
  }
  return issues;
}

function findExistingFile(candidate) {
  const candidates = [
    `${candidate}.js`,
    `${candidate}.json`,
    path.join(candidate, 'index.js'),
    path.join(candidate, 'index.json')
  ];
  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split('\n').length;
}

function buildIssue(code, extras = {}) {
  const rule = bugDb.findRule(code) || {};
  return {
    id: `${code}:${extras.file || extras.message || Date.now()}`,
    code,
    title: rule.title || 'Unknown Issue',
    severity: rule.severity || 'low',
    impact: rule.impact || 'none',
    category: rule.category || 'general',
    description: extras.message || rule.description || 'Detected issue',
    file: extras.file || null,
    line: extras.line || null,
    module: extras.module || inferModuleFromPath(extras.file),
    timestamp: new Date().toISOString(),
    details: extras.details || {}
  };
}

function inferModuleFromPath(filePath) {
  if (!filePath) {
    return 'app';
  }
  if (filePath.endsWith('commands.js')) {
    return 'commands';
  }
  if (filePath.endsWith('boot.js')) {
    return 'boot';
  }
  if (filePath.endsWith('bugdetector.js') || filePath.endsWith('bugalgo.js') || filePath.endsWith('bugdb.js')) {
    return 'bugdetector';
  }
  if (filePath.endsWith('pipelines.js')) {
    return 'pipelines';
  }
  if (filePath.endsWith('panic.js')) {
    return 'panic';
  }
  return 'app';
}

function scanApp(rootPath) {
  const filePaths = walkDirectory(rootPath);
  const fileContents = new Map();
  for (const filePath of filePaths) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      fileContents.set(filePath, content);
    } catch (err) {
      fileContents.set(filePath, '');
    }
  }

  const issues = [];
  for (const [filePath, content] of fileContents.entries()) {
    if (filePath.endsWith('.js')) {
      const syntaxError = compileJavaScript(content, filePath);
      if (syntaxError) {
        issues.push(buildIssue('BUG0001', {
          file: filePath,
          message: `Syntax error detected: ${syntaxError}`
        }));
      }
      issues.push(...getMissingRequireIssues(content, filePath, rootPath));
    }
    if (filePath.endsWith('.json')) {
      const jsonError = parseJson(content, filePath);
      if (jsonError) {
        issues.push(buildIssue('BUG0002', {
          file: filePath,
          message: `JSON parse error: ${jsonError}`
        }));
      }
    }
  }

  return { issues, fileCount: filePaths.length };
}

function checkMemory(history = []) {
  const snapshot = process.memoryUsage();
  const issues = [];
  if (history.length > 0) {
    const previous = history[history.length - 1];
    const growth = snapshot.heapUsed - previous.heapUsed;
    const growthPct = previous.heapUsed ? (growth / previous.heapUsed) * 100 : 0;
    if (growth > 50 * 1024 * 1024 && growthPct > 20) {
      issues.push(buildIssue('BUG0005', {
        message: `Heap usage grew by ${Math.round(growth / 1024 / 1024)}MB (${growthPct.toFixed(1)}%) since last scan.`,
        details: { previous: previous.heapUsed, current: snapshot.heapUsed }
      }));
    }
    if (snapshot.rss > 600 * 1024 * 1024) {
      issues.push(buildIssue('BUG0014', {
        message: `RSS memory usage is high: ${Math.round(snapshot.rss / 1024 / 1024)}MB.`,
        details: { rss: snapshot.rss }
      }));
    }
  }
  return { issues, snapshot };
}

function monitorPipelines(pipelines) {
  const issues = [];
  const pipelineDefinitions = [
    { name: 'p1', queue: pipelines.p1.messages },
    { name: 'p2', queue: pipelines.p2.messages },
    { name: 'p3', queue: pipelines.p3.logs }
  ];

  for (const pipeline of pipelineDefinitions) {
    if (!Array.isArray(pipeline.queue)) {
      issues.push(buildIssue('BUG0007', {
        module: 'pipelines',
        message: `Pipeline ${pipeline.name} is not holding an array of entries.`
      }));
      continue;
    }
    if (pipeline.queue.length > 100) {
      issues.push(buildIssue('BUG0006', {
        module: 'pipelines',
        message: `Pipeline ${pipeline.name} queue has ${pipeline.queue.length} pending entries.`
      }));
    }
    for (const entry of pipeline.queue) {
      if (!entry || typeof entry !== 'object' || !entry.ts) {
        issues.push(buildIssue('BUG0007', {
          module: 'pipelines',
          message: `Malformed entry in pipeline ${pipeline.name}.`,
          details: { entry }
        }));
      }
    }
  }

  return { issues };
}

module.exports = {
  walkDirectory,
  scanApp,
  checkMemory,
  monitorPipelines,
  buildIssue,
  compileJavaScript
};

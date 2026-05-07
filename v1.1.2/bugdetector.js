const fs = require('fs-extra');
const path = require('path');
const { app } = require('electron');
const pipelines = require('./pipelines');
const panic = require('./panic');
const bugDb = require('./bugdb');
const bugAlgo = require('./bugalgo');

const REPORT_JSON = 'bug_reports.json';
const REPORT_BIN = 'bug_reports.bin';

module.exports = {
  init() {
    if (this.scanning) {
      return;
    }

    this.rootPath = path.resolve(__dirname);
    this.bugCache = {};
    this.moduleRestartAttempts = {};
    this.panicState = {};
    this.scanCycle = 0;
    this.memoryHistory = [];
    this.scanning = true;

    this.ensureReportFiles();
    this.sendP3({ type: 'bugdetector.init', msg: 'Bug detector module starting', rootPath: this.rootPath });
    this.runScanLoop();
  },

  ensureReportFiles() {
    try {
      if (!fs.existsSync(REPORT_JSON)) {
        fs.writeFileSync(REPORT_JSON, JSON.stringify([], null, 2));
      }
      if (!fs.existsSync(REPORT_BIN)) {
        fs.writeFileSync(REPORT_BIN, Buffer.from(JSON.stringify([], null, 2)));
      }
    } catch (err) {
      this.sendP3({ type: 'bugdetector.error', msg: 'Unable to ensure report files', error: err.message });
    }
  },

  sendP3(payload) {
    pipelines.p3.send({ log: payload, ts: Date.now() });
  },

  async runScanLoop() {
    while (this.scanning) {
      try {
        await this.scanOnce();
      } catch (err) {
        this.sendP3({ type: 'bugdetector.failure', msg: 'Unexpected scan failure', error: err.message });
      }
      await this.delay(1000);
    }
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  async scanOnce() {
    this.scanCycle += 1;
    const cycleId = this.scanCycle;
    const start = Date.now();

    const appScan = bugAlgo.scanApp(this.rootPath);
    const memoryScan = bugAlgo.checkMemory(this.memoryHistory);
    const pipelineScan = bugAlgo.monitorPipelines(pipelines);

    this.memoryHistory.push(memoryScan.snapshot);
    if (this.memoryHistory.length > 20) {
      this.memoryHistory.shift();
    }

    const issues = [];
    issues.push(...appScan.issues);
    issues.push(...memoryScan.issues);
    issues.push(...pipelineScan.issues);

    if (issues.length > 0) {
      this.sendP3({ type: 'scan.issues', cycle: cycleId, count: issues.length, durationMs: Date.now() - start });
      for (const issue of issues) {
        this.handleBug(issue);
      }
      this.storeReports(issues);
    } else {
      this.sendP3({ type: 'scan.complete', cycle: cycleId, durationMs: Date.now() - start, count: 0 });
    }
  },

  handleBug(issue) {
    const key = issue.id || `${issue.code}:${issue.file || issue.module || 'global'}`;
    let record = this.bugCache[key];
    if (!record) {
      record = {
        issue,
        count: 0,
        restarts: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        panicMode: false
      };
    }

    record.count += 1;
    record.lastSeen = Date.now();
    this.bugCache[key] = record;

    this.sendP3({ type: 'bug.detected', issue, count: record.count });

    if (issue.severity === 'low') return;

    if (issue.severity === 'high' || issue.impact === 'host' || record.count >= 3) {
      this.enterPanicSequence(issue, record);
      return;
    }

    this.restartWorkflow(issue, record);
  },

  restartWorkflow(issue, record) {
    const moduleName = issue.module || 'app';
    if (record.restarts < 3) {
      record.restarts += 1;
      this.sendP3({ type: 'bug.restart', module: moduleName, attempt: record.restarts, issue });
      this.restartModule(moduleName);
    } else {
      this.enterPanicSequence(issue, record);
    }
  },

  restartModule(moduleName) {
    const normalized = String(moduleName).trim().toLowerCase();
    this.sendP3({ type: 'module.restart.request', module: normalized });

    try {
      if (normalized === 'commands') {
        const commands = require('./commands');
        if (commands && typeof commands.register === 'function') {
          commands.register();
          this.sendP3({ type: 'module.restart', module: normalized, status: 're-registered' });
        }
      } else if (normalized === 'pipelines') {
        if (typeof pipelines.init === 'function') {
          pipelines.init();
          this.sendP3({ type: 'module.restart', module: normalized, status: 'reinitialized' });
        }
      } else if (normalized === 'bugdetector') {
        this.sendP3({ type: 'module.restart', module: normalized, status: 'restarting scanner' });
        this.init();
      } else if (normalized === 'panic') {
        this.sendP3({ type: 'module.restart', module: normalized, status: 'panic module retained' });
      } else {
        this.sendP3({ type: 'module.restart', module: normalized, status: 'no direct restart handler available' });
      }
    } catch (err) {
      this.sendP3({ type: 'module.restart.error', module: normalized, error: err.message });
    }
  },

  async enterPanicSequence(issue, record) {
    if (record.panicMode) {
      return;
    }

    record.panicMode = true;
    this.sendP3({ type: 'panic.enter', issue, count: record.count, restarts: record.restarts });
    panic.trigger(Object.values(this.bugCache).map(r => r.issue));

    const moduleName = issue.module || 'app';
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      await this.delay(2000);
      this.sendP3({ type: 'panic.restart-module', module: moduleName, attempt });
      this.restartModule(moduleName);
    }

    const connected = this.getConnectedModule(moduleName);
    if (connected) {
      await this.delay(2000);
      this.sendP3({ type: 'panic.restart-connected', module: connected });
      this.restartModule(connected);
    }

    await this.delay(2000);
    this.sendP3({ type: 'panic.full-app-restart', module: moduleName, connected });
    this.restartApp();
  },

  getConnectedModule(moduleName) {
    const mapping = {
      commands: 'pipelines',
      pipelines: 'commands',
      boot: 'commands',
      main: 'boot',
      panic: 'commands'
    };
    return mapping[String(moduleName).trim().toLowerCase()] || 'commands';
  },

  restartApp() {
    this.sendP3({ type: 'app.restart', msg: 'Attempting full app restart' });
    try {
      if (app && typeof app.relaunch === 'function' && typeof app.exit === 'function') {
        app.relaunch();
        app.exit(0);
      } else if (global.mainWindow && !global.mainWindow.isDestroyed()) {
        global.mainWindow.reload();
      }
    } catch (err) {
      this.sendP3({ type: 'app.restart.error', error: err.message });
      if (global.mainWindow && !global.mainWindow.isDestroyed()) {
        global.mainWindow.reload();
      }
    }
  },

  storeReports(issues) {
    try {
      const existing = fs.existsSync(REPORT_JSON) ? fs.readJsonSync(REPORT_JSON) : [];
      const merged = existing.concat(issues.map(issue => ({ ...issue, recordedAt: new Date().toISOString() })));
      fs.writeJsonSync(REPORT_JSON, merged, { spaces: 2 });
      fs.writeFileSync(REPORT_BIN, Buffer.from(JSON.stringify(merged, null, 2)));
      this.sendP3({ type: 'bug.report.stored', count: issues.length });
    } catch (err) {
      this.sendP3({ type: 'bug.report.error', error: err.message });
    }
  }
};

const { shell } = require('electron');
const panic = require('./panic');
const cloud = require('./cloud/client');
const sandbox = require('./sandbox');

async function handleCloudResponse(name, cloudResult) {
  if (!cloudResult || cloudResult.error) {
    return cloudResult || { error: 'No response from cloud' };
  }

  const action = cloudResult.action || 'display';

  switch (action) {
    case 'display':
      return cloudResult.data !== undefined ? cloudResult.data : cloudResult;

    case 'exec': {
      const cmd = cloudResult.command;
      if (!cmd) return { error: 'Cloud returned empty exec command' };
      const r = await sandbox.run(cmd);
      if (r.ok) return r.result;
      return { error: r.error || 'Sandbox execution failed' };
    }

    case 'open':
      if (cloudResult.url) {
        shell.openExternal(cloudResult.url);
        return `Opened: ${cloudResult.url}`;
      }
      return { error: 'No URL provided' };

    case 'benchmark': {
      const tests = cloudResult.tests || [];
      const results = [];
      for (const t of tests) {
        const r = await sandbox.run(t.command);
        results.push({ test: t.name, result: r.ok ? r.result : r.error });
      }
      return results;
    }

    default:
      return cloudResult;
  }
}

async function proxyToCloud(commandName, args) {
  const result = await cloud.run(commandName, args);
  return handleCloudResponse(commandName, result);
}

module.exports = {
  register() {
    this.commands = {
      help: () => proxyToCloud('help'),

      'sysveiw-info': () => proxyToCloud('sysveiw-info'),

      cmd: async (command) => {
        if (!command) return { error: 'Usage: cmd "<command>"' };
        return proxyToCloud('cmd', [command]);
      },

      pwr: async (command) => {
        if (!command) return { error: 'Usage: pwr "<command>"' };
        return proxyToCloud('pwr', [command]);
      },

      naitive: async (command) => {
        if (!command) return { error: 'Usage: naitive "<command>"' };
        return proxyToCloud('naitive', [command]);
      },

      'sandbox.exec': async (command) => {
        if (!command) return { error: 'Usage: sandbox.exec "<command>"' };
        return proxyToCloud('sandbox.exec', [command]);
      },

      'panic.start': () => {
        panic.demo();
        return 'Panic demo triggered';
      },

      visitrepo: () => proxyToCloud('visitrepo'),

      benchmark: () => proxyToCloud('benchmark'),

      'net.ping': (host) => {
        if (!host) return { error: 'Usage: net.ping <host>' };
        return proxyToCloud('net.ping', [host]);
      },

      'net.dns': (domain) => {
        if (!domain) return { error: 'Usage: net.dns <domain>' };
        return proxyToCloud('net.dns', [domain]);
      },

      'net.port': (host, port) => {
        if (!host || !port) return { error: 'Usage: net.port <host> <port>' };
        return proxyToCloud('net.port', [host, port]);
      },

      'net.route': (host) => {
        if (!host) return { error: 'Usage: net.route <host>' };
        return proxyToCloud('net.route', [host]);
      },

      'net.public': () => proxyToCloud('net.public'),

      'server.status': () => proxyToCloud('server.status'),
      'server.list': () => proxyToCloud('server.list'),
      'server.add': (id, port, protocol) => proxyToCloud('server.add', [id, port, protocol]),
      'server.remove': (id) => proxyToCloud('server.remove', [id]),

      'dev.init': (projectName, ...args) => proxyToCloud('dev.init', [projectName, ...args]),
      'dev.install': (...deps) => proxyToCloud('dev.install', deps),
      'dev.run': (...args) => proxyToCloud('dev.run', args),
      'dev.clean': (...args) => proxyToCloud('dev.clean', args),
      'dev.test': (...args) => proxyToCloud('dev.test', args),

      'sys.cpu': () => proxyToCloud('sys.cpu'),
      'sys.ram': () => proxyToCloud('sys.ram'),
      'sys.ssd': () => proxyToCloud('sys.ssd'),
      'sys.gpu': () => proxyToCloud('sys.gpu'),
      'sys.os': () => proxyToCloud('sys.os'),
      'sys.processes': () => proxyToCloud('sys.processes'),
      'sys.users': () => proxyToCloud('sys.users'),
      'sys.battery': () => proxyToCloud('sys.battery'),
      'sys.network': () => proxyToCloud('sys.network'),
      'sys.bluetooth': () => proxyToCloud('sys.bluetooth'),
      'sys.fs': () => proxyToCloud('sys.fs'),
      'sys.load': () => proxyToCloud('sys.load'),
      'sys.uptime': () => proxyToCloud('sys.uptime'),
      'sys.temp': () => proxyToCloud('sys.temp'),
      'sys.services': () => proxyToCloud('sys.services'),
      'sys.scan': () => proxyToCloud('sys.scan')
    };

    return this.commands;
  }
};

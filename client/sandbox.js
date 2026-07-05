const { spawn } = require('child_process');

const ALLOWED_COMMANDS = new Set([
  'ls', 'pwd', 'uname', 'whoami', 'ps', 'df', 'free', 'hostname', 'cat', 'echo',
  'ping', 'nslookup', 'dig', 'traceroute', 'tracepath', 'curl', 'wget',
  'uptime', 'lscpu', 'lspci', 'lsblk', 'lshw', 'dmesg', 'nproc', 'id',
  'date', 'cal', 'which', 'env', 'printenv', 'head', 'tail', 'wc', 'sort',
  'grep', 'cut', 'tr', 'tee', 'basename', 'dirname', 'realpath', 'readlink',
  'mkdircd', 'touch', 'cp', 'mv', 'rm'
]);

const DENY_PATTERN = /[;&|<>$`]/;
const DENY_FLAGS = ['--rm-rf', '--force', '-rf', '--delete', '--remove'];

function parseCommand(command) {
  const tokens = [];
  const regex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
  let match;
  while ((match = regex.exec(command))) {
    tokens.push(match[1] || match[2] || match[0]);
  }
  return tokens.filter(Boolean);
}

function run(command) {
  return new Promise((resolve) => {
    const tokens = parseCommand(command);
    if (!tokens.length) {
      resolve({ error: 'No command provided', ok: false });
      return;
    }

    const [bin, ...args] = tokens;
    if (!ALLOWED_COMMANDS.has(bin)) {
      resolve({ error: `Command '${bin}' not allowed in sandbox`, ok: false });
      return;
    }
    if (args.some((arg) => DENY_PATTERN.test(arg))) {
      resolve({ error: 'Sandboxed execution denied: unsafe characters', ok: false });
      return;
    }
    if (args.some((arg) => DENY_FLAGS.some(f => arg.toLowerCase().includes(f)))) {
      resolve({ error: 'Sandboxed execution denied: unsafe flags', ok: false });
      return;
    }

    const child = spawn(bin, args, { cwd: process.cwd(), shell: false, timeout: 15000 });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.on('error', () => {
      resolve({ error: `Sandbox execution failed for ${bin}`, ok: false });
    });
    child.on('close', (code) => {
      if (code !== 0) {
        resolve({ error: stderr.trim() || `Command exited with code ${code}`, ok: false });
        return;
      }
      resolve({ result: stdout.trim() || `Executed ${bin}`, ok: true });
    });
  });
}

module.exports = { run, ALLOWED_COMMANDS };

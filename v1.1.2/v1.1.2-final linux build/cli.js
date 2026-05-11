const commands = require('./commands');

function parseCommandString(cmd) {
  const tokens = [];
  const regex = /[^\s"']+|"([^"\\]*(?:\\.[^"\\]*)*)"|'([^'\\]*(?:\\.[^'\\]*)*)'/g;
  let match;
  while ((match = regex.exec(cmd))) {
    tokens.push(match[1] || match[2] || match[0]);
  }
  return tokens;
}

commands.register();

process.stdin.on('data', async (data) => {
  const input = data.toString().trim();
  if (!input) {
    return;
  }

  const [cmd, ...args] = parseCommandString(input);
  if (commands.commands[cmd]) {
    try {
      const result = await commands.commands[cmd](...args);
      if (result && result.error) {
        console.error(result.error);
      } else if (typeof result === 'object') {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(result);
      }
    } catch (err) {
      console.error('Command execution failed:', err.message);
    }
  } else {
    console.log('Unknown command:', cmd);
  }
});

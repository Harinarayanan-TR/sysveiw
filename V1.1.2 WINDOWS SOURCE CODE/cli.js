const commands = require('./commands');

process.stdin.on('data', async (data) => {
  const input = data.toString().trim();
  const [cmd, ...args] = input.split(" ");
  if (commands.commands[cmd]) {
    await commands.commands[cmd](...args);
  } else {
    console.log("Unknown command:", cmd);
  }
});

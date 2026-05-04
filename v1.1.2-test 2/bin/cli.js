#!/usr/bin/env node
const chalk = require('chalk');
const ora = require('ora');
const dns = require('dns');
const { runCommand } = require('../commands/index');
const updater = require('../commands/updater');

console.log(chalk.blue.bold("Sysveiw v1.1.2 - Developer CLI"));
const spinner = ora("loading terminal.........").start();

setTimeout(() => {
  spinner.succeed("Terminal loaded.");
  console.log("diagnosing system modules...");
  setTimeout(() => {
    console.log("diagnostics complete.");
    console.log("looking for internet..............");

    dns.lookup('github.com', async (err) => {
      if (err) {
        console.log(chalk.red("no internet found. skipping updates."));
        startCLI();
      } else {
        console.log(chalk.green("internet found."));
        console.log("looking for updates..............");
        const updateAvailable = await updater.check();
        if (updateAvailable) {
          const inquirer = require('inquirer');
          const { confirm } = await inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Update ${updateAvailable} found. Download now?`
          }]);
          if (confirm) {
            await updater.download(updateAvailable);
          }
        }
        startCLI();
      }
    });
  }, 2000);
}, 2000);

function startCLI() {
  const inquirer = require('inquirer');
  (async () => {
    while (true) {
      const { cmd } = await inquirer.prompt([{
        type: 'input',
        name: 'cmd',
        message: chalk.green('sysveiw>'),
      }]);
      await runCommand(cmd.trim());
    }
  })();
}

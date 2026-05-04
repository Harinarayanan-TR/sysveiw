const dns = require("dns");

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

function checkInternet() {
  return new Promise(resolve => {
    dns.lookup("github.com", err => resolve(!err));
  });
}

async function initSequence(send) {
  send("terminal loading...");
  await delay(500);

  send("activating modules...");
  await delay(500);

  send("connecting to system...");
  await delay(500);

  const online = await checkInternet();

  if (online) send("checking for updates...");
  else send("no internet connection");

  return { online };
}

module.exports = { initSequence };

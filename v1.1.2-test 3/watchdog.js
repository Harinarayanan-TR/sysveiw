const errorScreen = require('./errorScreen');

let loaded = false;

function start() {
    setTimeout(() => {
        if (!loaded) {
            errorScreen.show();
        }
    }, 90000); // 1 min 30 sec
}

function markLoaded() {
    loaded = true;
}

module.exports = { start, markLoaded };

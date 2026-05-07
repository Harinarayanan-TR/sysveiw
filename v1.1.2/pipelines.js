module.exports = {
  p1: {
    messages: [],
    send(msg) {
      this.messages.push({ msg, ts: Date.now() });
    },
    receive() {
      return this.messages.shift();
    }
  },

  p2: {
    messages: [],
    send(msg) {
      this.messages.push({ msg, ts: Date.now() });
    },
    receive() {
      return this.messages.shift();
    }
  },

  p3: {
    logs: [],
    send(log) {
      this.logs.push({ log, ts: Date.now() });
    },
    monitor() {
      if (this.logs.length > 50) {
        console.warn("Pipeline overload detected.");
      }
    }
  },

  init() {
    this.p1.messages = this.p1.messages || [];
    this.p1.send = this.p1.send || function (msg) { this.messages.push({ msg, ts: Date.now() }); };
    this.p1.receive = this.p1.receive || function () { return this.messages.shift(); };

    this.p2.messages = this.p2.messages || [];
    this.p2.send = this.p2.send || function (msg) { this.messages.push({ msg, ts: Date.now() }); };
    this.p2.receive = this.p2.receive || function () { return this.messages.shift(); };

    this.p3.logs = this.p3.logs || [];
    this.p3.send = this.p3.send || function (log) { this.logs.push({ log, ts: Date.now() }); };
    this.p3.monitor = this.p3.monitor || function () {
      if (this.logs.length > 50) {
        console.warn("Pipeline overload detected.");
      }
    };

    console.log("Pipelines P1, P2, P3 initialized.");
  }
};

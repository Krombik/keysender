const { _sleep } = require("../../build/Release/key_sender.node");
const random = (min, max) =>
  min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;
module.exports = {
  random,
  sleepAsync: (ms) =>
    new Promise((_) => setTimeout(_, Array.isArray(ms) ? random(...ms) : ms)),
  sleep(arg) {
    const ms = !Array.isArray(arg) ? arg : random(...arg);
    if (ms > 0) _sleep(ms);
  },
};

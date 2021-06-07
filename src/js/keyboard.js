const { sleep, sleepAsync, DEFAULT_DELAY } = require("./helpers");
const { EventEmitter } = require("events");

module.exports.Keyboard = (ClassName) =>
  class extends ClassName {
    get keyboard() {
      const MICRO_DELAY = 3;

      const self = this;

      const _this = new EventEmitter();

      Object.defineProperty(this, "keyboard", {
        value: Object.assign(_this, {
          keyTogglerDelay: DEFAULT_DELAY,
          keySenderDelay: DEFAULT_DELAY,
          printText(text, keySenderDelay = 0) {
            _this.emit("beforePrintText", ...arguments);
            for (var i = 0; i < text.length - 1; i++) {
              self._printChar(text.codePointAt(i));
              sleep(keySenderDelay);
            }
            self._printChar(text.codePointAt(i));
            _this.emit("afterPrintText", ...arguments);
          },
          async printTextAsync(text, keySenderDelay = 0) {
            _this.emit("beforePrintText", ...arguments);
            for (var i = 0; i < text.length - 1; i++) {
              self._printChar(text.codePointAt(i));
              await sleepAsync(keySenderDelay);
            }
            self._printChar(text.codePointAt(i));
            _this.emit("afterPrintText", ...arguments);
          },
          toggleKey(key, isKeyDown = true, delay = _this.keyTogglerDelay) {
            _this.emit("beforeToggleKey", ...arguments);
            if (Array.isArray(key)) {
              let last = key.length - 1;
              if (isKeyDown)
                key.forEach((key, index) => {
                  self._toggleKey(key, true);
                  sleep(index !== last ? MICRO_DELAY : keyTogglerDelay);
                });
              else
                for (let i = last; i >= 0; i--) {
                  self._toggleKey(key[i], false);
                  sleep(i !== 0 ? MICRO_DELAY : keySenderDelay);
                }
            } else {
              self._toggleKey(key, isKeyDown);
              sleep(delay);
            }
            _this.emit("afterToggleKey", ...arguments);
          },
          async toggleKeyAsync(
            key,
            isKeyDown = true,
            delay = _this.keyTogglerDelay
          ) {
            _this.emit("beforeToggleKey", ...arguments);
            if (Array.isArray(key)) {
              let last = key.length - 1;
              if (isKeyDown)
                for (let i = 0; i <= last; i++) {
                  self._toggleKey(key[i], true);
                  await sleepAsync(i !== last ? MICRO_DELAY : keyTogglerDelay);
                }
              else
                for (let i = last; i >= 0; i--) {
                  self._toggleKey(key[i], false);
                  await sleepAsync(i !== 0 ? MICRO_DELAY : keySenderDelay);
                }
            } else {
              self._toggleKey(key, isKeyDown);
              await sleepAsync(delay);
            }
            _this.emit("afterToggleKey", ...arguments);
          },
          sendKey(
            key,
            keyTogglerDelay = _this.keyTogglerDelay,
            keySenderDelay = 0
          ) {
            _this.emit("beforeSendKey", ...arguments);
            if (Array.isArray(key)) {
              const last = key.length - 1;
              key.forEach((key, index) => {
                self._toggleKey(key, true);
                sleep(index !== last ? MICRO_DELAY : keyTogglerDelay);
              });
              for (let i = last; i >= 0; i--) {
                self._toggleKey(key[i], false);
                sleep(i !== 0 ? MICRO_DELAY : keySenderDelay);
              }
            } else {
              self._toggleKey(key, true);
              sleep(keyTogglerDelay);
              self._toggleKey(key, false);
              sleep(keySenderDelay);
            }
            _this.emit("afterSendKey", ...arguments);
          },
          async sendKeyAsync(
            key,
            keyTogglerDelay = _this.keyTogglerDelay,
            keySenderDelay = 0
          ) {
            _this.emit("beforeSendKey", ...arguments);
            if (Array.isArray(key)) {
              const last = key.length - 1;
              for (let i = 0; i <= last; i++) {
                self._toggleKey(key[i], true);
                await sleepAsync(i !== last ? MICRO_DELAY : keyTogglerDelay);
              }
              for (let i = last; i >= 0; i--) {
                self._toggleKey(key[i], false);
                await sleepAsync(i !== 0 ? MICRO_DELAY : keySenderDelay);
              }
            } else {
              self._toggleKey(key, true);
              await sleepAsync(keyTogglerDelay);
              self._toggleKey(key, false);
              await sleepAsync(keySenderDelay);
            }
            _this.emit("afterSendKey", ...arguments);
          },
          sendKeys(
            keys,
            keyTogglerDelay = _this.keyTogglerDelay,
            keySenderDelay = keyTogglerDelay === undefined
              ? _this.keySenderDelay
              : keyTogglerDelay
          ) {
            _this.emit("beforeSendKeys", ...arguments);
            keys.forEach((key, index) => {
              self._toggleKey(key, true);
              sleep(keyTogglerDelay);
              self._toggleKey(key, false);
              if (index !== keys.length - 1) sleep(keySenderDelay);
            });
            _this.emit("afterSendKeys", ...arguments);
          },
          async sendKeysAsync(
            keys,
            keyTogglerDelay = _this.keyTogglerDelay,
            keySenderDelay = keyTogglerDelay === undefined
              ? _this.keySenderDelay
              : keyTogglerDelay
          ) {
            _this.emit("beforeSendKeys", ...arguments);
            for (let i = 0; i < keys.length; i++) {
              self._toggleKey(keys[i], true);
              await sleepAsync(keyTogglerDelay);
              self._toggleKey(keys[i], false);
              if (i !== keys.length - 1) await sleepAsync(keySenderDelay);
            }
            _this.emit("afterSendKeys", ...arguments);
          },
        }),
      });

      return this.keyboard;
    }
  };

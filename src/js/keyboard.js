const { sleep, sleepAsync } = require("./helpers");
const { EventEmitter } = require("events");

module.exports.Keyboard = (ClassName) =>
  class extends ClassName {
    get keyboard() {
      const self = this;
      const microSleep = 3;
      Object.defineProperty(this, "keyboard", {
        value: Object.assign(new EventEmitter(), {
          keyTogglerDelay: 35,
          keySenderDelay: 35,
          printText(text, keySenderDelay = 0) {
            this.emit("beforePrintText", ...arguments);
            for (var i = 0; i < text.length - 1; i++) {
              self._printChar(text.codePointAt(i));
              sleep(keySenderDelay);
            }
            self._printChar(text.codePointAt(i));
            this.emit("afterPrintText", ...arguments);
          },
          async printTextAsync(text, keySenderDelay = 0) {
            this.emit("beforePrintText", ...arguments);
            for (var i = 0; i < text.length - 1; i++) {
              self._printChar(text.codePointAt(i));
              await sleepAsync(keySenderDelay);
            }
            self._printChar(text.codePointAt(i));
            this.emit("afterPrintText", ...arguments);
          },
          toggleKey(key, isKeyDown = true, delay = this.keyTogglerDelay) {
            this.emit("beforeToggleKey", ...arguments);
            if (Array.isArray(key)) {
              let last = key.length - 1;
              if (isKeyDown)
                key.forEach((key, index) => {
                  self._toggleKey(key, true);
                  sleep(index !== last ? microSleep : keyTogglerDelay);
                });
              else
                for (let i = last; i >= 0; i--) {
                  self._toggleKey(key[i], false);
                  sleep(i !== 0 ? microSleep : keySenderDelay);
                }
            } else {
              self._toggleKey(key, isKeyDown);
              sleep(delay);
            }
            this.emit("afterToggleKey", ...arguments);
          },
          async toggleKeyAsync(
            key,
            isKeyDown = true,
            delay = this.keyTogglerDelay
          ) {
            this.emit("beforeToggleKey", ...arguments);
            if (Array.isArray(key)) {
              let last = key.length - 1;
              if (isKeyDown)
                for (let i = 0; i <= last; i++) {
                  self._toggleKey(key[i], true);
                  await sleepAsync(i !== last ? microSleep : keyTogglerDelay);
                }
              else
                for (let i = last; i >= 0; i--) {
                  self._toggleKey(key[i], false);
                  await sleepAsync(i !== 0 ? microSleep : keySenderDelay);
                }
            } else {
              self._toggleKey(key, isKeyDown);
              await sleepAsync(delay);
            }
            this.emit("afterToggleKey", ...arguments);
          },
          sendKey(
            key,
            keyTogglerDelay = this.keyTogglerDelay,
            keySenderDelay = 0
          ) {
            this.emit("beforeSendKey", ...arguments);
            if (Array.isArray(key)) {
              const last = key.length - 1;
              key.forEach((key, index) => {
                self._toggleKey(key, true);
                sleep(index !== last ? microSleep : keyTogglerDelay);
              });
              for (let i = last; i >= 0; i--) {
                self._toggleKey(key[i], false);
                sleep(i !== 0 ? microSleep : keySenderDelay);
              }
            } else {
              self._toggleKey(key, true);
              sleep(keyTogglerDelay);
              self._toggleKey(key, false);
              sleep(keySenderDelay);
            }
            this.emit("afterSendKey", ...arguments);
          },
          async sendKeyAsync(
            key,
            keyTogglerDelay = this.keyTogglerDelay,
            keySenderDelay = 0
          ) {
            this.emit("beforeSendKey", ...arguments);
            if (Array.isArray(key)) {
              const last = key.length - 1;
              for (let i = 0; i <= last; i++) {
                self._toggleKey(key[i], true);
                await sleepAsync(i !== last ? microSleep : keyTogglerDelay);
              }
              for (let i = last; i >= 0; i--) {
                self._toggleKey(key[i], false);
                await sleepAsync(i !== 0 ? microSleep : keySenderDelay);
              }
            } else {
              self._toggleKey(key, true);
              await sleepAsync(keyTogglerDelay);
              self._toggleKey(key, false);
              await sleepAsync(keySenderDelay);
            }
            this.emit("afterSendKey", ...arguments);
          },
          sendKeys(
            keys,
            keyTogglerDelay = this.keyTogglerDelay,
            keySenderDelay = keyTogglerDelay === undefined
              ? this.keySenderDelay
              : keyTogglerDelay
          ) {
            this.emit("beforeSendKeys", ...arguments);
            keys.forEach((key, index) => {
              self._toggleKey(key, true);
              sleep(keyTogglerDelay);
              self._toggleKey(key, false);
              if (index !== keys.length - 1) sleep(keySenderDelay);
            });
            this.emit("afterSendKeys", ...arguments);
          },
          async sendKeysAsync(
            keys,
            keyTogglerDelay = this.keyTogglerDelay,
            keySenderDelay = keyTogglerDelay === undefined
              ? this.keySenderDelay
              : keyTogglerDelay
          ) {
            this.emit("beforeSendKeys", ...arguments);
            for (let i = 0; i < keys.length; i++) {
              self._toggleKey(keys[i], true);
              await sleepAsync(keyTogglerDelay);
              self._toggleKey(keys[i], false);
              if (i !== keys.length - 1) await sleepAsync(keySenderDelay);
            }
            this.emit("afterSendKeys", ...arguments);
          },
        }),
      });
      return this.keyboard;
    }
  };

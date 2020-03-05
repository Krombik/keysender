const { _Virtual, _Hardware, _getAllOpenWindowsList } = require('./build/Release/key_sender.node');
const stringToDWORDArray = str => {
    const arr = [];
    for (let i = 0; i < str.length; i++)
        arr[i] = str.codePointAt(i);
    return arr;
}

const Keyboard = ClassName => class extends ClassName {
    get keyboard() {
        const self = this;
        const microSleep = 3;
        Object.defineProperty(this, "keyboard", {
            value: {
                keyTooglerDelay: 35,
                keySenderDelay: 35,
                printText(text, keySenderDelay = 0) {
                    for (var i = 0; i < text.length - 1; i++) {
                        self._printChar(text.codePointAt(i));
                        self.sleep(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                },
                async printTextAsync(text, keySenderDelay = 0) {
                    for (var i = 0; i < text.length - 1; i++) {
                        self._printChar(text.codePointAt(i));
                        if (keySenderDelay > 0) await self.sleepAsync(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                },
                toogleKey(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown);
                    self.sleep(delay);
                },
                async toogleKeyAsync(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown);
                    if (delay > 0) await self.sleepAsync(delay);
                },
                sendKey(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true);
                    self.sleep(keyTooglerDelay);
                    self._toogleKey(key, false);
                    self.sleep(keySenderDelay);
                },
                async sendKeyAsync(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true);
                    if (keyTooglerDelay > 0) await self.sleepAsync(keyTooglerDelay);
                    self._toogleKey(key, false);
                    if (keySenderDelay > 0) await self.sleepAsync(keySenderDelay);
                },
                sendKeys(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        self.sleep(keyTooglerDelay);
                        self._toogleKey(key, false);
                        if (index !== keys.length - 1) self.sleep(keySenderDelay);
                    });
                },
                async sendKeysAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    for (let i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true);
                        if (keyTooglerDelay > 0) await self.sleepAsync(keyTooglerDelay);
                        self._toogleKey(keys[i], false);
                        if (keySenderDelay > 0 && i !== keys.length - 1) await self.sleepAsync(keySenderDelay);
                    }
                },
                sendKeyCombo(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    const last = keys.length - 1;
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        index !== last ? self._sleep(microSleep) : self.sleep(keyTooglerDelay);
                    });
                    for (let index = last; index >= 0; index--) {
                        self._toogleKey(keys[index], false);
                        index !== last ? self._sleep(microSleep) : self.sleep(keySenderDelay);
                    }
                },
                async sendKeyComboAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    const last = keys.length - 1;
                    for (var i = 0; i <= last; i++) {
                        self._toogleKey(keys[i], true);
                        if (i !== last || keyTooglerDelay > 0) await self.sleepAsync(i !== last ? microSleep : keyTooglerDelay);
                    }
                    for (i--; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        if (i !== last || keySenderDelay > 0) await self.sleepAsync(i !== last ? microSleep : keySenderDelay);
                    }
                }
            }
        });
        return this.keyboard
    }
}

const Mouse = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        Object.defineProperty(this, "mouse", {
            value: {
                click(button = "left", delay) {
                    self._toogleMb(button, true, delay);
                    self._toogleMb(button, false, delay);
                },
                moveTo(x, y) {
                    self._move(x, y, true);
                },
                move(x, y) {
                    self._move(x, y, false);
                },
                scrollWheel(x) {
                    self._scrollWheel(x);
                }
            }
        });
        return this.mouse;
    }
}

const Workwindow = ClassName => class extends ClassName {
    constructor(workwindow) {
        super();
        this._workwindow = typeof workwindow === 'string' ? stringToDWORDArray(workwindow) : workwindow;
    }
    set is(workwindow) {
        this._workwindow = typeof workwindow === 'string' ? stringToDWORDArray(workwindow) : workwindow;
    }
    get is() {
        const workwindow = { ...this._workwindow };
        workwindow.title = String.fromCodePoint(...workwindow.title)
        return workwindow;
    }
    randomStep = 0;
    random(ms) {
        return ms + Math.floor(Math.random() * this.randomStep);
    }
    sleep(ms) {
        if (ms > 0) this._sleep(this.randomStep > 0 ? this.random(ms) : ms);
    }
    sleepAsync(ms) {
        return new Promise(_ => setTimeout(_, this.randomStep > 0 ? this.random(ms) : ms));
    }
}

class Hardware extends Mouse(Keyboard(Workwindow(_Hardware))) { };
class Virtual extends Keyboard(Workwindow(_Virtual)) { };
const getAllOpenWindowsList = () =>
    _getAllOpenWindowsList()
        .map(item => ({ handle: item.handle, title: String.fromCodePoint(...item.title) }));

module.exports = { Virtual, Hardware, getAllOpenWindowsList };

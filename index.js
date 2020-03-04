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
                printText(text, keyTooglerDelay = 0, keySenderDelay = 0) {
                    self._printText(stringToDWORDArray(text), keyTooglerDelay, keySenderDelay);
                },
                toogleKey(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown, delay);
                },
                async toogleKeyAsync(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown, 0);
                    await new Promise(_ => setTimeout(_, delay));
                },
                sendKey(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true, keyTooglerDelay);
                    self._toogleKey(key, false, keySenderDelay);
                },
                async sendKeyAsync(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true, 0);
                    await new Promise(_ => setTimeout(_, keyTooglerDelay));
                    self._toogleKey(key, false, 0);
                    if (keySenderDelay !== 0) await new Promise(_ => setTimeout(_, keySenderDelay));
                },
                sendKeys(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true, keyTooglerDelay);
                        self._toogleKey(key, false, index !== keys.length - 1 ? keySenderDelay : 0);
                    });
                },
                async sendKeysAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    for (let i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true, 0);
                        await new Promise(_ => setTimeout(_, keyTooglerDelay));
                        self._toogleKey(keys[i], false, 0);
                        if (i !== keys.length - 1) await new Promise(_ => setTimeout(_, keySenderDelay));
                    }
                },
                sendKeyCombo(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    const last = keys.length - 1;
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true, index !== last ? microSleep : keyTooglerDelay);
                    });
                    for (let index = last; index >= 0; index--)
                        self._toogleKey(keys[index], false, index !== 0 ? microSleep : keySenderDelay);
                },
                async sendKeyComboAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    const last = keys.length - 1;
                    for (var i = 0; i <= last; i++) {
                        self._toogleKey(keys[i], true, 0);
                        await new Promise(_ => setTimeout(_, i !== last ? microSleep : keyTooglerDelay));
                    };
                    for (i--; i >= 0; i--) {
                        self._toogleKey(keys[i], false, 0);
                        await new Promise(_ => setTimeout(_, i !== 0 ? microSleep : keySenderDelay));
                    }
                }
            }
        });
        return this.keyboard
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
}

class Hardware extends Keyboard(Workwindow(_Hardware)) { };
class Virtual extends Keyboard(Workwindow(_Virtual)) { };
const getAllOpenWindowsList = () =>
    _getAllOpenWindowsList()
        .map(item => ({ handle: item.handle, title: String.fromCodePoint(...item.title) }));

module.exports = { Virtual, Hardware, getAllOpenWindowsList };

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
                        if (i !== last || keyTooglerDelay > 0)
                            await self.sleepAsync(i !== last ? microSleep : keyTooglerDelay);
                    }
                    for (i--; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        if (i !== last || keySenderDelay > 0)
                            await self.sleepAsync(i !== last ? microSleep : keySenderDelay);
                    }
                }
            }
        });
        return this.keyboard
    }
}

const MouseH = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        const rnd = (min, max) => min < max ? Math.floor(Math.random() * (max - min)) + min : min;
        const choice = (...items) => items[Math.round(Math.random() * (items.length - 1))];
        const curvDotMaker = (start, end, deviation, sign) => Math.round(start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation);
        const firstCurvDotMaker = (start, end, deviation, sign) => Math.round(start + sign * (end - start) * 0.01 * deviation);
        const curvMaker = (t, start, curvDot1, curvDot2, end) => Math.floor(Math.pow(1 - t, 3) * start + 3 * Math.pow(1 - t, 2) * t * curvDot1 + 3 * (1 - t) * t * t * curvDot2 + t * t * t * end);
        Object.defineProperty(this, "mouse", {
            value: {
                buttonTooglerDelay: 25,
                click(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMb(button, true);
                    self.sleep(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    self.sleep(buttonSenderDelay);
                },
                async clickAsync(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMb(button, true);
                    if (buttonTooglerDelay > 0) await self.sleepAsync(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    if (buttonSenderDelay > 0) await self.sleepAsync(buttonSenderDelay);
                },
                moveTo(x, y) {
                    self._move(x, y, true);
                },
                moveH(coords, speed = 5, deviation = 30, width = 0, height = 0) {
                    let [xE, yE, xS, yS] = coords;
                    if (width > 0) xE += rnd(0, width);
                    if (height > 0) yE += rnd(0, height);
                    const path = [];
                    const partLength = rnd(50, 200) / 2;
                    const partsTotal = Math.ceil(Math.pow(Math.pow(xE - xS, 2) + Math.pow(yE - yS, 2), 0.5) / partLength);
                    const xPartLength = (xE - xS) / partsTotal;
                    const yPartLength = (yE - yS) / partsTotal;
                    const speedMultiplicator = (speed > 1 ? (speed + 2) : 3) / partLength;
                    let partsLeft = partsTotal;
                    let parts = rnd(1, partsTotal / 2);
                    let xPartStart = xS;
                    let yPartStart = yS;
                    let xPartEnd = xS + xPartLength * parts;
                    let yPartEnd = yS + yPartLength * parts;
                    while (true) {
                        let curvDotX1, curvDotX2, curvDotY1, curvDotY2;
                        const dotIterator = speedMultiplicator / parts;
                        if (partsLeft !== partsTotal) {
                            curvDotX1 = curvDotMaker(xPartStart, xPartEnd, rnd(deviation / 3, deviation), choice(-1, 1));
                            curvDotY1 = curvDotMaker(yPartStart, yPartEnd, rnd(deviation / 3, deviation / 2), choice(-1, 1));
                            curvDotX2 = curvDotMaker(xPartStart, xPartEnd, rnd(0, deviation), choice(-1, 1));
                            curvDotY2 = curvDotMaker(yPartStart, yPartEnd, rnd(0, deviation / 2), choice(-1, 1));
                        }
                        else {
                            curvDotX1 = firstCurvDotMaker(xPartStart, xPartEnd, rnd(deviation / 2, deviation), 1);
                            curvDotY1 = firstCurvDotMaker(yPartStart, yPartEnd, rnd(deviation / 4, deviation / 3), 1);
                            curvDotX2 = firstCurvDotMaker(xPartStart, xPartEnd, rnd(deviation / 2, deviation), choice(-1, 1));
                            curvDotY2 = firstCurvDotMaker(yPartStart, yPartEnd, rnd(deviation / 2, deviation), choice(-1, 1));
                        }
                        for (let t = 0; t <= 1; t += dotIterator) {
                            const cur = [curvMaker(t, xPartStart, curvDotX1, curvDotX2, xPartEnd), curvMaker(t, yPartStart, curvDotY1, curvDotY2, yPartEnd)];
                            const prev = path[path.length - 1];
                            if (path.length === 0 || !(prev[0] === cur[0] && prev[1] === cur[1]))
                                path.push(cur);
                        }
                        if (xPartEnd === xE && yPartEnd === yE) break;
                        xPartStart = xPartEnd;
                        yPartStart = yPartEnd;
                        partsLeft -= parts;
                        if (partsLeft > 2) {
                            parts = rnd(1, partsLeft - 1);
                            xPartEnd += xPartLength * parts;
                            yPartEnd += yPartLength * parts;
                        }
                        else {
                            parts = partsLeft;
                            xPartEnd = xE;
                            yPartEnd = yE;
                        }
                    }
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    path.map(item => [item[0], item[1] + choice(-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)]).forEach(dot => {
                        self._move(dot[0], dot[1], true);
                        self.sleep(sleepTime);
                    });
                },
                move(x, y) {
                    self._move(x, y, false);
                },
                scrollWheel(count = 1, wheelTooglerDelay = 0) {
                    self._scrollWheel(count);
                    self.sleep(wheelTooglerDelay);
                },
                async scrollWheelAsync(count = 1, wheelTooglerDelay = 0) {
                    self._scrollWheel(count);
                    if (wheelTooglerDelay > 0) await self.sleepAsync(wheelTooglerDelay);
                }
            }
        });
        return this.mouse;
    }
}

const MouseV = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        Object.defineProperty(this, "mouse", {
            value: {
                buttonTooglerDelay: 25,
                clickAt(x, y, button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMbAt(button, true, x, y);
                    self.sleep(buttonTooglerDelay);
                    self._toogleMbAt(button, false, x, y);
                    self.sleep(buttonSenderDelay);
                },
                async clickAtAsync(x, y, button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMbAt(button, true, x, y);
                    if (buttonTooglerDelay > 0) await self.sleepAsync(buttonTooglerDelay);
                    self._toogleMbAt(button, false, x, y);
                    if (buttonSenderDelay > 0) await self.sleepAsync(buttonSenderDelay);
                },
                scrollWheelAt(count, x, y, wheelTooglerDelay = 0) {
                    self._scrollWheelAt(count, x, y);
                    self.sleep(wheelTooglerDelay);
                },
                async scrollWheelAtAsync(count, x, y, wheelTooglerDelay = 0) {
                    self._scrollWheelAt(count, x, y);
                    if (wheelTooglerDelay > 0) await self.sleepAsync(wheelTooglerDelay);
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

class Hardware extends MouseH(Keyboard(Workwindow(_Hardware))) { };
class Virtual extends MouseV(Keyboard(Workwindow(_Virtual))) { };
const getAllOpenWindowsList = () =>
    _getAllOpenWindowsList()
        .map(item => ({ handle: item.handle, title: String.fromCodePoint(...item.title) }));

module.exports = { Virtual, Hardware, getAllOpenWindowsList };

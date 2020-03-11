const { _Virtual, _Hardware, _getWindow, getWindowChild } = require('./build/Release/key_sender.node');
const random = (min, max) => min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;
const sleep = arg => {
    const ms = !Array.isArray(arg) ? arg : random(...arg);
    if (ms > 0) this._sleep(ms);
}
const sleepAsync = ms => new Promise(_ => setTimeout(_, !Array.isArray(ms) ? ms : random(...ms)));

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
                        sleep(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                },
                async printTextAsync(text, keySenderDelay = 0) {
                    for (var i = 0; i < text.length - 1; i++) {
                        self._printChar(text.codePointAt(i));
                        await sleepAsync(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                },
                toogleKey(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown);
                    sleep(delay);
                },
                async toogleKeyAsync(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    self._toogleKey(key, isKeyDown);
                    await sleepAsync(delay);
                },
                sendKey(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true);
                    sleep(keyTooglerDelay);
                    self._toogleKey(key, false);
                    sleep(keySenderDelay);
                },
                async sendKeyAsync(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    self._toogleKey(key, true);
                    await sleepAsync(keyTooglerDelay);
                    self._toogleKey(key, false);
                    await sleepAsync(keySenderDelay);
                },
                sendKeys(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        sleep(keyTooglerDelay);
                        self._toogleKey(key, false);
                        if (index !== keys.length - 1) sleep(keySenderDelay);
                    });
                },
                async sendKeysAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    for (let i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true);
                        await sleepAsync(keyTooglerDelay);
                        self._toogleKey(keys[i], false);
                        if (i !== keys.length - 1) await sleepAsync(keySenderDelay);
                    }
                },
                sendKeyCombo(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    let i = keys.length - 1;
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        index !== i ? self._sleep(microSleep) : sleep(keyTooglerDelay);
                    });
                    for (; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        i !== 0 ? self._sleep(microSleep) : sleep(keySenderDelay);
                    }
                },
                async sendKeyComboAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    for (var i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true);
                        await sleepAsync(i !== 0 ? microSleep : keyTooglerDelay);
                    }
                    for (i--; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        await sleepAsync(i !== 0 ? microSleep : keySenderDelay);
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
        const choice = (...items) => items[Math.round(Math.random() * (items.length - 1))];
        const curvDotMaker = (start, end, deviation, sign) => Math.round(start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation);
        const firstCurvDotMaker = (start, end, deviation, sign) => Math.round(start + sign * (end - start) * 0.01 * deviation);
        const curvMaker = (t, start, curvDot1, curvDot2, end) => Math.floor(Math.pow(1 - t, 3) * start + 3 * Math.pow(1 - t, 2) * t * curvDot1 + 3 * (1 - t) * t * t * curvDot2 + t * t * t * end);
        const humanCurv = (coords, speed, deviation, width, height) => {
            let [xE, yE, xS, yS] = coords;
            if (width > 0) xE += random(0, width);
            if (height > 0) yE += random(0, height);
            const path = [];
            const partLength = random(50, 200) / 2;
            const partsTotal = Math.ceil(Math.pow(Math.pow(xE - xS, 2) + Math.pow(yE - yS, 2), 0.5) / partLength);
            const xPartLength = (xE - xS) / partsTotal;
            const yPartLength = (yE - yS) / partsTotal;
            const speedMultiplicator = (speed > 1 ? (speed + 2) : 3) / partLength;
            let partsLeft = partsTotal;
            let parts = random(1, partsTotal / 2);
            let xPartStart = xS;
            let yPartStart = yS;
            let xPartEnd = xS + xPartLength * parts;
            let yPartEnd = yS + yPartLength * parts;
            do {
                let curvDotX1, curvDotX2, curvDotY1, curvDotY2;
                const dotIterator = speedMultiplicator / parts;
                if (partsLeft !== partsTotal) {
                    curvDotX1 = curvDotMaker(xPartStart, xPartEnd, random(deviation / 3, deviation), choice(-1, 1));
                    curvDotY1 = curvDotMaker(yPartStart, yPartEnd, random(deviation / 3, deviation / 2), choice(-1, 1));
                    curvDotX2 = curvDotMaker(xPartStart, xPartEnd, random(0, deviation), choice(-1, 1));
                    curvDotY2 = curvDotMaker(yPartStart, yPartEnd, random(0, deviation / 2), choice(-1, 1));
                } else {
                    curvDotX1 = firstCurvDotMaker(xPartStart, xPartEnd, random(deviation / 2, deviation), 1);
                    curvDotY1 = firstCurvDotMaker(yPartStart, yPartEnd, random(deviation / 4, deviation / 3), 1);
                    curvDotX2 = firstCurvDotMaker(xPartStart, xPartEnd, random(deviation / 2, deviation), choice(-1, 1));
                    curvDotY2 = firstCurvDotMaker(yPartStart, yPartEnd, random(deviation / 2, deviation), choice(-1, 1));
                }
                for (let t = 0; t < 1.00001; t += dotIterator) {
                    const curr = [curvMaker(t, xPartStart, curvDotX1, curvDotX2, xPartEnd), curvMaker(t, yPartStart, curvDotY1, curvDotY2, yPartEnd)];
                    const prev = path[path.length - 1];
                    if (path.length === 0 || !(prev[0] === curr[0] && prev[1] === curr[1]))
                        path.push(curr);
                }
                if (xPartEnd === xE && yPartEnd === yE) break;
                partsLeft -= parts;
                xPartStart = xPartEnd;
                yPartStart = yPartEnd;
                if (partsLeft > 2) {
                    parts = random(1, partsLeft - 1);
                    xPartEnd += xPartLength * parts;
                    yPartEnd += yPartLength * parts;
                } else {
                    parts = partsLeft;
                    xPartEnd = xE;
                    yPartEnd = yE;
                }
            } while (true);
            return path.map(item => [item[0], item[1] + choice(-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)]);
        }
        Object.defineProperty(this, "mouse", {
            value: {
                buttonTooglerDelay: 35,
                toogle(isButtonDown, button = "left", buttonTooglerDelay = this.buttonTooglerDelay) {
                    self._toogleMb(button, isButtonDown);
                    sleep(buttonTooglerDelay);
                },
                click(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMb(button, true);
                    sleep(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    sleep(buttonSenderDelay);
                },
                async clickAsync(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMb(button, true);
                    if (buttonTooglerDelay > 0) await sleepAsync(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    if (buttonSenderDelay > 0) await sleepAsync(buttonSenderDelay);
                },
                moveTo(x, y) {
                    self._move(x, y, true);
                },
                moveH(coords, speed = 5, deviation = 30, width = 0, height = 0) {
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    humanCurv(coords, speed, deviation, width, height).forEach(dot => {
                        self._move(dot[0], dot[1], true);
                        sleep(sleepTime);
                    });
                },
                move(x, y) {
                    self._move(x, y, false);
                },
                scrollWheel(count = 1, wheelTooglerDelay = 0) {
                    self._scrollWheel(count);
                    sleep(wheelTooglerDelay);
                },
                async scrollWheelAsync(count = 1, wheelTooglerDelay = 0) {
                    self._scrollWheel(count);
                    if (wheelTooglerDelay > 0) await sleepAsync(wheelTooglerDelay);
                }
            }
        });
        return this.mouse;
    }
}

const MouseV = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        const rnd = (min, max) => min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;
        const choice = (...items) => items[Math.round(Math.random() * (items.length - 1))];
        const curvDotMaker = (start, end, deviation, sign) => Math.round(start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation);
        const firstCurvDotMaker = (start, end, deviation, sign) => Math.round(start + sign * (end - start) * 0.01 * deviation);
        const curvMaker = (t, start, curvDot1, curvDot2, end) => Math.floor(Math.pow(1 - t, 3) * start + 3 * Math.pow(1 - t, 2) * t * curvDot1 + 3 * (1 - t) * t * t * curvDot2 + t * t * t * end);
        const humanCurv = (coords, speed, deviation, width, height) => {
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
            do {
                let curvDotX1, curvDotX2, curvDotY1, curvDotY2;
                const dotIterator = speedMultiplicator / parts;
                if (partsLeft !== partsTotal) {
                    curvDotX1 = curvDotMaker(xPartStart, xPartEnd, rnd(deviation / 3, deviation), choice(-1, 1));
                    curvDotY1 = curvDotMaker(yPartStart, yPartEnd, rnd(deviation / 3, deviation / 2), choice(-1, 1));
                    curvDotX2 = curvDotMaker(xPartStart, xPartEnd, rnd(0, deviation), choice(-1, 1));
                    curvDotY2 = curvDotMaker(yPartStart, yPartEnd, rnd(0, deviation / 2), choice(-1, 1));
                } else {
                    curvDotX1 = firstCurvDotMaker(xPartStart, xPartEnd, rnd(deviation / 2, deviation), 1);
                    curvDotY1 = firstCurvDotMaker(yPartStart, yPartEnd, rnd(deviation / 4, deviation / 3), 1);
                    curvDotX2 = firstCurvDotMaker(xPartStart, xPartEnd, rnd(deviation / 2, deviation), choice(-1, 1));
                    curvDotY2 = firstCurvDotMaker(yPartStart, yPartEnd, rnd(deviation / 2, deviation), choice(-1, 1));
                }
                for (let t = 0; t < 1.00001; t += dotIterator) {
                    const curr = [curvMaker(t, xPartStart, curvDotX1, curvDotX2, xPartEnd), curvMaker(t, yPartStart, curvDotY1, curvDotY2, yPartEnd)];
                    const prev = path[path.length - 1];
                    if (path.length === 0 || !(prev[0] === curr[0] && prev[1] === curr[1]))
                        path.push(curr);
                }
                if (xPartEnd === xE && yPartEnd === yE) break;
                partsLeft -= parts;
                xPartStart = xPartEnd;
                yPartStart = yPartEnd;
                if (partsLeft > 2) {
                    parts = rnd(1, partsLeft - 1);
                    xPartEnd += xPartLength * parts;
                    yPartEnd += yPartLength * parts;
                } else {
                    parts = partsLeft;
                    xPartEnd = xE;
                    yPartEnd = yE;
                }
            } while (true);
            return path.map(item => [item[0], item[1] + choice(-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1)]);
        }
        Object.defineProperty(this, "mouse", {
            value: {
                buttonTooglerDelay: 25,
                moveH(coords, speed = 5, deviation = 30, width = 0, height = 0) {
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    humanCurv(coords, speed, deviation, width, height).forEach((dot, index, arr) => {
                        if (index !== 0)
                            self._moveTo(dot[0], dot[1], arr[index - 1][0], arr[index - 1][1]);
                        else self._moveTo(dot[0], dot[1], coords[2], coords[3]);
                        sleep(sleepTime);
                    });
                },
                toogle(isButtonDown, x, y, button = "left", buttonTooglerDelay = this.buttonTooglerDelay) {
                    self._toogleMbAt(button, isButtonDown, x, y);
                    sleep(buttonTooglerDelay);
                },
                clickAt(x, y, button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMbAt(button, true, x, y);
                    sleep(buttonTooglerDelay);
                    self._toogleMbAt(button, false, x, y);
                    sleep(buttonSenderDelay);
                },
                async clickAtAsync(x, y, button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    self._toogleMbAt(button, true, x, y);
                    await sleepAsync(buttonTooglerDelay);
                    self._toogleMbAt(button, false, x, y);
                    await sleepAsync(buttonSenderDelay);
                },
                scrollWheelAt(count, x, y, wheelTooglerDelay = 0) {
                    self._scrollWheelAt(count, x, y);
                    sleep(wheelTooglerDelay);
                },
                async scrollWheelAtAsync(count, x, y, wheelTooglerDelay = 0) {
                    self._scrollWheelAt(count, x, y);
                    if (wheelTooglerDelay > 0) await sleepAsync(wheelTooglerDelay);
                }
            }
        });
        return this.mouse;
    }
}

const Workwindow = ClassName => class extends ClassName {
    constructor(workwindow) {
        super();
        this._workwindow = workwindow;
    }
    set is(workwindow) {
        this._workwindow = workwindow;
    }
    get is() {
        const workwindow = { ...this._workwindow };
        workwindow.title = String.fromCodePoint(...workwindow.title)
        return workwindow;
    }
}

class Hardware extends MouseH(Keyboard(Workwindow(_Hardware))) { };
class Virtual extends MouseV(Keyboard(Workwindow(_Virtual))) { };
const getWindow = arg => arg !== undefined ? _getWindow(arg) : _getWindow().map(item => ({ ...item, title: String.fromCodePoint(...item.title) }));
const windowTitle = str => {
    const arr = [];
    for (let i = 0; i < str.length; i++)
        arr[i] = str.codePointAt(i);
    return arr;
}

module.exports = { Virtual, Hardware, getWindow, getWindowChild, windowTitle };

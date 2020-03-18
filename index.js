const { Virtual, Hardware, getScreenSize, _getWindow, _getWindowChild, _sleep } = require('./build/Release/key_sender.node');
const { Buffer } = require("buffer");
const EventEmitter = require('events');
const random = (min, max) => min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;
const sleepAsync = ms => new Promise(_ => setTimeout(_, Array.isArray(ms) ? random(...ms) : ms));

const getWindow = (title, className) => title === undefined && className === undefined ?
    _getWindow().map(item => {
        if (item.className !== '') item.className = item.className.toString('ucs2');
        if (item.title !== '') item.title = item.title.toString('ucs2');
        return item;
    })
    :
    _getWindow(Buffer.from(title, "ucs2"), className !== undefined ? Buffer.from(className, "ucs2") : null);

const getWindowChild = (parentHandle, className, title) => className === undefined && title === undefined ?
    _getWindowChild(parentHandle).map(item => {
        if (item.className !== '') item.className = item.className.toString('ucs2');
        if (item.title !== '') item.title = item.title.toString('ucs2');
        return item;
    }) :
    _getWindowChild(parentHandle, className, title !== undefined ? Buffer.from(title, "ucs2") : null);

const sleep = arg => {
    const ms = !Array.isArray(arg) ? arg : random(...arg);
    if (ms > 0) _sleep(ms);
}

const Keyboard = ClassName => class extends ClassName {
    get keyboard() {
        const self = this;
        const microSleep = 3;
        Object.defineProperty(this, "keyboard", {
            value: Object.assign(new EventEmitter, {
                keyTooglerDelay: 35,
                keySenderDelay: 35,
                before(event, func) {
                    this.on(event, (isBefore, ...args) => {
                        if (isBefore) func(...args)
                    });
                },
                after(event, func) {
                    this.on(event, (isBefore, ...args) => {
                        if (!isBefore) func(...args)
                    });
                },
                printText(text, keySenderDelay = 0) {
                    this.emit('printText', true, ...arguments);
                    for (var i = 0; i < text.length - 1; i++) {
                        self._printChar(text.codePointAt(i));
                        sleep(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                    this.emit('printText', false, ...arguments);
                },
                async printTextAsync(text, keySenderDelay = 0) {
                    this.emit('printText', true, ...arguments);
                    for (var i = 0; i < text.length - 1; i++) {
                        self._printChar(text.codePointAt(i));
                        await sleepAsync(keySenderDelay);
                    }
                    self._printChar(text.codePointAt(i));
                    this.emit('printText', false, ...arguments);
                },
                toogleKey(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    this.emit('toogleKey', true, ...arguments);
                    self._toogleKey(key, isKeyDown);
                    sleep(delay);
                    this.emit('toogleKey', false, ...arguments);
                },
                async toogleKeyAsync(key, isKeyDown = true, delay = this.keyTooglerDelay) {
                    this.emit('toogleKey', true, ...arguments);
                    self._toogleKey(key, isKeyDown);
                    await sleepAsync(delay);
                    this.emit('toogleKey', false, ...arguments);
                },
                sendKey(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    this.emit('sendKey', true, ...arguments);
                    self._toogleKey(key, true);
                    sleep(keyTooglerDelay);
                    self._toogleKey(key, false);
                    sleep(keySenderDelay);
                    this.emit('sendKey', false, ...arguments);
                },
                async sendKeyAsync(key, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    this.emit('sendKey', true, ...arguments);
                    self._toogleKey(key, true);
                    await sleepAsync(keyTooglerDelay);
                    self._toogleKey(key, false);
                    await sleepAsync(keySenderDelay);
                    this.emit('sendKey', false, ...arguments);
                },
                sendKeys(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    this.emit('sendKeys', true, ...arguments);
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        sleep(keyTooglerDelay);
                        self._toogleKey(key, false);
                        if (index !== keys.length - 1) sleep(keySenderDelay);
                    });
                    this.emit('sendKeys', false, ...arguments);
                },
                async sendKeysAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
                    this.emit('sendKeys', true, ...arguments);
                    for (let i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true);
                        await sleepAsync(keyTooglerDelay);
                        self._toogleKey(keys[i], false);
                        if (i !== keys.length - 1) await sleepAsync(keySenderDelay);
                    }
                    this.emit('sendKeys', false, ...arguments);
                },
                sendKeyCombo(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    this.emit('sendKeyCombo', true, ...arguments);
                    let i = keys.length - 1;
                    keys.forEach((key, index) => {
                        self._toogleKey(key, true);
                        sleep(index !== i ? microSleep : keyTooglerDelay);
                    });
                    for (; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        sleep(index !== 0 ? microSleep : keySenderDelay);
                    }
                    this.emit('sendKeyCombo', false, ...arguments);
                },
                async sendKeyComboAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = 0) {
                    this.emit('sendKeyCombo', true, ...arguments);
                    for (var i = 0; i < keys.length; i++) {
                        self._toogleKey(keys[i], true);
                        await sleepAsync(i !== 0 ? microSleep : keyTooglerDelay);
                    }
                    for (i--; i >= 0; i--) {
                        self._toogleKey(keys[i], false);
                        await sleepAsync(i !== 0 ? microSleep : keySenderDelay);
                    }
                    this.emit('sendKeyCombo', false, ...arguments);
                }
            })
        });
        return this.keyboard;
    }
}

const Mouse = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        const choice = (...items) => items[Math.round(Math.random() * (items.length - 1))];
        const tremor = propability => Math.random() <= propability ? choice(-1, 1) : 0;
        const curvDotMaker = (start, end, deviation, sign) => Math.round(start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation);
        const firstCurvDotMaker = (start, end, deviation, sign) => Math.round(start + sign * (end - start) * 0.01 * deviation);
        const curvMaker = (t, start, curvDot1, curvDot2, end) => Math.floor(Math.pow(1 - t, 3) * start + 3 * Math.pow(1 - t, 2) * t * curvDot1 + 3 * (1 - t) * t * t * curvDot2 + t * t * t * end);
        const humanCurv = (xE, yE, xS, yS, speed, deviation) => {
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
            path.shift();
            return path.map((item, index) => index !== path.length - 1 ? [item[0], item[1] + tremor(speed / 15)] : [xE, yE]);
        }
        Object.defineProperty(this, "mouse", {
            value: Object.assign(new EventEmitter, {
                buttonTooglerDelay: 35,
                set saveMod(bool) {
                    self._saveMod = bool;
                },
                get saveMod() {
                    return self._saveMod;
                },
                set lastCoords(coords) {
                    self._lastCoords = coords;
                },
                get lastCoords() {
                    return self._lastCoords;
                },
                before(event, func) {
                    this.on(event, (isBefore, ...args) => {
                        if (isBefore) func(...args)
                    });
                },
                after(event, func) {
                    this.on(event, (isBefore, ...args) => {
                        if (!isBefore) func(...args)
                    });
                },
                getPos() {
                    return self._getPos();
                },
                toogle(isButtonDown, button = "left", buttonTooglerDelay = this.buttonTooglerDelay) {
                    this.emit('toogle', true, ...arguments);
                    self._toogleMb(button, isButtonDown);
                    sleep(buttonTooglerDelay);
                    this.emit('toogle', false, ...arguments);
                },
                async toogleAsync(isButtonDown, button = "left", buttonTooglerDelay = this.buttonTooglerDelay) {
                    this.emit('toogle', true, ...arguments);
                    self._toogleMb(button, isButtonDown);
                    await sleepAsync(buttonTooglerDelay);
                    this.emit('toogle', false, ...arguments);
                },
                click(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    this.emit('click', true, ...arguments);
                    self._toogleMb(button, true);
                    sleep(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    sleep(buttonSenderDelay);
                    this.emit('click', false, ...arguments);
                },
                async clickAsync(button = "left", buttonTooglerDelay = this.buttonTooglerDelay, buttonSenderDelay = 0) {
                    this.emit('click', true, ...arguments);
                    self._toogleMb(button, true);
                    await sleepAsync(buttonTooglerDelay);
                    self._toogleMb(button, false);
                    await sleepAsync(buttonSenderDelay);
                    this.emit('click', false, ...arguments);
                },
                moveTo(x, y, delay = 0) {
                    this.emit('moveTo', true, ...arguments);
                    self._move(x, y, true);
                    sleep(delay);
                    this.emit('moveTo', false, ...arguments);
                },
                async moveToAsync(x, y, delay = 0) {
                    this.emit('moveTo', true, ...arguments);
                    self._move(x, y, true);
                    await sleepAsync(delay);
                    this.emit('moveTo', false, ...arguments);
                },
                moveCurveTo(x, y, speed = 5, deviation = 30) {
                    this.emit('moveCurveTo', true, ...arguments);
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    humanCurv(x, y, ...self._lastCoords, speed, deviation).forEach(dot => {
                        self._move(dot[0], dot[1], true);
                        sleep(sleepTime);
                    });
                    this.emit('moveCurveTo', false, ...arguments);
                },
                async moveCurveToAsync(x, y, speed = 5, deviation = 30) {
                    this.emit('moveCurveTo', true, ...arguments);
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    for (const dot of humanCurv(x, y, ...self._lastCoords, speed, deviation)) {
                        self._move(dot[0], dot[1], true);
                        await sleepAsync(sleepTime);
                    }
                    this.emit('moveCurveTo', false, ...arguments);
                },
                move(x, y, delay = 0) {
                    this.emit('move', true, ...arguments);
                    self._move(x, y, false);
                    sleep(delay);
                    this.emit('move', false, ...arguments);
                },
                async moveAsync(x, y, delay = 0) {
                    this.emit('move', true, ...arguments);
                    self._move(x, y, false);
                    await sleepAsync(delay);
                    this.emit('move', false, ...arguments);
                },
                scrollWheel(count = 1, wheelTooglerDelay = 0) {
                    this.emit('scrollWheel', true, ...arguments);
                    self._scrollWheel(count);
                    sleep(wheelTooglerDelay);
                    this.emit('scrollWheel', false, ...arguments);
                },
                async scrollWheelAsync(count = 1, wheelTooglerDelay = 0) {
                    this.emit('scrollWheel', true, ...arguments);
                    self._scrollWheel(count);
                    await sleepAsync(wheelTooglerDelay);
                    this.emit('scrollWheel', false, ...arguments);
                }
            })
        });
        return this.mouse;
    }
}

const Workwindow = ClassName => class extends ClassName {
    constructor(workwindow) {
        super();
        this._workwindow = workwindow;
    }
    get workwindow() {
        const self = this;
        Object.defineProperty(this, "workwindow", {
            value: {
                set is(workwindow) {
                    self._workwindow = workwindow;
                },
                get is() {
                    const workwindow = { ...self._workwindow };
                    if (workwindow.className !== '') workwindow.className = workwindow.className.toString('ucs2');
                    if (workwindow.title !== '') workwindow.title = workwindow.title.toString('ucs2');
                    return workwindow;
                },
                set info(info) {
                    self._windowInfo = info;
                },
                get info() {
                    return self._windowInfo;
                },
                setForeground() {
                    self._setForeground();
                },
                isForeground() {
                    return self._isForeground();
                },
                isOpen() {
                    return self._isOpen();
                },
                capture(...args) {
                    return ({
                        ...self._capture(...args),
                        colorAt(x, y) {
                            const i = this.width * y + x << 2;
                            return ((this.data[i] << 16) | (this.data[i + 1] << 8) | this.data[i + 2]).toString(16);
                        }
                    });
                },
                kill() {
                    self._kill();
                },
                close() {
                    self._close();
                }
            }
        });
        return this.workwindow;
    }
}

module.exports = {
    getScreenSize,
    getWindow,
    getWindowChild,
    sleep,
    Virtual: Mouse(Keyboard(Workwindow(Virtual))),
    Hardware: Mouse(Keyboard(Workwindow(Hardware)))
}
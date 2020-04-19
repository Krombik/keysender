const { getScreenSize } = require('../../build/Release/key_sender.node');
const { sleep, sleepAsync, random } = require('./sleep');
const { EventEmitter } = require('events');
module.exports.Mouse = ClassName => class extends ClassName {
    get mouse() {
        const self = this;
        const choice = (...items) => items[Math.round(Math.random() * (items.length - 1))];
        const normalize = (item, max) => item < 0 ? 0 : item >= max ? max - 1 : item;
        const tremor = probability => Math.random() <= probability ? choice(-1, 1) : 0;
        const curvDotMaker = (start, end, deviation, sign) => Math.round(start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation);
        const firstCurvDotMaker = (start, end, deviation, sign) => Math.round(start + sign * (end - start) * 0.01 * deviation);
        const curvMaker = (t, start, curvDot1, curvDot2, end) => Math.floor(Math.pow(1 - t, 3) * start + 3 * Math.pow(1 - t, 2) * t * curvDot1 + 3 * (1 - t) * t * t * curvDot2 + t * t * t * end);
        const humanCurv = (xE, yE, speed, deviation) => {
            const { x, y } = self._lastCoords;
            if (x != xE && y != yE) {
                const path = [];
                const { height, width } = getScreenSize();
                const partLength = random(50, 200) / 2;
                const partsTotal = Math.ceil(Math.pow(Math.pow(xE - x, 2) + Math.pow(yE - y, 2), 0.5) / partLength);
                const xPartLength = (xE - x) / partsTotal;
                const yPartLength = (yE - y) / partsTotal;
                const speedMultiplier = (speed > 1 ? (speed + 2) : 3) / partLength;
                let partsLeft = partsTotal;
                let parts = random(1, partsTotal / 2);
                let xPartStart = x;
                let yPartStart = y;
                let xPartEnd = x + xPartLength * parts;
                let yPartEnd = y + yPartLength * parts;
                do {
                    let curvDotX1, curvDotX2, curvDotY1, curvDotY2;
                    const dotIterator = speedMultiplier / parts;
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
                return path.map((item, index) => index !== path.length - 1 ? [normalize(item[0], width), normalize(item[1] + tremor(speed / 15), height)] : [xE, yE]);
            }
            return [[x, y]];
        }
        Object.defineProperty(this, "mouse", {
            value: Object.assign(new EventEmitter, {
                buttonTogglerDelay: 35,
                enableSaveMod(bool) {
                    self._saveMod = bool;
                },
                getPos() {
                    return self._getPos();
                },
                toggle(isButtonDown, button = "left", buttonTogglerDelay = this.buttonTogglerDelay) {
                    this.emit('beforeToggle', ...arguments);
                    self._toggleMb(button, isButtonDown);
                    sleep(buttonTogglerDelay);
                    this.emit('afterToggle', ...arguments);
                },
                async toggleAsync(isButtonDown, button = "left", buttonTogglerDelay = this.buttonTogglerDelay) {
                    this.emit('beforeToggle', ...arguments);
                    self._toggleMb(button, isButtonDown);
                    await sleepAsync(buttonTogglerDelay);
                    this.emit('afterToggle', ...arguments);
                },
                click(button = "left", buttonTogglerDelay = this.buttonTogglerDelay, buttonSenderDelay = 0) {
                    this.emit('beforeClick', ...arguments);
                    self._toggleMb(button, true);
                    sleep(buttonTogglerDelay);
                    self._toggleMb(button, false);
                    sleep(buttonSenderDelay);
                    this.emit('afterClick', ...arguments);
                },
                async clickAsync(button = "left", buttonTogglerDelay = this.buttonTogglerDelay, buttonSenderDelay = 0) {
                    this.emit('beforeClick', ...arguments);
                    self._toggleMb(button, true);
                    await sleepAsync(buttonTogglerDelay);
                    self._toggleMb(button, false);
                    await sleepAsync(buttonSenderDelay);
                    this.emit('afterClick', ...arguments);
                },
                moveTo(x, y, delay = 0) {
                    this.emit('beforeMoveTo', ...arguments);
                    self._move(x, y, true);
                    sleep(delay);
                    this.emit('afterMoveTo', ...arguments);
                },
                async moveToAsync(x, y, delay = 0) {
                    this.emit('beforeMoveTo', ...arguments);
                    self._move(x, y, true);
                    await sleepAsync(delay);
                    this.emit('afterMoveTo', ...arguments);
                },
                moveCurveTo(x, y, speed = 5, deviation = 30) {
                    this.emit('beforeMoveCurveTo', ...arguments);
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    humanCurv(x, y, speed, deviation).forEach(dot => {
                        self._move(dot[0], dot[1], true);
                        sleep(sleepTime);
                    });
                    this.emit('afterMoveCurveTo', ...arguments);
                },
                async moveCurveToAsync(x, y, speed = 5, deviation = 30) {
                    this.emit('beforeMoveCurveTo', ...arguments);
                    const sleepTime = speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
                    for (const dot of humanCurv(x, y, speed, deviation)) {
                        self._move(dot[0], dot[1], true);
                        await sleepAsync(sleepTime);
                    }
                    this.emit('afterMoveCurveTo', ...arguments);
                },
                move(x, y, delay = 0) {
                    this.emit('beforeMove', ...arguments);
                    self._move(x, y, false);
                    sleep(delay);
                    this.emit('afterMove', ...arguments);
                },
                async moveAsync(x, y, delay = 0) {
                    this.emit('beforeMove', ...arguments);
                    self._move(x, y, false);
                    await sleepAsync(delay);
                    this.emit('afterMove', ...arguments);
                },
                scrollWheel(count, wheelTogglerDelay = 0) {
                    this.emit('beforeScrollWheel', ...arguments);
                    self._scrollWheel(count);
                    sleep(wheelTogglerDelay);
                    this.emit('afterScrollWheel', ...arguments);
                },
                async scrollWheelAsync(count, wheelTogglerDelay = 0) {
                    this.emit('beforeScrollWheel', ...arguments);
                    self._scrollWheel(count);
                    await sleepAsync(wheelTogglerDelay);
                    this.emit('afterScrollWheel', ...arguments);
                }
            })
        });
        return this.mouse;
    }
}
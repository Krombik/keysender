const { sleep, sleepAsync, random, DEFAULT_DELAY } = require("./helpers");
const { EventEmitter } = require("events");

module.exports.Mouse = (ClassName) =>
  class extends ClassName {
    get mouse() {
      const self = this;

      const _this = new EventEmitter();

      const choice = (...items) =>
        items[Math.round(Math.random() * (items.length - 1))];

      const tremor = (probability) =>
        Math.random() <= probability ? choice(-1, 1) : 0;

      const curveDotMaker = (start, end, deviation, sign) =>
        Math.round(
          start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation
        );

      const firstCurveDotMaker = (start, end, deviation, sign) =>
        Math.round(start + sign * (end - start) * 0.01 * deviation);

      const curveMaker = (t, start, curveDot1, curveDot2, end) =>
        Math.floor(
          Math.pow(1 - t, 3) * start +
            3 * Math.pow(1 - t, 2) * t * curveDot1 +
            3 * (1 - t) * t * t * curveDot2 +
            t * t * t * end
        );

      const humanCurve = (xE, yE, speed, deviation) => {
        const { x, y } = self._lastCoords;
        if (x != xE && y != yE) {
          const path = [];
          const partLength = random(50, 200) / 2;
          const partsTotal = Math.ceil(
            Math.pow(Math.pow(xE - x, 2) + Math.pow(yE - y, 2), 0.5) /
              partLength
          );
          const xPartLength = (xE - x) / partsTotal;
          const yPartLength = (yE - y) / partsTotal;
          const speedMultiplier = (speed > 1 ? speed + 2 : 3) / partLength;
          let partsLeft = partsTotal;
          let parts = random(1, partsTotal / 2);
          let xPartStart = x;
          let yPartStart = y;
          let xPartEnd = x + xPartLength * parts;
          let yPartEnd = y + yPartLength * parts;
          do {
            let curveDotX1, curveDotX2, curveDotY1, curveDotY2;
            const dotIterator = speedMultiplier / parts;
            if (partsLeft !== partsTotal) {
              curveDotX1 = curveDotMaker(
                xPartStart,
                xPartEnd,
                random(deviation / 3, deviation),
                choice(-1, 1)
              );
              curveDotY1 = curveDotMaker(
                yPartStart,
                yPartEnd,
                random(deviation / 3, deviation / 2),
                choice(-1, 1)
              );
              curveDotX2 = curveDotMaker(
                xPartStart,
                xPartEnd,
                random(0, deviation),
                choice(-1, 1)
              );
              curveDotY2 = curveDotMaker(
                yPartStart,
                yPartEnd,
                random(0, deviation / 2),
                choice(-1, 1)
              );
            } else {
              curveDotX1 = firstCurveDotMaker(
                xPartStart,
                xPartEnd,
                random(deviation / 2, deviation),
                1
              );
              curveDotY1 = firstCurveDotMaker(
                yPartStart,
                yPartEnd,
                random(deviation / 4, deviation / 3),
                1
              );
              curveDotX2 = firstCurveDotMaker(
                xPartStart,
                xPartEnd,
                random(deviation / 2, deviation),
                choice(-1, 1)
              );
              curveDotY2 = firstCurveDotMaker(
                yPartStart,
                yPartEnd,
                random(deviation / 2, deviation),
                choice(-1, 1)
              );
            }
            for (let t = 0; t < 1.00001; t += dotIterator) {
              const curr = [
                curveMaker(t, xPartStart, curveDotX1, curveDotX2, xPartEnd),
                curveMaker(t, yPartStart, curveDotY1, curveDotY2, yPartEnd),
              ];
              const prev = path[path.length - 1];
              if (
                path.length === 0 ||
                !(prev[0] === curr[0] && prev[1] === curr[1])
              )
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
          return path.map((item, index) =>
            index !== path.length - 1
              ? [item[0], item[1] + tremor(speed / 15)]
              : [xE, yE]
          );
        }
        return [[x, y]];
      };

      Object.defineProperty(this, "mouse", {
        value: Object.assign(_this, {
          buttonTogglerDelay: DEFAULT_DELAY,
          enableSaveMode(bool) {
            self._saveMode = bool;
          },
          getPos() {
            return self._getPos();
          },
          toggle(
            button = "left",
            isButtonDown,
            buttonTogglerDelay = _this.buttonTogglerDelay
          ) {
            _this.emit("before-toggle", ...arguments);
            self._toggleMb(button, isButtonDown);
            sleep(buttonTogglerDelay);
            _this.emit("after-toggle", ...arguments);
          },
          async toggleAsync(
            button = "left",
            isButtonDown,
            buttonTogglerDelay = _this.buttonTogglerDelay
          ) {
            _this.emit("before-toggle", ...arguments);
            self._toggleMb(button, isButtonDown);
            await sleepAsync(buttonTogglerDelay);
            _this.emit("after-toggle", ...arguments);
          },
          click(
            button = "left",
            buttonTogglerDelay = _this.buttonTogglerDelay,
            buttonSenderDelay = 0
          ) {
            _this.emit("before-click", ...arguments);
            self._toggleMb(button, true);
            sleep(buttonTogglerDelay);
            self._toggleMb(button, false);
            sleep(buttonSenderDelay);
            _this.emit("after-click", ...arguments);
          },
          async clickAsync(
            button = "left",
            buttonTogglerDelay = _this.buttonTogglerDelay,
            buttonSenderDelay = 0
          ) {
            _this.emit("before-click", ...arguments);
            self._toggleMb(button, true);
            await sleepAsync(buttonTogglerDelay);
            self._toggleMb(button, false);
            await sleepAsync(buttonSenderDelay);
            _this.emit("after-click", ...arguments);
          },
          moveTo(x, y, delay = 0) {
            _this.emit("before-moveTo", ...arguments);
            self._move(x, y, true);
            sleep(delay);
            _this.emit("after-moveTo", ...arguments);
          },
          async moveToAsync(x, y, delay = 0) {
            _this.emit("before-moveTo", ...arguments);
            self._move(x, y, true);
            await sleepAsync(delay);
            _this.emit("after-moveTo", ...arguments);
          },
          moveCurveTo(x, y, speed = 5, deviation = 30) {
            _this.emit("before-moveCurveTo", ...arguments);
            const sleepTime =
              speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
            humanCurve(x, y, speed, deviation).forEach((dot) => {
              self._move(dot[0], dot[1], true);
              sleep(sleepTime);
            });
            _this.emit("after-moveCurveTo", ...arguments);
          },
          async moveCurveToAsync(x, y, speed = 5, deviation = 30) {
            _this.emit("before-moveCurveTo", ...arguments);
            const sleepTime =
              speed >= 1 ? 1 : speed !== "max" ? Math.round(1 / speed) : 0;
            for (const dot of humanCurve(x, y, speed, deviation)) {
              self._move(dot[0], dot[1], true);
              await sleepAsync(sleepTime);
            }
            _this.emit("after-moveCurveTo", ...arguments);
          },
          move(x, y, delay = 0) {
            _this.emit("before-move", ...arguments);
            self._move(x, y, false);
            sleep(delay);
            _this.emit("after-move", ...arguments);
          },
          async moveAsync(x, y, delay = 0) {
            _this.emit("before-move", ...arguments);
            self._move(x, y, false);
            await sleepAsync(delay);
            _this.emit("after-move", ...arguments);
          },
          scrollWheel(count, wheelTogglerDelay = 0) {
            _this.emit("before-scrollWheel", ...arguments);
            self._scrollWheel(count);
            sleep(wheelTogglerDelay);
            _this.emit("after-scrollWheel", ...arguments);
          },
          async scrollWheelAsync(count, wheelTogglerDelay = 0) {
            _this.emit("before-scrollWheel", ...arguments);
            self._scrollWheel(count);
            await sleepAsync(wheelTogglerDelay);
            _this.emit("after-scrollWheel", ...arguments);
          },
        }),
      });

      return this.mouse;
    }
  };

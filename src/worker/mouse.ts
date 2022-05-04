import { DEFAULT_DELAY } from "../constants";
import { Delay, MouseButton } from "../types";
import { Worker } from "../addon";
import { random, sleep } from "../utils";

const handleMouse = (worker: Worker) => {
  const _getSign = () => (Math.random() > 0.5 ? 1 : -1);

  const _tremor = (probability: number) =>
    Math.random() <= probability ? _getSign() : 0;

  const _curveDotMaker = (
    start: number,
    end: number,
    deviation: number,
    sign: 1 | -1
  ) =>
    Math.round(
      start + (end - start) / 2 + sign * (end - start) * 0.01 * deviation
    );

  const _firstCurveDotMaker = (
    start: number,
    end: number,
    deviation: number,
    sign: 1 | -1
  ) => Math.round(start + sign * (end - start) * 0.01 * deviation);

  const _curveMaker = (
    t: number,
    start: number,
    curveDot1: number,
    curveDot2: number,
    end: number
  ) => {
    const invertT = 1 - t;

    const invertT2 = invertT * invertT;

    const t2 = t * t;

    return Math.floor(
      invertT2 * invertT * start +
        3 * invertT2 * t * curveDot1 +
        3 * invertT * t2 * curveDot2 +
        t2 * t * end
    );
  };

  const _humanCurve = (
    xE: number,
    yE: number,
    speed: number,
    deviation: number
  ) => {
    const { x, y } = worker.lastCoords;

    if (x === xE && y === yE) {
      return [[x, y]];
    }

    const path = [];

    const partLength = random(50, 200) / 2;

    const partsTotal = Math.ceil(
      Math.pow(Math.pow(xE - x, 2) + Math.pow(yE - y, 2), 0.5) / partLength
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
        curveDotX1 = _curveDotMaker(
          xPartStart,
          xPartEnd,
          random(deviation / 3, deviation),
          _getSign()
        );

        curveDotY1 = _curveDotMaker(
          yPartStart,
          yPartEnd,
          random(deviation / 3, deviation / 2),
          _getSign()
        );

        curveDotX2 = _curveDotMaker(
          xPartStart,
          xPartEnd,
          random(0, deviation),
          _getSign()
        );

        curveDotY2 = _curveDotMaker(
          yPartStart,
          yPartEnd,
          random(0, deviation / 2),
          _getSign()
        );
      } else {
        curveDotX1 = _firstCurveDotMaker(
          xPartStart,
          xPartEnd,
          random(deviation / 2, deviation),
          1
        );

        curveDotY1 = _firstCurveDotMaker(
          yPartStart,
          yPartEnd,
          random(deviation / 4, deviation / 3),
          1
        );

        curveDotX2 = _firstCurveDotMaker(
          xPartStart,
          xPartEnd,
          random(deviation / 2, deviation),
          _getSign()
        );

        curveDotY2 = _firstCurveDotMaker(
          yPartStart,
          yPartEnd,
          random(deviation / 2, deviation),
          _getSign()
        );
      }
      for (let t = 0; t < 1.00001; t += dotIterator) {
        const curr = [
          _curveMaker(t, xPartStart, curveDotX1, curveDotX2, xPartEnd),
          _curveMaker(t, yPartStart, curveDotY1, curveDotY2, yPartEnd),
        ];

        const prev = path[path.length - 1];

        if (
          path.length === 0 ||
          !(prev[0] === curr[0] && prev[1] === curr[1])
        ) {
          path.push(curr);
        }
      }

      if (xPartEnd === xE && yPartEnd === yE) {
        break;
      }

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

    const arr: number[][] = [];

    const l = path.length - 1;

    for (let i = 1; i < l; i++) {
      const item = path[i];

      arr.push([item[0], item[1] + _tremor(speed / 15)]);
    }

    arr.push([xE, yE]);

    return arr;
  };

  const toggle = (
    button: MouseButton,
    state: boolean,
    delay: Delay = DEFAULT_DELAY
  ) => {
    worker.toggleMb(button, state);

    return sleep(delay);
  };

  const click = async (
    button: MouseButton = "left",
    buttonTogglerDelay: Delay = DEFAULT_DELAY,
    buttonSenderDelay: Delay = 0
  ) => {
    await toggle(button, true, buttonTogglerDelay);

    return toggle(button, false, buttonSenderDelay);
  };

  const moveTo = (x: number, y: number, delay: Delay = 0) => {
    worker.move(x, y, true);

    return sleep(delay);
  };

  const moveCurveTo = async (
    x: number,
    y: number,
    speed = 5,
    deviation = 30
  ) => {
    const sleepTime = speed >= 1 ? 1 : Math.round(1 / speed);

    const curve = _humanCurve(x, y, speed, deviation);

    for (let i = 0; i < curve.length; i++) {
      const dot = curve[i];

      await moveTo(dot[0], dot[1], sleepTime);
    }
  };

  const move = (x: number, y: number, delay: Delay = 0) => {
    worker.move(x, y, false);

    return sleep(delay);
  };

  const scrollWheel = (amount: number, delay: Delay = 0) => {
    worker.scrollWheel(amount);

    return sleep(delay);
  };

  return {
    get saveMode() {
      return worker.saveMode;
    },

    set saveMode(value: boolean) {
      worker.saveMode = value;
    },

    getPos: worker.getPos,

    toggle,
    click,
    moveTo,
    moveCurveTo,
    move,
    scrollWheel,
  };
};

export default handleMouse;

import { _Worker, _Hardware, _Virtual } from "./addon";
import {
  bindPick,
  lazyGetters,
  makeCancelable,
  normalizeWindowInfo,
  random,
  sleep,
  stringsToBuffers,
} from "./utils";
import { Keyboard, KeyboardButton, Mouse, RGB, Workwindow } from "./types";
import { DEFAULT_DELAY, MICRO_DELAY } from "./constants";
import { SetWorkwindow } from "./types/utils";

declare class Worker {
  /** Provides methods to synthesize keystrokes */
  readonly keyboard: Keyboard;

  /** Provides methods to synthesize mouse motions, and button clicks */
  readonly mouse: Mouse;

  /** Provides methods to work with workwindow */
  readonly workwindow: Workwindow;

  /** Use entire desktop as workwindow */
  constructor();
  /** Use the first window with {@link handle} */
  constructor(handle: number);
  /** Use the first window with {@link title} and/or {@link className} and sets it as current workwindow */
  constructor(title: string | null, className?: string | null);
  /** Use the first child window with {@link childClassName} and/or {@link childTitle} of window with {@link parentHandle} and sets it as current workwindow */
  constructor(
    parentHandle: number,
    childClassName: string | null,
    childTitle?: string | null
  );
  /** Use the first child window with {@link childClassName} and/or {@link childTitle} of the first found window with {@link parentTitle} and/or {@link parentClassName} and sets it as current workwindow */
  constructor(
    parentTitle: string | null,
    parentClassName: string | null,
    childClassName: string | null,
    childTitle?: string | null
  );
}

const handleSetWorkwindow =
  (worker: _Worker): SetWorkwindow =>
  (...args: any[]) => {
    worker.setWorkwindow(...stringsToBuffers(args));
  };

const handleWorker = (WorkerClass: typeof _Worker): typeof Worker =>
  class {
    declare readonly keyboard: Keyboard;

    declare readonly mouse: Mouse;

    declare readonly workwindow: Workwindow;

    constructor(...args: any[]) {
      const worker = new WorkerClass();

      handleSetWorkwindow(worker).apply(null, args);

      lazyGetters(this, {
        keyboard() {
          const _toggleKey = (key: KeyboardButton, state: boolean) => {
            worker.toggleKey(key, state);

            return sleep(MICRO_DELAY);
          };

          const _toggleKeys = async (
            keys: KeyboardButton[],
            state: boolean
          ) => {
            const l = keys.length - 1;

            let i: number;

            if (state) {
              for (i = 0; i < l; i++) {
                await _toggleKey(keys[i], true);
              }
            } else {
              for (i = l; i > 0; i--) {
                await _toggleKey(keys[i], false);
              }
            }

            worker.toggleKey(keys[i], state);
          };

          const sendKey: Keyboard["sendKey"] = async (
            key,
            delayAfterPress = DEFAULT_DELAY,
            delayAfterRelease = 0
          ) => {
            if (Array.isArray(key)) {
              await _toggleKeys(key, true);

              await sleep(delayAfterPress);

              await _toggleKeys(key, false);
            } else {
              worker.toggleKey(key, true);

              await sleep(delayAfterPress);

              worker.toggleKey(key, false);
            }

            return sleep(delayAfterRelease);
          };

          return {
            printText: makeCancelable<Keyboard["printText"]>(async function (
              text,
              delayAfterCharTyping = 0,
              delay = 0
            ) {
              if (text) {
                if (delayAfterCharTyping) {
                  this.isCancelable = true;

                  const it = new Intl.Segmenter()
                    .segment(text)
                    [Symbol.iterator]();

                  let curr = it.next();

                  for (let next = it.next(); !next.done; next = it.next()) {
                    if (this.isCanceled()) {
                      return;
                    }

                    worker.printChar(Buffer.from(curr.value.segment, "ucs2"));

                    await sleep(delayAfterCharTyping);

                    curr = next;
                  }

                  if (this.isCanceled()) {
                    return;
                  }

                  delete this.isCancelable;

                  worker.printChar(Buffer.from(curr.value.segment, "ucs2"));
                } else {
                  worker.printChar(Buffer.from(text, "ucs2"));
                }
              }

              return sleep(delay);
            }),

            async toggleKey(key, state, delay = 0) {
              if (Array.isArray(key)) {
                await _toggleKeys(key, state);
              } else {
                worker.toggleKey(key, state);
              }

              return sleep(delay);
            },

            sendKey,

            sendKeys: makeCancelable<Keyboard["sendKeys"]>(async function (
              keys,
              delayAfterPress = DEFAULT_DELAY,
              delayAfterRelease = DEFAULT_DELAY,
              delay = 0
            ) {
              this.isCancelable = true;

              const l = keys.length - 1;

              for (let i = 0; i < l; i++) {
                if (this.isCanceled()) {
                  return;
                }

                await sendKey(keys[i], delayAfterPress, delayAfterRelease);
              }

              if (this.isCanceled()) {
                return;
              }

              delete this.isCancelable;

              return sendKey(keys[l], delayAfterPress, delay);
            }),
          };
        },
        mouse() {
          const _getSign = () => (Math.random() > 0.5 ? 1 : -1);

          const _tremor = (probability: number) =>
            Math.random() <= probability ? _getSign() : 0;

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

          const _curveDotMaker = (
            start: number,
            end: number,
            deviation: number
          ) =>
            Math.round(start + (end - start) * (0.5 + _getSign() * deviation));

          const _firstCurveDotMaker = (
            start: number,
            end: number,
            deviation: number,
            sign: 1 | -1
          ) => Math.round(start + sign * (end - start) * deviation);

          const moveTo: Mouse["moveTo"] = (x, y, delay = 0) => {
            worker.move(x, y, true);

            return sleep(delay);
          };

          const toggle: Mouse["toggle"] = (button, state, delay = 0) => {
            worker.toggleMb(button, state);

            return sleep(delay);
          };

          return {
            ...bindPick(worker, ["getPos"]),

            toggle,

            async click(
              button = "left",
              delayAfterPress = DEFAULT_DELAY,
              delayAfterRelease = 0
            ) {
              await toggle(button, true, delayAfterPress);

              return toggle(button, false, delayAfterRelease);
            },

            moveTo,

            humanMoveTo: makeCancelable<Mouse["humanMoveTo"]>(async function (
              xE,
              yE,
              speed = 5,
              deviation = 30,
              delay = 0
            ) {
              deviation /= 100;

              const sleepTime = speed >= 1 ? 1 : Math.round(1 / speed);

              const { x, y } = worker.lastCoords;

              if (x === xE && y === yE) {
                return;
              }

              this.isCancelable = true;

              const partLength = random(50, 200) / 2;

              const partsTotal = Math.ceil(
                Math.pow(Math.pow(xE - x, 2) + Math.pow(yE - y, 2), 0.5) /
                  partLength
              );

              const xPartLength = (xE - x) / partsTotal;

              const yPartLength = (yE - y) / partsTotal;

              const speedMultiplier = (speed > 1 ? speed + 2 : 3) / partLength;

              let partsLeft = partsTotal;

              let isLastOne = partsTotal === 1;

              let parts: number;

              let xPartEnd: number;

              let yPartEnd: number;

              let xPartStart = x;

              let yPartStart = y;

              if (!isLastOne) {
                parts = random(1, Math.ceil(partsTotal / 2));

                xPartEnd = x + xPartLength * parts;

                yPartEnd = y + yPartLength * parts;
              } else {
                parts = 1;

                xPartEnd = xE;

                yPartEnd = yE;
              }

              let getCurveDots = () => {
                getCurveDots = () => ({
                  curveDotX1: _curveDotMaker(
                    xPartStart,
                    xPartEnd,
                    random(deviation / 3, deviation)
                  ),
                  curveDotY1: _curveDotMaker(
                    yPartStart,
                    yPartEnd,
                    random(deviation / 3, deviation / 2)
                  ),
                  curveDotX2: _curveDotMaker(
                    xPartStart,
                    xPartEnd,
                    random(0, deviation)
                  ),
                  curveDotY2: _curveDotMaker(
                    yPartStart,
                    yPartEnd,
                    random(0, deviation / 2)
                  ),
                });

                return {
                  curveDotX1: _firstCurveDotMaker(
                    xPartStart,
                    xPartEnd,
                    random(deviation / 2, deviation),
                    1
                  ),
                  curveDotY1: _firstCurveDotMaker(
                    yPartStart,
                    yPartEnd,
                    random(deviation / 4, deviation / 3),
                    1
                  ),
                  curveDotX2: _firstCurveDotMaker(
                    xPartStart,
                    xPartEnd,
                    random(deviation / 2, deviation),
                    _getSign()
                  ),
                  curveDotY2: _firstCurveDotMaker(
                    yPartStart,
                    yPartEnd,
                    random(deviation / 2, deviation),
                    _getSign()
                  ),
                };
              };

              const tremorProbability = speed / 15;

              while (true) {
                const { curveDotX1, curveDotX2, curveDotY1, curveDotY2 } =
                  getCurveDots();

                const dotIterator = speedMultiplier / parts;

                const count = 1 / dotIterator;

                for (let i = 1; i < count; i++) {
                  if (this.isCanceled()) {
                    return;
                  }

                  const t = i * dotIterator;

                  await moveTo(
                    _curveMaker(
                      t,
                      xPartStart,
                      curveDotX1,
                      curveDotX2,
                      xPartEnd
                    ),
                    _curveMaker(
                      t,
                      yPartStart,
                      curveDotY1,
                      curveDotY2,
                      yPartEnd
                    ) + _tremor(tremorProbability),
                    sleepTime
                  );
                }

                if (this.isCanceled()) {
                  return;
                }

                if (isLastOne) {
                  delete this.isCancelable;

                  await moveTo(xE, yE, delay);

                  return;
                }

                await moveTo(
                  xPartEnd,
                  yPartEnd + _tremor(tremorProbability),
                  sleepTime
                );

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

                  isLastOne = true;
                }
              }
            }),

            move(x, y, delay = 0) {
              worker.move(x, y, false);

              return sleep(delay);
            },

            scrollWheel(amount, delay = 0) {
              worker.scrollWheel(amount);

              return sleep(delay);
            },
          };
        },
        workwindow() {
          const _add0 = (item: string) => (item.length > 1 ? item : "0" + item);

          const _hex = (...rgb: RGB) =>
            rgb.reduce((hex, color) => hex + _add0(color.toString(16)), "");

          return {
            ...bindPick(worker, [
              "refresh",
              "setForeground",
              "isForeground",
              "isOpen",
              "capture",
              "kill",
              "close",
              "getView",
              "setView",
            ]),

            set: handleSetWorkwindow(worker),

            get: () => normalizeWindowInfo(worker.getWorkwindow()),

            colorAt(x, y, format = "string"): any {
              const bgr = worker.getColor(x, y);

              const r = bgr & 0xff;
              const g = (bgr >> 8) & 0xff;
              const b = (bgr >> 16) & 0xff;

              switch (format) {
                case "array":
                  return [r, g, b];

                case "number":
                  return (r << 16) | (g << 8) | b;

                case "string":
                  return _hex(r, g, b);

                default:
                  throw new Error("wrong format");
              }
            },
          };
        },
      });
    }
  };

/** Provides methods implementations on hardware level. */
export const Hardware = handleWorker(_Hardware);

/** Provides methods implementations on virtual level. */
export const Virtual = handleWorker(_Virtual);

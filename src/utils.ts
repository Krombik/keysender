import { Delay, RGB, WindowInfo } from "./types";
import { _WindowInfo } from "./addon";
import fs from "fs";

const resolvedPromise = Promise.resolve();

export const random = (min: number, max: number) =>
  min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;

export const sleep = (delay: Delay) => {
  if (Array.isArray(delay)) {
    delay = random(delay[0], delay[1]);
  }

  if (delay) {
    return new Promise<void>((res) => {
      setTimeout(res, delay as number);
    });
  }

  return resolvedPromise;
};

type StringsToBuffers<T extends any[]> = {
  [key in keyof T]: Extract<T[key], string> extends string
    ? Exclude<T[key], string> | Buffer
    : T[key];
};

export const stringsToBuffers = <T extends any[]>(args: T) =>
  args.map((item) =>
    typeof item === "string" ? Buffer.from(item, "ucs2") : item
  ) as StringsToBuffers<T>;

export const lazyGetters = <T extends {}, K extends keyof T>(
  self: T,
  modules: { [key in K]: () => T[key] }
) => {
  const keys = Object.keys(modules);

  for (let i = keys.length; i--; ) {
    const key = keys[i];

    Object.defineProperty(self, key, {
      configurable: true,
      get() {
        Object.defineProperty(self, key, {
          value: modules[key](),
        });

        return self[key];
      },
    });
  }
};

export const bindPick = <T extends {}, K extends keyof T>(
  worker: T,
  keys: K[]
) =>
  keys.reduce(
    (acc, key) => ({ ...acc, [key]: (worker[key] as Function).bind(worker) }),
    {} as { [key in K]: T[key] extends Function ? T[key] : never }
  );

export const noop = function () {};

const rgbToBgr = (color: number) =>
  ((color & 0xff) << 16) |
  (((color >> 8) & 0xff) << 8) |
  ((color >> 16) & 0xff);

export const toBGR = (color: number | string | RGB) => {
  switch (typeof color) {
    case "number":
      return rgbToBgr(color);

    case "string":
      return rgbToBgr(parseInt(color, 16));

    default:
      return (
        (color[0] & 0xff) | ((color[1] >> 8) & 0xff) | ((color[2] >> 16) & 0xff)
      );
  }
};

export const getFontName = (path: string) => {
  const data = new DataView(fs.readFileSync(path).buffer, 0);

  const tablesCount = data.getUint16(4, false);

  let offset: number | undefined;

  for (let i = 0, pos = 12; i < tablesCount; i++, pos += 16) {
    if (
      String.fromCodePoint(
        data.getInt8(pos),
        data.getInt8(pos + 1),
        data.getInt8(pos + 2),
        data.getInt8(pos + 3)
      ) === "name"
    ) {
      offset = data.getUint32(pos + 8, false);

      break;
    }
  }

  if (offset === undefined) {
    throw new Error(`Something wrong with font '${path}'`);
  }

  let count = data.getUint16(offset + 2);

  const keyPos = offset + data.getUint16(offset + 4);

  offset += 6;

  while (count--) {
    const t = data.getUint16(offset);

    offset += 6;

    if ((t === 0 || t === 3) && data.getUint16(offset) === 4) {
      const fontFullName = new Uint16Array(data.getUint16(offset + 2) / 2);

      for (
        let i = 0, charPos = keyPos + data.getUint16(offset + 4);
        i < fontFullName.length;
        i++, charPos += 2
      ) {
        fontFullName[i] = data.getUint16(charPos);
      }

      return Buffer.from(fontFullName);
    }

    offset += 6;
  }

  throw new Error(`Something wrong with font '${path}'`);
};

export const normalizeWindowInfo = (windowInfo: _WindowInfo): WindowInfo => ({
  ...windowInfo,
  className: windowInfo.className.toString("ucs2"),
  title: windowInfo.title.toString("ucs2"),
});

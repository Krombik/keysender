const { _sleep } = require("../../build/Release/key_sender.node");
const { Buffer } = require("buffer");
const fs = require("fs");

const random = (min, max) =>
  min < max ? Math.floor(Math.random() * (max + 1 - min)) + min : min;

module.exports = {
  DEFAULT_DELAY: 35,

  random,

  sleepAsync: (ms) =>
    new Promise((res) =>
      setTimeout(res, Array.isArray(ms) ? random(...ms) : ms)
    ),

  sleep(arg) {
    const ms = !Array.isArray(arg) ? arg : random(...arg);

    if (ms > 0) _sleep(ms);
  },

  stringsToBuffers(args) {
    return args.map((item) =>
      typeof item === "string" ? Buffer.from(item, "ucs2") : item
    );
  },

  rgbToBgr(color) {
    if (typeof color === "string") {
      color = parseInt(color, 16);

      return (
        ((color & 0xff) << 16) |
        (((color >> 8) & 0xff) << 8) |
        ((color >> 16) & 0xff)
      );
    } else if (Array.isArray(color)) {
      return (
        (color[0] & 0xff) | ((color[1] >> 8) & 0xff) | ((color[2] >> 16) & 0xff)
      );
    } else if (typeof color === "number") {
      return (
        ((color & 0xff) << 16) |
        (((color >> 8) & 0xff) << 8) |
        ((color >> 16) & 0xff)
      );
    }

    return undefined;
  },

  getFontName(path) {
    const data = new DataView(fs.readFileSync(path).buffer, 0);

    const tablesCount = data.getUint16(4, false);

    let offset;

    for (let i = 0, pos = 12; i < tablesCount; i++, pos += 16)
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

    let count = data.getUint16(offset + 2);

    const keyPos = offset + data.getUint16(offset + 4);

    offset += 6;

    while (count--)
      if (
        data.getUint16((offset += 6)) === 4 &&
        [3, 0].some((item) => item === data.getUint16(offset - 6))
      ) {
        const fontFullName = new Array(data.getUint16(offset + 2) / 2);

        for (
          let i = 0, charPos = keyPos + data.getUint16(offset + 4);
          i < fontFullName.length;
          i++, charPos += 2
        )
          fontFullName[i] = data.getUint16(charPos);

        return Buffer.from(String.fromCodePoint(...fontFullName), "ucs2");
      } else offset += 6;

    return undefined;
  },
};

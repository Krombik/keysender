const {
  _textToImg,
  _getAllWindows,
  _getWindowChildren,
} = require("../../build/Release/key_sender.node");
const { Buffer } = require("buffer");
const fs = require("fs");
const getFontName = (path) => {
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
};
const rgbToBgr = (color) => {
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
};
module.exports = {
  textToImg(text, path, fontSize, options = {}) {
    if (options.color) options.color = rgbToBgr(options.color);
    if (options.backgroundColor)
      options.backgroundColor = rgbToBgr(options.backgroundColor);
    const fullOptions = {
      enableActualHeight: false,
      enableAntiAliasing: true,
      color: 0xffffff,
      backgroundColor: 0,
      format: "rgba",
      ...options,
    };
    return _textToImg(
      Buffer.from(text, "ucs2"),
      Buffer.from(path, "ucs2"),
      getFontName(path),
      fontSize,
      fullOptions
    );
  },
  getAllWindows() {
    return _getAllWindows().map((item) => {
      item.className = item.className.toString("ucs2");
      item.title = item.title.toString("ucs2");
      return item;
    });
  },
  getWindowChildren(...args) {
    return _getWindowChildren(...stringToBuffer(args)).map((item) => {
      item.className = item.className.toString("ucs2");
      item.title = item.title.toString("ucs2");
      return item;
    });
  },
};

const {
  _textToImg,
  _getAllWindows,
  _getWindowChildren,
} = require("../../build/Release/key_sender.node");
const { Buffer } = require("buffer");
const { stringsToBuffers, rgbToBgr, getFontName } = require("./helpers");

module.exports = {
  textToImg(text, path, fontSize, options = {}) {
    return _textToImg(
      Buffer.from(text, "ucs2"),
      Buffer.from(path, "ucs2"),
      getFontName(path),
      fontSize,
      {
        enableActualHeight: false,
        enableAntiAliasing: true,
        format: "rgba",
        ...options,
        color: options.color !== undefined ? rgbToBgr(options.color) : 0xffffff,
        backgroundColor:
          options.backgroundColor !== undefined
            ? rgbToBgr(options.backgroundColor)
            : 0,
      }
    );
  },
  getAllWindows() {
    return _getAllWindows().map((item) => ({
      ...item,
      className: item.className.toString("ucs2"),
      title: item.title.toString("ucs2"),
    }));
  },
  getWindowChildren(...args) {
    return _getWindowChildren(...stringsToBuffers(args)).map((item) => ({
      ...item,
      className: item.className.toString("ucs2"),
      title: item.title.toString("ucs2"),
    }));
  },
};

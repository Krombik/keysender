const { EventEmitter } = require("events");
const { stringsToBuffers } = require("./helpers");

module.exports.Workwindow = (ClassName) =>
  class extends ClassName {
    constructor(...args) {
      super();
      this._setWorkwindow(...stringsToBuffers(args));
    }
    get workwindow() {
      const self = this;
      const add0 = (item) => (item.length > 1 ? item : "0" + item);
      const hex = (...rgb) =>
        rgb.reduce((hex, color) => hex + add0(color.toString(16)), "");
      Object.defineProperty(this, "workwindow", {
        value: Object.assign(new EventEmitter(), {
          set(...args) {
            self._setWorkwindow(...stringsToBuffers(args));
          },
          get() {
            const workwindow = self._getWorkwindow();
            return {
              ...workwindow,
              className: workwindow.className.toString("ucs2"),
              title: workwindow.title.toString("ucs2"),
            };
          },
          refresh() {
            return self._refresh();
          },
          setView(view) {
            self._windowView = view;
          },
          getView() {
            return self._windowView;
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
            const img = self._capture(...args);
            this.emit("capture", img);
            return img;
          },
          colorAt(x, y, returnType) {
            let color = self._getColor(x, y);
            color = [color & 0xff, (color >> 8) & 0xff, (color >> 16) & 0xff];
            if (returnType === "array") return color;
            if (returnType === "number")
              return (color[0] << 16) | (color[1] << 8) | color[2];
            return hex(...color);
          },
          kill() {
            self._kill();
          },
          close() {
            self._close();
          },
        }),
      });
      return this.workwindow;
    }
  };

const { _getWindow, _getWindowChild } = require('../../build/Release/key_sender.node');
const { Buffer } = require('buffer');
const { EventEmitter } = require('events');
module.exports = {
    Workwindow: ClassName => class extends ClassName {
        constructor(workwindow) {
            super();
            this._workwindow = workwindow;
        }
        get workwindow() {
            const self = this;
            const add0 = item => item.length > 1 ? item : '0' + item;
            const hex = (...rgb) => rgb.reduce((hex, color) => hex + add0(color.toString(16)), '');
            Object.defineProperty(this, "workwindow", {
                value: Object.assign(new EventEmitter, {
                    set(workwindow) {
                        self._workwindow = workwindow;
                    },
                    get() {
                        const workwindow = { ...self._workwindow };
                        workwindow.className = workwindow.className.toString('ucs2');
                        workwindow.title = workwindow.title.toString('ucs2');
                        return workwindow;
                    },
                    setInfo(info) {
                        self._windowInfo = info;
                    },
                    getInfo() {
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
                        const img = self._capture(...args)
                        this.emit('capture', img);
                        return img;
                    },
                    colorAt(x, y, returnType = "string") {
                        let color = self._getColor(x, y);
                        color = [color & 0xff, (color >> 8) & 0xff, (color >> 16) & 0xff]
                        if (returnType === "string")
                            return hex(...color);
                        if (returnType === "array")
                            return color;
                        if (returnType === "number")
                            return color[0] << 16 | color[1] << 8 | color[2];
                    },
                    kill() {
                        self._kill();
                    },
                    close() {
                        self._close();
                    }
                })
            });
            return this.workwindow;
        }
    },
    getWindow: (title, className) => title === undefined && className === undefined ?
        _getWindow().map(item => {
            item.className = item.className.toString('ucs2');
            item.title = item.title.toString('ucs2');
            return item;
        })
        :
        _getWindow(title !== null ? Buffer.from(title, "ucs2") : null, className !== undefined ? Buffer.from(className, "ucs2") : null),
    getWindowChild: (parentHandle, className, title) => className === undefined && title === undefined ?
        _getWindowChild(parentHandle).map(item => {
            item.className = item.className.toString('ucs2');
            item.title = item.title.toString('ucs2');
            return item;
        }) :
        _getWindowChild(parentHandle, className !== null ? Buffer.from(className, "ucs2") : null, title !== undefined ? Buffer.from(title, "ucs2") : null)
}
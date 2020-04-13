const { Virtual, Hardware, getScreenSize } = require('./build/Release/key_sender.node');
const { GlobalHotkey } = require('./src/js/hotkey');
const { getWindow, getWindowChild, Workwindow } = require('./src/js/workwindow');
const { Keyboard } = require('./src/js/keyboard');
const { Mouse } = require('./src/js/mouse');
const { sleep } = require('./src/js/sleep');

module.exports = {
    GlobalHotkey,
    getScreenSize,
    getWindow,
    getWindowChild,
    sleep,
    Virtual: Mouse(Keyboard(Workwindow(Virtual))),
    Hardware: Mouse(Keyboard(Workwindow(Hardware))),
}
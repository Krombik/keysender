const { Virtual, Hardware, getScreenSize, vkToString } = require('./build/Release/key_sender.node');
const { GlobalHotkey } = require('./src/js/hotkey');
const { getAllWindows, getWindowChildren, Workwindow } = require('./src/js/workwindow');
const { Keyboard } = require('./src/js/keyboard');
const { Mouse } = require('./src/js/mouse');
const { sleep } = require('./src/js/sleep');

module.exports = {
    vkToString,
    GlobalHotkey,
    getScreenSize,
    getAllWindows,
    getWindowChildren,
    sleep,
    Virtual: Mouse(Keyboard(Workwindow(Virtual))),
    Hardware: Mouse(Keyboard(Workwindow(Hardware))),
}
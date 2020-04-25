const { _Virtual, _Hardware, getScreenSize, vkToString } = require('./build/Release/key_sender.node');
const { GlobalHotkey } = require('./src/js/hotkey');
const { Workwindow } = require('./src/js/workwindow');
const { Keyboard } = require('./src/js/keyboard');
const { Mouse } = require('./src/js/mouse');
const { sleep } = require('./src/js/sleep');
const { getAllWindows, getWindowChildren, textToImg } = require('./src/js/textToImg');

module.exports = {
    vkToString,
    GlobalHotkey,
    getScreenSize,
    getAllWindows,
    getWindowChildren,
    sleep,
    Virtual: Mouse(Keyboard(Workwindow(_Virtual))),
    Hardware: Mouse(Keyboard(Workwindow(_Hardware))),
    textToImg
}
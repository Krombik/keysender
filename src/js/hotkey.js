const { _GlobalHotkey } = require('../../build/Release/key_sender.node');
module.exports.GlobalHotkey = class extends _GlobalHotkey {
    constructor(hotkey, func, mode = "once", delay = 0) {
        let funcToSend;
        let isWorking = false;
        if (mode === "once") {
            funcToSend = func;
        } else if (mode === "toggle") {
            let state = false;
            funcToSend = () => {
                state = !state;
                if (!isWorking && state) (async () => {
                    isWorking = true;
                    while (isWorking && state) {
                        isWorking = await func();
                        await new Promise(_ => setTimeout(_, delay));
                    }
                    state = isWorking = false;
                })();
            }
        } else if (mode === "hold") {
            funcToSend = () => {
                if (!isWorking) (async () => {
                    isWorking = true;
                    while (isWorking && (isWorking = this._isButtonPressed())) {
                        isWorking = await func();
                        await new Promise(_ => setTimeout(_, delay));
                    }
                })();
            }
        }
        super(hotkey, funcToSend);
    }
}
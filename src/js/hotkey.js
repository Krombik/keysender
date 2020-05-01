const { _GlobalHotkey } = require('../../build/Release/key_sender.node');
const isEqual = require('lodash.isequal');
module.exports.GlobalHotkey = class extends _GlobalHotkey {
    constructor(options) {
        const { key, isEnabled, actionArgs, action, mode = "once", delay = 0, finalizerCallback } = options;
        let funcToSend = () => { };
        const state = [];
        const args = actionArgs ? actionArgs.map((item, index) => item.argSetter(state[index] = item.stateGetter())) : [];
        const stateChecker = () => {
            actionArgs.forEach((item, index) => {
                const currValue = item.stateGetter();
                if (!isEqual(currValue, state[index])) {
                    state[index] = currValue;
                    args[index] = item.argSetter(currValue);
                }
            });
        }
        let isWorking = false;
        if (mode === "once") {
            funcToSend = async () => {
                if (isWorking || (isEnabled && !(await isEnabled.apply(this)))) return;
                if (actionArgs) stateChecker();
                isWorking = true;
                await action.apply(this, args);
                isWorking = false;
            }
        } else if (mode === "toggle") {
            funcToSend = async () => {
                if (this.hotkeyState = !this.hotkeyState) {
                    if (isWorking || (isEnabled && !(await isEnabled.apply(this)))) {
                        this.hotkeyState = false;
                        return;
                    }
                    if (actionArgs) stateChecker();
                    isWorking = true;
                    while (this.hotkeyState && await action.apply(this, args))
                        await new Promise(_ => setTimeout(_, delay));
                    if (finalizerCallback) await finalizerCallback.apply(this, args);
                    this.hotkeyState = false;
                    isWorking = false;
                }
            }
        } else if (mode === "hold") {
            funcToSend = async () => {
                if (isWorking || (isEnabled && !(await isEnabled.apply(this)))) return;
                if (actionArgs) stateChecker();
                isWorking = true;
                while (this.hotkeyState && await action.apply(this, args))
                    await new Promise(_ => setTimeout(_, delay));
                if (finalizerCallback) await finalizerCallback.apply(this, args);
                isWorking = false;
            }
        }
        super(key, mode, funcToSend);
    }
}
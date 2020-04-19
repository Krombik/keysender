const { _GlobalHotkey } = require('../../build/Release/key_sender.node');
const isEqual = require('lodash.isequal');
module.exports.GlobalHotkey = class extends _GlobalHotkey {
    constructor(options) {
        const { key, isEnabled, actionArgs, action, mode = "once", delay = 0, finalizerCallback } = options;
        let funcToSend;
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
        if (mode === "once") {
            funcToSend = async () => {
                if (isEnabled && !(await isEnabled())) return;
                if (actionArgs) stateChecker();
                await action(...args);
            }
        } else if (mode === "toggle") {
            let togglerState = false;
            funcToSend = async () => {
                if (togglerState = !togglerState) {
                    if (isEnabled && !(await isEnabled())) {
                        togglerState = false;
                        return;
                    }
                    if (actionArgs) stateChecker();
                    while (togglerState && await action(...args))
                        await new Promise(_ => setTimeout(_, delay));
                    togglerState = false;
                    if (finalizerCallback) await finalizerCallback(...args);
                }
            }
        } else if (mode === "hold") {
            funcToSend = async () => {
                if (isEnabled && !(await isEnabled())) return;
                if (actionArgs) stateChecker();
                while (this._isButtonPressed() && await action(...args))
                    await new Promise(_ => setTimeout(_, delay));
                if (finalizerCallback) await finalizerCallback(...args);
            }
        }
        super(key, funcToSend);
    }
}
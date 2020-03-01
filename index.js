const nodeAddon = require('./build/Release/key_sender.node');

const Keyboard = ClassName => class extends ClassName {
    sendKey(key, delay) {
        this.toogleKey(key, true, delay);
        this.toogleKey(key, false, 0);
    }
    sendKeys(keys, keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
        keys.forEach((key, index) => {
            this.toogleKey(key, true, keyTooglerDelay);
            this.toogleKey(key, false, index !== keys.length - 1 ? keySenderDelay : 0);
        });
    }
    async sendKeyAsync(key, delay = this.keyTooglerDelay) {
        this.toogleKey(key, true, 0);
        await new Promise(_ => setTimeout(_, delay));
        this.toogleKey(key, false, 0);
    }
    async sendKeysAsync(keys, keyTooglerDelay = this.keyTooglerDelay, keySenderDelay = keyTooglerDelay === undefined ? this.keySenderDelay : keyTooglerDelay) {
        for (let i = 0; i < keys.length; i++) {
            this.toogleKey(keys[i], true, 0);
            await new Promise(_ => setTimeout(_, keyTooglerDelay));
            this.toogleKey(keys[i], false, 0);
            if (i !== keys.length - 1) await new Promise(_ => setTimeout(_, keySenderDelay));
        }
    }
}

// const KeyboardSync = ClassName => class extends ClassName {
//         sendKey(key) {
//             const down = [key, true];
//             const up = [key, false, this.keySenderDelay];
//             if (arguments.length > 1) {
//                 down[2] = arguments[1];
//                 up[2] = arguments[arguments.length - 1];
//             }
//             sync(() => this.kek(...down),
//                 () => this.kek(...up));

//         }
//         sendKeys(keys) {
//             const delays = [...arguments].slice(1);
//             keys.forEach(key => {
//                 this.sendKey(key, ...delays)
//             });
//         }
// }
class Hardware extends Keyboard(nodeAddon.Hardware) {


    // sendKey(key, delay) {
    //     this.toogleKey(key, true, delay);
    //     this.toogleKey(key, false, delay);
    // }
}
// class Virtual extends hardware.Virtual {

//     sendKey(key, delay) {
//         this.toogleKey(key, true, delay);
//         this.toogleKey(key, false, delay);
//     }
// }

module.exports = { Hardware };

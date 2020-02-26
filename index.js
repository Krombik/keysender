const hardware = require('./build/Release/key_sender.node');

class Hardware extends hardware.Hardware {


    sendKey(key, delay) {
        this.toogleKey(key, true, delay);
        this.toogleKey(key, false, delay);
    }
}
// class Virtual extends hardware.Virtual {

//     sendKey(key, delay) {
//         this.toogleKey(key, true, delay);
//         this.toogleKey(key, false, delay);
//     }
// }

module.exports = { Hardware };

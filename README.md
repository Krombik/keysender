# keysender
> Node.js Desktop Automation for Windows. Emulate the mouse and keyboard physical or hardware inputs, capture workwindow, register global hotkeys.

# Installation
Install Windows Build Tools:
```
npm install --global windows-build-tools
``` 
Install node-gyp:
```
npm install -g node-gyp
```
Install keysender using npm:
```
npm install keysender
```
or yarn:
```
yarn add keysender
```

# Example
```js
const { Hardware, getWindow, GlobalHotkey } = require("keysender");
const obj = new Hardware(getWindow(null, "Notepad")); // find Notepad handle by className and set it as workwindow
GlobalHotkey.register("num+", "sync", () => { // register hotkey
    obj.workwindow.setInfo({ x: 0, y: 0, width: 500 }) // move workwindow to top left corner of the screen and change width to 500px
    obj.keyboard.printText("hello"); // instantly types "hello"
    obj.keyboard.sendKey("space", 50); // press key "space", sleep for 50 milliseconds, release key "space"
    obj.keyboard.sendKeys("world".split(''),[25, 50], 50); // press key "w", sleep for random from range [25, 50] milliseconds, release key "w", sleep for 50 milliseconds, press key "o", sleep for random from range [25, 50] milliseconds, release key "o", sleep for 50 milliseconds, ..., release key "d"
    obj.keyboard.sendKey(["ctrl", "s"], 50); // press key combination "ctrl+s", sleep for 50 milliseconds, release key combination
    obj.mouse.moveCurveTo(480, 10); // makes human similar mouse movement from current cursor position to [480, 10]
    obj.mouse.click("left", 25); // press left mouse button, sleep for 25 milliseconds, release left mouse button
});
// or
GlobalHotkey.register("num-", "async", async () => { // register hotkey
    obj.workwindow.setInfo({ x: 0, y: 0, width: 500 }) // move workwindow to top left corner of the screen and change width to 500px
    obj.keyboard.printTextAsync("hello"); // instantly types "hello"
    await obj.keyboard.sendKeyAsync("space", 50); // press key "space", await for 50 milliseconds, release key "space"
    await obj.keyboard.sendKeysAsync("world".split(''),[25, 50], 50); // press key "w", await for random from range [25, 50] milliseconds, release key "w", await for 50 milliseconds, press key "o", await for random from range [25, 50] milliseconds, release key "o", await for 50 milliseconds, ..., release key "d"
    await obj.keyboard.sendKeyAsync(["ctrl", "s"], 50); // press key combination "ctrl+s", await for 50 milliseconds, release key combination
    await obj.mouse.moveCurveToAsync(480, 10); // makes human similar mouse movement from current cursor position to [480, 10]
    await obj.mouse.clickAsync("left", 25); // press left mouse button, await for 25 milliseconds, release left mouse button
});
```

# Syntax

## Hardware
Provides methods implementations on hardware level.
```js
const { Hardware } = require("keysender");
const obj = new Hardware(handle); // Create new instance of Hardware class with {handle} of initial working window.
                                  // {handle} could be found with getWindow or getWindowChild methods
                                  // pass 0 if initial working window is not required
```

## Virtual
Provides methods implementations on virtual level.
```js
const { Virtual } = require("keysender");
const obj = new Virtual(handle); // Create new instance of Virtual class with {handle} of initial working window.
                                 // {handle} could be found with getWindow or getWindowChild methods
```

## getWindow
```ts
getWindow(): windowData[];
getWindow(title: string | null, className?: string | null): number;
```
Returns window {handle} by {title} and(or) {className} or array with objects {handle, title, className} of all open windows.
```js
const { getWindow } = require("keysender");
console.log(getWindow()) // array with objects {handle, title, className} of all open windows
console.log(getWindow("someTitle")) // {handle} of first find window with "someTitle" title
console.log(getWindow(null, "someClass")) // {handle} of first find window with "someClass" class
console.log(getWindow("someTitle", "someClass")) // {handle} of first find window with "someTitle" title and "someClass" class
```

## getWindowChild
```ts
getWindowChild(parentHandle: number): windowData[];
getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;
```
Returns window child {handle} by {title} and(or) {className} or array with objects {handle, title, className} of all existing window children.
```js
const { getWindowChild } = require("keysender");
console.log(getWindowChild(parentHandle)) // array with objects {handle, title, className} of all {parentHandle} children
console.log(getWindowChild(parentHandle, "someClass")) // {handle} of first find {parentHandle} child with "someClass" class
console.log(getWindowChild(parentHandle, null, "someTitle")) // {handle} of first find {parentHandle} child with "someTitle" title 
console.log(getWindowChild(parentHandle, "someClass", "someTitle")) // {handle} of first find {parentHandle} child with "someTitle" title and "someClass" class
```

## EventEmitter
EventEmitter available for every sendInput method from [keyboard](#keyboard) and [mouse](#mouse) modules and capture method from [workwindow](#workwindow) module.

Example:
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.on("beforeSendKey", (key, delay) => {
    console.log(`get ready, now I press ${key}, wait for ${delay} ms and release it`); // logs before each sendKey or sendKeyAsync method
});
obj.keyboard.on("afterSendKey", () => {
    console.log("I done"); // logs after each sendKey or sendKeyAsync method
});
obj.keyboard.sendKey("a");
obj.keyboard.sendKeyAsync("b");
```
>For more details see [EventEmitter documentation](https://nodejs.org/api/events.html#events_class_eventemitter).

## keyboard
Provides methods to synthesize keystrokes.

### keyTogglerDelay
```ts
keyTogglerDelay: number | randomFromRange = 35;
```
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.keyTogglerDelay = 25;
obj.keyboard.keyTogglerDelay = [25, 50];
```

### keySenderDelay
```ts
keySenderDelay: number | randomFromRange = 35;
```
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.keySenderDelay=25;
obj.keyboard.keySenderDelay=[25, 50];
```

### toggleKey
```ts
toggleKey(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): void;
toggleKeyAsync(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): Promise<void>;
```
Toggles key or combination of keys to provided state.
| Argument | Description | Default Value |
| --- | --- | --- |
| key | key or array with keys |  |
| state | key state selection: **true** for press, **false** for release | true |
| delay | milliseconds to sleep/await after key toggled | [keyTogglerDelay](#keytogglerdelay) |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.toggleKey("a", true); // press key "a" and sleep for {keyTogglerDelay} milliseconds
obj.keyboard.toggleKey("a", false, 50); // release key "a" and sleep for 50 milliseconds
obj.keyboard.toggleKey(["ctrl", "shift", "a"], true, [25, 50]); // press key combination "ctrl+shift+a" and sleep for random from range [25, 50] milliseconds
console.log("You will see this message after all previous actions ends");
obj.keyboard.toggleKeyAsync("b", true) // press key "b" and await for {keyTogglerDelay} milliseconds
    .then(() => obj.keyboard.toggleKeyAsync("b", false, 50)) // release key "b" and await for 50 milliseconds
    .then(() => {
        // do something
        return obj.keyboard.toggleKeyAsync("d", false)
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### sendKey
```ts
sendKey(key: keyboardButton | keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
sendKeyAsync(key: keyboardButton | keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
```
Press and release key or combination of keys.
| Argument | Description | Default Value |
| --- | --- | --- |
| key | key or array with keys |  |
| afterPressDelay | milliseconds to sleep/await after key pressed | [keyTogglerDelay](#keytogglerdelay) |
| afterReleaseDelay | milliseconds to sleep/await after key released | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.sendKey("a"); // press key "a", sleep for {keyTogglerDelay} milliseconds, release key "a"
obj.keyboard.sendKey("a", 50); // press key "a", sleep for 50 milliseconds, release key "a"
obj.keyboard.sendKey("a", 50, 90); // press key "a", sleep for 50 milliseconds, release key "a", sleep for 90 milliseconds
obj.keyboard.sendKey(["ctrl", "shift", "a"], [25, 50]); // press key combination "ctrl+shift+a", sleep for random from range [25, 50] milliseconds, release key combination "ctrl+shift+a"
console.log("You will see this message after all previous actions ends");
obj.keyboard.sendKeyAsync("b") // press key "b", await for {keyTogglerDelay} milliseconds, release key "b"
    .then(() => obj.keyboard.sendKeyAsync("a", 50, 50)) // press key "b", await for 50 milliseconds, release key "b", await for 50 milliseconds
    .then(() => {
        // do something
        return obj.keyboard.sendKeyAsync("d")
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### sendKeys
```ts
sendKeys(keys: keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
sendKeysAsync(keys: keyboardButton[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
```
Press and release array of keys.
| Argument | Description | Default Value |
| --- | --- | --- |
| keys | array with keys |  |
| afterPressDelay | milliseconds to sleep/await after key pressed | [keyTogglerDelay](#keytogglerdelay) |
| afterReleaseDelay | milliseconds to sleep/await after key released excluding last | {afterPressDelay}, or [keySenderDelay](#keysenderdelay) if {afterPressDelay} not provided |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.sendKeys(["a", "b"]); // press key "a", sleep for {keyTogglerDelay} milliseconds, release key "a", sleep for {keySenderDelay} milliseconds, press key "b", sleep for {keyTogglerDelay} milliseconds, release key "b"
obj.keyboard.sendKeys(["a", "b"], 50); // press key "a", sleep for 50 milliseconds, release key "a", sleep for 50 milliseconds, press key "b", sleep for 50 milliseconds, release key "b"
obj.keyboard.sendKeys(["a", "b"], 50, 90); // press key "a", sleep for 50 milliseconds, release key "a", sleep for 90 milliseconds, press key "b", sleep for 50 milliseconds, release key "b"
obj.keyboard.sendKeys(["a", "b"], [25, 50]); // press key "a", sleep for random from range [25, 50] milliseconds, release key "a", sleep for random from range [25, 50] milliseconds, press key "b", sleep for random from range [25, 50] milliseconds, release key "b"
console.log("You will see this message after all previous actions ends");
obj.keyboard.sendKeysAsync(["a", "b"]) // press key "a", await for {keyTogglerDelay} milliseconds, release key "a", await for {keySenderDelay} milliseconds, press key "b", await for {keyTogglerDelay} milliseconds, release key "b"
    .then(() => obj.keyboard.sendKeysAsync("a", 50, [25, 50])) // press key "a", await for 50 milliseconds, release key "a", await for random from range [25, 50] milliseconds, press key "b", await for 50 milliseconds, release key "b"
    .then(() => {
        // do something
        return obj.keyboard.sendKeyAsync(["h", "e"])
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### printText
```ts
printText(text: string, afterTypeDelay?: number | randomFromRange): void;
printTextAsync(text: string, afterTypeDelay?: number | randomFromRange): Promise<void>;
```
Prints text.
| Argument | Description | Default Value |
| --- | --- | --- |
| text | string to print |  |
| afterTypeDelay | milliseconds to sleep/await after each char typed excluding last | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.printText("hello world"); // instantly types "hello world" 
obj.keyboard.printText("hello world", 50); // types "h", sleep for 50 milliseconds, types "e", sleep for 50 milliseconds, ..., types "d";
obj.keyboard.printText("hello world", [25, 50]); // types "h", sleep for random from range [25, 50] milliseconds, types "e", sleep for random from range [25, 50] milliseconds, ..., types "d";
console.log("You will see this message after all previous actions ends");
obj.keyboard.printText("γ Ğ ф f Ș ě š") // instantly types "γ Ğ ф f Ș ě š"
    .then(() => obj.keyboard.printText("qwerty", 50)) // types "q", sleep for 50 milliseconds, types "w", sleep for 50 milliseconds, ..., types "y"
    .then(() => {
        // do something
        return obj.keyboard.sendKeyAsync("d")
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

## mouse
Provides methods to synthesize mouse motions, and button clicks.

### buttonTogglerDelay
```ts
buttonTogglerDelay: number | randomFromRange = 35;
```
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.buttonTogglerDelay = 25;
obj.mouse.buttonTogglerDelay = [25, 50];
```

### saveMod
```ts
enableSaveMod(bool: boolean): void;
```
If saveMod is enable every mouse move method first back to last known coordinates ([0, 0] on first move), by default - disable
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.enableSaveMod(true);
```

### toggle
```ts
toggle(state: boolean, button?: mouseButton, delay?: number | randomFromRange): void;
toggleAsync(state: boolean, button?: mouseButton, delay?: number | randomFromRange): Promise<void>;
```
Switch mouse button state.
| Argument | Description | Default Value |
| --- | --- | --- |
| state | key state selection: **true** for press, **false** for release | true |
| button | name of mouse button | "left" |
| delay | milliseconds to sleep/await after switching mouse button state | [buttonTogglerDelay](#buttontogglerdelay) |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.toggle(); // press left mouse button and sleep for {buttonTogglerDelay} milliseconds
obj.mouse.toggle(false); // release left mouse button and sleep for {buttonTogglerDelay} milliseconds
obj.mouse.toggle(true, "right", 25); // press right mouse button and sleep for 25 milliseconds
obj.mouse.toggle(false, "right", [25, 50]); // release right mouse button and sleep for random from range [25, 50] milliseconds
console.log("You will see this message after all previous actions ends");
obj.mouse.toggleAsync(true, "middle") // press middle mouse button (wheel) and sleep for {buttonTogglerDelay} milliseconds
    .then(() => {
        // do something
        return obj.mouse.toggleAsync(false, "middle", 0)
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### click
```ts
click(button?: mouseButton, afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
clickAsync(button?: mouseButton, afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
```
Click mouse button.
| Argument | Description | Default Value |
| --- | --- | --- |
| button | name of mouse button | "left" |
| afterPressDelay | milliseconds to sleep/await after mouse button pressed | [buttonTogglerDelay](#buttontogglerdelay) |
| afterReleaseDelay | milliseconds to sleep/await after mouse button released | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.click(); // press left mouse button, sleep for {buttonTogglerDelay} milliseconds, release left mouse button
obj.mouse.click("right"); // press right mouse button, sleep for {buttonTogglerDelay} milliseconds, release right mouse button
console.log("You will see this message after all previous actions ends");
obj.mouse.clickAsync("middle", [25, 50]) // press middle mouse button, await for random from range [25, 50] milliseconds, release middle mouse button
    .then(() => {
        // do something
        return obj.mouse.clickAsync("left", 25, 25) // press left mouse button, await for 25 milliseconds, release left mouse button, await for 25 milliseconds
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### moveTo
```ts
moveTo(x: number, y: number, delay?: number | randomFromRange): void;
moveToAsync(x: number, y: number, delay?: number | randomFromRange): Promise<void>;
```
Move mouse to [x, y].
| Argument | Description | Default Value |
| --- | --- | --- |
| delay | milliseconds to sleep/await after mouse movement | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveTo(25, 25); // move mouse cursor to [25, 25]
obj.mouse.moveTo(50, 50, 50); // move mouse cursor to [50, 50] and sleep for 50 milliseconds
console.log("You will see this message after all previous actions ends");
obj.mouse.moveToAsync(25, 25) // move mouse cursor to [25, 25]
    .then(() => {
        // do something
        return obj.mouse.moveToAsync(50, 50, 50) // move mouse cursor to [50, 50] and await for 50 milliseconds
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### move
```ts
move(x: number, y: number, delay?: number | randomFromRange): void;
moveAsync(x: number, y: number, delay?: number | randomFromRange): Promise<void>;
```
Move mouse from current position by [x, y] relatively.
| Argument | Description | Default Value |
| --- | --- | --- |
| delay | milliseconds to sleep/await after mouse movement | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.move(25, 25); // move mouse cursor from current position by [25, 25]
obj.mouse.move(-50, 50, 50); // move mouse cursor from current position by [-50, 50] and sleep for 50 milliseconds
console.log("You will see this message after all previous actions ends");
obj.mouse.moveAsync(25, -25) // move mouse cursor from current position by [25, -25]
    .then(() => {
        // do something
        return obj.mouse.moveAsync(50, -50, 50) // move mouse cursor from current position by [50, -50] and await for 50 milliseconds
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### moveCurveTo
```ts
moveCurveTo(x: number, y: number, speed?: number | "max", deviation?: number): void;
moveCurveToAsync(x: number, y: number, speed?: number | "max", deviation?: number): Promise<void>;
```
Simulate human similar mouse movement to [x, y].
| Argument | Description | Default Value |
| --- | --- | --- |
| speed | move speed, if speed equals to "max" - immediate movement | 5 |
| deviation | movement curvature | 30 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveCurveTo(25, 25); // makes human similar mouse movement from current cursor position to [25, 25]
console.log("You will see this message after all previous actions ends");
obj.mouse.moveCurveToAsync(50, 50, "max") // makes instant human similar mouse movement from [25, 25] to [50, 50]
    .then(() => {
        // do something
        return obj.mouse.moveCurveToAsync(125, 45, 0.1, 10) // makes slow human similar mouse movement from [50, 50] to [125, 45]
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### scrollWheel
```ts
scrollWheel(amount: number, wheelTogglerDelay?: number | randomFromRange): void;
scrollWheelAsync(count: number, wheelTogglerDelay?: number | randomFromRange): Promise<void>;
```
Scroll mouse wheel.
| Argument | Description | Default Value |
| --- | --- | --- |
| amount | amount of wheel movement, positive value indicates that the wheel was rotated forward, away from the user, negative value indicates that the wheel was rotated backward, toward the user |  |
| delay | milliseconds to sleep/await after wheel scroll | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.scrollWheel(-1);
console.log("You will see this message after all previous actions ends");
obj.mouse.scrollWheelAsync(25, 25)
    .then(() => {
        // do something
        return obj.mouse.scrollWheelAsync(15)
    })
    .then(() => { console.log("I done") });
console.log("You will see this message without waiting for all previous actions");
```

### getPos
```ts
getPos(): pos;
```
Returns current cursor position at screen for Hardware class or position at current workwindow for Virtual class.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveTo(25, 50);
console.log(obj.mouse.getPos()); // object {x: 25, y: 50}
```

## workwindow

### set
```ts
set(handle: number): void;
```
Set new current workwindow by {handle}.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.set(newHandle);
```

### get
```ts
get(): windowData;
```
Returns object with {handle}, {title} and {className} of current workwindow.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.set(newHandle)); // object {handle, title, className}
```

### setInfo
```ts
setInfo(info: Partial<posAndSize>): void;
```
Set workwindow position and(or) size.
| Object field | Description |
| --- | --- |
| x | window x position |
| y | window y position |
| width | window width |
| height | window height |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.setInfo({x: 25}); // sets x position of workwindow to 25
obj.workwindow.setInfo({y: 25, width: 1200}); // sets y position of workwindow to 25, sets workwindow width to 1200px
obj.workwindow.setInfo({x: 50, y: 25, width: 1200, height: 800});
```

### getInfo
```ts
getInfo(): posAndSize;
```
Returns object with workwindow position and size.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.getInfo()); // object {x, y, width, height}
```

### setForeground
```ts
setForeground(): void;
```
Makes the current workwindow a foreground window.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.setForeground();
```

### isForeground
```ts
isForeground(): boolean;
```
Checks if the current workwindow is a foreground window.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.isForeground()); // true if current workwindow is a foreground window, false if not
```

### isOpen
```ts
isOpen(): boolean;
```
Checks if the current workwindow exist.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.isOpen()); // true if current workwindow exist, false if not
```

### kill
```ts
kill(): void;
```
Terminate current workwindow by killing it's thread.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.kill();
```

### close
```ts
close(): void;
```
Close current workwindow by sending close message.
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.close();
```

### capture
```ts
capture(part: posAndSize, format?: "rgba" | "bgra" | "grey"): img;
capture(part: posAndSize, format: "monochrome", threshold?: uint8): img;
capture(format?: "rgba" | "bgra" | "grey"): img;
capture(format: "monochrome", threshold?: uint8): img;
```
Capture screenshot of current workwindow or desktop. 
| Argument | Description | Default Value |
| --- | --- | --- |
| part | object {x, y, height, width} with position and size to be captured |  |
| format | color format of returned image, could be "rgba", "bgra", "grey" or "monochrome" | "rgba" |
| threshold | color limit for "monochrome" format, if the pixel value is smaller than the threshold, it is set to 0, otherwise it is set to 255 | 127 |
Returns object {data, width, height}.
| field | Description |
| --- | --- |
| data | Buffer with pixels |
| width | width of captured img |
| height | height of captured img |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
const desktop = new Hardware(0);
obj.workwindow.capture(); // returns {data: Buffer with captured image data in rgba color format, width: width of current workwindow, height: height of current workwindow}
desktop.workwindow.capture(); // returns {data: Buffer with captured image data in rgba color format, width: width of screen, height: height of screen}
obj.workwindow.capture({x: 25, y: 25, width: 500, height: 500}); // returns {data: Buffer with captured image data in rgba color format, width: 500, height: 500}
desktop.workwindow.capture({x: 25, y: 25, width: 500, height: 500}); // returns {data: Buffer with captured image data in rgba color format, width: 500, height: 500}
obj.workwindow.capture("grey"); // returns {data: Buffer with captured image data in grayscale color format, width: width of current workwindow, height: height of current workwindow}
obj.workwindow.capture({x: 25, y: 25, width: 500, height: 500}, "monochrome", 200); // returns {data: Buffer with captured image data in monochrome color format, width: 500, height: 500}
```

### colorAt
```ts
colorAt(x: number, y: number, returnType?: "string"): hexString;
colorAt(x: number, y: number, returnType: "array"): [red, green, blue];
colorAt(x: number, y: number, returnType: "number"): number;
```
Returns pixel color in [x, y] from current workwindow (or screen if {handle} is 0).
```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
const desktop = new Hardware(0);
obj.workwindow.colorAt(25, 25); // returns workwindow color in [25, 25] in "rrggbb" format
obj.workwindow.colorAt(25, 25, "array"); // returns workwindow color in [25, 25] in [r,g,b] format
obj.workwindow.colorAt(25, 25, "number"); // returns workwindow color in [25, 25] in decimal format
desktop.workwindow.colorAt(25, 25); // returns screen color in [25, 25] in "rrggbb" format
```

## GlobalHotkey
Register or unregister global hotkeys

### register
```ts
register(hotkey: keyboardRegularButton, hotkeyName: string, func: () => boolean | Promise<boolean>, mode: "hold" | "toggle", delay?: number): void;
register(hotkey: keyboardRegularButton, hotkeyName: string, func: () => void | Promise<void>, mode?: "once"): void;
```
Register hotkey.
| Argument | Description | Default Value |
| --- | --- | --- |
| func | function to be calling in new thread after hotkey was pressed |  |
| mode | if "once" - {func} will repeat one time for each {hotkey} press, if "hold" - {func} will repeat while {hotkey} is pressed, if "toggle" - {func} starts repeat after {hotkey} first time pressed and end repeat after {hotkey} second time pressed | "once" |
| delay | if {mode} is "hold" or "toggle" - sets delay between {func} calls | 0 |

```js
const { GlobalHotkey } = require("keysender");
GlobalHotkey.register("num+", "first", () => { // logs "hi" every time "ctrl+num+" is pressed
    console.log("hi");
});
GlobalHotkey.register("num*", "second", () => { // logs "hi" every 50 milliseconds while "num*" is pressed
    console.log("hi");
    return true;
}, "hold", 50);
let i = 0;
GlobalHotkey.register("num/", "second", () => { // logs "hi" every 50 milliseconds after "num/" is pressed until "num/" be pressed again or i become > 50
    i++;
    if (i>50) return false;
    console.log("hi")
    return true
}, "toggle", 50); 
```

### unregister
```ts
unregister(hotkeyName: string): void;
```
Unregister hotkeys by name.
```js
const { GlobalHotkey } = require("keysender");
GlobalHotkey.register("num+", "first", () => {
    console.log("hi")
});
GlobalHotkey.unregister("first");
```

### unregisterAll
```ts
unregisterAll(): void;
```
Unregister all hotkeys.
```js
const { GlobalHotkey } = require("keysender");
GlobalHotkey.register("num+", "first", () => {
    console.log("hi")
});
GlobalHotkey.register("num-", "second", () => {
    console.log("hi")
});
GlobalHotkey.unregisterAll();
```

### findHotkeyName
```ts
findHotkeyName(hotkey: keyboardRegularButton): string | undefined;
```
Returns name of {hotkey} or null if {hotkey} is not registered.
```js
const { GlobalHotkey } = require("keysender");
GlobalHotkey.register("num-", "second", () => {
    console.log("hi")
});
console.log(GlobalHotkey.findHotkeyName("num-")); // "second"
console.log(GlobalHotkey.findHotkeyName("a")); // undefined
```

## getScreenSize
```ts
getScreenSize(): size;
```
Returns object with screen size
```js
const { getScreenSize } = require("keysender");
console.log(getScreenSize()); // object {width, height}
```

## sleep
```ts
sleep(ms: number | randomFromRange): void;
```
Pause current thread for {ms} milliseconds.
```js
const { sleep } = require("keysender");
sleep(25); // pause current thread for 25 milliseconds.
sleep([25, 50]) // pause current thread for random from range [25, 50] milliseconds.
```

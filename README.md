# keysender

> Node.js Desktop Automation for Windows. Emulate the mouse and keyboard physical or virtual inputs, capture workwindow, register global hotkeys.

## Contents

- [Installation](#installation)
- [Example](#example)
- [Syntax](#syntax)
  - [Available keyboard buttons](#keyboardbutton)
  - [Hardware and Virtual](#hardware-and-virtual)
    - [.keyboard](#keyboard)
      - [.keyTogglerDelay](#keytogglerdelay)
      - [.keySenderDelay](#keysenderdelay)
      - [.toggleKey](#togglekey)
      - [.sendKey](#sendkey)
      - [.sendKeys](#sendkeys)
      - [.printText](#printtext)
    - [.mouse](#mouse)
      - [.buttonTogglerDelay](#buttontogglerdelay)
      - [.enableSaveMode](#enablesavemode)
      - [.toggle](#toggle)
      - [.click](#click)
      - [.moveTo](#moveto)
      - [.move](#move)
      - [.moveCurveTo](#movecurveto)
      - [.scrollWheel](#scrollwheel)
      - [.getPos](#getpos)
    - [.workwindow](#workwindow)
      - [.set](#set)
      - [.get](#get)
      - [.refresh](#refresh)
      - [.setView](#setview)
      - [.getView](#getview)
      - [.setForeground](#setforeground)
      - [.isForeground](#isforeground)
      - [.isOpen](#isopen)
      - [.kill](#kill)
      - [.close](#close)
      - [.capture](#capture)
      - [.colorAt](#colorat)
    - [EventEmitter](#eventemitter)
  - [GlobalHotkey](#globalhotkey)
    - [.hotkeyState](#hotkeystate)
    - [.reassignment](#reassignment)
    - [.unregister](#unregister)
    - [.delete](#delete)
    - [unregisterAll](#unregisterall)
    - [deleteAll](#deleteall)
  - [textToImg](#texttoimg)
  - [getAllWindows](#getallwindows)
  - [getWindowChildren](#getwindowchildren)
  - [getScreenSize](#getscreensize)
  - [vkToString](#vktostring)
  - [sleep](#sleep)

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
const { Hardware, GlobalHotkey } = require("keysender");
const obj = new Hardware(null, "Notepad"); // find Notepad handle by className and set it as workwindow
new GlobalHotkey({
  // register hotkey
  key: "num+",
  isEnabled() {
    return (
      (obj.workwindow.isOpen() || obj.workwindow.refresh()) &&
      obj.workwindow.isForeground()
    ); // if "Notepad" is open and foreground - do {action}
  },
  actionArgs: [
    // something like watcher for {size}
    {
      stateGetter() {
        const { height, width } = obj.workwindow.getView();
        return { height, width }; // returns current {size}
      },
      argSetter: (size) => [size.width / 2, size.height / 2], // change {middleCoords} if current {size} not equal to previous size
    },
  ],
  action(middleCoords) {
    obj.workwindow.setView({ x: 0, y: 0 }); // move workwindow to top left corner of the screen
    obj.mouse.moveCurveTo(...middleCoords); // makes human similar mouse movement from current cursor position to middle of "Notepad" window
    obj.keyboard.printText("hello"); // instantly types "hello"
    obj.keyboard.sendKey("space", 50); // press key "space", sleep for 50 milliseconds, release key "space"
    obj.keyboard.sendKeys("world".split(""), [25, 50], 50); // press key "w", sleep for random from range [25, 50] milliseconds, release key "w", sleep for 50 milliseconds, press key "o", sleep for random from range [25, 50] milliseconds, release key "o", sleep for 50 milliseconds, ..., release key "d"
    obj.keyboard.sendKey(["ctrl", "s"], 50); // press key combination "ctrl+s", sleep for 50 milliseconds, release key combination
    obj.workwindow.close(); // close "Notepad" window
  },
});
// or
new GlobalHotkey({
  // register hotkey
  key: "num-",
  isEnabled() {
    return (
      (obj.workwindow.isOpen() || obj.workwindow.refresh()) &&
      obj.workwindow.isForeground()
    ); // if "Notepad" is open and foreground - do {action}
  },
  actionArgs: [
    // something like watcher for {size}
    {
      stateGetter() {
        const { height, width } = obj.workwindow.getView();
        return { height, width }; // returns current {size}
      },
      argSetter: (size) => [size.width / 2, size.height / 2], // change {middleCoords} if current {size} not equal to previous size
    },
  ],
  async action(middleCoords) {
    obj.workwindow.setView({ x: 0, y: 0 }); // move workwindow to top left corner of the screen
    await obj.mouse.moveCurveToAsync(...middleCoords); // makes human similar mouse movement from current cursor position to middle of "Notepad" window
    await obj.keyboard.printTextAsync("hello"); // instantly types "hello"
    await obj.keyboard.sendKeyAsync("space", 50); // press key "space", await for 50 milliseconds, release key "space"
    await obj.keyboard.sendKeysAsync("world".split(""), [25, 50], 50); // press key "w", await for random from range [25, 50] milliseconds, release key "w", await for 50 milliseconds, press key "o", await for random from range [25, 50] milliseconds, release key "o", await for 50 milliseconds, ..., release key "d"
    await obj.keyboard.sendKeyAsync(["ctrl", "s"], 50); // press key combination "ctrl+s", await for 50 milliseconds, release key combination
    obj.workwindow.close(); // close "Notepad" window
  },
});
```

# Syntax

#### keyboardButton

[toggleKey](#togglekey), [sendKey](#sendkey), [sendKeys](#sendkeys), [GlobalHotkey](#globalhotkey) supports for following keys or numbers([virtual key codes](https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes))

```ts
type keyboardRegularButton =
  | "backspace"
  | "tab"
  | "enter"
  | "pause"
  | "capslock"
  | "escape"
  | "space"
  | "pageup"
  | "pagedown"
  | "end"
  | "home"
  | "left"
  | "up"
  | "right"
  | "down"
  | "prntscrn"
  | "insert"
  | "delete"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | "num0"
  | "num0"
  | "num1"
  | "num2"
  | "num3"
  | "num4"
  | "num5"
  | "num6"
  | "num7"
  | "num8"
  | "num9"
  | "num*"
  | "num+"
  | "num,"
  | "num-"
  | "num."
  | "num/"
  | "f1"
  | "f2"
  | "f3"
  | "f4"
  | "f5"
  | "f6"
  | "f7"
  | "f8"
  | "f9"
  | "f10"
  | "f11"
  | "f12"
  | "f13"
  | "f14"
  | "f15"
  | "f16"
  | "f17"
  | "f18"
  | "f19"
  | "f20"
  | "f21"
  | "f22"
  | "f23"
  | "f24"
  | "numlock"
  | "scrolllock"
  | ";"
  | "+"
  | ","
  | "-"
  | "."
  | "/"
  | "~"
  | "["
  | "|"
  | "]"
  | "'";
type keyboardSpecButton =
  | "alt"
  | "ctrl"
  | "shift"
  | "lshift"
  | "rshift"
  | "lctrl"
  | "rctrl"
  | "lalt"
  | "ralt"
  | "lwin"
  | "rwin";
type keyboardButton = keyboardRegularButton | keyboardSpecButton;
```

## Hardware and Virtual

```ts
/** Sets current workwindow by {handle}. */
constructor(handle?: number);
/** Finds the first window with {title} and/or {className} and sets it as current workwindow. */
constructor(title: string | null, className?: string | null);
/** Finds the first child window with {childClassName} and/or {childTitle} of window with {parentHandle} and sets it as current workwindow. */
constructor(parentHandle: number, childClassName: string | null, childTitle?: string | null);
/** Finds the first child window with {childClassName} and/or {childTitle} of the first found window with {parentTitle} and/or {parentClassName} and sets it as current workwindow. */
constructor(parentTitle: string | null, parentClassName: string | null, childClassName: string | null, childTitle?: string | null);
```

Classes Hardware and Virtual provide the same [keyboard](#keyboard), [mouse](#mouse) and [workwindow](#workwindow) methods and have the same constructors, but:

- Class Hardware provides keyboard and mouse methods implementations on hardware level by inserts the events serially into the keyboard or mouse input stream. These events are not interspersed with other keyboard or mouse input events inserted either by the user (with the keyboard or mouse).
- Class Virtual provides keyboard and mouse methods implementations on virtual level by sending messages to workwindow, so it could work with background window.
  > Note: Virtual keyboard and mouse methods do not work for all windows, for example, input line in certain window may accept message from [printText](#printext) method, but [sendKey](#sendkey) method makes no effect outside input line, or the window may accept a keystroke message from [sendKey](#sendkey) method but not accept mouse movement message from [moveTo](#moveto) method.

```js
const { Hardware, Virtual } = require("keysender");
const foo = new Hardware("Some title");
const bar = new Virtual(null, "SomeClassName");
const foobar = new Hardware(
  "Some parent title",
  "SomeParentClassName",
  "SomeChildClassName"
);
```

### keyboard

Provides methods to synthesize keystrokes.

#### keyTogglerDelay

```ts
keyTogglerDelay: number | randomFromRange = 35;
```

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.keyTogglerDelay = 25;
obj.keyboard.keyTogglerDelay = [25, 50];
```

#### keySenderDelay

```ts
keySenderDelay: number | randomFromRange = 35;
```

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.keySenderDelay = 25;
obj.keyboard.keySenderDelay = [25, 50];
```

#### toggleKey

```ts
toggleKey(key: keyboardButton | number | keyboardButton[] | number[], state?: boolean, delay?: number | randomFromRange): void;
toggleKeyAsync(key: keyboardButton | number | keyboardButton[] | number[], state?: boolean, delay?: number | randomFromRange): Promise<void>;
```

Toggles key or combination of keys to provided state.
| Argument | Description | Default Value |
| --- | --- | --- |
| key | key or array with keys | |
| state | key state selection: **true** for press, **false** for release | true |
| delay | milliseconds to sleep/await after key toggled | [keyTogglerDelay](#keytogglerdelay) |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.toggleKey("a", true); // press key "a" and sleep for {keyTogglerDelay} milliseconds
obj.keyboard.toggleKey("a", false, 50); // release key "a" and sleep for 50 milliseconds
obj.keyboard.toggleKey(["ctrl", "shift", "a"], true, [25, 50]); // press key combination "ctrl+shift+a" and sleep for random from range [25, 50] milliseconds
console.log("You will see this message after all previous actions ends");
obj.keyboard
  .toggleKeyAsync("b", true) // press key "b" and await for {keyTogglerDelay} milliseconds
  .then(() => obj.keyboard.toggleKeyAsync("b", false, 50)) // release key "b" and await for 50 milliseconds
  .then(() => {
    // do something
    return obj.keyboard.toggleKeyAsync("d", false);
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### sendKey

```ts
sendKey(key: keyboardButton | number | keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
sendKeyAsync(key: keyboardButton | number | keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
```

Press and release key or combination of keys.
| Argument | Description | Default Value |
| --- | --- | --- |
| key | key or array with keys | |
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
obj.keyboard
  .sendKeyAsync("b") // press key "b", await for {keyTogglerDelay} milliseconds, release key "b"
  .then(() => obj.keyboard.sendKeyAsync("a", 50, 50)) // press key "b", await for 50 milliseconds, release key "b", await for 50 milliseconds
  .then(() => {
    // do something
    return obj.keyboard.sendKeyAsync("d");
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### sendKeys

```ts
sendKeys(keys: keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): void;
sendKeysAsync(keys: keyboardButton[] | number[], afterPressDelay?: number | randomFromRange, afterReleaseDelay?: number | randomFromRange): Promise<void>;
```

Press and release array of keys.
| Argument | Description | Default Value |
| --- | --- | --- |
| keys | array with keys | |
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
obj.keyboard
  .sendKeysAsync(["a", "b"]) // press key "a", await for {keyTogglerDelay} milliseconds, release key "a", await for {keySenderDelay} milliseconds, press key "b", await for {keyTogglerDelay} milliseconds, release key "b"
  .then(() => obj.keyboard.sendKeysAsync("a", 50, [25, 50])) // press key "a", await for 50 milliseconds, release key "a", await for random from range [25, 50] milliseconds, press key "b", await for 50 milliseconds, release key "b"
  .then(() => {
    // do something
    return obj.keyboard.sendKeyAsync(["h", "e"]);
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### printText

```ts
printText(text: string, afterTypeDelay?: number | randomFromRange): void;
printTextAsync(text: string, afterTypeDelay?: number | randomFromRange): Promise<void>;
```

Prints text.
| Argument | Description | Default Value |
| --- | --- | --- |
| text | string to print | |
| afterTypeDelay | milliseconds to sleep/await after each char typed excluding last | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.printText("hello world"); // instantly types "hello world"
obj.keyboard.printText("hello world", 50); // types "h", sleep for 50 milliseconds, types "e", sleep for 50 milliseconds, ..., types "d";
obj.keyboard.printText("hello world", [25, 50]); // types "h", sleep for random from range [25, 50] milliseconds, types "e", sleep for random from range [25, 50] milliseconds, ..., types "d";
console.log("You will see this message after all previous actions ends");
obj.keyboard
  .printText("γ Ğ ф f Ș ě š") // instantly types "γ Ğ ф f Ș ě š"
  .then(() => obj.keyboard.printText("qwerty", 50)) // types "q", sleep for 50 milliseconds, types "w", sleep for 50 milliseconds, ..., types "y"
  .then(() => {
    // do something
    return obj.keyboard.sendKeyAsync("d");
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

### mouse

Provides methods to synthesize mouse motions, mouse button clicks and get mouse position.

#### buttonTogglerDelay

```ts
buttonTogglerDelay: number | randomFromRange = 35;
```

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.buttonTogglerDelay = 25;
obj.mouse.buttonTogglerDelay = [25, 50];
```

#### enableSaveMode

```ts
enableSaveMode(bool: boolean): void;
```

If saveMode is enable - every mouse move method first back to last known coordinates ([0, 0] on first move), by default - disable

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.enableSaveMode(true);
```

#### toggle

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
obj.mouse
  .toggleAsync(true, "middle") // press middle mouse button (wheel) and sleep for {buttonTogglerDelay} milliseconds
  .then(() => {
    // do something
    return obj.mouse.toggleAsync(false, "middle", 0);
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### click

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
obj.mouse
  .clickAsync("middle", [25, 50]) // press middle mouse button, await for random from range [25, 50] milliseconds, release middle mouse button
  .then(() => {
    // do something
    return obj.mouse.clickAsync("left", 25, 25); // press left mouse button, await for 25 milliseconds, release left mouse button, await for 25 milliseconds
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### moveTo

```ts
moveTo(x: number, y: number, delay?: number | randomFromRange): void;
moveToAsync(x: number, y: number, delay?: number | randomFromRange): Promise<void>;
```

Move mouse to [x, y] in current workwindow.
| Argument | Description | Default Value |
| --- | --- | --- |
| delay | milliseconds to sleep/await after mouse movement | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveTo(25, 25); // move mouse cursor to [25, 25]
obj.mouse.moveTo(50, 50, 50); // move mouse cursor to [50, 50] and sleep for 50 milliseconds
console.log("You will see this message after all previous actions ends");
obj.mouse
  .moveToAsync(25, 25) // move mouse cursor to [25, 25]
  .then(() => {
    // do something
    return obj.mouse.moveToAsync(50, 50, 50); // move mouse cursor to [50, 50] and await for 50 milliseconds
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### move

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
obj.mouse
  .moveAsync(25, -25) // move mouse cursor from current position by [25, -25]
  .then(() => {
    // do something
    return obj.mouse.moveAsync(50, -50, 50); // move mouse cursor from current position by [50, -50] and await for 50 milliseconds
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### moveCurveTo

```ts
moveCurveTo(x: number, y: number, speed?: number | "max", deviation?: number): void;
moveCurveToAsync(x: number, y: number, speed?: number | "max", deviation?: number): Promise<void>;
```

Simulate human similar mouse movement to [x, y] in current workwindow.
| Argument | Description | Default Value |
| --- | --- | --- |
| speed | move speed, if speed equals to "max" - immediate movement | 5 |
| deviation | movement curvature | 30 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveCurveTo(25, 25); // makes human similar mouse movement from current cursor position to [25, 25]
console.log("You will see this message after all previous actions ends");
obj.mouse
  .moveCurveToAsync(50, 50, "max") // makes instant human similar mouse movement from [25, 25] to [50, 50]
  .then(() => {
    // do something
    return obj.mouse.moveCurveToAsync(125, 45, 0.1, 10); // makes slow human similar mouse movement from [50, 50] to [125, 45]
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### scrollWheel

```ts
scrollWheel(amount: number, wheelTogglerDelay?: number | randomFromRange): void;
scrollWheelAsync(count: number, wheelTogglerDelay?: number | randomFromRange): Promise<void>;
```

Scroll mouse wheel.
| Argument | Description | Default Value |
| --- | --- | --- |
| amount | amount of wheel movement, positive value indicates that the wheel was rotated forward, away from the user, negative value indicates that the wheel was rotated backward, toward the user | |
| delay | milliseconds to sleep/await after wheel scroll | 0 |

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.scrollWheel(-1);
console.log("You will see this message after all previous actions ends");
obj.mouse
  .scrollWheelAsync(25, 25)
  .then(() => {
    // do something
    return obj.mouse.scrollWheelAsync(15);
  })
  .then(() => {
    console.log("I done");
  });
console.log(
  "You will see this message without waiting for all previous actions"
);
```

#### getPos

```ts
getPos(): pos;
```

Returns current cursor position relative to workwindow.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.mouse.moveTo(25, 50);
console.log(obj.mouse.getPos()); // object {x: 25, y: 50}
```

### workwindow

Provides methods to work with workwindow.

#### set

```ts
/** Sets current workwindow by {handle}. */
set(handle?: number): void;
/** Finds the first window with {title} and/or {className} and sets it as current workwindow. */
set(title: string | null, className?: string | null): void;
/** Finds the first child window with {childClassName} and/or {childTitle} of window with {parentHandle} and sets it as current workwindow. */
set(parentHandle: number, childClassName: string | null, childTitle?: string | null): void;
/** Finds the first child window with {childClassName} and/or {childTitle} of the first found window with {parentTitle} and/or {parentClassName} and sets it as currentworkwindow. */
set(parentTitle: string | null, parentClassName: string | null, childClassName: string | null, childTitle?: string | null): void;
```

Same as [constructor](#hardware-and-virtual).

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware("Some title"); // or Virtual
obj.workwindow.set(null, "SomeClass");
```

#### get

```ts
get(): windowInfo;
```

Returns object with {handle}, {title} and {className} of current workwindow.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware("Some title"); // or Virtual
console.log(obj.workwindow.get()); // object {handle, title, className}
```

#### refresh

```ts
refresh(): boolean;
```

Tries to find a new workwindow using already defined {handle}, {className}, {childTitle}, {childClassName},
returns "true" if new workwindow successfully find (new handle not equal to 0), "false" if it is not.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware("Some title"); // or Virtual
obj.workwindow.refresh();
```

#### setView

```ts
setView(info: Partial<pos & size>): void;
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
obj.workwindow.setView({ x: 25 }); // sets x position of workwindow to 25
obj.workwindow.setView({ y: 25, width: 1200 }); // sets y position of workwindow to 25, sets workwindow width to 1200px
obj.workwindow.setView({ x: 50, y: 25, width: 1200, height: 800 });
```

#### getView

```ts
getView(): pos & size;
```

Returns object with workwindow position and size.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.getView()); // object {x, y, width, height}
```

#### setForeground

```ts
setForeground(): void;
```

Makes the current workwindow a foreground window.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.setForeground();
```

#### isForeground

```ts
isForeground(): boolean;
```

Checks if the current workwindow is a foreground window.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.isForeground()); // true if current workwindow is a foreground window, false if not
```

#### isOpen

```ts
isOpen(): boolean;
```

Checks if the current workwindow exist.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
console.log(obj.workwindow.isOpen()); // true if current workwindow exist, false if not
```

#### kill

```ts
kill(): void;
```

Terminate current workwindow by killing it's thread.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.kill();
```

#### close

```ts
close(): void;
```

Close current workwindow by sending close message.

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.workwindow.close();
```

#### capture

```ts
capture(part: pos & size, format?: "rgba" | "bgra" | "grey"): img;
capture(part: pos & size, format: "monochrome", threshold?: uint8): img;
capture(format?: "rgba" | "bgra" | "grey"): img;
capture(format: "monochrome", threshold?: uint8): img;
```

Capture screenshot of current workwindow (even if it background) or desktop.
| Argument | Description | Default Value |
| --- | --- | --- |
| part | object {x, y, height, width} with position and size to be captured | |
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
obj.workwindow.capture({ x: 25, y: 25, width: 500, height: 500 }); // returns {data: Buffer with captured image data in rgba color format, width: 500, height: 500}
desktop.workwindow.capture({ x: 25, y: 25, width: 500, height: 500 }); // returns {data: Buffer with captured image data in rgba color format, width: 500, height: 500}
obj.workwindow.capture("grey"); // returns {data: Buffer with captured image data in grayscale color format, width: width of current workwindow, height: height of current workwindow}
obj.workwindow.capture(
  { x: 25, y: 25, width: 500, height: 500 },
  "monochrome",
  200
); // returns {data: Buffer with captured image data in monochrome color format, width: 500, height: 500}
```

#### colorAt

```ts
colorAt(x: number, y: number, returnType?: "string"): string;
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

#### EventEmitter

EventEmitter available for every sendInput method from [keyboard](#keyboard) and [mouse](#mouse) modules and capture method from [workwindow](#workwindow) module.

```ts
type keyboardEvent =
  | "beforePrintText"
  | "beforeToggleKey"
  | "beforeSendKey"
  | "beforeSendKeys"
  | "afterPrintText"
  | "afterToggleKey"
  | "afterSendKey"
  | "afterSendKeys";
type mouseEvent =
  | "beforeToggle"
  | "beforeClick"
  | "beforeMoveTo"
  | "beforeMoveCurveTo"
  | "beforeMove"
  | "beforeScrollWheel"
  | "afterToggle"
  | "afterClick"
  | "afterMoveTo"
  | "afterMoveCurveTo"
  | "afterMove"
  | "afterScrollWheel";
type workwindowEvent = "capture";
```

Example:

```js
const { Virtual, Hardware } = require("keysender");
const obj = new Hardware(handle); // or Virtual
obj.keyboard.on("beforeSendKey", (key, delay) => {
  console.log(
    `get ready, now I press ${key}, wait for ${delay} ms and release it`
  ); // logs before each sendKey or sendKeyAsync method
});
obj.keyboard.on("afterSendKey", () => {
  console.log("I done"); // logs after each sendKey or sendKeyAsync method
});
obj.keyboard.sendKey("a");
obj.keyboard.sendKeyAsync("b");
```

> For more details see [EventEmitter documentation](https://nodejs.org/api/events.html#events_class_eventemitter).

## GlobalHotkey

```ts
type actionArgs<S extends any[], A extends any[]> = {
    [i in keyof S]: {
        stateGetter(): S[i],
        argSetter(item: S[i]): A[i extends keyof A ? i : never]
    }
}
type hotkeyOptions<S extends any[], A extends any[]> = {
    key: keyboardRegularButton | number;
    isEnabled?(this: GlobalHotkey<S, A>): boolean | Promise<boolean>;
    actionArgs?: actionArgs<S, A>;
    mode?: "once";
    action(this: GlobalHotkey<S, A>, ...args: A): void | Promise<void>;
} | {
    key: keyboardRegularButton | number;
    isEnabled?(this: GlobalHotkey<S, A>): boolean | Promise<boolean>;
    actionArgs?: actionArgs<S, A>;
    mode: "toggle" | "hold";
    action(this: GlobalHotkey<S, A>, ...args: A): boolean | Promise<boolean>;
    finalizerCallback?(this: GlobalHotkey<S, A>, ...args: A): void | Promise<void>;
    delay?: number;
};
constructor(options: hotkeyOptions<stateTypes extends any[] ? stateTypes : [stateTypes], argsTypes extends any[] ? argsTypes : [argsTypes]>);
```

Registers hotkey, if some hotkey already registered for this {options.key}, [unregister](#unregister) previous hotkey and registers new hotkey.
| field | Description | Default Value | |
| --- | --- | --- | --- |
| key | hotkey | | required |
| mode | if "once" - {options.action} will call one time for each {options.key} press, if "hold" - {options.action} will repeat every {options.delay} milliseconds while {options.key} is pressed or {options.action} returns true, if "toggle" - {options.action} starts repeat repeat every {options.delay} milliseconds after {options.key} first time pressed and stops after {options.key} second time pressed or {options.action} returns false | "once" | |
| isEnabled | function to check if hotkey is need to be executing | | |
| actionArgs | something like watcher for arguments of {options.action} and {options.finalizerCallback}, i.e. array with objects { stateGetter: () => stateType, argSetter: (item: stateType) => argType }, where stateGetter is function for gets current state, argSetter - function to change arg value if state getting by stateGetter is different from the previous state, see an example for a better understanding. | | |
| action | function to be call after hotkey was pressed | | required |
| finalizerCallback | if {options.mode} is "hold" or "toggle" - function to be call after hotkey work is end | | |
| delay | if {options.mode} is "hold" or "toggle" - sets delay between {options.action} calls | 0 | |

```js
const { GlobalHotkey } = require("keysender");
const foo = new GlobalHotkey({ // logs "hi" after pressing "num+"
    key: "num+",
    action() {
        console.log("hi");
    }
});
new GlobalHotkey({ // logs "hi" every 50 milliseconds while "num*" is pressed
    key: "num*",
    action() {
        console.log("hi");
        return true;
    },
    mode: "hold",
    delay: 50
});
let i = 0;
new GlobalHotkey({ // logs "hi" every 50 milliseconds after "num/" is pressed until "num/" be pressed again or i become > 50
    key: "num/",
    action() {
        i++;
        if (i > 50) return false;
        console.log("hi")
        return true
    },
    mode: "toggle",
    delay: 50
});
new GlobalHotkey({ // after "a" is pressed if i <= 50 - logs "hi" every 50 milliseconds until "a" be pressed again
    key: "a",
    isEnabled() {
        return i <= 50;
    }
    action() {
        i++;
        console.log("hi")
        return true
    },
    mode: "toggle",
    delay: 50
});
new GlobalHotkey({ // logs "hi" every 50 milliseconds while "num-" is pressed, logs "bye" when "num-" is released
    key: "num-",
    async action() {
        console.log("hi");
        return true;
    },
    mode: "hold",
    delay: 50,
    async finalizerCallback() {
        console.log("bye");
    }
});
const bar = new GlobalHotkey({ // unregister prev "num+" hotkey {foo} (but it still could be reassignment) and register new hotkey "num+" {bar}
    key: "num+",
    action() {
        console.log("hello");
    }
});
```

```ts
import { Hardware, GlobalHotkey } from "keysender";
/**Code described below registers hotkey "num +", takes first {stateValue} of "Notepad" {height, width} and returns [width / 2, height / 2] as arg for {action}.
 * When "num +" will be pressed {isEnabled} will check is "Notepad" open,
 * if it's not open, it try to find it again,
 * if it still isn't open hotkey do nothing do nothing,
 * if it's open {stateGetter} gets {height, width} of "Notepad" and compares it with previous {stateValue},
 * if they are not equal sets new value [width / 2, height / 2] for argument of {action}, based on current {stateValue},
 * if they are equal, argument of {action} is not change,
 * after this it do {action} - moves mouse cursor to middle of "Notepad" window and makes left mouse click.
 */
const obj = new Hardware(null, "Notepad");
type stateType = {
  height: number;
  width: number;
};
type argType = [number, number];
new GlobalHotkey<[stateType], [argType]>({
  key: "num+",
  isEnabled() {
    return obj.workwindow.isOpen() ? true : obj.workwindow.refresh();
  },
  actionArgs: [
    {
      stateGetter() {
        const { height, width } = obj.workwindow.getView();
        return { height, width };
      },
      argSetter: (size) => [size.width / 2, size.height / 2],
    },
  ],
  async action(size) {
    await obj.mouse.moveToAsync(...size);
    await obj.mouse.clickAsync();
  },
});
```

### hotkeyState

```ts
readonly hotkeyState: boolean;
```

if {options.mode} is "hold" - state of {options.key} (true if {options.key} is pressed, false if it isn't),
if {options.mode} is "toggle" - state of toggler.

```js
const { GlobalHotkey } = require("keysender");
const text = "hello world!";
let i = 0;
new GlobalHotkey({
  key: "num-",
  async action() {
    while (i < text.length && this.hotkeyState) {
      console.log(text[i]);
      i++;
      await new Promise((_) => setTimeout(_, 250));
    }
    return false;
  },
  finalizerCallback() {
    if (this.hotkeyState) console.log("I done");
    else console.log("I not done");
    i = 0;
  },
  mode: "toggle",
});
```

### reassignment

```ts
reassignment(newHotkey: keyboardRegularButton | number): void;
```

Reassignments hotkey.

```js
const { GlobalHotkey } = require("keysender");
function action() {
  console.log("hi");
}
const foo = new GlobalHotkey({
  key: "num+",
  action,
});
foo.reassignment("a"); // now function {action} calling after "a" pressed
```

### unregister

```ts
unregister(): void;
```

Unregister hotkey, but it still can be reassignment by [reassignment](#reassignment) method.

```js
const { GlobalHotkey } = require("keysender");
const foo = new GlobalHotkey({
  key: "num+",
  action() {
    console.log("hi");
  },
});
foo.unregister(); // hotkey "num+" {foo} is unregister, but it still could be reassignment
```

### delete

```ts
delete(): void;
```

Delete hotkey.

```js
const { GlobalHotkey } = require("keysender");
const foo = new GlobalHotkey({
  key: "num+",
  action() {
    console.log("hi");
  },
});
foo.delete(); // hotkey "num+" {foo} is no longer exist
```

### unregisterAll

```ts
static unregisterAll(): void;
```

Unregister all hotkeys, but they still can be reassignment by [reassignment](#reassignment) method.

```js
const { GlobalHotkey } = require("keysender");
new GlobalHotkey({
  key: "num+",
  action() {
    console.log("hi");
  },
});
new GlobalHotkey({
  key: "num-",
  action() {
    console.log("hi");
  },
});
GlobalHotkey.unregisterAll();
```

### deleteAll

```ts
static deleteAll(): void;
```

Delete all hotkeys, use it before close program.

```js
const { GlobalHotkey } = require("keysender");
new GlobalHotkey({
  key: "num+",
  action() {
    console.log("hi");
  },
});
new GlobalHotkey({
  key: "num-",
  action() {
    console.log("hi");
  },
});
GlobalHotkey.deleteAll();
```

## textToImg

```ts
textToImg(text: string, path: string, fontSize: number, options?: textToImgOptions): img;
```

Draws text using the specified font (supports .ttf and .otf only).
| Argument | Description | Default Value |
| --- | --- | --- |
| text | text to draw | |
| path | path to font | |
| fontSize | font size in px | |
| options | object with options | |
Options object:
| field | Description | Default Value |
| --- | --- | --- |
| enableActualHeight | if true - height of returned img be equal to {fontSize} (some characters may be trimmed top or bottom) | false |
| enableAntiAliasing | if true - anti-aliasing enabled | true |
| color | text color, could be [r, g, b] or "rrggbb" or number | 0xffffff (white) |
| backgroundColor | background color, could be [r, g, b] or "rrggbb" or number | 0 (black) |
| format | color format of return data, could be "rgba", "bgra", "grey" | "rgba" |
Returns object {data, width, height}.
| field | Description |
| --- | --- |
| data | Buffer with pixels |
| width | width of drawn text |
| height | height of drawn text |

```js
const { textToImg } = require("keysender");
const img1 = textToImg("Hello World!", "./path/to/font.ttf", 12);
const img2 = textToImg("Hello World!", "./path/to/font.otf", 24, {
  enableAntiAliasing: false,
  format: "grey",
});
const img3 = textToImg("Hello World!", "./path/to/font.otf", 36, {
  enableActualHeight: true,
  color: "ff0000",
  backgroundColor: [0, 255, 0],
});
```

## getAllWindows

```ts
getAllWindows(): windowInfo[];
```

Returns array with objects {handle, title, className} of all open windows.

```js
const { getAllWindows } = require("keysender");
console.log(getAllWindows()); // array with objects {handle, title, className} of all open windows
```

## getWindowChildren

```ts
getWindowChildren(parentHandle: number): windowInfo[];
getWindowChildren(parentTitle: string | null, parentClassName?: string | null): windowInfo[];
```

Returns array with objects {handle, title, className} with all children of given window.

```js
const { getWindowChildren } = require("keysender");
console.log(getWindowChildren(parentHandle)); // array with objects {handle, title, className} of all {parentHandle} children
console.log(getWindowChildren("Some title")); // array with objects {handle, title, className} of all children window of the first found window with title "Some title"
console.log(getWindowChildren(null, "SomeClass")); // array with objects {handle, title, className} of all children window of the first found window with className "SomeClass"
console.log(getWindowChildren("Some title", "SomeClass")); // array with objects {handle, title, className} of all children window of the first found window with className "SomeClass" and title "Some title"
```

## getScreenSize

```ts
getScreenSize(): size;
```

Returns object with screen size.

```js
const { getScreenSize } = require("keysender");
console.log(getScreenSize()); // object {width, height}
```

## vkToString

```ts
vkToString(virtualKey: number): keyboardButton;
```

Returns string name of {virtualKey}.

```js
const { vkToString } = require("keysender");
console.log(vkToString(66)); // "b"
```

## sleep

```ts
sleep(ms: number | randomFromRange): void;
```

Pause current thread for {ms} milliseconds.

```js
const { sleep } = require("keysender");
sleep(25); // pause current thread for 25 milliseconds.
sleep([25, 50]); // pause current thread for random from range [25, 50] milliseconds.
```

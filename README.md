# keysender

> Node.js Desktop Automation for Windows. Emulate the mouse and keyboard physical or virtual inputs, capture workwindow, register global hotkeys.

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

```ts
import { Hardware, GlobalHotkey } from "keysender";

const notepad = new Hardware(null, "Notepad"); // find Notepad handle by className and set it as workwindow

new GlobalHotkey({
  // register hotkey
  key: "f1",
  mode: "once",
  async action() {
    if (
      (notepad.workwindow.isOpen() || notepad.workwindow.refresh()) &&
      notepad.workwindow.isForeground()
    ) {
      notepad.workwindow.setView({ x: 0, y: 0 }); // move workwindow to top left corner of the screen

      const { width, height } = notepad.workwindow.getView();

      await notepad.mouse.humanMoveTo(width / 2, height / 2); // makes human similar mouse movement from current cursor position to middle of "Notepad" window

      await notepad.keyboard.printText("hello"); // instantly types "hello"

      await notepad.keyboard.sendKey("space", 50); // press key "space", await for 50 milliseconds, release key "space"

      await notepad.keyboard.sendKeys(["w", "o", "r", "l", "d"], [25, 50], 50);

      await notepad.keyboard.sendKey(["ctrl", "s"], 50); // press key combination "ctrl+s", await for 50 milliseconds, release key combination
    }
  },
});
```

# Api

- [Hardware and Virtual](#hardware-and-virtual)
  - [.keyboard](#keyboard)
    - [.sendKey](#sendkey)
    - [.toggleKey](#togglekey)
    - [.sendKeys](#sendkeys)
    - [.printText](#printtext)
  - [.mouse](#mouse)
    - [.click](#click)
    - [.toggle](#toggle)
    - [.moveTo](#moveto)
    - [.move](#move)
    - [.humanMoveTo](#humanmoveto)
    - [.scrollWheel](#scrollwheel)
    - [.getPos](#getpos)
    - [.saveMode](#saveMode)
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
- [GlobalHotkey](#globalhotkey)
  - [.hotkeyState](#hotkeystate)
  - [.stop](#stop)
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
- [Available keyboard buttons](#keyboardbutton)

## Hardware and Virtual

```ts
/** Finds the first window with {handle} */
constructor(handle?: number);
/**
 * Finds the first window with {title} and/or {className} and sets it as current workwindow
 * */
constructor(title: string | null, className?: string | null);
/**
 * Finds the first child window with {childClassName} and/or {childTitle}
 * of window with {parentHandle} and sets it as current workwindow
 * */
constructor(
  parentHandle: number,
  childClassName: string | null,
  childTitle?: string | null
);
/**
 * Finds the first child window with {childClassName} and/or {childTitle}
 * of the first found window with {parentTitle} and/or {parentClassName}
 * and sets it as current workwindow
 * */
constructor(
  parentTitle: string | null,
  parentClassName: string | null,
  childClassName: string | null,
  childTitle?: string | null
);
```

Classes Hardware and Virtual provide the same [keyboard](#keyboard), [mouse](#mouse) and [workwindow](#workwindow) methods and have the same constructors, but:

- Class Hardware provides keyboard and mouse methods implementations on hardware level by inserts the events serially into the keyboard or mouse input stream. These events are not interspersed with other keyboard or mouse input events inserted either by the user (with the keyboard or mouse).
- Class Virtual provides keyboard and mouse methods implementations on virtual level by sending messages to workwindow, so it could work with background window.
  > Note: Virtual keyboard and mouse methods do not work for all windows, for example, input line in certain window may accept message from [printText](#printext) method, but [sendKey](#sendkey) method makes no effect outside input line, or the window may accept a keystroke message from [sendKey](#sendkey) method but not accept mouse movement message from [moveTo](#moveto) method.

```ts
import { Hardware, Virtual } from "keysender";

const foo = new Hardware("Some title");

const bar = new Virtual(null, "SomeClassName");

const foobar = new Hardware(
  "Some parent title",
  "SomeParentClassName",
  "SomeChildClassName"
);
```

### keyboard

Provides methods to synthesize keystrokes

### sendKey

```ts
sendKey(
  key: KeyboardButton | KeyboardButton[],
  delayAfterPress?: number | [from: number, to: number],
  delayAfterRelease?: number | [from: number, to: number]
): Promise<void>;
```

Pressing and releasing key or combination of keys

| Argument          | Description                                  | Default Value |
| ----------------- | -------------------------------------------- | ------------- |
| key               | key or array with combination of keys        |               |
| delayAfterPress   | milliseconds to await after **key** pressed  | `35`          |
| delayAfterRelease | milliseconds to await after **key** released | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.keyboard.sendKey("a");

await obj.keyboard.sendKey("a", 50);

await obj.keyboard.sendKey("a", 50, 90);

await obj.keyboard.sendKey(["ctrl", "shift", "a"], [25, 50]);
```

### toggleKey

```ts
toggleKey(
  key: KeyboardButton | KeyboardButton[],
  state: boolean,
  delay?: number | [from: number, to: number]
): Promise<void>;
```

Toggling key or combination of keys to provided state

| Argument | Description                                                    | Default Value |
| -------- | -------------------------------------------------------------- | ------------- |
| key      | key or array with combination of keys                          |               |
| state    | **key** state selection: `true` for press, `false` for release |               |
| delay    | milliseconds to await after **key** toggling                   | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.keyboard.toggleKey("a", true);

await obj.keyboard.toggleKey("a", false, 50);

await obj.keyboard.toggleKey(["ctrl", "shift", "a"], true, [25, 50]);
```

### sendKeys

```ts
sendKeys(
  keys: (KeyboardButton | KeyboardButton[])[],
  delayAfterPress?: number | [from: number, to: number],
  delayAfterRelease?: number | [from: number, to: number],
  delay?: number | [from: number, to: number]
): Promise<void>;
```

Pressing and releasing array of keys or combinations of keys

| Argument          | Description                                                    | Default Value |
| ----------------- | -------------------------------------------------------------- | ------------- |
| keys              | array with keys                                                |               |
| afterPressDelay   | milliseconds to await after each key pressed                   | `35`          |
| afterReleaseDelay | milliseconds to await after each key released (excluding last) | `35`          |
| delay             | milliseconds to await after last key released                  | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.keyboard.sendKeys(["a", "b"]);

await obj.keyboard.sendKeys(["a", "b"], 50);

await obj.keyboard.sendKeys(["a", "b"], 50, 90);

await obj.keyboard.sendKeys(["a", "b"], [25, 50], 25, 45);
```

### printText

```ts
printText(
  text: string,
  delayAfterCharTyping?: number | [from: number, to: number],
  delay?: number | [from: number, to: number]
): Promise<void>;
```

Prints given text

| Argument             | Description                                                   | Default Value |
| -------------------- | ------------------------------------------------------------- | ------------- |
| text                 | string to print                                               |               |
| delayAfterCharTyping | milliseconds to await after each char typing (excluding last) | `0`           |
| delay                | milliseconds to await after text printed                      | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.keyboard.printText("hello world");

await obj.keyboard.printText("hello world", 50);

await obj.keyboard.printText("hello world", [25, 50], 25);
```

### mouse

Provides methods to synthesize mouse motions, and button clicks

### click

```ts
click(
  button?: MouseButton,
  delayAfterPress?: number | [from: number, to: number],
  delayAfterRelease?: number | [from: number, to: number]
): Promise<void>;
```

| Argument          | Description                                     | Default Value |
| ----------------- | ----------------------------------------------- | ------------- |
| button            | name of mouse button                            | `"left"`      |
| delayAfterPress   | milliseconds to await after **button** pressed  | `35`          |
| delayAfterRelease | milliseconds to await after **button** released | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.click();

await obj.mouse.click("right", 25, 15);
```

### toggle

```ts
toggle(button: MouseButton, state: boolean, delay?: number | [from: number, to: number]): Promise<void>;
```

Switch mouse button state

| Argument | Description                                                   | Default Value |
| -------- | ------------------------------------------------------------- | ------------- |
| button   | name of mouse button                                          |               |
| state    | button state selection: `true` for press, `false` for release |               |
| delay    | milliseconds to await after switching **button** **state**    | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.toggle("left", true);

await obj.mouse.toggle("right", false, 25);
```

### moveTo

```ts
moveTo(x: number, y: number, delay?: number | [from: number, to: number]): Promise<void>;
```

Move mouse to [x, y] in current workwindow

| Argument | Description                                | Default Value |
| -------- | ------------------------------------------ | ------------- |
| delay    | milliseconds to await after mouse movement | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.moveTo(25, 25);

await obj.mouse.moveTo(50, 50, 50);
```

### move

```ts
move(x: number, y: number, delay?: number | [from: number, to: number]): Promise<void>;
```

Move mouse from current position by [x, y] relatively

| Argument | Description                                | Default Value |
| -------- | ------------------------------------------ | ------------- |
| delay    | milliseconds to await after mouse movement | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.move(25, 25);

await obj.mouse.move(-50, 50, 50);
```

### humanMoveTo

```ts
humanMoveTo(
  x: number,
  y: number,
  speed?: number,
  deviation?: number,
  delay?: number | [from: number, to: number]
): Promise<void>;
```

Simulate human similar mouse movement from current cursor position to [x, y] in current workwindow

| Argument  | Description                              | Default Value |
| --------- | ---------------------------------------- | ------------- |
| speed     | move speed                               | `5`           |
| deviation | movement curvature                       | `30`          |
| delay     | milliseconds to await after movement end | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.humanMoveTo(25, 25);
```

### scrollWheel

```ts
scrollWheel(amount: number, delay?: number | [from: number, to: number]): Promise<void>;
```

| Argument | Description                                                                                                                                                                                    | Default Value |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| amount   | amount of wheel movement, positive value indicates that the wheel was rotated forward,<br /> away from the user, negative value indicates that the wheel was rotated backward, toward the user |               |
| delay    | milliseconds to await after wheel scroll                                                                                                                                                       | `0`           |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.scrollWheel(-1);
```

### getPos

```ts
getPos(): Position;
```

Returns current cursor position relative to workwindow

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

await obj.mouse.moveTo(25, 50);

console.log(obj.mouse.getPos()); // {x: 25, y: 50}
```

### saveMod

```ts
/**
 * @default false
 */
set saveMode(value: boolean);
```

if `true` - every mouse move method first back to last known coordinates ([0, 0] on first move)

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

obj.mouse.saveMode = true;
```

### workwindow

Provides methods to work with workwindow

### set

```ts
/** Sets current workwindow by {handle}. */
set(handle?: number): void;
/**
 * Finds the first window with {title}
 * and/or {className} and sets it as current workwindow.
 * */
set(title: string | null, className?: string | null): void;
/**
 * Finds the first child window with {childClassName}
 * and/or {childTitle} of window with {parentHandle}
 * and sets it as current workwindow
 * */
set(parentHandle: number, childClassName: string | null, childTitle?: string | null): void;
/**
 * Finds the first child window with {childClassName}
 * and/or {childTitle} of the first found window with {parentTitle}
 * and/or {parentClassName} and sets it as current workwindow
 * */
set(parentTitle: string | null, parentClassName: string | null, childClassName: string | null, childTitle?: string | null): void;
```

Same as [constructor](#hardware-and-virtual).

```ts
import { Hardware } from "keysender";

const obj = new Hardware("Some title"); // or Virtual

obj.workwindow.set(null, "SomeClass");
```

### get

```ts
get(): {
  handle: number;
  className: string;
  title: string;
};
```

```ts
import { Hardware } from "keysender";

const obj = new Hardware("Some title"); // or Virtual

console.log(obj.workwindow.get()); // { handle, title, className }
```

### refresh

```ts
refresh(): boolean;
```

Tries to find a new workwindow using already defined `handle`, `className`, `childTitle`, `childClassName`,<br />
returns `true` if new workwindow successfully find (new handle not equal to 0), `false` if it is not

```ts
import { Hardware } from "keysender";

const obj = new Hardware("Some title"); // or Virtual

obj.workwindow.refresh();
```

### setView

```ts
setView(view: Partial<Position & Size>): void;
```

Sets workwindow position and/or size

| Object field | Description       |
| ------------ | ----------------- |
| x            | window x position |
| y            | window y position |
| width        | window width      |
| height       | window height     |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

obj.workwindow.setView({ x: 25 });

obj.workwindow.setView({ y: 25, width: 1200 });

obj.workwindow.setView({ x: 50, y: 25, width: 1200, height: 800 });
```

### getView

```ts
getView(): Position & Size;
```

Returns object with workwindow position and size

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

console.log(obj.workwindow.getView()); // { x, y, width, height }
```

### setForeground

```ts
setForeground(): void;
```

Makes the current workwindow the foreground window

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

obj.workwindow.setForeground();
```

### isForeground

```ts
isForeground(): boolean;
```

Checks if the current workwindow is a foreground window

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

console.log(obj.workwindow.isForeground());
```

### isOpen

```ts
isOpen(): boolean;
```

Checks if the current workwindow exist

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

console.log(obj.workwindow.isOpen());
```

### kill

```ts
kill(): void;
```

Terminates current workwindow by killing it's thread

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

obj.workwindow.kill();
```

### close

```ts
close(): void;
```

Closes current workwindow by sending close message

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

obj.workwindow.close();
```

### capture

```ts
  capture(part: Position & Size, format?: "rgba" | "bgra" | "grey"): Image;
  capture(
    part: Position & Size,
    format: "monochrome",
    threshold?: number
  ): Image;
  capture(format?: "rgba" | "bgra" | "grey"): Image;
  capture(format: "monochrome", threshold?: number): Image;
```

Capture screenshot of current workwindow (even if it background) or desktop.

| Argument  | Description                                                                                                                                                                                      | Default Value |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| part      | object `{ x, y, height, width }` with position and size to be captured                                                                                                                           |               |
| format    | color format of returned image, could be `"rgba"`, `"bgra"`, `"grey"` or `"monochrome"` <br/> Note: the bgra format has the best performance, but the alpha channel of pixels is not always 255. | `"rgba" `     |
| threshold | color limit for "monochrome" format, if the pixel value is smaller than the threshold, it is set to 0, otherwise it is set to 255                                                                | `127 `        |

Returns object `{ data, width, height }`

| field  | Description            |
| ------ | ---------------------- |
| data   | Buffer with pixels     |
| width  | width of captured img  |
| height | height of captured img |

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

const desktop = new Hardware();

obj.workwindow.capture();

desktop.workwindow.capture();

obj.workwindow.capture({ x: 25, y: 25, width: 500, height: 500 });

desktop.workwindow.capture({ x: 25, y: 25, width: 500, height: 500 });

obj.workwindow.capture("grey");

obj.workwindow.capture(
  { x: 25, y: 25, width: 500, height: 500 },
  "monochrome",
  200
);
```

### colorAt

```ts
colorAt(x: number, y: number, returnType?: "string"): string;
colorAt(x: number, y: number, returnType: "array"): RGB;
colorAt(x: number, y: number, returnType: "number"): number;
```

Returns pixel color in [x, y] of current workwindow (or screen if `handle` was unset)

```ts
import { Hardware } from "keysender";

const obj = new Hardware(handle); // or Virtual

const desktop = new Hardware();

obj.workwindow.colorAt(25, 25); // returns workwindow color in [25, 25] in "rrggbb" format

obj.workwindow.colorAt(25, 25, "array"); // returns workwindow color in [25, 25] in [r,g,b] format

obj.workwindow.colorAt(25, 25, "number"); // returns workwindow color in [25, 25] in decimal format

desktop.workwindow.colorAt(25, 25); // returns screen color in [25, 25] in "rrggbb" format
```

## GlobalHotkey

```ts
enum Reason {
  BY_KEYBOARD,
  BY_ACTION,
  BY_STOP,
}

constructor(
  options: {
    key: KeyboardRegularButton | number;
  } & (
    | {
        mode: "once";
        action(this: GlobalHotkey): void | Promise<void>;
      }
    | {
        mode: "toggle" | "hold";
        isEnable?(this: GlobalHotkey): boolean | Promise<boolean>;
        before?(this: GlobalHotkey): void | Promise<void>;
        action(this: GlobalHotkey): boolean | Promise<boolean>;
        after?(
          this: GlobalHotkey,
          reason: any
        ): void | Promise<void>;
        delay?: number | [from: number, to: number];
      }
  )
);
```

Registers hotkey, if some hotkey already registered for this **key**, [unregister](#unregister) previous hotkey and registers new hotkey.

| field      | Description                                                                                                                                                                                                                                                                                                                                                                                            | Default Value |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------- |
| key        | hotkey                                                                                                                                                                                                                                                                                                                                                                                                 |               |
| mode       | if `"once"` - **action** will call one time for each **key** press,<br /> if `"hold"` - **action** will repeat every **delay** milliseconds while **key** is pressed or **action** returns `true`,<br /> if `"toggle"` - **action** starts repeat repeat every **delay** milliseconds after **key** first time pressed <br/> and stops after **key** second time pressed or **action** returns `false` |               |
| isEnabled? | method to check if hotkey is need to be executing                                                                                                                                                                                                                                                                                                                                                      | `() => true`  |
| before?    | if **mode** is `"hold"` or `"toggle"` - method to be executed before the **action** loop                                                                                                                                                                                                                                                                                                               |               |
| action     | function to be call after hotkey was pressed                                                                                                                                                                                                                                                                                                                                                           |               |
| after?     | if **mode** is `"hold"` or `"toggle"` - function to be call after hotkey work is end, first param is reason of ending,<br /> reason of **action** loop ending, can be one of `Reason` enum (if ended by action - `Reason.BY_ACTION`,<br /> if ended by keyboard - `Reason.BY_KEYBOARD`) or any value from [stop](#stop) method                                                                         |               |
| delay?     | if **mode** is `"hold"` or `"toggle"` - sets delay between **action** calls                                                                                                                                                                                                                                                                                                                            | `35`          |

```ts
import { GlobalHotkey } from "keysender";

new GlobalHotkey({ // logs "hi" after pressing "num+"
  key: "num+",
  mode: "once",
  action() {
    console.log("hi");
  }
});

new GlobalHotkey({ // logs "hi" every 50 milliseconds while "num*" is pressed
  key: "num*",
  mode: "hold",
  action() {
    console.log("hi");

    return true;
  },
  delay: 50
});

let i = 0;

new GlobalHotkey({ // logs "hi" every 50 milliseconds after "num/" is pressed
  key: "num/", //     until "num/" be pressed again or i become > 50
  mode: "toggle",
  action() {
    i++;

    if (i > 50) {
      return false;
    }

    console.log("hi");

    return true;
  },
});

new GlobalHotkey({ // after "a" is pressed if i <= 50 - logs "hi" every 50 milliseconds
  key: "a", //        until "a" be pressed again
  mode: "toggle",
  isEnabled() {
    return i <= 50;
  }
  action() {
    i++;

    console.log("hi");

    return true;
  },
  delay: 50
});

new GlobalHotkey({ // logs "hi" every 50 milliseconds while "num-" is pressed,
  key: "num-", //   logs Release.BY_KEYBOARD when "num-" is released
  mode: "hold",
  action() {
    console.log("hi");

    return true;
  },
  after(reason) {
    console.log(reason);
  }
});
```

### hotkeyState

```ts
hotkeyState: boolean;
```

**mode** is `"hold"` - state of **key** (`true` if **key** is pressed, `false` if it isn't),<br />
**mode** is `"toggle"` - state of `toggler`,<br />
**mode** is `"once"` - always `true`

```ts
import { GlobalHotkey } from "keysender";

const text = "hello world!";

let i = 0;

new GlobalHotkey({
  key: "num-",
  mode: "toggle",
  async action() {
    while (i < text.length && this.hotkeyState) {
      console.log(text[i]);

      i++;

      await new Promise((res) => setTimeout(res, 250));
    }

    return false;
  },
  after() {
    if (this.hotkeyState) {
      console.log("I done");
    } else {
      console.log("I not done");
    }

    i = 0;
  },
});
```

## stop

```ts
stop(reason?: string): Promise<void>;
```

Stops the loop of **action** executing

> Note: works only if **mode** equals to `"toggle"`

| Argument | Description                | Default Value    |
| -------- | -------------------------- | ---------------- |
| reason   | reason to **after** method | `Reason.BY_STOP` |

```ts
import { GlobalHotkey } from "keysender";

const foo = new GlobalHotkey({
  key: "num-",
  mode: "toggle",
  action() {
    // some action here

    return true;
  },
  after(reason) {
    if (reason === "someReason") {
      console.log("stopped");
    }
  },
});

new GlobalHotkey({
  key: "num+",
  mode: "once",
  async action() {
    await foo.stop("someReason");

    console.log("num- action was stopped");
  },
});
```

### reassignment

```ts
reassignment(newHotkey: KeyboardRegularButton | number): void;
```

Reassignments hotkey

```js
import { GlobalHotkey } from "keysender";

const foo = new GlobalHotkey({
  key: "num+",
  mode: "once",
  action() {
    console.log("hi");
  },
});

foo.reassignment("a");
```

### unregister

```ts
unregister(): void;
```

Unregister hotkey, but it still can be reassignment by [reassignment](#reassignment) method

```ts
import { GlobalHotkey } from "keysender";

const foo = new GlobalHotkey({
  key: "num+",
  mode: "once",
  action() {
    console.log("hi");
  },
});

foo.unregister();
```

### delete

```ts
delete(): void;
```

Delete hotkey, it can't be [reassignment](#reassignment)

```ts
import { GlobalHotkey } from "keysender";

const foo = new GlobalHotkey({
  key: "num+",
  mode: "once",
  action() {
    console.log("hi");
  },
});

foo.delete();
```

### unregisterAll

```ts
static unregisterAll(): void;
```

Unregister all hotkeys, but they still can be reassignment by [reassignment](#reassignment) method

```js
import { GlobalHotkey } from "keysender";

GlobalHotkey.unregisterAll();
```

### deleteAll

```ts
static deleteAll(): void;
```

Delete all hotkeys

```ts
import { GlobalHotkey } from "keysender";

GlobalHotkey.deleteAll();
```

## textToImg

```ts
textToImg(
  text: string,
  path: string,
  fontSize: number,
  options?: TextToImgOptions
): Image;
```

Draws text using the specified font **(supports .ttf and .otf only)**

| Argument | Description         |
| -------- | ------------------- |
| text     | text to draw        |
| path     | path to font        |
| fontSize | font size in px     |
| options  | object with options |

Options object:

| Field              | Description                                                                                                                                                       | Default Value      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| enableActualHeight | if `true` - height of returned img be equal to **fontSize** (some characters may be trimmed top or bottom)                                                        | `false`            |
| enableAntiAliasing | if `true` - anti-aliasing enabled                                                                                                                                 | `true`             |
| color              | text color, could be in [r, g, b] or "rrggbb" or number formats                                                                                                   | `0xffffff` (white) |
| backgroundColor    | background color, could be in [r, g, b] or "rrggbb" or number formats                                                                                             | `0` (black)        |
| format             | color format of return data, could be `"rgba"`, `"bgra"`, `"grey"` <br/> Note: `"bgra"` format has the best performance, but alpha chanel of each pixel will be 0 | `"rgba"`           |

Returns:

| Field  | Description          |
| ------ | -------------------- |
| data   | Buffer with pixels   |
| width  | width of drawn text  |
| height | height of drawn text |

```ts
import { textToImg } from "keysender";

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
getAllWindows(): {
  handle: number;
  className: string;
  title: string;
}[];
```

Returns array with objects {handle, title, className} of all open windows

```ts
import { getAllWindows } from "keysender";

console.log(getAllWindows());
```

## getWindowChildren

```ts
getWindowChildren(parentHandle: number): {
  handle: number;
  className: string;
  title: string;
}[];
getWindowChildren(parentTitle: string | null, parentClassName?: string | null): {
  handle: number;
  className: string;
  title: string;
}[];
```

Returns array with objects {handle, title, className} with all children of given window

```ts
import { getWindowChildren } from "keysender";

console.log(getWindowChildren(parentHandle));

console.log(getWindowChildren("Some title"));

console.log(getWindowChildren(null, "SomeClass"));

console.log(getWindowChildren("Some title", "SomeClass"));
```

## getScreenSize

```ts
getScreenSize(): size;
```

Returns object with screen size

```js
import { getScreenSize } from "keysender";

console.log(getScreenSize());
```

## vkToString

```ts
vkToString(virtualKey: number): KeyboardButton;
```

Returns string name of **virtualKey**

```ts
import { vkToString } from "keysender";

console.log(vkToString(66)); // "b"
```

## sleep

```ts
sleep(ms: number | [from: number, to: number]): Promise<void>;
```

used under the hood of all async methods

```ts
import { sleep } from "keysender";

await sleep(25);

await sleep([25, 50]);
```

### KeyboardButton

[toggleKey](#togglekey), [sendKey](#sendkey), [sendKeys](#sendkeys), [GlobalHotkey](#globalhotkey) supports for following keys or numbers([virtual key codes](https://docs.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes))

```ts
export type KeyboardRegularButton =
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
  | "="
  | ","
  | "-"
  | "."
  | "/"
  | "~"
  | "["
  | "|"
  | "]"
  | "'";

export type KeyboardSpecButton =
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

export type KeyboardButton =
  | KeyboardRegularButton
  | KeyboardSpecButton
  | number;
```

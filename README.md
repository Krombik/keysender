# keysender
> Node.js Desktop Automation for Windows. Emulate the mouse and keyboard physical or hardware inputs, capture workwindow, register global hotkeys.

## Installation
Install keysender using npm:

```
npm install keysender
```

## Syntax

### Hardware
Provides methods implementations on hardware level.
```js
const { Hardware } = require("keysender");
const someName = new Hardware(handle); // Create new instance of Hardware class with {handle} of initial working window.
                                       // {handle} could be found with getWindow or getWindowChild methods
                                       // pass 0 if initial working window is not required
```

### Virtual
Provides methods implementations on virtual level.
```js
const { Virtual } = require("keysender");
const someName = new Virtual(handle); // Create new instance of Virtual class with {handle} of initial working window.
                                      // {handle} could be found with getWindow or getWindowChild methods
```

### getWindow
```ts
getWindow(): windowData[];
getWindow(title: string | null, className?: string | null): number;
```
Returns window {handle} by {title} and(or) {className} or array with objects {handle, title, className} of all open windows.
```js
const { getWindow } = require("keysender");
console.log(getWindow()) // returns array with objects {handle, title, className} of all open windows
console.log(getWindow("someTitle")) // returns {handle} of first find window with "someTitle" title
console.log(getWindow(null, "someClass")) // returns {handle} of first find window with "someClass" class
console.log(getWindow("someTitle", "someClass")) // returns {handle} of first find window with "someTitle" title and "someClass" class
```

### getWindowChild
```ts
getWindowChild(parentHandle: number): windowData[];
getWindowChild(parentHandle: number, className: string | null, title?: string | null): number;
```
Returns window child {handle} by {title} and(or) {className} or array with objects {handle, title, className} of all existing window children.
```js
const { getWindowChild } = require("keysender");
console.log(getWindowChild(parentHandle)) // returns array with objects {handle, title, className} of all {parentHandle} children
console.log(getWindowChild(parentHandle, "someClass")) // returns {handle} of first find {parentHandle} child with "someClass" class
console.log(getWindowChild(parentHandle, null, "someTitle")) // returns {handle} of first find {parentHandle} child with "someTitle" title 
console.log(getWindowChild(parentHandle, "someClass", "someTitle")) // returns {handle} of first find {parentHandle} child with "someTitle" title and "someClass" class
```

## keyboard
Provides methods to synthesize keystrokes.

### keyTogglerDelay
```ts
keyTogglerDelay: number | randomFromRange = 35;
```
```js
const { Virtual, Hardware } = require("keysender");
const someName = new Hardware(handle); // or Virtual
someName.keyboard.keyTogglerDelay=25;
someName.keyboard.keyTogglerDelay=[25, 50]; //sets random value in range [25, 50]
```

### keySenderDelay
```ts
keySenderDelay: number | randomFromRange = 35;
```
```js
const { Virtual, Hardware } = require("keysender");
const someName = new Hardware(handle); // or Virtual
someName.keyboard.keySenderDelay=25;
someName.keyboard.keySenderDelay=[25, 50]; //sets random value in range [25, 50]
```

### toggleKey
```ts
toggleKey(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): void;
toggleKeyAsync(key: keyboardButton | keyboardButton[], state?: boolean, delay?: number | randomFromRange): Promise<void>;
```
Toggles key or combination of keys to provided state.
| Argument | Description | Default Value |
| --- | --- | --- |
| key | key or array with combination of keys |  |
| state | key state selection: **true** for press, **false** for release | true |
| delay | milliseconds to sleep after key toggled | [keyTogglerDelay](#keyTogglerDelay) |
```js
const { Virtual, Hardware } = require("keysender");
const someName = new Hardware(handle); // or Virtual
someName.keyboard.toggleKey("a", true); // press key "a" and sleep for {keyTogglerDelay} milliseconds
someName.keyboard.toggleKey("a", false, 50); // release key "a" and sleep for 50 milliseconds
someName.keyboard.toggleKey(["ctrl","shift","a"], true, [25, 50]); // press key combination "ctrl+shift+a" and sleep for random from range [25, 50] milliseconds
someName.keyboard.toggleKeyAsync("b", true) // press key "b" and await for {keyTogglerDelay} milliseconds
    .then(()=>someName.keyboard.toggleKeyAsync("b", false, 50)) // release key "b" and await for 50 milliseconds
    .then(()=>{
        // do something
        return someName.keyboard.toggleKeyAsync("d",false)
    })
    .then(()=>{console.log("I done")});
```




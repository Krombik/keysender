#ifndef KEYBOARD_H
#define KEYBOARD_H

#include <napi.h>
#include <iostream>
#include <map>
#include <winuser.h>

class Keyboard
{
public:
    void toogleKey(const Napi::CallbackInfo &info);
    void printText(const Napi::CallbackInfo &info);

private:
    static const std::map<std::string, UINT> keysDef;
    virtual void keyToogler(UINT key, bool isKeyDown, int delay) = 0;
    virtual void textPrinter(Napi::Array text, int keyTooglerDelay, int keySenderDelay) = 0;
};
#endif
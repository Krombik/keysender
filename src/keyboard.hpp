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
    void printChar(const Napi::CallbackInfo &info);

private:
    static const std::map<std::string, UINT> keysDef;
    virtual void keyToogler(UINT key, bool isKeyDown) = 0;
    virtual void charPrinter(int code) = 0;
};
#endif
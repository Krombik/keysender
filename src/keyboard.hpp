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
    virtual void textPrinter(std::string text) = 0;

protected:
    int keyTooglerDelay = 30;
    int keySenderDelay = 30;
    void setKeyTooglerDelay(const Napi::CallbackInfo &info, const Napi::Value &value);
    void setKeySenderDelay(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getKeyTooglerDelay(const Napi::CallbackInfo &info);
    Napi::Value getKeySenderDelay(const Napi::CallbackInfo &info);
};
#endif
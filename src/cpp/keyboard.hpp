#pragma once
#ifndef KEYBOARD_H
#define KEYBOARD_H

#include "includes.hpp"

class Keyboard
{
public:
    void toggleKey(const Napi::CallbackInfo &info);
    void printChar(const Napi::CallbackInfo &info);
    static const std::map<std::string, UINT> keysDef;
    static bool getKeyCode(Napi::Value key, UINT *keyCode);

private:
    virtual void keyToggler(UINT key, bool isKeyDown) = 0;
    virtual void charPrinter(int code) = 0;
};
#endif
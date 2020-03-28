#ifndef HARDWARE_H
#define HARDWARE_H

#include "keyboard.hpp"
#include "mouse.hpp"
#include "workwindow.hpp"
#include <napi.h>
#include <winuser.h>
#include <array>

class Hardware : public Keyboard, public Mouse, public Workwindow, public Napi::ObjectWrap<Hardware>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Hardware(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hardware>(info){};

private:
    static Napi::FunctionReference constructor;
    static const UINT extendKeys[];
    static const std::map<int8_t, std::array<UINT, 2>> buttonsDef;
    void mousePosGetter(POINT *coords);
    void mbToggler(int8_t button, bool isButtonDown);
    void mover(int x, int y, bool isAbsolute);
    void wheelScroller(int x);
    void keyToggler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

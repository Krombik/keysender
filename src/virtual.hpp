#ifndef VIRTUAL_H
#define VIRTUAL_H

#include "keyboard.hpp"
#include "mouse.hpp"
#include "workwindow.hpp"
#include <napi.h>
#include <winuser.h>
#include <array>

class Virtual : public Keyboard, public Mouse, public Workwindow, public Napi::ObjectWrap<Virtual>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Virtual(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Virtual>(info){};

private:
    static Napi::FunctionReference constructor;
    static const std::map<int8_t, std::array<UINT, 2>> msgs;
    static const std::map<UINT, UINT> wParams;
    void mousePosGetter(POINT *coords);
    void mbToggler(int8_t button, bool isButtonDown);
    void mover(int x, int y, bool isAbsolute);
    void wheelScroller(int x);
    void keyToggler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

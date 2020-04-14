#ifndef HARDWARE_H
#define HARDWARE_H

#include "includes.hpp"
#include "keyboard.hpp"
#include "mouse.hpp"
#include "workwindow.hpp"

class Hardware : public Keyboard, public Mouse, public Workwindow, public Napi::ObjectWrap<Hardware>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Hardware(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hardware>(info){};

private:
    static Napi::FunctionReference constructor;
    static const UINT extendKeys[];
    static const std::map<uint8_t, std::array<UINT, 2>> buttonsDef;
    Napi::Value getLastCoords(const Napi::CallbackInfo &info);
    void mousePosGetter(POINT *coords);
    void mbToggler(uint8_t button, bool isButtonDown);
    void mover(POINT coords, bool isAbsolute);
    void wheelScroller(int x);
    void keyToggler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

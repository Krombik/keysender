#ifndef HARDWARE_H
#define HARDWARE_H

#include "keyboard.hpp"
#include "workwindow.hpp"
#include <napi.h>
#include <winuser.h>
#include <array>

class Hardware : public Keyboard, public Workwindow, public Napi::ObjectWrap<Hardware>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    void toogleMb(const Napi::CallbackInfo &info);
    void scrollWheel(const Napi::CallbackInfo &info);
    void move(const Napi::CallbackInfo &info);
    Hardware(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hardware>(info){};

private:
    static Napi::FunctionReference constructor;
    static const UINT extendKeys[];
    static const std::map<std::string, std::array<UINT, 2>> buttonsDef;
    void keyToogler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

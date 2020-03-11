#ifndef VIRTUAL_H
#define VIRTUAL_H

#include "keyboard.hpp"
#include "workwindow.hpp"
#include <napi.h>
#include <winuser.h>
#include <array>

class Virtual : public Keyboard, public Workwindow, public Napi::ObjectWrap<Virtual>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    void toogleMbAt(const Napi::CallbackInfo &info);
    void moveTo(const Napi::CallbackInfo &info);
    void scrollWheelAt(const Napi::CallbackInfo &info);
    Virtual(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Virtual>(info){};

private:
    static Napi::FunctionReference constructor;
    static const std::map<std::string, std::array<UINT, 2>> msgs;
    static const std::map<UINT, UINT> wParams;
    void keyToogler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

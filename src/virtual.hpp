#ifndef VIRTUAL_H
#define VIRTUAL_H

#include "keyboard.hpp"
#include "workwindow.hpp"
#include <napi.h>
#include <winuser.h>

class Virtual : public Keyboard, public Workwindow, public Napi::ObjectWrap<Virtual>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Virtual(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Virtual>(info){};

private:
    static Napi::FunctionReference constructor;
    void keyToogler(UINT key, bool isKeyDown);
    void charPrinter(int code);
};

#endif

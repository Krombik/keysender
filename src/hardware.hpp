#ifndef HARDWARE_H
#define HARDWARE_H

#include "keyboard.hpp"
#include <napi.h>
#include <winuser.h>

class Hardware : public Keyboard, public Napi::ObjectWrap<Hardware>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Hardware(const Napi::CallbackInfo &info);

private:
    static Napi::FunctionReference constructor;
    static const UINT extendKeys[];
    void keyToogler(UINT key, bool isKeyDown, int delay);
    void textPrinter(Napi::Array text, int keyTooglerDelay, int keySenderDelay);
    Napi::Value isWorkwindowActive(const Napi::CallbackInfo &info);

protected:
    HWND workwindow = NULL;
};

#endif

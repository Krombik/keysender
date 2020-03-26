#ifndef HOTKEY_H
#define HOTKEY_H

#include <napi.h>
#include <winuser.h>
#include <windows.h>
#include <iostream>
#include <map>
#include <vector>
#include <string>
#include <sstream>

struct TsfnContext
{
    HANDLE thread;
    UINT keyFlags = NULL;
    bool isHoldEnable = false;
    int32_t delay = 0;
    UINT keyCode;
    std::string name;
    Napi::ThreadSafeFunction tsfn;
};
static std::vector<TsfnContext *> hotkeysRef;
const std::map<std::string, UINT> flags = {
    {"alt", MOD_ALT},
    {"ctrl", MOD_CONTROL},
    {"shift", MOD_SHIFT},
};

class Hotkey : public Napi::ObjectWrap<Hotkey>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info){};
    static void registerHotkey(const Napi::CallbackInfo &info);
    static void unregisterHotkey(const Napi::CallbackInfo &info);
    static void unregisterAllHotkeys(const Napi::CallbackInfo &info);
    static Napi::Value findHotkeyName(const Napi::CallbackInfo &info);

private:
    static Napi::FunctionReference constructor;
    static void messagesGetter(TsfnContext *context);
};

#endif

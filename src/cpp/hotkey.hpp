#ifndef HOTKEY_H
#define HOTKEY_H

#include "includes.hpp"

struct TsfnContext
{
    bool exist = true;
    UINT keyCode;
    std::string name;
    Napi::ThreadSafeFunction tsfn;
};
static std::vector<TsfnContext *> hotkeysRef;

class Hotkey : public Napi::ObjectWrap<Hotkey>
{
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info){};
    static void registerHotkey(const Napi::CallbackInfo &info);
    static void unregisterHotkey(const Napi::CallbackInfo &info);
    static void unregisterAllHotkeys(const Napi::CallbackInfo &info);
    static Napi::Value findHotkeyName(const Napi::CallbackInfo &info);
    static Napi::Value buttonIsPressed(const Napi::CallbackInfo &info);

private:
    static Napi::FunctionReference constructor;
    static void messagesGetter(TsfnContext *context);
};

#endif

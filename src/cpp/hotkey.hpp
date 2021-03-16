#pragma once
#ifndef HOTKEY_H
#define HOTKEY_H

#include "types.hpp"

class Hotkey : public Napi::ObjectWrap<Hotkey>
{
public:
    Hotkey(const Napi::CallbackInfo &info) : Napi::ObjectWrap<Hotkey>(info){};
    void deleteHotkey(const Napi::CallbackInfo &info);
    void unregisterHotkey(const Napi::CallbackInfo &info);
    void reassignmentHotkey(const Napi::CallbackInfo &info);
    void setHotkeyState(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getHotkeyState(const Napi::CallbackInfo &info);
    std::function<bool()> hotkeyState;
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    static void deleteAllHotkeys(const Napi::CallbackInfo &info);
    static void unregisterAllHotkeys(const Napi::CallbackInfo &info);

private:
    std::set<TsfnContext *>::iterator it;
    bool togglerState = false;
    void registerHotkey(const Napi::CallbackInfo &info);
    static Napi::FunctionReference constructor;
    static std::set<TsfnContext *> hotkeyPointers;
    static void messagesGetter(TsfnContext *context);
    static void unregisterDuplicate(UINT keyCode);
};

#endif

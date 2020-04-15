#pragma once
#ifndef HOTKEY_H
#define HOTKEY_H

#include "types.hpp"

class Hotkey : public Napi::ObjectWrap<Hotkey>
{
public:
    Hotkey(const Napi::CallbackInfo &info);
    void deleteHotkey(const Napi::CallbackInfo &info);
    void unregisterHotkey(const Napi::CallbackInfo &info);
    void reassignmentHotkey(const Napi::CallbackInfo &info);
    Napi::Value isButtonPressed(const Napi::CallbackInfo &info);
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    static void deleteAllHotkeys(const Napi::CallbackInfo &info);
    static void unregisterAllHotkeys(const Napi::CallbackInfo &info);

private:
    std::set<TsfnContext *>::iterator it;
    static Napi::FunctionReference constructor;
    static std::set<TsfnContext *> hotkeyPointers;
    static void messagesGetter(TsfnContext *context);
    static void unregisterDuplicate(UINT keyCode);
};

#endif

#pragma once
#ifndef HOTKEY_H
#define HOTKEY_H

#include "includes.hpp"

typedef struct
{
    bool exist = true;
    bool reassignment = false;
    UINT keyCode;
    Napi::ThreadSafeFunction tsfn;
} TsfnContext;

class Hotkey : public Napi::ObjectWrap<Hotkey>
{
public:
    Hotkey(const Napi::CallbackInfo &info);
    void unregisterHotkey(const Napi::CallbackInfo &info);
    void reassignmentHotkey(const Napi::CallbackInfo &info);
    Napi::Value isButtonPressed(const Napi::CallbackInfo &info);
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    static void unregisterAllHotkeys(const Napi::CallbackInfo &info);

private:
    std::set<TsfnContext *>::iterator it;
    static Napi::FunctionReference constructor;
    static std::set<TsfnContext *> hotkeyPointers;
    static void messagesGetter(TsfnContext *context);
};

#endif

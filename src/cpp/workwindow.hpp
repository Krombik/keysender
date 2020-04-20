#pragma once
#ifndef WORKWINDOW_H
#define WORKWINDOW_H

#include "types.hpp"

Napi::Value getAllWindows(const Napi::CallbackInfo &info);
Napi::Value getWindowChildren(const Napi::CallbackInfo &info);
Napi::Value getScreenSize(const Napi::CallbackInfo &info);

class Workwindow
{
public:
    Napi::Value capture(const Napi::CallbackInfo &info);
    Napi::Value getColor(const Napi::CallbackInfo &info);
    Napi::Value isForeground(const Napi::CallbackInfo &info);
    Napi::Value isOpen(const Napi::CallbackInfo &info);
    void setForeground(const Napi::CallbackInfo &info);
    void kill(const Napi::CallbackInfo &info);
    void close(const Napi::CallbackInfo &info);
    static Napi::Object windowGetter(HWND hWnd, Napi::Env env);
    static std::wstring bufferToWstring(Napi::Value val);

protected:
    HWND hWnd = NULL;
    std::wstring titleName, className, childTitleName, childClassName;
    void setWorkwindow(const Napi::CallbackInfo &info);
    Napi::Value getWorkwindow(const Napi::CallbackInfo &info);
    void setWindowView(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getWindowView(const Napi::CallbackInfo &info);
};

#endif

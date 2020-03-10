#include <windows.h>
#include <tchar.h>
#include <chrono>
#include <thread>
#include "workwindow.hpp"

BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd) || GetWindowTextLengthA(hWnd) == 0)
        return TRUE;
    std::vector<HWND> &hWnds =
        *reinterpret_cast<std::vector<HWND> *>(lParam);
    hWnds.push_back(hWnd);
    return TRUE;
}

Napi::Value getAllOpenWindowsList(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    std::vector<HWND> hWnds;
    EnumWindows(EnumWindowsProc, reinterpret_cast<LPARAM>(&hWnds));
    Napi::Array windows = Napi::Array::New(env);
    for (const HWND &hWnd : hWnds)
    {
        std::wstring title(GetWindowTextLengthA(hWnd) + 1, L'\0');
        GetWindowTextW(hWnd, &title[0], title.size());
        Napi::Array titleA = Napi::Array::New(env);
        for (size_t i = 0; i < title.length() - 1; i++)
            titleA[i] = Napi::Number::New(env, DWORD(title.at(i)));
        Napi::Object window = Napi::Object::New(env);
        window["handle"] = Napi::Number::New(env, HandleToLong(hWnd));
        window["title"] = titleA;
        windows[windows.Length()] = window;
    }
    return windows;
}

void Workwindow::sleep(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1)
        Napi::Error::New(env, "Expected exactly 1 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Napi::Error::New(env, "Expected an Number")
            .ThrowAsJavaScriptException();
    std::this_thread::sleep_for(std::chrono::milliseconds(info[0].As<Napi::Number>().Int32Value()));
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    if (info[0].IsArray())
    {
        const Napi::Array name = info[0].As<Napi::Array>();
        std::wstring nameS;
        for (size_t i = 0; i < name.Length(); i++)
            nameS[i] = DWORD(name[i].As<Napi::Number>().Int32Value());
        this->hWnd = FindWindowW(NULL, LPCWSTR(nameS.c_str()));
    }
    else if (info[0].IsNumber())
    {
        this->hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
    }
};
Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::Object workwindow = Napi::Object::New(env);
    Napi::Array titleA = Napi::Array::New(env);
    HWND hWnd = this->hWnd;
    std::wstring title(GetWindowTextLengthA(hWnd) + 1, L'\0');
    GetWindowTextW(hWnd, &title[0], title.size());
    for (size_t i = 0; i < title.length() - 1; i++)
        titleA[i] = Napi::Number::New(env, DWORD(title.at(i)));
    workwindow["title"] = titleA;
    workwindow["handle"] = Napi::Number::New(env, HandleToLong(hWnd));
    return workwindow;
};

Napi::Value Workwindow::isForeground(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), this->hWnd == GetForegroundWindow());
};

Napi::Value Workwindow::isOpen(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), IsWindow(this->hWnd));
};

void Workwindow::setForeground(const Napi::CallbackInfo &info)
{
    SetForegroundWindow(this->hWnd);
};
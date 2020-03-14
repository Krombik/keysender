#include <windows.h>
#include <chrono>
#include <thread>
#include <iostream>
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

BOOL CALLBACK EnumChildProc(HWND hWnd, LPARAM lParam)
{
    if (!IsWindowVisible(hWnd) || !IsWindowEnabled(hWnd))
        return TRUE;
    std::vector<HWND> &chWnds =
        *reinterpret_cast<std::vector<HWND> *>(lParam);
    chWnds.push_back(hWnd);
    return TRUE;
}

Napi::Value getWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() == 0)
    {
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
            char className[256];
            GetClassNameA(hWnd, className, 256);
            Napi::Object window = Napi::Object::New(env);
            window["handle"] = Napi::Number::New(env, HandleToLong(hWnd));
            window["className"] = className;
            window["title"] = titleA;
            windows[windows.Length()] = window;
        }
        return windows;
    }
    if (!info[0].IsString() && !info[0].IsArray())
        Napi::Error::New(env, "Expected an String or Array")
            .ThrowAsJavaScriptException();
    if (info[0].IsArray())
    {
        const Napi::Array name = info[0].As<Napi::Array>();
        std::wstring nameS;
        for (size_t i = 0; i < name.Length(); i++)
            nameS[i] = DWORD(name[i].As<Napi::Number>().Int32Value());
        return Napi::Number::New(env, HandleToLong(FindWindowW(NULL, LPCWSTR(nameS.c_str()))));
    }
    return Napi::Number::New(env, HandleToLong(FindWindowA(std::string(info[0].As<Napi::String>()).c_str(), NULL)));
}

Napi::Value getWindowChild(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    if (info.Length() == 0)
        Napi::Error::New(env, "Expected exactly 1-2 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Napi::Error::New(env, "Expected an Number")
            .ThrowAsJavaScriptException();
    if (info.Length() == 1)
    {
        std::vector<HWND> chWnds;
        EnumChildWindows((HWND)info[0].As<Napi::Number>().Int64Value(), EnumChildProc, reinterpret_cast<LPARAM>(&chWnds));
        Napi::Array children = Napi::Array::New(env);
        if (!chWnds.empty())
            for (const HWND &hWnd : chWnds)
            {
                char className[256];
                GetClassNameA(hWnd, className, 256);
                Napi::Object child = Napi::Object::New(env);
                child["handle"] = Napi::Number::New(env, HandleToLong(hWnd));
                child["className"] = Napi::String::New(env, className);
                children[children.Length()] = child;
            }
        return children;
    }
    return Napi::Number::New(env, HandleToLong(FindWindowExA((HWND)info[0].As<Napi::Number>().Int64Value(), NULL, std::string(info[1].As<Napi::String>()).c_str(), NULL)));
}

void sleep(const Napi::CallbackInfo &info)
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

Napi::Value Workwindow::capture(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    RECT area;
    int16_t width, height;
    if (info.Length() == 0)
    {
        GetClientRect(hWnd, &area);
        width = area.right - area.left;
        height = area.bottom - area.top;
    }
    else if (info.Length() != 4 || !info[0].IsNumber() || !info[1].IsNumber() || !info[2].IsNumber() || !info[3].IsNumber())
        Napi::Error::New(env, "Expected 4 Number arguments")
            .ThrowAsJavaScriptException();
    else
    {
        width = info[2].As<Napi::Number>().Int32Value();
        height = info[3].As<Napi::Number>().Int32Value();
        area.left = info[0].As<Napi::Number>().Int32Value();
        area.top = info[1].As<Napi::Number>().Int32Value();
        area.right = area.left + width;
        area.bottom = area.top + height;
    }
    const uint32_t size = width * height * 4;
    HDC context = GetDC(hWnd);
    BITMAPINFO bi;
    bi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
    bi.bmiHeader.biWidth = width;
    bi.bmiHeader.biHeight = -height;
    bi.bmiHeader.biPlanes = 1;
    bi.bmiHeader.biBitCount = 32;
    bi.bmiHeader.biCompression = BI_RGB;
    bi.bmiHeader.biSizeImage = 0;
    bi.bmiHeader.biXPelsPerMeter = 0;
    bi.bmiHeader.biYPelsPerMeter = 0;
    bi.bmiHeader.biClrUsed = 0;
    bi.bmiHeader.biClrImportant = 0;
    uint8_t *pixels;
    HDC memDC = CreateCompatibleDC(context);
    HBITMAP section = CreateDIBSection(context, &bi, DIB_RGB_COLORS, (void **)&pixels, 0, 0);
    DeleteObject(SelectObject(memDC, section));
    BitBlt(memDC, 0, 0, width, height, context, area.left, area.top, SRCCOPY);
    DeleteDC(memDC);
    for (uint32_t i = 0; i < size; i += 4)
        std::swap(pixels[i], pixels[i + 2]);
    Napi::Object returnValue = Napi::Object::New(env);
    returnValue["data"] = Napi::Buffer<uint8_t>::Copy(env, pixels, size);
    returnValue["width"] = width;
    returnValue["height"] = height;
    DeleteObject(section);
    return returnValue;
}

void Workwindow::setWorkwindow(const Napi::CallbackInfo &info, const Napi::Value &value)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1)
        Napi::Error::New(env, "Expected exactly 1 arguments")
            .ThrowAsJavaScriptException();
    if (!info[0].IsNumber())
        Napi::Error::New(env, "Expected an Number")
            .ThrowAsJavaScriptException();
    hWnd = (HWND)info[0].As<Napi::Number>().Int64Value();
};

Napi::Value Workwindow::getWorkwindow(const Napi::CallbackInfo &info)
{
    Napi::Env env = info.Env();
    Napi::Object workwindow = Napi::Object::New(env);
    Napi::Array titleA = Napi::Array::New(env);
    std::wstring title(GetWindowTextLengthA(hWnd) + 1, L'\0');
    GetWindowTextW(hWnd, &title[0], title.size());
    for (size_t i = 0; i < title.length() - 1; i++)
        titleA[i] = Napi::Number::New(env, DWORD(title.at(i)));
    char className[256];
    GetClassNameA(hWnd, className, 256);
    workwindow["title"] = titleA;
    workwindow["className"] = className;
    workwindow["handle"] = Napi::Number::New(env, HandleToLong(hWnd));
    return workwindow;
};

Napi::Value Workwindow::isForeground(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), hWnd == GetForegroundWindow());
};

Napi::Value Workwindow::isOpen(const Napi::CallbackInfo &info)
{
    return Napi::Boolean::New(info.Env(), IsWindow(hWnd));
};

void Workwindow::setForeground(const Napi::CallbackInfo &info)
{
    SetForegroundWindow(hWnd);
};
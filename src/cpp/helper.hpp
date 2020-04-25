#pragma once
#ifndef HELPER_H
#define HELPER_H

#include "types.hpp"

class Helper
{
public:
    static std::wstring bufferToWstring(Napi::Value val);
    static std::wstring classNameGetter(HWND hWnd);
    static std::wstring titleGetter(HWND hWnd);
    static Napi::Object windowGetter(HWND hWnd, Napi::Env env);
    static BOOL CALLBACK EnumWindowsProc(HWND hWnd, LPARAM lParam);
    static BOOL CALLBACK EnumAllWindowsProc(HWND hWnd, LPARAM lParam);
    static BOOL CALLBACK EnumChildrenProc(HWND hWnd, LPARAM lParam);
    static bool getKeyCode(Napi::Value key, UINT *keyCode);
    static const std::map<std::string, UINT> keysDef;
    static Napi::Object imgGetter(Napi::Env env, uint8_t *pixels, int height, int width, std::string format, uint8_t threshold);
};

#endif
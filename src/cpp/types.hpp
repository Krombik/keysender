#include "includes.hpp"
#pragma once
#ifndef TYPES_H
#define TYPES_H

#define SOME_NUMBER 5
#define NONEXISTENT_VIRTUAL_KEY 255

typedef enum
{
    HOTKEY_REGISTERED,
    HOTKEY_REASSIGNMENT,
    HOTKEY_UNREGISTERED,
    HOTKEY_DELETED
} HotkeyState;

typedef struct
{
    HotkeyState state = HOTKEY_REGISTERED;
    UINT keyCode;
    Napi::ThreadSafeFunction tsfn;
} TsfnContext;

typedef struct
{
    HWND hWnd = NULL;
    std::wstring className;
    std::wstring title;
} WindowInfo;

typedef struct _BITMAP : BITMAPINFO
{
    _BITMAP(int height, int width)
    {
        bmiHeader.biWidth = width;
        bmiHeader.biHeight = -height;
        bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
        bmiHeader.biPlanes = 1;
        bmiHeader.biBitCount = 32;
        bmiHeader.biCompression = BI_RGB;
        bmiHeader.biSizeImage = 0;
        bmiHeader.biXPelsPerMeter = 0;
        bmiHeader.biYPelsPerMeter = 0;
        bmiHeader.biClrUsed = 0;
        bmiHeader.biClrImportant = 0;
    }
} MAKEBITMAPINFO;

#endif
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
    HWND hWnd= NULL;
    std::wstring className;
    std::wstring title;
} WindowInfo;

#endif
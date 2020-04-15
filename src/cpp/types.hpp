#include "includes.hpp"
#pragma once
#ifndef TYPES_H
#define TYPES_H

typedef struct
{
    bool exist = true;
    bool reassignment = false;
    UINT keyCode;
    Napi::ThreadSafeFunction tsfn;
} TsfnContext;

typedef struct
{
    long handle;
    std::vector<wchar_t> className;
    std::vector<wchar_t> title;
} Window;

#endif
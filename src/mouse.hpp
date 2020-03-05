#ifndef MOUSE_H
#define MOUSE_H

#include <napi.h>
#include <iostream>
#include <map>
#include <winuser.h>

class Mouse
{
public:
    void toogleMb(const Napi::CallbackInfo &info);
    void move(const Napi::CallbackInfo &info);
    void scrollWheel(const Napi::CallbackInfo &info);

private:
    virtual void mbToogler(std::string button, bool isButtonDown) = 0;
    virtual void mover(int x, int y, bool isAbsolute) = 0;
    virtual void wheelScroller(int x) = 0;
};
#endif
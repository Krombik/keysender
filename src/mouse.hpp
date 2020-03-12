#ifndef MOUSE_H
#define MOUSE_H

#include <napi.h>
#include <iostream>
#include <map>
#include <winuser.h>

class Mouse
{
public:
    Napi::Value getMousePos(const Napi::CallbackInfo &info);
    void toogleMb(const Napi::CallbackInfo &info);
    void move(const Napi::CallbackInfo &info);
    void scrollWheel(const Napi::CallbackInfo &info);

protected:
    POINT lastCoords;
    void setLastCoords(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getLastCoords(const Napi::CallbackInfo &info);
    virtual void mousePosGetter(POINT *coords) = 0;
    virtual void mbToogler(std::string button, bool isButtonDown) = 0;
    virtual void mover(int x, int y, bool isAbsolute) = 0;
    virtual void wheelScroller(int x) = 0;
};
#endif
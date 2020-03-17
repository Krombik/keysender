#ifndef MOUSE_H
#define MOUSE_H

#include <napi.h>
#include <iostream>
#include <map>
#include <array>
#include <winuser.h>

class Mouse
{
public:
    Napi::Value getMousePos(const Napi::CallbackInfo &info);
    void toogleMb(const Napi::CallbackInfo &info);
    void move(const Napi::CallbackInfo &info);
    void scrollWheel(const Napi::CallbackInfo &info);

private:
    std::array<std::string, 3> buttonsName = {"left", "right", "middle"};

protected:
    POINT lastCoords = {0, 0};
    bool saveMod = false;
    void setLastCoords(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getLastCoords(const Napi::CallbackInfo &info);
    void setSaveMod(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getSaveMod(const Napi::CallbackInfo &info);
    virtual void mousePosGetter(POINT *coords) = 0;
    virtual void mbToogler(int8_t button, bool isButtonDown) = 0;
    virtual void mover(int x, int y, bool isAbsolute) = 0;
    virtual void wheelScroller(int x) = 0;
};
#endif
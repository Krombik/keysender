#pragma once
#ifndef MOUSE_H
#define MOUSE_H

#include "includes.hpp"

class Mouse
{
public:
    Napi::Value getMousePos(const Napi::CallbackInfo &info);
    void toggleMb(const Napi::CallbackInfo &info);
    void move(const Napi::CallbackInfo &info);
    void scrollWheel(const Napi::CallbackInfo &info);

private:
    std::array<std::string, 3> buttonsName = {"left", "right", "middle"};

protected:
    POINT lastCoords = {0, 0};
    bool saveMod = false;
    void setSaveMod(const Napi::CallbackInfo &info, const Napi::Value &value);
    Napi::Value getSaveMod(const Napi::CallbackInfo &info);
    virtual void mousePosGetter(POINT *coords) = 0;
    virtual void mbToggler(uint8_t button, bool isButtonDown) = 0;
    virtual void mover(POINT coords, bool isAbsolute) = 0;
    virtual void wheelScroller(int x) = 0;
};
#endif
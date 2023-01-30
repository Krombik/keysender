#pragma once
#ifndef DISABLE_INPUT_H
#define DISABLE_INPUT_H

#include "types.hpp"

struct DisableInputContext {
  WPARAM down = 0;
  WPARAM action;
  int16_t vkCode = 0;

  bool operator<(const DisableInputContext &other) const {
    return action < other.action || vkCode < other.vkCode;
  }
};

struct BlockedInput {
  WPARAM wParam;
  int16_t vkCode = 0;

  BlockedInput(WPARAM wParam, int16_t vkCode) {
    this->wParam = wParam;
    this->vkCode = vkCode;
  };

  bool operator<(const BlockedInput &other) const {
    return wParam < other.wParam || vkCode < other.vkCode;
  }
};

struct DisableInputData {
  std::set<DisableInputContext> disabled;
  std::set<DisableInputContext> enabled;
  bool inverted = false;
  HHOOK hhk = nullptr;
  std::set<LONG> pressedButtons;
};

struct MouseInput {
  std::string button;
  bool state;

  MouseInput(std::string button, bool state) {
    this->button = button;
    this->state = state;
  };
};

class DisableInput {
 public:
  static Napi::Value call(const Napi::CallbackInfo &info);

 private:
  static Napi::Object mapBlockedItem(const Napi::Env &env, const BlockedInput &blockedInput, std::map<BlockedInput, Napi::Object> &itemMap);
  static MouseInput getMouseInput(const BlockedInput &blockedInput);
  static bool check(DisableInputData &data, WPARAM wParam, int16_t key);
  static LRESULT CALLBACK KeyboardHookProc(int nCode, WPARAM wParam, LPARAM lParam);
  static LRESULT CALLBACK MouseHookProc(int nCode, WPARAM wParam, LPARAM lParam);
  static DisableInputContext handleMouse(const Napi::Value &action);
  static DisableInputContext handleKeyboard(const Napi::Value &action);
  static void cleanup(DisableInputData &data);
  static void disable(DisableInputData &data, const Napi::Value &value, std::function<DisableInputContext(Napi::Value)> handleItem, int idHook, HOOKPROC lpfn);
  static void enable(DisableInputData &data, const Napi::Value &value, std::function<DisableInputContext(Napi::Value)> handleItem, size_t count);
  static DisableInputData mouse;
  static DisableInputData keyboard;
  static std::vector<BlockedInput> blockedInputs;
  static const std::map<int, int> downUpMap;
};

#endif

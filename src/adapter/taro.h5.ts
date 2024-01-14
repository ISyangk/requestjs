import Taro from "@tarojs/taro";

export function redirectTo(option: Taro.redirectTo.Option) {
  return Taro.redirectTo(option);
}

export function showToast(option: Taro.showToast.Option | undefined) {
  return Taro.showToast(option).catch(() => {});
}

export function getStorageSync(key: string) {
  return localStorage.getItem(key) || "{}";
}

export function setStorageSync(key: string, data: string) {
  return localStorage.setItem(key, data);
}

export function removeStorageSync(key: string) {
  return localStorage.removeItem(key);
}

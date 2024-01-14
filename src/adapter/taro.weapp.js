import Taro from "@tarojs/taro";
import wx from 'weixin-js-sdk';

export function redirectTo(option) {
  return Taro.redirectTo(option);
}

export function showToast(option) {
  return Taro.showToast(option);
}

export function getStorageSync(key) {
  return wx.getStorageSync(key);
}

export function setStorageSync(key, data) {
  return wx.setStorageSync(key, data);
}

export function removeStorageSync(key) {
  return wx.removeStorageSync(key);
}

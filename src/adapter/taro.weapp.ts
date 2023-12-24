import Taro from "@tarojs/taro";

export function previewImage(option) {
  return Taro.previewImage(option);
}

export function switchTab(option) {
  return Taro.switchTab(option);
}

export function reLaunch(option) {
  return Taro.reLaunch(option);
}

export function navigateTo(option) {
  return Taro.navigateTo(option);
}

export function redirectTo(option) {
  return Taro.redirectTo(option);
}

export function navigateBack() {
  return Taro.navigateBack();
}

export function setNavigationBarTitle(option) {
  return Taro.setNavigationBarTitle(option);
}

export function stopPullDownRefresh() {
  return Taro.stopPullDownRefresh();
}

export function pageScrollTo(option) {
  return Taro.pageScrollTo(option);
}

export function showToast(option) {
  return Taro.showToast(option);
}

export function showModal(option) {
  return Taro.showModal(option);
}

export function showLoading(option) {
  return Taro.showLoading(option);
}

export function hideLoading() {
  return Taro.hideLoading();
}

export function atMessage(option) {
  return Taro.atMessage(option);
}

export function pxTransform(size) {
  return Taro.pxTransform(size);
}

export function getSystemInfo(res) {
  return Taro.getSystemInfo(res);
}

export function canIUse(fun) {
  return Taro.canIUse(fun);
}

export function createSelectorQuery() {
  return Taro.createSelectorQuery();
}

export function getUpdateManager() {
  return Taro.getUpdateManager();
}

export function createVideoContext() {
  return Taro.createVideoContext("myVideo");
}

export function setNavigationBarColor(option) {
  return Taro.setNavigationBarColor(option);
}

export function getSystemInfoSync() {
  return wx.getSystemInfoSync();
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

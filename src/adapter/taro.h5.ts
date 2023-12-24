import Taro from "@tarojs/taro";

export function previewImage(option: Taro.previewImage.Option) {
  return Taro.previewImage(option);
}

export function switchTab(option: Taro.switchTab.Option) {
  return Taro.switchTab(option);
}

export function reLaunch(option: Taro.reLaunch.Option) {
  return Taro.reLaunch(option);
}

export function navigateTo(option: Taro.navigateTo.Option) {
  return Taro.navigateTo(option);
}

export function redirectTo(option: Taro.redirectTo.Option) {
  return Taro.redirectTo(option);
}

export function navigateBack() {
  return Taro.navigateBack();
}

export function setNavigationBarTitle(option: Taro.setNavigationBarTitle.Option) {
  return Taro.setNavigationBarTitle(option);
}

export function stopPullDownRefresh() {
  return Taro.stopPullDownRefresh();
}

export function pageScrollTo(option: Taro.pageScrollTo.Option) {
  return Taro.pageScrollTo(option);
}

export function showToast(option: Taro.showToast.Option | undefined) {
  return Taro.showToast(option).catch(() => {});
}

export function showModal(option: Taro.showModal.Option | undefined) {
  return Taro.showModal(option);
}

export function showLoading(option: Taro.showLoading.Option | undefined) {
  return Taro.showLoading(option);
}

export function hideLoading() {
  return Taro.hideLoading();
}

export function atMessage(option: any) {
  return Taro.atMessage(option);
}

export function pxTransform(size: number, designWidth = 750) {
  return Taro.pxTransform(size, designWidth);
}

export function getSystemInfo(res: Taro.getSystemInfo.Option | undefined) {
  return Taro.getSystemInfo(res);
}

export function canIUse(fun: string) {
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

export function getSystemInfoSync() {
  return navigator.userAgent.toLowerCase();
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

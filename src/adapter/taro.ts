import Taro from "@tarojs/taro";
import dd from "dingtalk-jsapi";
// import dd from "@tarojs/plugin-platform-alipay-dd";

export function previewImage(option: Taro.previewImage.Option) {
  return Taro.previewImage(option);
}

export function switchTab(option: any) {
  return dd.switchTab(option);
}

export function reLaunch(option: any) {
  return dd.reLaunch(option);
}

export function navigateTo(option: any) {
  return dd.navigateTo(option);
}

export function redirectTo(option: any) {
  return dd.redirectTo(option);
}

export function navigateBack() {
  return dd.navigateBack();
}

export function setNavigationBarTitle(option: any) {
  return dd.setNavigationBar(option);
}

export function stopPullDownRefresh() {
  return dd.stopPullDownRefresh();
}

export function pageScrollTo(option: any) {
  return dd.pageScrollTo(option);
}

export function showToast({ title, icon, ...option }) {
  return dd.showToast({
    ...option,
    type: icon || "none",
    content: title,
  });
}

export function showModal(option: any) {
  return dd.confirm({
    ...option,
    confirmButtonText: "确认",
    cancelButtonText: "取消",
  });
}

export function showLoading({ title, ...option }) {
  return dd.showLoading({
    ...option,
    content: title,
  });
}

export function hideLoading() {
  return dd.hideLoading();
}

export function atMessage(option: any) {
  return Taro.atMessage(option);
}

export function pxTransform(this: any, size: string) {
  // return Taro.pxTransform(size);
  const _ref = this.config || {},
    _ref$designWidth = _ref.designWidth,
    designWidth = _ref$designWidth === void 0 ? 750 : _ref$designWidth,
    _ref$deviceRatio = _ref.deviceRatio,
    deviceRatio =
      _ref$deviceRatio === void 0
        ? {
            640: 2.34 / 2,
            750: 1,
            828: 1.81 / 2,
          }
        : _ref$deviceRatio;

  if (!(designWidth in deviceRatio)) {
    throw new Error(
      "deviceRatio \u914D\u7F6E\u4E2D\u4E0D\u5B58\u5728 ".concat(
        designWidth,
        " \u7684\u8BBE\u7F6E\uFF01"
      )
    );
  }

  return parseInt(size, 10) * deviceRatio[designWidth] + "rpx";
}

export function getSystemInfo(res: any) {
  return dd.getSystemInfo(res);
}

export function canIUse(fun: any) {
  return dd.canIUse(fun);
}

export function createSelectorQuery() {
  return dd.createSelectorQuery();
}

export function getUpdateManager() {
  return dd.getUpdateManager();
}

export function createVideoContext() {
  return dd.createVideoContext("ddVideo");
}

export function getSystemInfoSync() {
  return dd.getSystemInfoSync();
}

export function getStorageSync(key: any) {
  const { data: res } = dd.getStorageSync({ key }) || {};
  return res;
}

export function setStorageSync(key: any, data: any) {
  return dd.setStorageSync({ key, data });
}

export function removeStorageSync(key: any) {
  return dd.removeStorageSync({ key });
}

// export function onCheckForUpdate(callback) {
//   return dd.onCheckForUpdate(callback);
// }

// export function onUpdateReady(callback) {
//   return dd.onUpdateReady(callback);
// }

// export function applyUpdate() {
//   return dd.applyUpdate();
// }

// export function onUpdateFailed(callback) {
//   return dd.onUpdateFaile(callback);
// }

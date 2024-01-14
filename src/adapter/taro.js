import Taro from "@tarojs/taro";
import dd from "dingtalk-jsapi";
// import dd from "@tarojs/plugin-platform-alipay-dd";

export function redirectTo(option) {
  return dd.redirectTo(option);
}

export function showToast({ title, icon, ...option }) {
  return dd.showToast({
    ...option,
    type: icon || "none",
    content: title,
  });
}

export function getStorageSync(key) {
  const { data: res } = dd.getStorageSync({ key }) || {};
  return res;
}

export function setStorageSync(key, data) {
  return dd.setStorageSync({ key, data });
}

export function removeStorageSync(key) {
  return dd.removeStorageSync({ key });
}

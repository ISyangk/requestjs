import * as Taro from "@/adapter/taro";

// eslint-disable-next-line no-unused-vars
export const showErrorMsg = (e, isToast = false) => {
  const msg = e.errMsg || e || "出现错误";
  Taro.showToast({
    title: msg,
    icon: "none",
    duration: 2000
  });
};

export const showToast = msg => {
  Taro.showToast({
    title: msg,
    icon: "none",
    duration: 2000
  });
};
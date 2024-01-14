import hxHybrid from "@hx/fe-common-hybrid";
import { getCookiesStr } from "./cookie";

// 请求挂起在小程序端，header数据格式问题转换
export function transformHeaders(params) {
    const { headers: header, ...args } = params;
    let headers = {};
    if (header instanceof Array) {
      header.forEach((item) => {
        headers = Object.assign(headers, item);
      });
      return {
        ...args,
        headers: { ...headers, Cookie: getCookiesStr() },
      };
    } else {
      return params;
    }
  }

  const isUaMatchRegex = (regex) => {
    const ua = navigator.userAgent.toLowerCase();
    const match = ua.match(regex);
    return match && match.length > 0;
  };

  export const isInSptApp = () => {
    const regex = /spt\/\d+[.]\d+[.]\d+/;
    return isUaMatchRegex(regex);
  };

  export const isInAqmApp = () => {
    const regex = /aqm\/\d+[.]\d+[.]\d+/;
    return isUaMatchRegex(regex);
  };
  
  export const isInApp = isInSptApp() || isInAqmApp();

  export const tellAppToLogin = (msg) => {
    if (!isInApp) {
      return;
    }
    try {
      hxHybrid.Core.sendMessage({
        moduleName: "Common",
        actionName: "kickOut",
        params: { msg },
      });
    } catch (e) {
      console.warn(e);
    }
  };
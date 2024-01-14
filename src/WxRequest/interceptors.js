import Taro, { getCurrentInstance } from "@tarojs/taro";
import { stringify } from "qs";

import { getLocationSearch } from "@/utils";
import { getCookiesStr, setCookie, setCookieFromHeader } from "../utils/cookie.weapp.js";

const loginPage = `/pages/user/login/index`;
/**
 * http 状态码拦截器
 */
const customInterceptor = (chain) => {
  const requestParams = chain.requestParams;
  const { url, doCookieFromHeaderfn, } = requestParams;
  const header = requestParams.header || {};
  delete requestParams.ignoreErrorMsg;
  return chain
    .proceed({
      ...requestParams,
      header: {
        ...header,
        Cookie: getCookiesStr(),
        "content-type": header.contentType || "application/json",
      },
    })
    .then((res) => {
      if (doCookieFromHeaderfn) {
        doCookieFromHeaderfn();
      } else {
        setCookieFromHeader(res.header["Set-Cookie"] || res.header["set-cookie"]);
      }
      
      if (res.statusCode === 200) {
        return res.data;
      } else if (res.statusCode === 404) {
        return Promise.reject({
          code: res.statusCode,
          msg: `[${url}] 请求资源不存在`,
        });
      } else if (res.statusCode === 502 || res.statusCode === 500) {
        return Promise.reject({
          code: res.statusCode,
          msg: res?.data?.message || `[${url}] 服务端出现了问题`,
        });
      } else if (res.statusCode === 403) {
        return Promise.reject({ code: res.statusCode, msg: "没有权限访问" });
      } else if (res.statusCode === 401) {
        return Promise.reject({ code: res.statusCode, msg: "需要鉴权" });
      } else {
        return Promise.reject({ code: res.statusCode, msg: "出现错误" });
      }
    });
};

/**
 * 自定义状态码拦截器
 *   - noCheckDataCode 通过此字段可配置跳过拦截
 */
const hxInterceptor = (chain) => {
  const requestParams = chain.requestParams;
  const { noCheckDataCode = false, cbFn_401, noTenantCodeCbFn } = requestParams;

  if (noCheckDataCode) {
    return chain.proceed(requestParams);
  }

  return chain
    .proceed(requestParams)
    .then((res) => {
      if (res.code === 200) {
        return res.data;
      }

      const { params, path } = getCurrentInstance().router;
      let { scene } = params; // scene [tenantId, inviteCode, expiresTime]

      // 扫普通链接打开小程序参数解析
      const qrOption = params.q;
      const { tenantId } = getLocationSearch(decodeURIComponent(qrOption));

      if (qrOption && tenantId) {
        scene = tenantId;
      }

      if (res.code === 401) {
        // 401 回调函数
        if (cbFn_401) {
          cbFn_401();
        } else {
          if (path && !path.includes(loginPage)) {
            setCookie({
              BEFORE_LOGIN_PAGE: path,
              BEFORE_LOGIN_PAGE_OPTION: stringify(params),
            });
          }
  
          Taro.redirectTo({
            url: scene ? `${loginPage}?scene=${scene}` : loginPage,
          });
        }
        
        return Promise.reject({ code: res.code, msg: "没有权限访问" });
      }

      // 没有租户的用户跳转验证企业
      if (res.code === 1100) {
        if (noTenantCodeCbFn) {
          noTenantCodeCbFn();
        } else {
          const verifyCodePage = `/pages/user/company/index`;
          Taro.redirectTo({
            url: scene ? `${verifyCodePage}?scene=${scene}` : verifyCodePage,
          });
        }
        return Promise.reject({ code: res.code, msg: "没有租户的用户" });
      }

      // res.msg === "用户不存在"
      if (res.code === 802) {
        return Promise.reject({
          code: res.code,
          msg: res.msg || "用户不存在，请切换企业或联系管理员",
        });
      }

      return Promise.reject({
        code: res.code,
        msg: res.msg?.length < 50 ? res.msg : "系统开小差了",
      });
    })
    .catch((err) => {
      return Promise.reject({
        msg: err.errMsg ? '网络连接异常，请连接后重试' : err.msg,
        code: err.code || -1,
      });
    });
};

const interceptors = [
  hxInterceptor,
  customInterceptor,
  Taro.interceptors.logInterceptor,
];

export default interceptors;

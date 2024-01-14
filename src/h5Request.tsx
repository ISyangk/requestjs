/* eslint-disable no-throw-literal */
import Taro, { getCurrentInstance } from "@tarojs/taro";
// import axios from "axios";
import { extend } from 'umi-request';
import { stringify } from "qs";

import { isInApp, tellAppToLogin } from "./utils/common";
import { showErrorMsg } from "./utils/msg";

import { getSign, getTimestamp } from "./utils/sign";

import { OptionsType, MConfigObject } from "./Types";

const loginPage = `/pages/user/login/index`;

type RouterType = {
    params: any,
    path: any,
    [propName: string]: any,
};
// 业务状态码拦截器
const customErr = (response: { code: number; data: any; msg: any; message: any; }) => {
    const { params: customParams, path: pagePath } = getCurrentInstance().router as RouterType;
    // params可能为undefined
    const scene = customParams && customParams.scene;
  
    if (response.code === 200) {
      return response.data;
    }
  
    if (response.code === 401) {
      const [currentPage] = pagePath.split("?");
  
      if (currentPage && !currentPage.includes(loginPage)) {
        localStorage.setItem("BEFORE_LOGIN_PAGE", loginPage);
        localStorage.setItem("BEFORE_LOGIN_PAGE_OPTION", stringify(customParams));
      }
      if (isInApp) {
        tellAppToLogin(response?.msg);
      }
  
      if (currentPage !== loginPage) {
        Taro.redirectTo({
          url: scene ? `${loginPage}?scene=${scene}` : loginPage,
        });
      }
      throw { message: "没有权限访问", code: response.code };
    }
  
    // 没有租户的用户跳转验证企业
    if (response.code === 1100) {
      const verifyCodePage = `/pages/user/company/index`;
      Taro.redirectTo({
        url: scene ? `${verifyCodePage}?scene=${scene}` : verifyCodePage,
      });
      throw { message: "没有租户的用户", code: response.code };
    }
  
    // response.msg === "用户不存在"
    if (response.code === 802) {
      throw {
        message: response.msg || "用户不存在，请切换企业或联系管理员",
        code: response.code,
      };
    }
  
    const message = response.msg || response.message;
  
    throw {
      message: message?.length < 50 ? message : "系统开小差了",
      code: response.code,
    };
  };
  
  const requestInterceptor = (url: string, options: any) => {
    // Add your logic for request interception here
    return options;
  };
  
  const responseInterceptor = (response: any) => {
    // Add your logic for response interception here
    switch (response.status) {
      case 200:
        try {
          const { noCheckDataCode, ...res } = response.data;
          if (noCheckDataCode) {
            return res;
          }
  
          return customErr(response);
        } catch (err) {
          return Promise.reject(err);
        }
      case 401:
        return Promise.reject({ code: response.status, message: "需要鉴权" });
      case 404:
        return Promise.reject({
          code: response.status,
          message: `[${response.url}] 请求资源不存在`,
        });
      case 403:
        return Promise.reject({ code: response.status, message: "没有权限访问" });
      case 502:
      case 500:
        console.log(
          response?.data?.message ||
            `[${response.url}] 服务端出现了问题`
        );
        break;
      default:
        return Promise.reject({ code: response.status, message: "系统开小差了" });
    }
  };
  
  const errorInterceptor = (error: { response: { data: { message: any; msg: any; code: any; }; }; }) => {
    // Add your logic for error interception here
    if (error.response?.data) {
      return Promise.reject({
        message: error.response.data.message || error.response.data.msg,
        code: error.response.data.code,
      });
    }
    return Promise.reject({ message: "NET_ERROR", code: -1 });
  };

  const instanceRequest = extend({
    timeout: 1000,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    interceptors: [requestInterceptor, responseInterceptor, errorInterceptor],
  });

class HttpRequest {
    API_URL: string;
    APP_KEY: string;
    APP_SECRET: string;
    MOCK_URL?: string;
    NET_ERROR?: any;

    constructor(props: { config: MConfigObject, }) {
        const { config: { API_URL, APP_KEY, APP_SECRET, MOCK_URL, NET_ERROR } } = props;
        this.API_URL = API_URL
        this.APP_KEY = APP_KEY
        this.APP_SECRET = APP_SECRET;
        this.MOCK_URL = MOCK_URL;
        this.NET_ERROR = NET_ERROR;
    }
  /**
   * 网络请求基础方法，
   * @param {Object} params 请求参数
   *   - url {String}                        【必传】请求路径，不包含协议 + 域名 + 端口
   *   - data {Object|undefined}             【可选】请求携带的数据
   *   - header {Object|undefined}           【可选】请求携带的头部
   *   - noCheckDataCode {Boolean|undefined} 【可选】【默认为 false】是否需要数据鉴权
   * @param {String} method 请求方法 GET | POST | PUT | DELETE | HEAD
   * @param {String} baseUrl 请求 URL 前缀，协议 + 域名 + 端口
   * @return {Object} 返回 Promise 实例
   */
  baseOptions(params: any, method = "GET", baseUrl = this.API_URL) {
    const {
      url,
      header,
      ignoreErrorMsg,
      noCheckDataCode = false,
      ...rest
    } = params;

    const option = {
      ...rest,
      url: baseUrl + url,
      withCredentials: true,
      headers: {
        "Content-type": "application/json",
        ...header,
      },
      method,
      transformResponse: (data: string) => {
        if (!data) {
          return data;
        }
        return {
          noCheckDataCode,
          ...JSON.parse(data),
        };
      },
      prefix: this.API_URL,
      errorHandler: false, // Disable umi-request error handler
    };

    return instanceRequest(option).catch(({ message, code }) => {
        if (!ignoreErrorMsg) {
          showErrorMsg(
            message === "NET_ERROR" ? "网络连接异常，请连接后重试" : message
          );
        }
        throw { message, code };
      });
  }

  /**
   * 调用远程网关接口
   * @example
   * ```
   * export async function loginByPhoneNumber(params) {
   *   return await Request.call("zhiyong.passport.api.login", "1.0", params);
   * }
   * ```
   * @param {String} method  【必填】调用服务端接口哪个方法（⚠️注意：不是 "GET" 或 "POST"）
   * @param {String} version 【可选】调用接口的版本
   * @param {Object} data【可选】携带的数据
   * @return {Object} 返回 Promise 实例
   */
  call(callMethod: string, version = "1.0", params: any, options: OptionsType = {}) {
    const { method, ...optionRest } = options;
    const payload = {
      appKey: this.APP_KEY,
      method: callMethod,
      version,
      timestamp: getTimestamp(),
      ...params,
    };
    const sign = getSign({
      appSecret: this.APP_SECRET,
      params: payload,
    });
    return this.baseOptions(
      {
        ...optionRest,
        url: `/router/rest?sign=${sign}&${stringify(payload)}`,
      },
      method
    );
  }

  callPost(callMethod: string, version = "1.0", params: any, options: OptionsType = {}) {
    return this.call(callMethod, version, params, {
      ...options,
      method: "POST",
    });
  }

  /**
   * 发送 GET 请求
   * @example
   * ```
   * export async function getPlayDetail(params) {
   *   return await Request.get(`/course/v1/video?${stringify(params)}`);
   * }
   * ```
   * @param {String} url 【必传】请求路径，不包含协议 + 域名 + 端口
   * @param {Object} data【可选】请求携带的数据
   * @return {Object} 返回 Promise 实例
   */
  get(url: string, data: any, options: OptionsType = {}) {
    const { baseUrl, ...rest } = options;
    let params = { url, params: data, ...rest };
    return this.baseOptions(params, "GET", baseUrl);
  }

  /**
   * 发送 POST 请求
   * @example
   * ```
   * export async function addWatchRecords(records = []) {
   *   return await Request.post("/watchLog/save", records);
   * }
   * ```
   * @param {String} url 【必传】请求路径，不包含协议 + 域名 + 端口
   * @param {Object} data【可选】请求携带的数据
   * @param {Object} options【可选】附加选项
   *   - baseUrl 请求 URL 前缀，协议 + 域名 + 端口
   *   - contentType 请求内容类型（默认："application/json"）
   * @return {Object} 返回 Promise 实例
   */
  post(url: string, data: any, options: OptionsType = {}) {
    const { contentType, baseUrl, ...rest } = options;
    let params = { url, data, contentType, ...rest };
    return this.baseOptions(params, "POST", baseUrl);
  }

  /**
   * 此 Mock 方法目前用于 mock `Request.get` 方法，后期将替换为 mock `Request.call` 方法
   * @example
   * ```
   * export async function getPlayDetail(params) {
   *   return await Request.mock(`/course/v1/video?${stringify(params)}`);
   * }
   * ```
   * @example
   * ```
   *   "GET /course/v1/video": (req, res) => {·
   *     res.json(mockjs.mock({
   *       code: 200,
   *       msg: "",
   *       data: true
   *     }));
   *   }
   * ```
   * @param {String} url 【必传】请求路径，不包含协议 + 域名 + 端口
   * @param {Object} data【可选】请求携带的数据
   * @return {Object} 返回 Promise 实例
   */
  mock(url: string, data = "") {
    return this.mockGet(url, data);
  }

  /**
   * 用于 mock `Request.call` 方法，参数与其一致。
   *
   * @example
   * ```
   * export async function loginByPhoneNumber(params) {
   *   return await Request.mockCall("zhiyong.passport.api.login", "1.0", params);
   * }
   * ```
   * @example
   * ```
   *   "POST /zhiyong.passport.api.login__1.0": (req, res) => {
   *     res.json(mockjs.mock({
   *       code: 200,
   *       msg: "",
   *       data: true
   *     }));
   *   }
   * ```
   * @param {String} method  【必填】调用服务端接口哪个方法（⚠️注意：不是 "GET" 或 "POST"）
   * @param {String} version 【可选】调用接口的版本
   * @param {Object} data【可选】携带的数据
   * @return {Object} 返回 Promise 实例
   */
  mockCall(method: string, version = "1.0", params: any, data: any) {
    let option = {
      url: `/${method}/${version}?${stringify(params)}`,
      data,
    };
    return this.baseOptions(option, "GET", this.MOCK_URL);
  }

  mockCallPost(method: string, version = "1.0", params: any, data: any) {
    let option = {
      url: `/${method}/${version}?${stringify(params)}`,
      data,
    };
    return this.baseOptions(option, "POST", this.MOCK_URL);
  }

  /**
   * 用于 mock `Request.get` 方法，参数与其一致。
   * @example
   * ```
   * export async function getPlayDetail(params) {
   *   return await Request.mock(`/course/v1/video?${stringify(params)}`);
   * }
   * ```
   * @example
   * ```
   *   "GET /course/v1/video": (req, res) => {
   *     res.json(mockjs.mock({
   *       code: 200,
   *       msg: "",
   *       data: true
   *     }));
   *   }
   * ```
   * @param {String} url 【必传】请求路径，不包含协议 + 域名 + 端口
   * @param {Object} data【可选】请求携带的数据
   * @return {Object} 返回 Promise 实例
   */
  mockGet(url: string, data = "") {
    let option = { url, data };
    return this.baseOptions(option, "GET", this.MOCK_URL);
  }

  /**
   * 用于 mock `Request.post` 方法，参数与其一致。
   * @example
   * ```
   * export async function addWatchRecords(body) {
   *   return await Request.mockPost("/watchLog/save", body);
   * }
   * ```
   * @example
   * ```
   *   "POST /watchLog/save": (req, res) => {
   *     res.json(mockjs.mock({
   *       code: 200,
   *       msg: "",
   *       data: true
   *     }));
   *   }
   * ```
   * @param {String} url 【必传】请求路径，不包含协议 + 域名 + 端口
   * @param {Object} data【可选】请求携带的数据
   * @return {Object} 返回 Promise 实例
   */
  mockPost(url: string, data: any, options: OptionsType = {}) {
    const { contentType } = options;
    let params = { url, data, contentType };
    return this.baseOptions(params, "POST", this.MOCK_URL);
  }
}

export const H5Request = HttpRequest;

// Taro.request 文档
// https://nervjs.github.io/taro/docs/apis/network/request/request
import * as Taro from "../adapter/taro";
import { stringify } from "qs";
import dd from "dingtalk-jsapi";
// import { reRegister } from "@/service/user";
import { setCookieFromHeader, getCookiesStr } from "../utils/cookie";
import { showToast } from "../utils/msg";
import { transformHeaders } from "../utils/common";
import { getSign, getTimestamp, getAuthCode } from "../utils/sign";
import { OptionsType, MConfigObject, ReRegisterFunction } from '../Types';

class HttpRequest {
    API_URL: string;
    APP_KEY: string;
    APP_SECRET: string;
    MOCK_URL?: string;
    NET_ERROR?: any;
    reRegister: ReRegisterFunction; // 重新登录(身份过期)
    loginSuccessCb: (res: any) => void; // 成功登录的回调函数
                
    constructor(props: { config: MConfigObject, reRegister: ReRegisterFunction, loginSuccessCb: (res: any) => void }) {
        const { config: { API_URL, APP_KEY, APP_SECRET, MOCK_URL, NET_ERROR }, reRegister, loginSuccessCb } = props;
        this.API_URL = API_URL
        this.APP_KEY = APP_KEY
        this.APP_SECRET = APP_SECRET;
        this.MOCK_URL = MOCK_URL;
        this.NET_ERROR = NET_ERROR;
        this.reRegister = reRegister;
        this.loginSuccessCb = loginSuccessCb;
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
  baseOptions(params: { [x: string]: any; url: any; data?: any; contentType?: any; header?: any; }, method = "GET", baseUrl = this.API_URL) {
    const { url, header, ...rest } = params;
    const option = {
      ...rest,
      url: baseUrl + url,
      headers: {
        Cookie: getCookiesStr(),
        ...header,
        "Content-Type": "application/json"
      },
      // dataType: 'json',
      method
    };
    return this.ddRequest(option);
  }
  // 是否正在刷新身份的标记
  isRefreshing = false;
  //重试队列，每一项将是一个待执行的函数形式
  requests = [] as any;
  // 钉钉请求方法
  ddRequest = async (option: { url: any; }) => {
    try {
      const res = await dd.httpRequest(option);
      switch (res.status) {
        case 200:
          if (res.data.code === 200) {
            return res.data.data;
          } else if (res.data.code === 401 || res.data.code === 403) {
            // 正在获取code，将返回一个未执行resolve的promise
            const promise = new Promise(resolve => {
              // 将resolve放进队列，用一个函数形式来保存，等code刷新后直接执行
              this.requests.push(() => {
                const params = transformHeaders(option);

                resolve(
                  this.ddRequest({
                    ...params,
                    headers: {
                      Cookie: getCookiesStr(),
                      "Content-Type": "application/json"
                    }
                  })
                );
              });
            });
            // 处理身份异常的问题
            if (!this.isRefreshing) {
              this.isRefreshing = true;
              const { authCode } = await getAuthCode();
              await this.ddLogin(authCode);
            }
            return promise;
          } else {
            throw new Error(res?.data?.messag || res?.data?.msg);
          }
        case 401:
          return Promise.reject("需要鉴权");
        case 403:
          return Promise.reject("没有权限访问");
        case 502:
        case 500:
          throw new Error(
            res?.data?.message || `[${option.url}] 服务端出现了问题`
          );
        default:
          throw new Error(res?.data?.messag || res?.data?.msg);
      }
    } catch (err: any) {
      showToast(err.message);
      return null;
    }
  };

  ddLogin = async (authCode: any) => {
    try {
      const res = await this.reRegister(authCode);
      if (res?.data?.code === 200) {
        // 成功登录的回调
        if (this.loginSuccessCb) {
            this.loginSuccessCb(res?.data);
        } else {
            setCookieFromHeader(res.headers["Set-Cookie"]);
        }
        // 已经重新登录，将所有队列中的请求进行重试
        for (let i = 0; i < this.requests.length; i++) {
          this.requests[i]();
        }
        this.requests = [];
      } else {
        showToast(res?.data?.messag || res?.data?.msg);
      }
    } catch (err) {
      // 重新无感知登录失败的逻辑
      throw new Error("身份过期，且重新登录失败，请稍后再试！");
    } finally {
      this.isRefreshing = false;
    }
  };

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
  call(callMethod: any, version = "1.0", params: any, options: OptionsType = {}) {
    const { method, ...optionRest } = options;
    const payload = {
      appKey: this.APP_KEY,
      method: callMethod,
      version,
      timestamp: getTimestamp(),
      ...params
    };
    const sign = getSign({
      appSecret: this.APP_SECRET,
      params: payload
    });
    return this.baseOptions(
      {
        ...optionRest,
        url: `/router/rest?sign=${sign}&${stringify(payload)}`
      },
      method
    );
  }

  callPost(callMethod: any, version = "1.0", params: any, option: { data: any; }) {
    return this.call(callMethod, version, params, {
      data: JSON.stringify(option.data),
      method: "POST"
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
    let params = { url, data, ...rest };
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
  post(url: any, data: any, options: OptionsType = {}) {
    const { contentType, baseUrl, ...rest } = options;
    let params = { url, data, contentType, ...rest };
    params.data = JSON.stringify(params.data);
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
  mockCall(method: any, version = "1.0", params: any, data: any) {
    let option = {
      url: `/${method}/${version}?${stringify(params)}`,
      data
    };
    return this.baseOptions(option, "GET", this.MOCK_URL);
  }

  mockCallPost(method: any, version = "1.0", params: any, data: any) {
    let option = {
      url: `/${method}/${version}?${stringify(params)}`,
      data
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

export default HttpRequest;

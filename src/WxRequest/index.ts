// Taro.request 文档
// https://nervjs.github.io/taro/docs/apis/network/request/request
import Taro from "@tarojs/taro";
import { stringify } from "qs";
import { showErrorMsg } from "../utils/msg";
import interceptors from "./interceptors";
import { getSign, getTimestamp } from "./sign";

interceptors.forEach(i => Taro.addInterceptor(i));

class HttpRequest {
  API_URL: any;
  APP_KEY: any;
  APP_SECRET: any;
  MOCK_URL: any;
  NET_ERROR: any;
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
  constructor(API_URL: any, APP_KEY: any, APP_SECRET: any, MOCK_URL: any, NET_ERROR: any) {
    this.API_URL = API_URL
    this.APP_KEY = APP_KEY
    this.APP_SECRET = APP_SECRET;
    this.MOCK_URL = MOCK_URL;
    this.NET_ERROR = NET_ERROR;
  }
  
  baseOptions(params: any, method = "GET", baseUrl = this.API_URL) {
    const { url, ignoreErrorMsg, ...rest } = params;
    const option = {
      ...rest,
      url: baseUrl + url,
      method,
    };
    return Taro.request(option).catch(({ msg, code }) => {
      if (!ignoreErrorMsg) {
        showErrorMsg(msg === this.NET_ERROR ? "网络连接异常，请连接后重试" : msg);
      }
      throw { message: msg, code };
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
  call(callMethod: any, version = "1.0", params: any, option: object) {
    const { method, ...optionRest } = option;
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

  callPost(callMethod: any, version = "1.0", params: any, option: object) {
    return this.call(callMethod, version, params, {
      ...option,
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
  get(url: any, data: any, options = {}) {
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
  post(url: any, data: any, options = {}) {
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
  mock(url: any, data = "") {
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
      data,
    };
    return this.baseOptions(option, "GET", this.MOCK_URL);
  }

  mockCallPost(method: any, version = "1.0", params: any, data: any) {
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
  mockGet(url: any, data = "") {
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
  mockPost(url: any, data: any, options = {}) {
    const { contentType } = options;
    let params = { url, data, contentType };
    return this.baseOptions(params, "POST", this.MOCK_URL);
  }
}

export default new HttpRequest();

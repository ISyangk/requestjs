import { extend } from 'umi-request';
import { ResponseError, RequestOptionsInit } from 'umi-request/types/index';
import * as R from 'ramda';
import { message } from 'antd';

import { filterEmpty, getLocationSearch } from './utils';
import { getApiPrefix, goToLogin } from './gateway';
import { getRequestUrl, getLogRequestUrl } from './gateway/helper';

interface CodeObject {
    [key: string]: string | number | undefined | null | void
}

const codeMessage:CodeObject = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};

export const SERVICE_CODE_200 = 200;

type ResObj<T> = {
    data: T,
    code: Number,
    msg: string,
    [propName: string]: any,
}

type ConfigObject = { 
    LOGIN_URL: string,
    HOST_URL: string,
    GATEWAY_URL: string,
    LOG_APP_KEY: string,
    LOG_APP_SECRET: string,
    APP_KEY: string,
    APP_SECRET: string,
    [propName: string]: any,
}
type RequestObject = {
    request: Function,
    post: Function,
    get: Function,
    resolvePost: Function,
    resolveGet: Function,
    [propName: string]: any,
}

export type LocationSearchType = {
  accessToken: String,
  [propName: string]: any,
}

// 异常处理程序
const errorHandler = (error: ResponseError) => {
    const { response, request } = error;
    if (response?.status) {
        const errorText = codeMessage[response.status] || response.statusText;
        message.error(errorText);
    } else if (!response) {
        const { options } = request || {};
        // 用户自定义终止请求后不提示
        if (!options?.signal) {
            message.error('您的网络发生异常，无法连接服务器');
        }
    }
    throw error;
};

export const webRequest = (config: ConfigObject, redirectToHome: any, unifyErrorMsgFn: (msg: any) => void, redirectToLoginFn: () => void ): RequestObject  => {
    const { LOGIN_URL } = config;
    (window as any).baseConfig = config;
    const request = extend({
        errorHandler, // 默认错误处理
        credentials: 'include', // 默认请求是否带上cookie
    });
    
    // 网关拦截
    request.interceptors.request.use((url, options) => {
        const { version, prefix, ...props } = options;
        props.params = filterEmpty(props.params);
    
        // 根据域名网管设置 prefix
        const fmtPrefix = getApiPrefix(prefix);
        // 此处的 url = prefix + url; 需要格式化摘除prefix
        const fmtUrl = prefix ? url.split(prefix)?.[1] : url;
    
        // 调用网关
        if (version) {
            const isLogApi = prefix === LOGIN_URL;
            const locationUrl = decodeURIComponent(window.location.search);
            // 处理业务鉴权
            const { accessToken } = getLocationSearch(locationUrl) as LocationSearchType;
    
            const finalOptions = props as any;
    
            if (accessToken) {
                finalOptions.headers['x-access-token'] = accessToken;
            }
    
            // 去掉网关接口校验
            // const authHeaderCode = getResouceCodeByApiMethod(url);
            // if (authHeaderCode) {
            //   finalOptions = R.assocPath(['headers', PERMISSION_HEADER], authHeaderCode, finalOptions);
            // }
            const signUrl = isLogApi ? getLogRequestUrl(fmtUrl, options) : getRequestUrl(fmtUrl, options);
            return {
                url: `${fmtPrefix}${signUrl}`,
                options: finalOptions,
            };
        }
    
        // 不调用网关，直接调用服务端api
        options.prefix = fmtPrefix;
        return {
            url: `${fmtPrefix}${fmtUrl}`,
            options,
        };
    });
    
    // 接口响应统一拦截
    request.interceptors.response.use(async (response: Response | any, options: RequestOptionsInit) => {
        const rsp = await response?.clone()?.json();
        const { code, msg, message: fmtMsg } = rsp || {};
        if (code === 401 || code === 5006 || code === 1100) {
            if (redirectToLoginFn) {
                redirectToLoginFn();
            } else {
                goToLogin(redirectToHome);
            }
            return;
        }
        // 统一业务错误信息提示，ignoreError 为 true 时不提示公共错误信息
        if (!/^2/.test(code) && !options?.ignoreError) {
            const msgError = msg || fmtMsg || '';
            if (unifyErrorMsgFn) {
                unifyErrorMsgFn(msgError);
            } else {
                message.error(!msgError || msgError.length >= 40 ? '服务器繁忙，请稍后再试' : msgError);
            }
        }
        return response;
    });

    function post<T>() {
        return R.curry((url: string, data: T) => {
            return request(url, {
                method: 'post',
                version: '1.0',
                data,
            });
        });
    }

    function get<T>() {
        return R.curry((url: string, data: T) => {
            return request(url, {
                method: 'get',
                data,
                version: '1.0',
            });
        });
    }
    
    function postIgnoreError<T>(url: string, data: T) {
        return request(url, {
            method: 'POST',
            data,
            version: '1.0',
            ignoreError: true,
        });
    };
    
    function getIgnoreError<T>(url: string, data: T) {
        return request(url, {
            method: 'GET',
            data,
            version: '1.0',
            ignoreError: true,
        });
    };
    
    function resolveResponse<T>(promise: any) {
        return new Promise((resolve, reject) => {
            promise.then((res: ResObj<T>) => {
                const { data, code, msg } = res;
                if (code === SERVICE_CODE_200) {
                    resolve(data);
                } else {
                    reject(msg);
                }
            });
        });
    };
    /**
     * 此备注对应 resolvePost, resolveGet
     *
     * @param   url                 'zhiyong.****'
     * @param   data                {object}
     * @return  {Promise<unknown>}
     *
     * // resolve<Response>(response.data), 此时 response.code === SERVICE_CODE_200
     * 正常返回: resolve(data);
     *
     * // reject<Response>(response.msg), 此时 response.code !== SERVICE_CODE_200
     * 异常返回: reject(msg);
     */
    function resolvePost<T>(url: string, data: T) { return resolveResponse(postIgnoreError(url, data))} ;
    function resolveGet<T>(url: string, data: T) { return resolveResponse(getIgnoreError(url, data))}; 
    return {
        request,
        post,
        get,
        resolvePost,
        resolveGet,
    };
};

// const {
//     request,
//     post: Post,
//     get: Get,
//     resolvePost: ResolvePost,
//     resolveGet: ResolveGet,
// } = Request as unknown as RequestType;
// export const post = Post;

// export const get = Get;

// export const resolvePost = ResolvePost;

// export const resolveGet = ResolveGet;

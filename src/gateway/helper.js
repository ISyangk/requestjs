import qs from 'qs';
import moment from 'moment';
import { v4 } from 'uuid';
import { isEmpty } from 'ramda';

import { filterEmpty } from '../utils';
// eslint-disable-next-line camelcase
import { hex_hmac_md5 } from './md5';

export const getSign = ({ params, appSecret }) => {
  const ary = [];
  Object.keys(params).forEach((key) => {
    const value = params[key];
    const fmtValue = value === null ? '' : value;
    if (fmtValue !== undefined && typeof fmtValue !== 'object') {
      ary.push(`${key}${encodeURIComponent(fmtValue)}`);
    }
  });
  const sortParams = ary.sort().join('');
  const hmacSign = hex_hmac_md5(appSecret, sortParams);
  const rsp = hmacSign.toUpperCase();

  return rsp;
};

const getTimestamp = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss');
};

// 统一网关接口逻辑
export const getRequestUrl = (url, objParams ) => {
  const { APP_KEY, APP_SECRET } = window.baseConfig;
  const { method, version, data, params } = objParams;
  const urlParams = {
    appKey: APP_KEY,
    timestamp: getTimestamp(),
    method: url,
    version,
  };
  let signParams = urlParams;

  // get请求时url的业务参数要参与计算签名
  if (method.toLowerCase() === 'get') {
    const fmtParams = isEmpty(params) ? undefined : filterEmpty(params);
    const fmtData = isEmpty(data) ? undefined : filterEmpty(data);
    const objQuery = fmtParams || fmtData || {};
    signParams = { ...signParams, ...objQuery };
    if (!fmtParams && fmtData) {
      Object.assign(urlParams, fmtData);
    }
  }

  // 计算签名
  const sign = getSign({
    appSecret: APP_SECRET,
    params: signParams,
  });

  return `/router/rest?${qs.stringify({ ...urlParams, sign })}`;
};

// 登录网关接口逻辑
export const getLogRequestUrl = (url, params) => {
  const { LOG_APP_KEY, LOG_APP_SECRET } = window.baseConfig;
  const { version } = params;
  const signParams = {
    appKey: LOG_APP_KEY,
    timestamp: getTimestamp(),
    version,
    nonce: v4(),
  };

  // 计算签名
  const sign = getSign({
    appSecret: LOG_APP_SECRET,
    params: signParams,
  });

  return `${url}?${qs.stringify({ ...signParams, sign })}`;
};

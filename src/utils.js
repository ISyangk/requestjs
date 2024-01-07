import { isNil, isEmpty } from 'ramda';
// 过滤对象中的空值
export const filterEmpty = (params) => {
    if (!params) return;
    const obj = {};
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (!isNil(value) && !isEmpty(value)) {
        obj[key] = typeof value === 'string' ? value.trim() : value;
      }
    });
    return obj;
};

  // 获取url查询参数
export const getLocationSearch = (search) => {
  const url = decodeURI(search);
  const query = {};
  if (url.indexOf('?') !== -1) {
    const str = url.substring(1);
    const pairs = str.split('&');
    for (let i = 0; i < pairs.length; i += 1) {
      const pair = pairs[i].split('=');
      query[pair[0]] = pair[1];
    }
  }
  return query; // 返回对象
};
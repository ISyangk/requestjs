import wx from 'weixin-js-sdk';
/**
 * Cookie基础库
 * @example
 *      getCookie('cookie1')
 *      setCookie({ cookie1: 'xxx' })
 *      removeCookie('cookie2')
 *
 * @author WecTeam
 */

/**
 * 设置 cookie
 * 功能点：
 *      1. 支持设置单个，也支持设置多个
 *      2. 可以设置有效期（maxAge 或 expires）
 *      3. 支持直接传值value，也支持传对象Object，里面包含{ value, expires }
 *      4. 需要进行编码（JS内置的URI编码即可）
 *
 * @example
 *      setCookie({
 *          cookie1: 12345,
 *          cookie2: '12345'
 *      })
 *
 *      setCookie({
 *          cookie1: {
 *              value: 12345,
 *              maxAge: 3600 * 24  // 自定义有效期（这里示例是24小时）
 *          },
 *          cookie2: {
 *              value: '12345',
 *              expires: 'Wed, 21 Oct 2015 07:28:00 GMT' // 标准GMT格式
 *          }
 *      })
 *
 * @param {Object} cookies     需要设置的cookie项
 * @return void
 */
export function setCookie(cookies) {
  if (!isType(cookies, "Object")) return console.error("输入不合法@setCookie");

  let oldCookies = getFullCookiesObj();
  let newCookies = {}; // 由入参转化后的标准格式的cookies

  for (let name in cookies) {
    if (isType(cookies[name], "Object")) {
      let { value, expires, maxAge } = cookies[name];
      newCookies[name] = getStandardCookieItem({
        name,
        value,
        expires,
        maxAge
      });
    } else {
      newCookies[name] = getStandardCookieItem({ name, value: cookies[name] });
    }
  }

  saveCookiesToStorage(Object.assign({}, oldCookies, newCookies));
}

/**
 * 将 cookies 保存到本地Storage
 *
 * @param {Object}  cookies   完整到cookies对象
 * @return void
 */
function saveCookiesToStorage(cookies) {
  try {
    wx.setStorageSync("cookies", cookies);
  } catch (e) {
    console.error("saveCookiesToStorage失败：", e);
  }
}

/**
 * 生成标准的 cookie 项
 *
 * @param {Object}   obj
 *                      .name       cookie名
 *                      .value      cookie值
 *                      .expires    cookie过期时间
 *                      .maxAge     cookie有效期
 * @return {CookieItem} { name: 'cookie1', value: 'xxx', expires: xxx }
 */
function getStandardCookieItem({ name, value, expires, maxAge }) {
  if (name === undefined || value === undefined) {
    console.error("输入不合法@getStandardCookieItem");
    return {};
  }

  expires = expires || transferMaxAgeToExpires(maxAge); // 默认1年

  let cookieItem = {
    name,
    value,
    expires
  };

  return cookieItem;
}

/**
 * 将Max-Age格式的时间，转换为Expires格式的时间
 *
 * @param {Number}   maxAge     有效期，单位为“秒”
 * @return {String}  expires    标准的Expires时间
 */
function transferMaxAgeToExpires(maxAge) {
  // 目前的默认cookie是保存1年，注意【秒 ==> 毫秒】
  const t = 1000 * (maxAge || 3600 * 24 * 365);
  return new Date(new Date().getTime() + t).toGMTString();
}

/**
 * 获取指定 cookie 字段的值
 *
 * @param {String} name       cookie 名称name
 * @return {Any}              cookie 值value
 */
export function getCookie(name = "") {
  let cookies = getFullCookiesObj();
  let cookieItem = cookies[name];
  let result = "";

  if (cookieItem) {
    result = decodeURIComponent(cookieItem.value);
  } else {
    console.warn("该cookie项不存在，或者已过期：", name);
    result = "";
  }

  return result;
}

/**
 * 获取完整的 cookies 对象
 *
 * @return {Object}           cookie 对象
 * @example
 *      {
 *          cookie1: { name: 'cookie1', value: 'xxx', expires: xxx },
 *          cookie2: { name: 'cookie2', value: 'xxx', expires: xxx },
 *      }
 */
function getFullCookiesObj() {
  let cookies;

  try {
    cookies = wx.getStorageSync("cookies");
  } catch (e) {
    console.error("cookies初始化失败:", e);
  }

  if (!isType(cookies, "Object")) cookies = {};

  checkExpires(cookies); // 如果过期会自动删除，并同步本地Storage

  return cookies;
}

/**
 * 获取简化的 cookies 对象（已解码）
 *
 * @return {Object}           cookie 对象
 * @example
 *      {
 *          cookie1: 'xxx',
 *          cookie2: 'xxx',
 *      }
 */
export function getCookiesObj() {
  let cookies = getFullCookiesObj();
  let newCookies = {};

  for (let name in cookies) {
    newCookies[name] = decodeURIComponent(cookies[name].value);
  }

  return cookies;
}

/**
 * 获取简化的 cookies 字符串（无解码）
 *
 * @return {String}           cookie 字符串
 * @example 'cookie1=xxx;cookie2=xxx'
 */
export function getCookiesStr() {
  let result = [];
  let cookies = getFullCookiesObj();

  for (let name in cookies) {
    result.push(`${name}=${cookies[name].value}`);
  }

  return result.join(";");
}

/**
 * 删除某个cookie
 *
 * @param {String}   cookieName    待删除的cookie名
 * @return void
 */
export function removeCookie(cookieName) {
  let cookies = getFullCookiesObj();

  delete cookies[cookieName];

  saveCookiesToStorage(Object.assign({}, cookies));
}

/**
 * 处理【响应头】的set-cookie字段
 *
 * 可能的值：
 *      "sessionId=38afes7a8",
 *      "id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT",
 *      "id=a3fWa; Max-Age=2592000",
 *      "BAIDUID=xxxxx:FG=1; max-age=31536000; expires=Tue, 22-Dec-20 02:38:57 GMT; domain=.baidu.com; path=/; version=1; comment=bd,H_WISE_SIDS=43_1374871; path=/; expires=Tue, 22-Dec-20 02:38:57 GMT; domain=.baidu.com,bd_traffictrace=231038; expires=Thu, 08-Jan-1970 00:00:00 GMT,BDSVRTM=144; path=/"
 *
 * 注意点：
 *      1. 最基本的格式：Set-Cookie: <cookie-name>=<cookie-value>
 *      2. 可能同时包含多个cookie字段，以,分割（但需要排除时间值里的,）
 *      3. 时间格式：Max-Age/Expires （不区分大小写）
 *
 * @param {String} setCookieStr    响应header的 Set-Cookie 值
 * @return void
 */
export function setCookieFromHeader(setCookieStr) {
  if (!setCookieStr) return;

  let setCookieArr = [];
  let resultSetCookieParam = {};

  // 拆解cookie项：1. 替换 Expires 里的逗号; 2. 根据逗号分离多个 cookie 项; 3. 还原 Expires 里的逗号
  setCookieArr = setCookieStr
    .replace(/(Expires=[A-Za-z]{3}),/gi, "$1_")
    .split(",")
    .map(item => item.replace(/(Expires=[A-Za-z]{3})_/gi, "$1,"));

  if (setCookieArr.length === 0) return;

  // 单独对每一项处理
  setCookieArr.forEach(item => {
    let cookieItem = parseCookieItem(item);
    if (!(cookieItem && cookieItem.name)) return;
    resultSetCookieParam[cookieItem.name] = cookieItem;
  });

  setCookie(resultSetCookieParam);
}

/**
 * 解析出标准格式的cookie项
 * @example parseCookieItem('id=a3fWa; Expires=Wed, 21 Oct 2015 07:28:00 GMT')
 *          返回： {
 *                  name: 'id',
 *                  value: 'a3fWa',
 *                  expires: 'Wed, 21 Oct 2015 07:28:00 GMT'
 *                }
 *
 * @param {Object}    cookieStr           set-cookie项
 * @return {Object}   cookieItem    标准格式的cookie项
 */
function parseCookieItem(cookieStr) {
  let params = cookieStr.split(";");
  let cookieItem = {};

  let firstParam = params.shift();
  // 这里兼容下奇葩cookie值
  if (firstParam.indexOf("=") === -1)
    return console.error("cookie value error ", cookieStr);
  const eqIndex = firstParam.indexOf("=");
  cookieItem.name = firstParam.substring(0, eqIndex).trim();
  cookieItem.value = firstParam.substring(eqIndex + 1).trim();
  params.forEach(item => {
    if (item.match(/^\s*Expires=/i))
      cookieItem.expires = new Date(item.split("=")[1]).toGMTString();
    if (item.match(/^\s*Max-age=/i)) cookieItem.maxAge = +item.split("=")[1];
  });

  return cookieItem;
}

/**
 * 校验 cookies 中各个字段的有效期（过期则删除）
 * 注：非纯函数，会直接修改传入的cookies
 *
 * @param {Object}   cookies     cookies对象
 * @return void
 */
function checkExpires(cookies) {
  let hasExpired = false;
  let now = new Date();

  for (let name in cookies) {
    let expires = new Date(cookies[name].expires);

    if (expires <= now) {
      hasExpired = true;
      delete cookies[name]; // 删除
    }
  }

  // 同步到本地Storage
  if (hasExpired) saveCookiesToStorage(Object.assign({}, cookies));
}

/**
 * 一般的类型检查函数
 *
 * @param ele {Anything} 代检查元素
 * @param type {String} 目标类型，例如'String'/'Array'/'Function'
 * @return {Boolean} 是否目标类型
 */
function isType(ele, type) {
  return Object.prototype.toString.call(ele) === `[object ${type}]`;
}

import HmacMD5 from "crypto-js/hmac-md5";
import dayjs from "dayjs";
import dd from "dingtalk-jsapi";

export const getTimestamp = () => dayjs().format("YYYY-MM-DD HH:mm:ss");

export const getSign = ({ params, appSecret }) => {
  const paramArr = [];
  for (const key in params) {
    if (key === "session" || key === "tenantId" || key === "ignoreErrorMsg") {
      // eslint-disable-next-line
      continue;
    }
    const value = params[key];
    if (value !== undefined && value !== "") {
      paramArr.push(
        `${key}${key === "timestamp" ? encodeURIComponent(value) : value}`
      );
    }
  }
  const sortParams = paramArr.sort().join("");
  const hmacSign = HmacMD5(sortParams, appSecret);
  const res = hmacSign.toString().toUpperCase();
  return res;
};

// 获取免登授权码
export const getAuthCode = async () => {
  return await new Promise((resolve, reject) => {
    dd.getAuthCode({
      success: function(res) {
        resolve(res);
      },
      fail: function(err) {
        reject(err);
      },
    });
  });
};

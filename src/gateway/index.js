// 跳转登录
export const goToLogin = async (getTenantConfig, redirectToHome) => {
  const { LOGIN_URL } = window.baseConfig;
  // 5位以上的数字通常为 id, 携带 id 的页面  redirectUrl 为默认开启页面
  const reg = /\d{5,}/;
  const redirectUrl =
    redirectToHome || reg.test(window.location.pathname)
      ? `${window.location.origin}`
      : window.location.href;
  let origin = LOGIN_URL;

  try {
    // 兼容配置域名
    if (!window.location.hostname.includes('.highso') && !window.location.host.includes(':8000')) {
      const { data } = await getTenantConfig({
        domain: window.location.origin,
        // domain: 'http://admin.aqm.zacm.com.cn',
        // type: 1, // 0 - C端， 1 - B端, 2 企业端
      });

      origin = data?.orgUrl || LOGIN_URL;
    }
    window.location = `${origin}/user/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  } catch (err) {
    window.location = `${origin}/user/login?redirectUrl=${encodeURIComponent(redirectUrl)}`;
  }
};

// 获取接口域名
export const getApiPrefix = (prefix) => {
  const { HOST_URL, LOGIN_URL, GATEWAY_URL } = window.baseConfig;
  const { origin, host } = window.location;
  const isHx = HOST_URL.slice(2) === host;

  // 本地开发或内网环境
  if (isHx || host.includes('local')) {
    const isLogApi = prefix === LOGIN_URL;
    return isLogApi ? LOGIN_URL : GATEWAY_URL;
  }

  return origin;
};

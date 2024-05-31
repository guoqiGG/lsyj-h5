const config = require("./config.js");
const http = require("./http.js");

// 检查是否授权
const checkAuthInfo = (fn) => {
  const pages = getCurrentPages();
  if (uni.getStorageSync("bbcToken")) {
    fn();
    return;
  }
  // 设置登录后的跳转地址
  setRouteUrlAfterLogin();
  uni.redirectTo({
    url: "/pages/user-login/user-login",
  });
};

/**
 * 设置登录后的跳转地址
 */
const setRouteUrlAfterLogin = () => {
  const pages = getCurrentPages();
  // 登录后的回跳地址
  if (
    pages[pages.length - 1].route.indexOf("register") === -1 &&
    pages[pages.length - 1].route.indexOf("accountLogin") === -1
  ) {
    uni.setStorageSync(
      "bbcRouteUrlAfterLogin",
      pages[pages.length - 1].$page.fullPath
    );
  }
};

// 登录返回上一页
const previousPage = () => {
  const routeUrlAfterLogin = uni.getStorageSync("bbcRouteUrlAfterLogin");
  const pages = getCurrentPages();
  const nowRoute = pages[pages.length - 1].route;

  if (pages.length === 1) {
    uni.reLaunch({
      url: routeUrlAfterLogin || "/pages/user/user",
    });
    uni.removeStorageSync("bbcRouteUrlAfterLogin");
    return;
  }

  const prevPage = pages[pages.length - 2];
  if (!prevPage) {
    // util.toHomePage();
    uni.switchTab({ url: "/pages/index/index" });
    return;
  }
  // 判断上一页面是否为tabbar页面 (首页和分类页无需登录接口)
  const isTabbar =
    prevPage.route === "pages/user/user" ||
    prevPage.route === "pages/discover/discover";

  if (isTabbar) {
    uni.switchTab({
      url: "/" + prevPage.route,
    });
  } else {
    // 非tabbar页面
    let backDelata = 0;
    pages.forEach((page, index) => {
      if (page.$page.fullPath === routeUrlAfterLogin) {
        backDelata = pages.length - index - 1;
      }
    });
    if (backDelata) {
      uni.navigateBack({
        delta: backDelata,
      });
    } else {
      util.toHomePage();
    }
  }
};

/**
 * 回到首页
 */
const toHomePage = () => {
  uni.switchTab({ url: "/pages/index/index" });
};

/**
 * 防抖
 * @param fn
 * @param wait
 * @returns {Function}
 * @constructor
 */
const debounce = (fn, t) => {
  const delay = t || 500;
  let timer;
  return function () {
    const args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    const callNow = !timer;
    timer = setTimeout(() => {
      timer = null;
    }, delay);
    if (callNow) fn.apply(this, args);
  };
};

/**
 * 手机号正则校验
 */
const checkPhoneNumber = (phoneNumber) => {
  var regexp = /^[1][0-9]{10}$/;
  return regexp.test(phoneNumber);
};
// 字符串转 base64
const stringToBase64 = (str) => {
  let base64 = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  for (let i = 0; i < str.length; i += 3) {
    const char1 = str.charCodeAt(i);
    const char2 = str.charCodeAt(i + 1);
    const char3 = str.charCodeAt(i + 2);

    const enc1 = char1 >> 2;
    const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
    const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
    const enc4 = char3 & 63;

    base64 +=
      characters.charAt(enc1) +
      characters.charAt(enc2) +
      characters.charAt(enc3) +
      characters.charAt(enc4);
  }
  return base64;
};

// 字符串转 utf8
const utf8_encode = (str) => {
  var output = "";
  for (var n = 0; n < str.length; n++) {
    var c = str.charCodeAt(n);
    if (c < 128) {
      output += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      output += String.fromCharCode((c >> 6) | 192);
      output += String.fromCharCode((c & 63) | 128);
    } else {
      output += String.fromCharCode((c >> 12) | 224);
      output += String.fromCharCode(((c >> 6) & 63) | 128);
      output += String.fromCharCode((c & 63) | 128);
    }
  }
  return output;
};

export const util = {
  checkAuthInfo,
  previousPage,
  toHomePage,
  debounce,
  checkPhoneNumber,
  stringToBase64,
  utf8_encode,
};

module.exports = util;

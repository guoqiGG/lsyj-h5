<template>
	<view class="con" style="position: relative;">
		<image class="login_bg" src="/static/login/login_bg.png" mode="widthFix" />
		<image class=""
			style="width: 196rpx;height: 196rpx;border-radius: 12rpx;position: absolute;left:278rpx;top: 120rpx; "
			src="/static/login/logo.png" mode="widthFix" />
		<!-- 微信登录 -->
		<view class="login-form">
			<!-- 按钮 -->
			<view class="happy">欢迎登录~</view>
			<view class="input">
				<image class="phone_icon" src="/static/login/phone_icon.png" mode="widthFix" />
				<text class="line"></text>
				<u--input placeholder="请输入手机号" border="none" v-model="phoneNumber" @blur="phoneChange"></u--input>
			</view>
			<view class="input" style="margin-top: 40rpx;">
				<image class="phone_icon" src="/static/login/code_icon.png" mode="widthFix" />
				<text class="line"></text>
				<u--input placeholder="请输入验证码" border="none" v-model="code" @blur="codeChange"></u--input>
				<!-- <text v-if="codeText" class="code" :class="flag ? 'color' : ''" @click="getCode">{{codeText}}</text> -->
				<text class="code" :class="flag ? 'color' : ''" @click="getCode">获取验证码</text>
			</view>
			<!-- 服务条款 -->
			<view class="item statement">
				<label class="statement-label" @tap.stop="handlePrivacyClick">
					<checkbox class="check-box" :checked="isPrivacy === 1" />
					<view style="color: #979797 ; margin-top: 4rpx;">
						我已阅读并同意氢春时代
						<text @tap.stop="toTermsOfService('serviceTerms')">《服务条款》</text>
						<text style="color: #979797">和</text>
						<text @tap.stop="toTermsOfService('servicePolicy')">《隐私协议》</text>
					</view>
				</label>
			</view>
			<button class="authorized-btn" @tap="maskBtn" :class="flag2 ? 'loginColor' : ''">
				立即登录
			</button>
			<!-- <button class="wechat-logo" @click="getWeChatCode">微信授权登录</button> -->
		</view>
	</view>
</template>


<script>
	const http = require("@/utils/http");
	const util = require("@/utils/util.js");
	import hCompress from "@/components/helang-compress/helang-compress";
	import {
		resolve
	} from "path";
	import {
		rejects
	} from "assert";
	// 引入wxjs
	import wx from "weixin-js-sdk";
	const jweixin = require('jweixin-module')
	import sha1 from 'sha1'
	import randomString from '@/utils/randomString.js'

	export default {
		props: {},
		components: {
			hCompress,
		},
		data() {
			return {
				appType: uni.getStorageSync("bbcAppType"),
				showAuth: false, // 用户是否首次登录 true 是 false 否
				isPrivacy: 0,
				phoneNumber: null,
				code: null,
				flag: false,
				flag2: false,
				// codeText:null,
			};
		},


		/**
		 * 生命周期函数--监听页面加载
		 */
		onLoad: function(options) {
			// 头部导航标题
			uni.setNavigationBarTitle({
				title: '用户登录',
			});
			// const hasWechatLogin = uni.getStorageSync('wechat_login_tag') || null;
			// if (hasWechatLogin) {
			// 	this.checkWeChatCode();
			// }
		},

		/**
		 * 生命周期函数--监听页面初次渲染完成
		 */
		onReady: function() {
			uni.getSystemInfo({
				success: (res) => {
					// 根据屏幕高度设置 top 值
					this.regLocation = res.windowHeight - 150 + "px";
				},
			});
		},

		/**
		 * 生命周期函数--监听页面显示
		 */
		onShow: function() {
			// 头部导航标题
			uni.setNavigationBarTitle({
				title: '用户登录'
			});

		},
		created() {
			// 调用分享的事件
			// this.getShareInfo();
		},
		 onLaunch() {
			 // 调用分享的事件
		        this.weiXinShareFn()
		 },
		methods: {
			// getWeChatCode() {
			// 	//用于退出登录回来不会再调一次授权登录
			// 	uni.setStorageSync('wechat_login_tag', 'true');
			// 	const appID = 'wxa2a6315d32072c7e'; //公众号appID
			// 	// http://192.168.110.24:8080/#/pages/user-login/user-login
			// 	const callBack = 'http://h5.hnliyue.cn:8088/#/pages/user-login/user-login'; //回调地址 就是你的完整地址登录页

			// 	//通过微信官方接口获取code之后，会重新刷新设置的回调地址【redirect_uri】
			// 	window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
			// 		appID + '&redirect_uri=' + encodeURIComponent(callBack) +
			// 		'&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect'
			// },
			// // 重定向回来本页面检查有没有code
			// checkWeChatCode() {
			//     let code = this.getUrlCode('code');
			//     if(code) {
			//         this.handleToLogin(code)
			//     }
			// },
			// // 正则匹配请求地址中的参数函数
			// getUrlCode(name) {
			//     return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) ||[, ''])[1].replace(/\+/g, '%20')) || null
			// },
			// handleToLogin(code) {
			// 	console.log(code,'handleToLogin')
			//     loginIn({
			//         code,
			//     }).then(res => {
			//         console.log('登录成功')
			//         uni.redirectTo({
			//             url: '/pages/index/index'
			//         })
			//     })
			// },
			weiXinShareFn() {
				// 获取url
				const linkUrl = window.location.href.split('#')[0]
				const u = navigator.userAgent
				const isWeixin = u.toLowerCase().indexOf('micromessenger') !== -1
				// 判断当前是否在微信浏览器内
				if (isWeixin) {
					// 这里需要请求后端配置的接口
					uni.request({
						url: 'http://xxxxxx',
						method: 'GET',
						data: {
							code: 'cws_gzh'
						},
						success: res => {
							//返回jsapi码
							const ticket = res.data.ticket || ''
							//时间戳
							const timestamp = Math.round(new Date().getTime() / 1000).toString()
							//随机字符串
							const nonceStr = randomString()
							//签名算法(微信给的格式)
							const jsons =
								`jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${linkUrl}`
							// 把签名转为sha算法
							const signature = sha1(jsons)
							wx.config({
								debug: false, // 调试模式
								appId: 'wx0d0f2b9c6b30d93e', // 公众平台申请的id
								timestamp, // 时间戳
								nonceStr, // 随机字符串
								signature, // 签名
								jsApiList: [ // 申请需要使用的api
									'updateAppMessageShareData',
									'updateTimelineShareData'
								]
							})

							wx.ready(() => {
								const shareData = {
									title: '每日新闻', // 标题
									desc: '2022年12月20日21:47:55每日新闻', //详情
									link: linkUrl, // h5链接
									imgUrl: 'https://blogobs.88688.team/blog/l-logo-y.jpg' // 图片链接 只能是网络连接
								}
								//分享给朋友
								wx.updateAppMessageShareData(shareData)
								//分享到朋友圈
								wx.updateTimelineShareData(shareData)
							});
							//错误了会走 这里
							wx.error(function(res) {
								console.log("微信分享错误信息", res);
							});
						}
					})
				}
			},



			getShareInfo() {
				//获取url链接（如果有#需要这么获取）
				var url = encodeURIComponent(window.location.href.split("#")[0]);
				//获取url链接（如果没有#需要这么获取）
				// var url = encodeURIComponent(window.location.href);

				getSing(url).then(res => {
					wx.config({
						debug: false, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
						appId: res.data.appId, // 必填，公众号的唯一标识
						timestamp: parseInt(res.data.timestamp), // 必填，生成签名的时间戳
						nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
						signature: res.data.signature, // 必填，签名
						jsApiList: [
							"updateAppMessageShareData",
							"updateTimelineShareData"
						] // 必填，需要使用的 JS 接口列表
					});
					wx.ready(() => {
						var shareData = {
							title: "每日新闻",
							desc: "2022年12月20日21:47:55每日新闻",
							link: window.location.href,
							imgUrl: "https://blogobs.88688.team/blog/l-logo-y.jpg"
						};
						//自定义“分享给朋友”及“分享到QQ”按钮的分享内容
						wx.updateAppMessageShareData(shareData);
						//自定义“分享到朋友圈”及“分享到 QQ 空间”按钮的分享内容（1.4.0）
						wx.updateTimelineShareData(shareData);
					});
					//错误了会走 这里
					wx.error(function(res) {
						console.log("微信分享错误信息", res);
					});
				});
			},

			phoneChange(e) {
				const reg = /^1\d{10}$/
				if (reg.test(e)) {
					this.flag = true
					return;
				} else {
					uni.showToast({
						title: '请输入正确的手机号',
						icon: "none",
					});
				}
			},
			codeChange(e) {
				if (e) {
					if (this.isPrivacy === 1 && this.code && this.phoneNumber) {
						this.flag2 = true
					}
					return;
				} else {
					uni.showToast({
						title: '请输入验证码',
						icon: "none",
					});
				}
			},
			// 获取验证码
			getCode() {
				if (this.phoneNumber && this.flag) {
					// let num=60
					// let timer=setInterval(()=>{
					// 	num--;
					// 	this.codeText=`${num}s`
					// 	if(num===0){
					// 		this.codeText='重新获取'
					// 		clearInterval(timer)
					// 	}
					// },1000)
					const params = {
						url: '/pub/user/verification/code',
						method: "POST",
						data: JSON.stringify({
							mobile: this.phoneNumber,
						}),
						callBack: (res) => {
							uni.showToast({
								title: '验证码发送成功',
								icon: "none",
							});
						},

					};
					http.request(params);
				} else {
					uni.showToast({
						title: '请先输入手机号',
						icon: "none",
					});
				}
			},

			// 条款点击事件(勾选/取选)
			handlePrivacyClick() {
				this.isPrivacy = this.isPrivacy === 1 ? 0 : 1;
				if (this.isPrivacy === 1 && this.code && this.phoneNumber) {
					this.flag2 = true
				}
			},
			// 立即登录
			maskBtn() {
				if (this.isPrivacy === 1 && this.phoneNumber && this.code) {
					const params = {
						url: '/pub/user/login/sms/code',
						method: "POST",
						data: JSON.stringify({
							mobile: this.phoneNumber,
							smsCode: this.code,
						}),
						callBack: (res) => {
							console.log(res, 'callBack===>')
							if (!res.id) {
								uni.setStorageSync("bbcTempUid", res);
								// 还原全局 正在登录状态
								getApp().globalData.isLanding = false;
								while (getApp().globalData.requestQueue.length) {
									http.request(getApp().globalData.requestQueue.pop());
									getApp().globalData.currentReqCounts--;
								}
								if (uni.getStorageSync('noAuth')) {
									this.showAuth = true
								} else {
									this.showAuth = false
								}
							} else {
								uni.setStorageSync("bbcTempUid", res.openId);
								if (res.loginToken) {
									uni.setStorageSync("bbcIsPrivacy", 1);
									uni.setStorageSync("bbcHadLogin", true);
									uni.setStorageSync("bbcToken", res.loginToken);
									uni.setStorageSync("bbcLoginResult", res); // 保存整个登录数据
									uni.setStorageSync("bbcUserInfo", res); //用户信息
									uni.setStorageSync('noAuth', false) // 用户是否首次授权
									// const expiresTimeStamp =
									// 	(res.expiresIn * 1000) / 2 + new Date().getTime();
									// // 缓存token的过期时间
									// uni.setStorageSync("bbcExpiresTimeStamp", expiresTimeStamp);
									// 还原全局 正在登录状态
									getApp().globalData.isLanding = false;
									while (getApp().globalData.requestQueue.length) {
										http.request(getApp().globalData.requestQueue.pop());
									}
									// 返回未登录前点击的页面
									util.previousPage()
								}
							}
						},
						errCallBack: () => {
							// 还原全局 正在登录状态
							getApp().globalData.isLanding = false;
							while (getApp().globalData.requestQueue.length) {
								http.request(getApp().globalData.requestQueue.pop());
								getApp().globalData.currentReqCounts--;
							}
							uni.removeStorageSync("bbcLoginResult");
							uni.removeStorageSync("bbcToken");
							uni.removeStorageSync("bbcHadBindUser");
							uni.removeStorageSync("bbcCode");
							uni.removeStorageSync("bbcUserInfo");
							uni.removeStorageSync("bbcExpiresTimeStamp");
							uni.removeStorageSync("noAuth");
						},
					};
					http.request(params);
				} else {
					uni.showToast({
						title: '请先阅读并勾选协议',
						icon: "none",
					});
				}

			},
			// 回到首页
			// toIndex() {
			// 	util.toHomePage();
			// },
			// 去服务条款和隐私协议页面
			toTermsOfService(key) {
				uni.navigateTo({
					url: "/pages/package-user/pages/terms-page/terms-page?sts=" + key,
				});
			},
		},
	};
</script>
<style>
	@import "./user-login.css";
</style>
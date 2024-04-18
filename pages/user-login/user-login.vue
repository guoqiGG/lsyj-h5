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
			// 调用分享的事件
			// this.getShareInfo();

		},

		methods: {
			getShareInfo() {
				// // #ifdef H5
				// var ua = window.navigator.userAgent.toLowerCase();
				// if (!(ua.match(/MicroMessenger/i) == 'micromessenger')) { 
				// 	uni.showToast({
				// 		title: '分享请在微信中打开',
				// 		icon: "none",
				// 	});
				//       return;
				// }
				// // #endif
				var url = encodeURIComponent(window.location.href.split("#")[0]);
				let bbcUserInfo = uni.getStorageSync("bbcUserInfo");
				const params = {
					url: '/wx/h5/getSing?url=' + url + '&userId=' + this.userInfo.id,
					method: "GET",
					callBack: (res) => {
						let linkUrl = res.url
						let leaderId = res.userId
						wx.config({
							debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
							appId: res.appId, // 必填，公众号的唯一标识
							timestamp: res.timestamp, // 必填，生成签名的时间戳
							nonceStr: res.nonceStr, // 必填，生成签名的随机串
							signature: res.signature, // 必填，签名，见附录1
							jsApiList: ["updateAppMessageShareData", "updateTimelineShareData", 
							], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2,
							openTagList: ['wx-open-launch-weapp']
						});
						wx.ready(() => {
							wx.updateAppMessageShareData({
								title: "氢春态",
								desc: "欢迎来到氢春态",
								link: linkUrl + '?userId=' + leaderId,
								imgUrl: "https://qingchuntaijava1.oss-cn-beijing.aliyuncs.com/3531fd5d3d034964bd1c365db16a8421.png",
								success: function() {
									// alert('updateAppMessageShareData成功', )
								},
								fail: function(err) {
									// alert('updateAppMessageShareData失败', err);
								},
							})
						});
						//错误了会走 这里
						wx.error(function(res) {
							// alert('微信分享错误信息', err)
						});
					},
					errCallBack: (err) => {
						// alert('errCallBack', err)
					},
				};
				http.request(params);
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
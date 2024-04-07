<template>
	<view class="con">
		<image class="login_bg" src="/static/login/login_bg.png" mode="widthFix" />
		<!-- <image class=""  style="width: 196rpx;height: 196rpx;border-radius: 12rpx; " src="/static/login/logo.png" mode="widthFix" /> -->
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
				<text class="code" :class="flag?'color':''" @click="getCode">获取验证码</text>
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
			<button class="authorized-btn" @tap="maskBtn" :class="flag2?'loginColor':''">
				立即登录
			</button>
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
	export default {
		props: {},
		components: {
			hCompress,
		},
		data() {
			return {
				code: "",
				isPrivacy: 0,
				appType: uni.getStorageSync("bbcAppType"),
				privacyNumber: "",
				showAuth: false, // 用户是否首次登录 true 是 false 否
				name: '',
				avatar: '',

				phoneNumber: null,
				code: null,
				flag: false,
				flag2: false
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
			// if (getApp().globalData.isLanding) return;
			// // 改变全局中登录
			// const globalData = getApp().globalData;
			// globalData.isLanding = true;
			// wx.login({
			// 	success: (res) => {
			// 		// 用code 请求登录
			// 		this.loginByCode(res.code);
			// 	},
			// });
		},
		methods: {
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
					console.log(this.phoneNumber, this.code, '获取验证码')
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
					console.log(this.isPrivacy, this.phoneNumber, this.code, '立即登录')
					// uni.request({
					// 	url: '/api' + '/pub/user/login/password', //  /api要与上面的/api一致
					// 	method: 'POST',
					// 	data: JSON.stringify({
					// 		mobile: this.phoneNumber,
					// 		pwd: this.code,
					// 	}),
					// 	success: (res) => {
					// 			console.log(res,'res')
					// 		if (res.statusCode == 200) {
					// 			console.log(res.data)
					// 		} else {
					// 			uni.showToast({
					// 				title: res.data.ErrorMessage,
					// 				icon: 'none'
					// 			})
					// 		}
					// 	},
					// 	fail: (err) => {
					// 		uni.showToast({
					// 			title: err.ErrorMessage,
					// 			icon: 'none'
					// 		})
					// 	},
					// });

					const params = {
						// url: "/pub/user/login/password",
					url: '/pub/user/login/password',
						method: "POST",
						data: JSON.stringify({
							mobile: this.phoneNumber,
							pwd: this.code,
						}),
						callBack: (res) => {
							console.log(res,'res')
						},
						errCallBack: (err) => {
							console.log(err,'err')
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
			/**
			 * 通过微信返回的code登录
			 * @param {String} code 请求微信返回的 code
			 */
			loginByCode(code) {
				const params = {
					url: "/pub/user/login/auth",
					method: "POST",
					data: JSON.stringify({
						code: code,
						loginType: 1
					}),
					callBack: (res) => {
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
								const expiresTimeStamp =
									(res.expiresIn * 1000) / 2 + new Date().getTime();
								// 缓存token的过期时间
								uni.setStorageSync("bbcExpiresTimeStamp", expiresTimeStamp);
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
			},


			/**
			 * 微信小程序获取手机号一键登录按钮
			 */
			getPhoneNumberLogin(e) {
				// 拒绝了授权
				if (!e.detail.code) {
					return;
				}
				const params = {
					url: "/pub/user/login/auth",
					method: "POST",
					data: JSON.stringify({
						code: e.detail.code,
						loginType: 2,
						openid: uni.getStorageSync('bbcTempUid'),
						name: this.name,
						avatar: this.avatar
					}),
					callBack: (res) => {
						if (res.loginToken) {
							uni.setStorageSync("bbcIsPrivacy", 1);
							uni.setStorageSync("bbcHadLogin", true);
							uni.setStorageSync("bbcToken", res.loginToken);
							uni.setStorageSync("bbcLoginResult", res); // 保存整个登录数据
							uni.setStorageSync("bbcUserInfo", res); //用户信息
							uni.setStorageSync('noAuth', false) // 用户是否首次授权
							const expiresTimeStamp =
								(res.expiresIn * 1000) / 2 + new Date().getTime();
							// 缓存token的过期时间
							uni.setStorageSync("bbcExpiresTimeStamp", expiresTimeStamp);
							// 还原全局 正在登录状态
							getApp().globalData.isLanding = false;
							while (getApp().globalData.requestQueue.length) {
								http.request(getApp().globalData.requestQueue.pop());
							}
							// 返回未登录前点击的页面
							util.previousPage()
						}
					},
					errCallBack: (err) => {
						console.log(err)
						this.loginErrHandle(err);
					},
				};
				http.request(params);
			},




			/**
			 * 登录异常
			 */
			loginErrHandle(err) {
				if (
					err.code === 500
				) {
					uni.showToast({
						title: err.msg || "Error",
						icon: "none",
					});
				}


			},

			/**
			 * 回到首页
			 */
			toIndex() {
				util.toHomePage();
			},
			/**
			 * 去服务条款和隐私协议页面
			 */
			toTermsOfService(key) {
				uni.navigateTo({
					url: "/pages/package-user/pages/terms-page/terms-page?sts=" + key,
				});
			},
			/**
			 * 头像
			 */
			getUploadImg: function(e) {
				var tempFilePaths = e.detail.avatarUrl;
				const params = {
					url: "/upload/oss",
					filePath: tempFilePaths,
					name: "file",
					callBack: (res2) => {
						this.avatar = res2
					},
				};
				const obj = {
					src: tempFilePaths,
					quality: 0.2,
				};
				this.$refs.hCompress.compress(obj, e.detail.avatarUrl).then((res) => {
					params.filePath = res;
					http.upload(params);
				});
			},
			// 用户昵称
			getNickNameInt: function(e) {
				this.name = e.detail.value;
			},
			save() {
				if (this.name.trim() && this.avatar) {
					this.showAuth = false
				}
			}
		},
	};
</script>
<style>
	@import "./user-login.css";
</style>
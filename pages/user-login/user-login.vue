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
			<view class="input-con">
				<image class="phone_icons" src="/static/login/phone_icon.png" />
				<input class="phone-number" placeholder="请输入手机号" border="none" v-model="phoneNumber"
					@blur="phoneChange"></input>
			</view>
			<!-- <view class="input" style="margin-top: 40rpx;">
				<image class="phone_icon" src="/static/login/code_icon.png" mode="widthFix" />
				<text class="line"></text>
				<u--input placeholder="请输入验证码" border="none" v-model="code" @blur="codeChange"></u--input>
				<text class="code" :class="flag ? 'color' : ''" @click="getCode">获取验证码</text>
			</view> -->
			<!-- 服务条款 -->
			<view class="item statement">
				<label class="statement-label" @tap.stop="handlePrivacyClick">
					<checkbox class="check-box" :checked="isPrivacy === 1" />
					<view style="color: #979797 ; margin-top: 4rpx;">
						我已阅读并同意上品时代
						<text @tap.stop="toTermsOfService('serviceTerms')">《服务条款》</text>
						<text style="color: #979797">和</text>
						<text @tap.stop="toTermsOfService('servicePolicy')">《隐私协议》</text>
					</view>
				</label>
			</view>
			<button class="authorized-btn" @tap="maskBtn" :class="phoneNumber ? 'loginColor' : ''"
				:loading="isChecked ? true : false">
				{{ this.isChecked ? '登陆中' : '立即登录' }}
			</button>
		</view>
	</view>
</template>

<script>
const http = require("@/utils/http");
const util = require("@/utils/util.js");
import hCompress from "@/components/helang-compress/helang-compress";
export default {
	props: {},
	components: {
		hCompress,
	},
	data() {
		return {
			appType: uni.getStorageSync("bbcAppType"),
			showAuth: false, // 用户是否首次登录 true 是 false 否
			isPrivacy: 1,
			phoneNumber: null,
			code: 1994,
			flag: false,
			flag2: false,
			// codeText:null,
			appId: null,
			isChecked: false
		};
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		// 头部导航标题
		uni.setNavigationBarTitle({
			title: '用户登录',
		});
		this.getWexinPublicAccount()
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
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
	onShow: function () {
		// if (window.location.href.includes('code')) {
		// 	const code = this.getQueryParam(window.location.href, 'code')
		// 	const state = this.getQueryParam(window.location.href, 'state')
		// 	if (state == '123') {
		// 		this.getUserPublicAccountOpenIdByCode(code)
		// 	}
		// 	if (state == 'STATE') {
		// 		const url = new URL(window.location.href);
		// 		const params = url.searchParams;
		// 		const codes = params.getAll('code');
		// 		if (uni.getStorageSync('bbcUserInfo') && uni.getStorageSync('bbcToken')) {
		// 			this.getUserPublicAccountOpenId(uni.getStorageSync('bbcUserInfo').id, codes.length == 1 ? codes[0] : codes[1], uni.getStorageSync('bbcToken'))
		// 		}
		// 	}
		// }
	},
	methods: {
		// 静默授权
		jingMoAuth(appId) {
			let redirect_uri = encodeURIComponent(window.location.href.split("#")[0] + '#/pages/user-login/user-login')
			window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
		},
		// 手动授权
		weixinAuthLogin(appId) {
			let redirect_uri = encodeURIComponent(window.location.href.split("#")[0] + '#/pages/user-login/user-login')
			window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`
		},
		getQueryParam(url, param) {
			// 创建一个URL对象
			const urlObj = new URL(url);
			// 使用URLSearchParams获取指定的查询参数
			return urlObj.searchParams.get(param);
		},
		// 获取公众号appId
		getWexinPublicAccount() {
			const params = {
				url: '/admin/get/setting?name=GONG_ZHONGHAO_APPID&pageNo=1&pageSize=10',
				method: "GET",
				callBack: (res) => {
					this.appId = res.list[0].value
					if (!window.location.href.includes('code') && !uni.getStorageSync('userManualExit')) {
						// this.jingMoAuth(this.appId)
					}
				},
			};
			http.request(params);
		},
		// 获取用户公众号openId
		getUserPublicAccountOpenId(userId, code, loginToken) {
			const params = {
				url: `/wx/h5/getToken/wx?userId=${userId}&code=${code}&type=1&loginToken=${loginToken}`,
				method: "GET",
				callBack: (res) => {
					uni.removeStorageSync('userManualExit')
					if (uni.getStorageSync('bbcRouteUrlAfterLogin')) {
						window.location.href = window.location.href.split("?")[0] + '#' + uni.getStorageSync('bbcRouteUrlAfterLogin')
					} else {
						window.location.href = window.location.href.split("?")[0] + '#/pages/index/index'
					}
				},
			};
			http.request(params);
		},
		// 获取用户openID
		getUserPublicAccountOpenIdByCode(code) {
			const params = {
				url: `/wx/h5/codeLogin?code=${code}`,
				method: "GET",
				callBack: (res) => {
					if (res.id) {
						uni.setStorageSync("bbcTempUid", res.openId);
						if (res.loginToken) {
							uni.setStorageSync("bbcIsPrivacy", 1);
							uni.setStorageSync("bbcHadLogin", true);
							uni.setStorageSync("bbcToken", res.loginToken);
							uni.setStorageSync("bbcLoginResult", res); // 保存整个登录数据
							uni.setStorageSync('bbcUserInfo', res); //用户信息
							getApp().globalData.isLanding = false;
							while (getApp().globalData.requestQueue.length) {
								http.request(getApp().globalData.requestQueue.pop());
							}
						}
						if (uni.getStorageSync('bbcRouteUrlAfterLogin')) {
							window.location.href = window.location.href.split("?")[0] + '#' + uni.getStorageSync('bbcRouteUrlAfterLogin')
						} else {
							window.location.href = window.location.href.split("?")[0] + '#/pages/index/index'
						}
					} else {
						window.location.href = window.location.href.replace('&state=123', '')
					}

				},
			};
			http.request(params);
		},
		phoneChange(e) {
			if (!util.checkPhoneNumber(e.detail.value)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
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

			if (!util.checkPhoneNumber(this.phoneNumber)) {
				uni.showToast({
					title: '请输入正确的手机号',
					icon: 'none'
				})
				return
			}
			if (this.isPrivacy === 1 && this.phoneNumber && this.code) {
				this.isChecked = true
				const params = {
					url: '/pub/user/login/sms/code',
					method: "POST",
					data: JSON.stringify({
						mobile: this.phoneNumber,
						smsCode: this.code,
					}),
					callBack: (res) => {
						this.isChecked = false
						if (!res.id) {
							uni.setStorageSync("bbcTempUid", res);
							// 还原全局 正在登录状态
							getApp().globalData.isLanding = false;
							while (getApp().globalData.requestQueue.length) {
								http.request(getApp().globalData.requestQueue.pop());
								getApp().globalData.currentReqCounts--;
							}
						} else {
							uni.setStorageSync("bbcTempUid", res.openId);
							if (res.loginToken) {
								uni.setStorageSync("bbcIsPrivacy", 1);
								uni.setStorageSync("bbcHadLogin", true);
								uni.setStorageSync("bbcToken", res.loginToken);
								uni.setStorageSync("bbcLoginResult", res); // 保存整个登录数据
								uni.setStorageSync('bbcUserInfo', res); //用户信息
								getApp().globalData.isLanding = false;
								while (getApp().globalData.requestQueue.length) {
									http.request(getApp().globalData.requestQueue.pop());
								}

								if (!res.bizId) {
									// 弹出公众号授权
									this.weixinAuthLogin(this.appId)
								} else {
									// 返回未登录前点击的页面
									uni.removeStorageSync('userManualExit')
									util.previousPage()
								}

							}
						}
					},
					errCallBack: () => {
						this.isChecked = false
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
<style lang="scss">
page {
	background: #FFF3EF;
	height: 100%;
	position: relative;
}

.con {
	background: #FFF3EF;
}

.login_bg {
	width: 100%;
	height: 100%;
}

.login-form {
	width: 90%;
	margin: -200rpx auto;
	position: absolute;
	left: 50%;
	transform: translateX(-50%);

	.happy {
		font-family: PingFang SC, PingFang SC;
		font-weight: 400;
		font-size: 40rpx;
		color: #101010;
		line-height: 48rpx;
		margin-bottom: 40rpx;
	}

	.input-con {
		width: 100%;
		height: 92rpx;
		background: #ffffff;
		display: flex;
		flex-direction: row;
		align-items: center;
		border-radius: 20rpx;

		.phone_icons {
			width: 52rpx;
			height: 52rpx;
			margin-left: 18rpx;
		}

		.phone-number {
			margin-left: 20rpx;
		}

		.code {
			font-weight: 400;
			font-size: 30rpx;
			color: #979797;
		}

		.color {
			color: #FD594D;
		}
	}
}

.authorized-btn {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	margin: 0 auto;
	text-align: center;
	background-color: #FD594D;
	border: 1rpx solid #FD594D;
	color: #fff;
	border-radius: 14rpx;
	font-size: 32rpx;
	margin-top: 60rpx;
	border-radius: 98rpx;
	font-weight: normal;
	letter-spacing: 0rpx;
	opacity: 1;
	box-shadow: 0rpx 8rpx 12rpx 0rpx #FFA099;
}

.loginColor {
	background-color: #FD594D;
	border: 1rpx solid #FD594D;
}

/* 条款声明 */
.statement {
	margin-top: 20rpx;
	font-size: 26rpx;
	line-height: 2em;
	color: #999999;
}

.statement-label {
	display: flex;
}

.statement text {
	color: #4083FF;
	cursor: pointer;
}

.checked {}
</style>
<template>
	<view class="container">
		<navigation />
		<view v-if="showGoLiveRoom" class="go-live"><text @tap="toLiveAddress">返回直播间</text></view>
		<view class="con">
			<view class="list" v-if="giftInfo.name">
				<view class="left-con">
					<view class="name">{{ giftInfo.name }}</view>
					<view class="time">发布时间：{{ giftInfo.createTime }}</view>
				</view>
				<view class="button" v-if="giftInfo.status == 0" @click="receiveGift">
					立即领取
				</view>
				<view class="button" v-else style="background-color: #979797;" @click="received">
					已领取
				</view>
			</view>
		</view>
	</view>
</template>

<script>
const http = require("@/utils/http");
const util = require("@/utils/util");
export default {
	data() {
		return {
			giftId: null,
			giftInfo: {},
			showGoLiveRoom: false
		};
	},
	onShow: function () {
		uni.setNavigationBarTitle({
			title: '领取礼品卡'
		})
		if (window.location.href.includes('ht=1')) {
			window.top.location = window.location.href.substring(0, (window.location.href.length - 5))
		}
		if (uni.getStorageSync('courseIdExpiredTime')) {
			if ((new Date().getTime() - 2 * 3600 * 1000) >= uni.getStorageSync('courseIdExpiredTime')) {
				this.showGoLiveRoom = false
			} else {
				this.showGoLiveRoom = true
			}
		} else {
			this.showGoLiveRoom = false
		}
	},
	onLoad: function (options) {
		
		if (options.id) {
			this.giftId = options.id
			if (uni.getStorageSync('bbcToken')) {
				this.openId = uni.getStorageSync('bbcUserInfo').openId
				this.getGiftListData(options.id, this.openId)
			} else {
				wx.login({
					success: (res) => {
						// 用code 请求登录
						const params = {
							url: "/pub/user/login/auth",
							method: "POST",
							data: JSON.stringify({
								code: res.code,
								loginType: 1
							}),
							callBack: (res1) => {
								if (!res1.id) {
									this.openId = res1
								} else {
									this.openId = res1.openId
								}
								this.getGiftListData(options.id, this.openId)
							},
							errCallBack: () => {
							},
						};
						http.request(params);
					},
				});

			}
		}

	},
	// js文件，广告事件监听 Page({ 
	adLoad() {
		console.log('视频广告 广告加载成功')
	},
	adError(err) {
		console.error('视频广告 广告加载失败', err)
	},
	adClose() {
		console.log('视频广告 广告关闭')
	},
	// }) 
	methods: {
		// 跳转到欢拓直播地址
		toLiveAddress() {
			util.checkAuthInfo(() => {
				uni.navigateTo({ url: '/pages/package-user/pages/huantuolive/huantuolive?courseId=' + uni.getStorageSync('courseId') })
			})
		},
		// 领取礼品卡
		receiveGift: util.debounce(function () {
			const params = {
				url: "/pub/user/receive/gift",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify({
						id: this.giftId, openId: this.openId
					}),
				},
				callBack: (res) => {
					if (res === 0) {
						console.log(this.giftInfo)
						this.giftInfo.status = 1
						uni.showToast({
							title: '领取成功',
							icon: 'none',
							mask: true
						})
					}
				},
				errCallBack: () => {
					uni.showToast({
						title: '领取失败',
						icon: 'none',
						mask: true
					})
				}
			}
			http.request(params);
		}, 1000),

		// 根据id获取礼品卡
		getGiftListData(id, openId) {
			const params = {
				url: "/pub/user/gift/one",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify({ giftId: id, openId: openId }),
				},
				callBack: (res) => {
					this.giftInfo = res
				},
			}
			http.request(params);
		},
		received() {
			uni.showToast({
				title: '已领取',
				icon: 'none',
				mask: true
			})
		}

	},
};
</script>

<style>
@import "./exchange-area.css";
</style>
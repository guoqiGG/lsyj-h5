<template>
	<view class="main">
		<view class="top">
			<view :class="['news-swiper']">
				<view class="news-swiper-con">
					<view class="message-play" style="margin-top: 20rpx;">
						<image src="/static/horn.png" class="hornpng" />
						<view class="scroll-news-content">
							<view class="news-content">
								<view class="news-text">走进氢春态，省钱成常态！进入直播间，福利不间断！</view>
							</view>
						</view>
						<!-- <text class="arrow" /> -->
					</view>
				</view>
				<!-- 消息播放end -->
			</view>
			<!-- 导航&公告end -->
		</view>

		<swiper class="swiper" circular="true" :indicator-dots="true" :autoplay="true" :interval="3000"
			:duration="1000">
			<block v-for="(item, seq) in indexImgs" :key="seq">
				<swiper-item class="banner-item">
					<view class="img-box">
						<img :src="item.imgUrl" alt="" />
					</view>
				</swiper-item>
			</block>
		</swiper>

		<view class="content">
			<view class="middle">
				<view class="convert" @click="goConvert()">
					<image class="bg-convert-2" src="/static/bg-convert-2.png" />
					<image class="bg-convert-3" src="/static/bg-convert-3.png" />
					<view class="convert-title">
						青春豆兑换区
					</view>
					<view class="convert-sub">
						福利多多
					</view>
					<view class="convert-go-pic">
						<view class="convert-go">
							GO>
						</view>
					</view>

				</view>
				<view class="singIn" @tap="goMemberCenter">
					<image class="bg-singIn-2" src="/static/bg-singIn-2.png" />
					<image class="bg-singIn-3" src="/static/bg-singIn-3.png" />
					<view class="singIn-title">
						签到
					</view>
					<view class="singIn-sub">
						签到有礼
					</view>
					<view class="singIn-go-pic">
						<view class="singIn-go">
							GO>
						</view>
					</view>
				</view>
			</view>
			<view class="sponsored-ad">
				<view class="sponsored-ad-title" @tap="toLiveAddress">
					看直播
				</view>
				<view class="sponsored-ad-content-box" @tap="toLiveAddress">
					<view class="sponsored-ad-content">
						<image src="/static/zhibo.png" style="width: 100%; height:100%;" alt="" />
					</view>

				</view>
			</view>
		</view>
	</view>
</template>

<script>
import navigationBar from '@/components/navigation-bar/index.vue'
import { mpAppName } from '@/utils/config';
// 引入wxjs
import wx from "weixin-js-sdk";
const util = require("@/utils/util.js");
const http = require("@/utils/http.js");
export default {
	components: {
		navigationBar
	},
	onLoad: function (options) {
		console.log('options.scene', options)
		// 团长绑定用户
		if (options.scene) {
			if (uni.getStorageSync('bbcToken')) {
				console.log(decodeURIComponent(options.scene))
				if (decodeURIComponent(options.scene).includes('*')) { // 团长扫用户
					let userId = options.scene.split('*')[0]
					let giftId = options.scene.split('*')[1]
					http.request({
						url: '/pub/user/leader/binding',
						methods: 'POST',
						data: {
							sign: 'qcsd',
							data: JSON.stringify({
								userId: userId,
								giftRuleUserId: giftId,
								loginToken: uni.getStorageSync('bbcToken')
							})
						},
						callBack: (res) => {
							if (res.loginToken) {
								uni.setStorageSync('bbcToken', res.loginToken)
							}
							uni.showToast({
								title: '核销成功',
								icon: 'none',
							})
						}
					})
				} else { // 用户扫团长
					http.request({
						url: '/pub/leader/binding',
						methods: 'POST',
						data: {
							sign: 'qcsd',
							data: JSON.stringify({
								loginToken: uni.getStorageSync('bbcToken'),
								parentId: options.scene
							})
						},
						callBack: (res) => {
							if (res.loginToken) {
								uni.setStorageSync('bbcToken', res.loginToken)
							}
							uni.showToast({
								title: '绑定成功',
								icon: 'none',
							})
						}
					})
				}

			} else {
				util.checkAuthInfo(() => {
				})
			}
		}
	},
	onShareAppMessage: function () {
		wx.showShareMenu({
			withShareTicket: true,
			menus: ['shareAppMessage', 'shareTimeline']
		})
		return {
			path: "pages/user/user",
			title: mpAppName,
			imageUrl: '/static/logo.png',
			success: function (res) {
				// 转发成功
			},
			fail: function (res) {
				// 转发失败
			}
		};
	},
	//用户点击右上角分享朋友圈
	onShareTimeline: function () {
		return {
			title: '氢春时代',
			imageUrl: '/static/logo.png'
		}
	},
	onLaunch() {
		// this.getShareInfo();
	},
	created() {
		// 调用分享的事件
		// this.getShareInfo();
	},

	data() {
		return {
			navigationBarIsShow: true,
			title: '氢春时代',
			tabConfig: {
				background: '',
				fontColor: '#FFFFFF',
				iconColor: '#FFFFFF'
			},
			isBgImg: false,
			indexImgs: [{
				imgUrl: 'https://qingchuntai2.oss-cn-beijing.aliyuncs.com/2024/02/20/1.jpg',
				id: 1
			},
			{
				imgUrl: 'https://qingchuntai2.oss-cn-beijing.aliyuncs.com/2024/02/20/2.jpg',
				id: 2
			},
			{
				imgUrl: 'https://qingchuntai2.oss-cn-beijing.aliyuncs.com/2024/02/20/3.jpg',
				id: 3
			},
			{
				imgUrl: 'https://qingchuntai2.oss-cn-beijing.aliyuncs.com/2024/02/20/4.jpg',
				id: 4
			},
			],
		}
	},
	// js文件，广告事件监听 Page({
	adLoad() {
		console.log('Banner 广告加载成功')
	},

	adError(err) {
		console.error('Banner 广告加载失败', err)
	},
	adClose() {
		console.log('Banner 广告关闭')
	},
	methods: {
		getShareInfo() {
			//获取url链接（如果有#需要这么获取）
			var url = encodeURIComponent(window.location.href.split("#")[0]);
			//获取url链接（如果没有#需要这么获取）
			// var url = encodeURIComponent(window.location.href);
			let bbcUserInfo = uni.getStorageSync("bbcUserInfo");
			const params = {
				url: '/wx/h5/getSing?url=' + url + '&userId=' + bbcUserInfo.id,
				method: "GET",
				callBack: (res) => {
					wx.config({
						debug: true, // 开启调试模式,调用的所有 api 的返回值会在客户端 alert 出来，若要查看传入的参数，可以在 pc 端打开，参数信息会通过 log 打出，仅在 pc 端时才会打印。
						appId: res.appId, // 必填，公众号的唯一标识
						timestamp: parseInt(res.timestamp), // 必填，生成签名的时间戳
						nonceStr: res.nonceStr, // 必填，生成签名的随机串
						signature: res.signature, // 必填，签名
						jsApiList: [
							"updateAppMessageShareData",
							"updateTimelineShareData"
						] // 必填，需要使用的 JS 接口列表
					});
					wx.checkJsApi({
						jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
						success: function (res) {
							console.log('可以用');
						},
						fail: function (err) {
							console.log('不可以用', err);
						},
					});

					wx.ready(() => {
						// var shareData = {
						// 	title: "氢春时代",
						// 	desc: "2024年04月09日",
						// 	link: "http://h5.hnspsd.com",
						// 	imgUrl: "http://qingchuntaijava1.oss-cn-beijing.aliyuncs.com/2023/12/43d35a023a344097854affcaecb664bf.jpg"
						// };
						wx.updateAppMessageShareData({
							title: "氢春时代",
							desc: "2024年04月09日",
							// link: "http://h5.hnspsd.com",
							link: 'http://h5.hnspsd.com?userId=' + bbcUserInfo.id,
							imgUrl: "http://qingchuntaijava1.oss-cn-beijing.aliyuncs.com/2023/12/43d35a023a344097854affcaecb664bf.jpg",
							success: function () {
								alert('updateAppMessageShareData成功',)
							},
							fail: function (err) {
								alert('updateAppMessageShareData失败',)
								// console.log('updateAppMessageShareData失败',err);
							},
						})
						//自定义“分享给朋友”及“分享到QQ”按钮的分享内容
						// wx.updateAppMessageShareData(shareData);
						//自定义“分享到朋友圈”及“分享到 QQ 空间”按钮的分享内容（1.4.0）
						// wx.updateTimelineShareData(shareData);
					});
					//错误了会走 这里
					wx.error(function (res) {
						alert('微信分享错误信息', err)
					});

				},
				errCallBack: () => {
					alert('errCallBack',)
				},

			};
			http.request(params);
		},
		// 跳转到青春豆兑换专区
		goConvert() {
			util.checkAuthInfo(() => {
				uni.navigateTo({
					url: '/pages/package-member-integral/pages/integral-index/integral-index'
				})
			})
		},
		// 跳转到会员中心
		goMemberCenter() {
			util.checkAuthInfo(() => {
				uni.navigateTo({
					url: '/pages/package-member-integral/pages/member-center/member-center'
				})
			})
		},
		// 跳转到欢拓直播地址
		toLiveAddress() {
			util.checkAuthInfo(() => {
				const params = {
					url: '/huan/tuo/user/courseId',
					data: JSON.stringify({ userId: uni.getStorageSync("bbcUserInfo").id }),
					// data: JSON.stringify({ userId: 22 }),
					callBack: (res) => {
						if (res) {
							// #ifdef H5 
							// window.location.href = res
							// #endif
							uni.navigateTo({ url: '/pages/package-user/pages/huantuolive/huantuolive?urls=' + res })
						}
					},
					errCallBack: () => {
						alert('errCallBack',)
					},

				};
				http.request(params);

			})
		}
	},
}
</script>

<style lang="less" scoped>
.main {
	background-color: #e6e6e6;
	min-height: 100vh;

}

.content {
	padding: 0 20rpx;
	box-sizing: border-box;
	background: #e6e6e6;
	overflow-x: hidden;
}

.top {
	width: 100%;
	height: 480rpx;
}

.news-swiper {
	padding: 0 0rpx;
}

.news-swiper .news-swiper-con {
	background: linear-gradient(180deg, #025BFF 0%, rgba(2, 91, 255, 0) 100%);
	display: block;
	padding-top: 15rpx;
	height: 264rpx;
}

// /* 消息播放 */
.message-play {
	position: relative;
	height: 64rpx;
	background: #fff;
	margin: 0 20rpx;
	box-sizing: border-box;
	border-radius: rpx;
	padding: 8rpx 0 8rpx 120rpx;
	border-radius: 40rpx;
}

.message-play .hornpng {
	width: 202rpx;
	height: 202rpx;
	position: absolute;
	left: -46rpx;
	top: -80rpx;
	margin-right: 8rpx;
	z-index: 998;
	transform: rotate(12.78deg);
}

.message-play .swiper-cont {
	height: 64rpx;
	line-height: 64rpx;
	margin-top: 0;
	z-index: 999;
}

.message-play .swiper-cont .items {
	text-overflow: ellipsis;
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	text-align: left;
	font-size: 32rpx;
}

.news-text {
	font-weight: 400;
	font-size: 30rpx;
	color: #810301;
	line-height: 48rpx;
	text-align: center;
	font-style: normal;
	text-transform: none;
}

.arrow {
	width: 15rpx;
	height: 15rpx;
	border-top: 3rpx solid #686868;
	border-right: 3rpx solid #686868;
	transform: rotate(45deg);
	position: absolute;
	right: 30rpx;
	top: 34rpx;
}

.scroll-news-content {
	width: 100%;
	overflow: hidden;
	white-space: nowrap;
	height: 64rpx;
	line-height: 64rpx;
	font-size: 30rpx;
	color: #232323;
}

.scroll-news-content .news-content {
	animation: loop 8s linear infinite;
}

.scroll-news-content .content {
	display: inline-block;
	background: #fff;
}

.scroll-news-content .content:nth-child(2) {
	margin-left: 10rpx;
	padding-right: 50rpx;
	box-sizing: border-box;
}

@keyframes loop {
	0% {
		transform: translateX(100%);
		-webkit-transform: translateX(100%);
	}

	100% {
		transform: translateX(calc(-120% + 90rpx));
		-webkit-transform: translateX(calc(-120% + 90rpx));
	}
}

// /* 消息播放end */

swiper {
	width: calc(100% - 40rpx);
	height: 250rpx;
	margin: 0 20rpx;
	margin-top: -350rpx;
	border-radius: 20rpx;
	overflow: hidden;
}

swiper .banner-item {
	width: 100%;
	height: 250rpx;
}

swiper .banner-item .img-box {
	width: 100%;
	height: 250rpx;
}

swiper .banner-item .img-box img {
	width: 100%;
	height: 250rpx;
}

.middle {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;

	.convert {
		background: linear-gradient(90deg, #3874e4 0%, #BA55FF 100%);
		width: 346rpx;
		height: 220rpx;
		border-radius: 20rpx;
		box-sizing: border-box;
		padding: 14rpx 22rpx;
		position: relative;
		overflow: hidden;

		.bg-convert-2 {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}

		.bg-convert-3 {
			position: absolute;
			width: 130%;
			height: 130%;
			top: -35rpx;
			left: -55rpx;
		}

		.convert-title {
			font-weight: 400;
			font-size: 40rpx;
			color: #FFFFFF;
			line-height: 48rpx;
			letter-spacing: 1px;
			font-style: normal;
			text-transform: none;
		}

		.convert-sub {
			font-weight: 400;
			font-size: 22rpx;
			color: #FFFFFF;
			line-height: 48rpx;
		}

		.convert-go-pic {
			display: flex;
			justify-content: space-between;
			height: 100rpx;

			.convert-go {
				margin-top: 30rpx;
				width: 112rpx;
				height: 62rpx;
				background: #fff;
				border-radius: 30rpx;
				line-height: 62rpx;
				text-align: center;
				font-weight: 400;
				font-size: 40rpx;
				color: #6E2EED;
				line-height: 62rpx;
			}
		}
	}

	.singIn {
		position: relative;
		background: linear-gradient(90deg, #e7324d 0%, #e2ae70 100%);
		width: 346rpx;
		height: 220rpx;
		border-radius: 20rpx;
		box-sizing: border-box;
		padding: 14rpx 22rpx;
		overflow: hidden;

		.bg-singIn-2 {
			position: absolute;
			width: 100%;
			height: 100%;
			top: 0;
			left: 0;
		}

		.bg-singIn-3 {
			position: absolute;
			width: 130%;
			height: 130%;
			top: -35rpx;
			left: -55rpx;
		}

		.singIn-title {
			font-weight: 400;
			font-size: 40rpx;
			color: #FFFFFF;
			line-height: 48rpx;
			letter-spacing: 1px;
			font-style: normal;
			text-transform: none;
		}

		.singIn-sub {
			font-weight: 400;
			font-size: 22rpx;
			color: #FFFFFF;
			line-height: 48rpx;
		}

		.singIn-go-pic {
			display: flex;
			justify-content: space-between;
			height: 196rpx;

			.singIn-go {
				margin-top: 30rpx;
				width: 112rpx;
				height: 62rpx;
				background: #fff;
				border-radius: 30rpx;
				line-height: 62rpx;
				text-align: center;
				font-weight: 400;
				font-size: 40rpx;
				color: #F32843;
			}

		}
	}

}

.sponsored-ad {
	width: 710rpx;
	margin-top: 20rpx;
	padding-top: 20rpx;

	.sponsored-ad-title {
		margin: 0 20rpx 20rpx;
		height: 48rpx;
		box-sizing: border-box;
		font-weight: 400;
		font-size: 34rpx;
		color: #101010;
		line-height: 48rpx;
		letter-spacing: 1px;
		border-left: 6rpx solid #518BFC;
		padding-left: 10rpx;
	}

	.sponsored-ad-content-box {
		box-sizing: border-box;
		padding: 52rpx 24rpx;
		width: 710rpx;
		height: 404rpx;
		border-radius: 20rpx;
		background: #9DBEFF;
	}

	.sponsored-ad-content {
		width: 662rpx;
		height: 296rpx;
		border-radius: 20rpx;
		//background: #D8D8D8;
	}
}
</style>
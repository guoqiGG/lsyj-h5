<template>
	<view class="main">
		<view class="top">
			<view :class="['news-swiper']">
				<view class="news-swiper-con">
					<view class="message-play" style="margin-top: 20rpx;">
						<image src="/static/horn.png" class="hornpng" />
						<view class="scroll-news-content">
							<view class="news-content">
								<view class="news-text">走进上品时代，省钱成常态！进入直播间，福利不间断！</view>
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
			<block v-for="item in indexImgs" :key="item.id">
				<swiper-item class="banner-item">
					<view class="img-box">
						<img v-if="item.type == 0" :src="item.url" alt="" />
						<video v-else :src="item.url" :controls="false" autoplay loop muted :object-fit="fill"></video>
					</view>
				</swiper-item>
			</block>
		</swiper>

		<view class="content">
			<view class="middle">
				<view class="convert" @click="goConvert()">
					<image class="bg-convert" src="/static/bg-convert.png" />
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
					<image class="bg-singIn" src="/static/bg-signIn.png" />
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
				<view class="sponsored-ad-title">
					赞助广告
				</view>
				<view class="sponsored-ad-content-box">
					<view class="sponsored-ad-content">
						<image :src="liveImg" style="width: 100%; height:100%;border-radius: 20rpx;" alt="" />
					</view>

				</view>
			</view>
		</view>
	</view>
</template>

<script>
import navigationBar from '@/components/navigation-bar/index.vue'
// 引入wxjs
import wx from "weixin-js-sdk";
const util = require("@/utils/util.js");
const http = require("@/utils/http.js");
export default {
	components: {
		navigationBar
	},
	onLoad: function (options) {
		console.log(1)
		util.checkAuthInfo(() => {
			this.getShareInfo();
		})
		this.getCarousel()
		this.getLiveImg()
	},
	onShow() {

	},
	data() {
		return {
			navigationBarIsShow: true,
			title: '上品时代',
			tabConfig: {
				background: '',
				fontColor: '#FFFFFF',
				iconColor: '#FFFFFF'
			},
			isBgImg: false,
			indexImgs: [],
			liveImg: null,
		}
	},
	methods: {
		getShareInfo() {
			var url = encodeURIComponent(window.location.href.split("#")[0]);
			let userId = uni.getStorageSync('bbcUserInfo').id
			const params = {
				url: `/wx/h5/getSing?url=${url}&userId=${userId}`,
				method: "GET",
				callBack: (res) => {
					wx.config({
						debug: false,
						appId: res.appId,
						timestamp: parseInt(res.timestamp),
						nonceStr: res.nonceStr,
						signature: res.signature,
						jsApiList: [
							"updateAppMessageShareData",
							"updateTimelineShareData"
						]
					});

					wx.ready(() => {
						wx.checkJsApi({
							jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
							success: function (res) {
								console.log('可以用');
							},
							fail: function (err) {
								console.log('不可以用', err);
							},
						});
						wx.updateAppMessageShareData({
							title: res.title,
							desc: res.coupyweiring,
							link: window.location.href.split("#")[0] + '#/?userId=' + res.userId,
							imgUrl: res.img,
							success: function () {
								console.log('分享成功')
							},
							fail: function (err) {
								console.log('分享失败', err)
							},
						})
					});
					//错误了会走 这里
					wx.error(function (err) {
						// console.log('微信分享错误信息', err)
					});
				},
				errCallBack: () => {
					console.log('失败')
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
		// 获取首页轮播列表
		getCarousel() {
			var that = this
			const params = {
				url: '/swiper/user/list',
				method: 'GET',
				callBack: function (res) {
					that.setData({
						indexImgs: res
					})
				}
			}
			http.request(params)
		},
		getLiveImg() {
			const params = {
				url: '/admin/get/setting?name=HOME_PAGE_IMAGE&pageNo=1&pageSize=10',
				method: "GET",
				callBack: (res) => {
					this.liveImg = res.list[0].value
				},
			};
			http.request(params);
		},
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
	background: linear-gradient(180deg, #FD594D 0%, rgba(2, 91, 255, 0) 100%);
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
	border-radius: 8rpx;
	padding: 8rpx 0 8rpx 120rpx;
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
	color: #FD594D;
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
	border-radius: 8rpx;
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

swiper .banner-item .img-box video {
	width: 100%;
	height: 250;
}

.middle {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;

	.convert {
		width: 346rpx;
		height: 220rpx;
		border-radius: 8rpx;
		box-sizing: border-box;
		padding: 14rpx 22rpx;
		position: relative;
		overflow: hidden;

		.bg-convert {
			position: absolute;
			width: 394rpx;
			height: 356rpx;
			top: -2rpx;
			left: -3rpx;
			border-radius: 25rpx;
		}

		.convert-title {
			position: absolute;
			top: 15rpx;
			left: 30rpx;
			font-weight: 400;
			font-size: 36rpx;
			color: #0559F4;
			line-height: 48rpx;
			letter-spacing: 1px;
		}

		.convert-sub {
			position: absolute;
			top: 60rpx;
			left: 30rpx;
			font-weight: 400;
			font-size: 22rpx;
			color: #0559F4;
			line-height: 48rpx;
		}

		.convert-go-pic {
			display: flex;
			justify-content: space-between;
			height: 196rpx;
			position: absolute;
			bottom: -20rpx;

			.convert-go {
				margin-top: 94rpx;
				width: 112rpx;
				height: 62rpx;
				background: #fff;
				border-radius: 30rpx;
				line-height: 62rpx;
				text-align: center;
				font-weight: 400;
				font-size: 40rpx;
				color: #0559F4;
				line-height: 62rpx;
			}

			.convert-pic {
				box-sizing: border-box;
				height: 196rpx;
			}
		}
	}

	.singIn {
		position: relative;
		width: 346rpx;
		height: 220rpx;
		border-radius: 8rpx;
		box-sizing: border-box;
		padding: 14rpx 22rpx;
		overflow: hidden;

	

		.bg-singIn {
			border-radius: 25rpx;
			position: absolute;
			width: 412rpx;
			height: 352rpx;
			top: -2rpx;
			left: -3rpx;
		}

		.singIn-title {
			position: absolute;
			top: 15rpx;
			left: 30rpx;
			font-weight: 400;
			font-size: 36rpx;
			color: #FF6200;
			line-height: 48rpx;
			letter-spacing: 1px;
		}

		.singIn-sub {
			position: absolute;
			top: 60rpx;
			left: 30rpx;
			font-weight: 400;
			font-size: 22rpx;
			color: #FF6200;
			line-height: 48rpx;
		}

		.singIn-go-pic {
			display: flex;
			justify-content: space-between;
			height: 196rpx;
			position: absolute;
			bottom: -20rpx;

			.singIn-go {
				margin-top: 94rpx;
				width: 112rpx;
				height: 62rpx;
				background: #fff;
				border-radius: 30rpx;
				line-height: 62rpx;
				text-align: center;
				font-weight: 400;
				font-size: 40rpx;
				color: #FF6200;
				line-height: 62rpx;
			}
		}
	}

}

.sponsored-ad {
	width: 710rpx;
	margin-top: 20rpx;
	padding-top: 20rpx;
	background: linear-gradient(90deg, #F9C0BC 0%, #FD594D 100%);
	border-radius: 8rpx;

	.sponsored-ad-title {
		margin: 0 20rpx 20rpx;
		height: 48rpx;
		box-sizing: border-box;
		font-weight: 400;
		font-size: 34rpx;
		color: #FFFFFF;
		line-height: 48rpx;
		letter-spacing: 1px;
		padding-left: 10rpx;
	}

	.sponsored-ad-content-box {
		box-sizing: border-box;
		padding: 52rpx 24rpx;
		width: 710rpx;
		height: 404rpx;
		border-radius: 8rpx;
		background: #FFFFFF;
	}

	.sponsored-ad-content {
		width: 662rpx;
		height: 296rpx;
		border-radius: 8rpx;
	}
}
</style>
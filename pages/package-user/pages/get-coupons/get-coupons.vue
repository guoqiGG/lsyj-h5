<template>
	<view class="container">
		<!-- <navigation /> -->
		<view class="con">
			<view class="list" v-if="couponInfo.name">
				<view class="left-con">
					<text style="font-size: 36rpx;">￥</text>{{ couponInfo.amount }}
					<view class="dot"></view>
					<view class="dot"></view>
				</view>
				<view class="right-con">
					<view class="name">{{ couponInfo.name }}</view>
					<text class="button" v-if="couponInfo.status == 0" @click="receiveGift">
						立即领取
					</text>
					<text class="button" v-else style="border: 2rpx solid #979797;color:#979797;" @click="received">
						已领取
					</text>
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
			couponId: null,
			couponInfo: {},
		};
	},
	onShow: function () {
	},
	onLoad: function (options) {

		if (options.id) {
			this.couponId = options.id
			if (uni.getStorageSync('bbcToken')) {
				this.userId = uni.getStorageSync('bbcUserInfo').id
				this.getCouponListData(options.id, this.userId)
			} else {
				util.checkAuthInfo(() => { })
			}
		}
		// if (window.location.href.includes('ht=1')) {
		// 	window.top.location = window.location.href.substring(0, (window.location.href.length - 5))
		// }
	},
	methods: {
		// 领取优惠券
		receiveGift: util.debounce(function () {
			const params = {
				url: "/user/coupon/receive",
				method: "POST",
				data: JSON.stringify({ couponId: this.couponId, userId: uni.getStorageSync('bbcUserInfo').id }),
				callBack: (res) => {

					if (res === 1) {
						this.couponInfo.status = 1
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

		// 根据id获取优惠券信息
		getCouponListData(id, userId) {
			const params = {
				url: "/user/coupon/chcek",
				method: "POST",
				data: JSON.stringify({ couponId: id, userId: userId }),
				callBack: (res) => {
					this.couponInfo = res
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
@import "./get-coupons.css";
</style>
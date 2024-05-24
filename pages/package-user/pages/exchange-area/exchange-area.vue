<template>
	<view class="container">
		<!-- <navigation /> -->
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
	},
	onLoad: function (options) {
		util.checkAuthInfo(() => {
			if (options.id) {
				if (uni.getStorageSync('bbcToken')) {
					this.giftId = options.id
					this.getGiftListData(options.id, uni.getStorageSync('bbcUserInfo').id)
				}
			}
		})
	},
	methods: {
		// 领取礼品卡
		receiveGift: util.debounce(function () {
			const params = {
				url: "/pub/user/receive/gift",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify({
						id: this.giftId, userId: uni.getStorageSync('bbcUserInfo').id
					}),
				},
				callBack: (res) => {
					if (res === 0) {
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
		getGiftListData(id, userId) {
			const params = {
				url: "/pub/user/gift/one",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify({ giftId: id, userId: userId }),
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
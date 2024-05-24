<template>
	<view class="con">
		<navigation />
		<view class="h-tabs">
			<view :class="'h-tab ' + (coupon_state == 1 ? 'on' : '')" data-type="1" @tap="changeTab">可合并
			</view>
			<view :class="'h-tab ' + (coupon_state == 2 ? 'on' : '')" data-type="2" @tap="changeTab">已合并
			</view>
		</view>
		<view class="container" style="padding: 20rpx;">
			<uni-swipe-action>
				<block v-for="(item, index) in dataList" :key="index">
					<uni-swipe-action-item :right-options="options" @click="onClick(item)">
						<view class="item">
							<view class="left">
								<image src="../../static/icon_delivery.png" mode="scaleToFill" />
							</view>
							<view class="right">
								<view class="coupon-name">{{ item.name }}</view>
								<view class="coupon-text" v-if="coupon_state == '2'">合成时间：{{ item.createTime }}</view>
								<view class="coupon-text" v-if="coupon_state == '2' && item.status == 1">
									核销时间：{{ item.cancelDate }}
								</view>
								<view class="coupon-text" v-if="coupon_state == '1'">
									领取时间：{{ item.createTime }}</view>
							</view>
							<view class="use" v-if="coupon_state == 1 && item.type == 0"
								@tap="syntheticGiftCard(coupon_state == 1 ? item.giftId : item.id, userId)">
								<text class="text">合并</text>
							</view>

							<view class="use" v-if="coupon_state == 1 && item.type == 2"
								@tap="syntheticGiftCard(coupon_state == 1 ? item.giftId : item.id, userId)">
								<text class="text">合并</text>
							</view>

							<view class="use" v-if="coupon_state == '2' && item.status == 0 && item.type == 0"
								@tap="writeOffSyntheticGiftCard(item.id, userId)">核销
							</view>

							<view class="use" v-if="coupon_state == '2' && item.status == 0 && item.type == 2"
								@tap="toBindLeader(item.id)">扫码核销
							</view>

							<view class="use used" v-if="coupon_state == '2' && item.status == 1">已核销</view>
						</view>
					</uni-swipe-action-item>
				</block>

				<EmptyAllTips v-if="isLoaded" :isEmpty="!dataList.length" emptyTips="暂无数据" :isAll="isAll" />
			</uni-swipe-action>


		</view>
		<view class="liveRoom" v-if="showGoLiveRoom" @tap="toLiveAddress">
			<view class="anime">
				<view class="items"></view>
				<view class="items"></view>
				<view class="items"></view>
				<view class="items"></view>
				<view class="items"></view>
				<view class="items"></view>
			</view>
			<text class="text">点击回直播间</text>
		</view>
	</view>
</template>
<script>
const http = require("@/utils/http");
const util = require("@/utils/util");
export default {
	data() {
		return {
			options: [{
				text: '删除',
				style: {
					backgroundColor: '#dd524d',
				}
			}],
			isLoaded: false,
			coupon_state: 1, //礼品卡状态 1可合并 2 已合并
			dataList: [],
			isAll: false,
			remark: "",
			pageSize: 10,
			userId: 0,
			current: 1, // 当前页
			pages: 1,//总页数
			showGoLiveRoom: false
		};
	},
	onShow: function () {
		if (uni.getStorageSync('coureIdExpiredTime')) {
			if ((new Date().getTime() - 2 * 3600 * 1000) >= uni.getStorageSync('coureIdExpiredTime')) {
				this.showGoLiveRoom = false
			} else {
				this.showGoLiveRoom = true
			}
		} else {
			this.showGoLiveRoom = false
		}
		util.checkAuthInfo(() => {
			if (uni.getStorageSync('bbcUserInfo')) {
				this.userId = uni.getStorageSync('bbcUserInfo').id
			}
			this.getGiftCardList()
		})
	},
	methods: {
		// 跳转到欢拓直播地址
		toLiveAddress() {
			util.checkAuthInfo(() => {
				// uni.navigateTo({ url: '/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url') })
				window.location.replace(window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url'))
			})
		},
		onClick(item) {
			const params = {
				url: "/pub/user/delete/gift",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify({ id: item.giftId }),
				},
				callBack: (res) => {
					uni.showToast({
						title: '删除成功',
						icon: 'none',
						mask: true
					})
					this.getGiftCardList()
				},
			}
			http.request(params);

		},
		// 标签切换事件
		changeTab(e) {
			this.coupon_state = e.currentTarget.dataset.type
			this.current = 1
			this.pages = 1
			this.getGiftCardList();
		},
		getGiftCardList() {
			this.isLoaded = false
			let data
			if (this.coupon_state == 1) { //可合并列表
				data = {
					pageNo: this.current,
					pageSize: this.pageSize,
					userId: this.userId
				}
				const params = {
					url: "/pub/user/gift/list",
					method: "POST",
					data: {
						sign: 'qcsd',
						data: JSON.stringify(data),
					},
					callBack: (res) => {
						this.isLoaded = true
						this.dataList = this.current == 1 ? res.list : this.dataList.concat(res.list)
						this.pages = res.total == 0 ? 1 : Math.ceil(res.total / this.pageSize)
					},
				}
				http.request(params);
			} else { // 已合并列表
				data = {
					pageNo: this.current,
					pageSize: this.pageSize,
					userId: this.userId
				}
				const params = {
					url: "/pub/user/gift/combine/list",
					method: "POST",
					data: {
						sign: 'qcsd',
						data: JSON.stringify(data),
					},
					callBack: (res) => {
						this.isLoaded = true
						this.dataList = this.current == 1 ? res.list : this.dataList.concat(res.list)
						this.pages = res.total == 0 ? 1 : Math.ceil(res.total / this.pageSize)
					},


				}
				http.request(params);
			}

		},
		// 合成礼品卡
		syntheticGiftCard: util.debounce(function (giftId, userId) {
			let data = {
				giftId: giftId,
				userId: userId
			}
			const params = {
				url: "/pub/user/gift/merge",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify(data),
				},
				callBack: (res) => {
					if (res) {
						uni.showToast({
							title: res,
							icon: 'none',
							mask: true
						})
						this.pages = 1
						this.current = 1
						this.getGiftCardList()

					}
				},
			}
			http.request(params);
		}, 1000),
		// 核销合成礼品卡
		writeOffSyntheticGiftCard: util.debounce(function (id, userId) {
			uni.showModal({
				title: "添加备注",
				editable: true,
				placeholderText: "备注(非必填)",
				showCancel: true,
				success: ({
					confirm,
					cancel,
					content
				}) => {
					let data = {
						remark: content,
						giftRuleId: id,
						userId: userId
					}
					if (confirm) {
						const params = {
							url: "/pub/user/gift/cancel",
							method: "POST",
							data: {
								sign: "qcsd",
								data: JSON.stringify(data)
							},
							callBack: (res1) => {
								uni.showToast({
									title: res1,
									icon: "none",
								});
								this.pages = 1
								this.current = 1
								this.getGiftCardList()
							},
						};
						http.request(params);
					} else if (cancel) { }
				},
			});
		}, 1000),
		toBindLeader: util.debounce(function (id) {
			uni.navigateTo({
				url: '/pages/package-user/pages/bind-user/bind-user?giftId=' + id
			})
		}, 1000),
	},
	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {
		if (this.current < this.pages) {
			this.current = this.current + 1
			this.getGiftCardList()
		} else {
			this.isAll = true
		}
	}
};
</script>

<style lang="scss" scoped>
.liveRoom {
	position: fixed;
	height: 120rpx;
	width: 120rpx;
	border-radius: 15rpx;
	padding: 5rpx;
	right: 5%;
	bottom: 30%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	z-index: 10;
	background: #fff;
	box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.12);
	text-align: center;

	.anime {
		height: 40rpx;
		display: flex;
		flex-direction: row;
		align-items: flex-end;
		justify-content: space-between;

		.items {
			width: 8rpx;
			height: 40rpx;
			background: #ff5470;
			margin-left: 5rpx;
			animation: loop 2s linear infinite 0s;

			&:nth-child(2) {
				height: 20rpx;
				background: #00ebc7;
				animation: loop 2s linear infinite 0.5s;
			}

			&:nth-child(3) {
				height: 40rpx;
				background: #fde24f;
				animation: loop 2s linear infinite 1s;
			}

			&:nth-child(4) {
				height: 20rpx;
				background: #14c9c9;
				animation: loop 2s linear infinite 1.5s;
			}

			&:nth-child(5) {
				height: 20rpx;
				background: #00ebc7;
				animation: loop 2s linear infinite 0.5s;
			}

			&:nth-child(6) {
				height: 40rpx;
				background: #fde24f;
				animation: loop 2s linear infinite 1s;
			}
		}
	}

	.text {
		font-size: 32rpx;
		line-height: 40rpx;
		font-weight: 400;
		color: #dd524d;
	}
}

@keyframes loop {
	0% {
		height: 0rpx;
	}

	50% {
		height: 40rpx;
	}

	100% {
		height: 0rpx;
	}
}

.h-tabs {
	border-bottom: 1px solid #f2f2f2;
	display: flex;
	justify-content: space-around;
	font-size: 28rpx;
	/*  position: fixed;
	top: 0; */
	z-index: 1000;
	width: 100%;
	background: #fff;
}

.h-tab {
	height: 88rpx;
	line-height: 88rpx;
}

.h-tab.on {
	border-bottom: 3px solid #005aff;
	font-weight: 600;
	color: #005aff;
}

.container {
	box-sizing: border-box;
	/* padding-top: 88rpx; */
}

.item {
	position: relative;
	box-sizing: border-box;
	/* margin: 20rpx 30rpx 0rpx; */
	margin-bottom: 20rpx;
	background: #fff;
	padding: 30rpx 20rpx;
	border-radius: 5rpx 0rpx 0rpx 5rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	box-shadow: -3px 3px 6px 0px rgba(111, 111, 111, 0.2);
}

.left {
	display: flex;
	align-items: center;
}

.left image {
	width: 130rpx;
	height: 130rpx;
	border-radius: 50%;
	margin-top: 20rpx;
}

.right {
	margin-left: 10rpx;
}

.right .coupon-name {
	width: 340rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	font-size: 28rpx;
	color: #000000;
	font-weight: normal;
	line-height: 24rpx;
	margin-bottom: 30rpx;
}

.right .coupon-text {
	font-size: 20rpx;
	color: #979797;
	margin-top: 10rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 350rpx;
}

.use {
	height: 210rpx;
	width: 180rpx;
	position: absolute;
	background: #c53032;
	color: #ffffff;
	right: 0;
	font-size: 36rpx;
	/* border-radius: 7rpx; */
	border-top-left-radius: 0;
	border-bottom-left-radius: 0;
	line-height: 200rpx;
	text-align: center;
}

.used {
	background: #979797;
}

:deep(.button-group--right) {
	margin-bottom: 19rpx !important;
}
</style>
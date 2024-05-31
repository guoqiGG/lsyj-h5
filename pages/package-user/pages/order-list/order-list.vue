<template>
	<view style="min-height:100vh;background: #f2f2f2;">
		<view class="order-list">
			<navigation />
			<u-tabs lineHeight="4" lineColor="#A691F4" :scrollable="true" :current="currentTab" :list="list1"
				@click="handleTabClick"></u-tabs>
			<view class="order-list-content">
				<view class="order-list-content-box" v-for="(item, index) in orderLists" :key="item.orderId">
					<view class="order-list-content-box-title">
						<view class="order-list-content-box-title-left">
							订单编号：{{ item.orderId }}
						</view>
						<view class="order-list-content-box-title-right" :class="item.orderStatus > 1 ? 'blue' : ''"
							v-if="currentTab !== 5">
							<!-- // 00全部 1待支付 2待发货(已支付) 3已发货 4确认收货  5已取消-->
							{{ item.orderStatus === 1 ? '待支付' : item.orderStatus === 2 ? '待发货' : item.orderStatus === 3
				?
				'已发货' : item.orderStatus === 4 ? '已完成' : item.orderStatus === 5 ? '已取消' : '' }}
						</view>
						<view class="order-list-content-box-title-right" :class="item.orderStatus > 1 ? 'blue' : ''"
							v-else>
							<!-- //0-未申请退款；1-申请退款；2-退款中；3-退款失败；4-退款成功 5后台手动退款成功-->
							{{ item.refundStatus === 0 ? '未申请退款' : item.refundStatus === 1 ? '申请退款' : item.refundStatus
				===
				2 ? '退款中' : item.refundStatus === 3 ? '退款失败' : item.refundStatus === 4 ? '退款成功' :
					item.refundStatus === 5 ? '后台退款成功' : '' }}
						</view>
					</view>
					<view class="order-list-content-box-content" @click="goOrderDetail(item.orderId)">
						<image class="order-list-content-box-content-img" :src="item.orderGoods[0].thumbail" mode="">
						</image>
						<view class="order-list-content-box-content-text">
							<view class="title">
								{{ item.orderGoods[0].title }}
							</view>
							<view class="size" v-if="item.specificationName != '默认'">
								{{ item.specificationName ? item.specificationName : '' }}
							</view>
							<view class="price">
								<view class="price-number">
									￥{{ item.orderGoods[0].salePrice }}
								</view>
								<view class="price-amount">
									{{ item.goodsCount }}件
								</view>

							</view>
						</view>
					</view>
					<view class="order-list-content-box-count">
						共{{ item.goodsCount }}件商品 总计：{{ item.totalAmount }}
					</view>

					<view class="order-list-content-box-btn">
						<!-- <view class="cancelBtn" style="width: 120rpx;color: #D90024;border: 2rpx solid #D90024;"
							@click="deleteOrder(item.orderId)" v-if="item.orderStatus !== 1">
							删除
						</view> -->
						<view style="margin-left:20rpx;color: #D90024;border: 2rpx solid #D90024;" class="cancelBtn"
							@click="cancelOrder(item.orderId)" v-if="item.orderStatus === 1">
							取消订单
						</view>

						<view class="cancelBtn"
							style="margin-left: 20rpx;width: 120rpx;color: #025BFF;border: 2rpx solid #025BFF;"
							v-if="item.orderStatus === 1" @click="payOrder(item.orderId)">
							付款
						</view>
						<view class="cancelBtn" v-if="item.orderStatus === 3"
							style="margin-left: 20rpx;width: 120rpx;color: #A691F4;border: 2rpx solid #A691F4;"
							@click="receive(item.orderId)">
							确认收货
						</view>
					</view>
				</view>
				<!-- 空列表或加载全部提示 -->
				<EmptyAllTips v-if="isLoaded" :isEmpty="!orderLists.length" emptyTips="暂无订单信息" :isAll="isAll" />
			</view>
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
import wxpay from "weixin-js-sdk";
export default {
	data() {
		return {
			// 00全部 1待支付 2待发货(已支付) 3已发货 4确认收货
			list1: [{
				name: '全部',
				id: 0,
			}, {
				name: '待付款',
				id: 1,
			}, {
				name: '待发货',
				id: 2,
			}, {
				name: '待收货',
				id: 3,
			}, {
				name: '已完成',
				id: 4,
			},
			{
				name: '退款/售后',
				id: 100,
			},
			],
			isLoaded: false,
			isAll: false,
			currentTab: 0,
			orderLists: [],
			pageNo: 1, // 当前页
			pageSize: 10, //每页条数
			loginToken: null,
			status: null,
			userId: null, //用户id
			showGoLiveRoom: false
		}
	},
	onLoad(option) {
		this.currentTab = option.id
		if (this.currentTab == 0) {
			this.status = this.list1[0].id
		} else if (this.currentTab == 1) {
			this.status = this.list1[1].id
		} else if (this.currentTab == 2) {
			this.status = this.list1[2].id
		} else if (this.currentTab == 3) {
			this.status = this.list1[3].id
		} else if (this.currentTab == 4) {
			this.status = this.list1[4].id
		} else if (this.currentTab == 5) {
			this.status = this.list1[5].id
		}
	},
	onShow() {
		if (uni.getStorageSync('coureIdExpiredTime') && window.parent === window) {
			if ((new Date().getTime() - 2 * 3600 * 1000) >= uni.getStorageSync('coureIdExpiredTime')) {
				this.showGoLiveRoom = false
			} else {
				this.showGoLiveRoom = true
			}
		} else {
			this.showGoLiveRoom = false
		}
		this.loginToken = uni.getStorageSync("bbcToken")
		this.userId = uni.getStorageSync("bbcUserInfo").id
		this.getOrderLists()
	},
	methods: {
		// 跳转到欢拓直播地址
		toLiveAddress() {
			util.checkAuthInfo(() => {
				if (window.parent === window) {
					uni.navigateTo({ url: '/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url') })
				} else {
					window.location.replace(window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url'))
				}
			})
		},
		// 跳转取订单详情
		goOrderDetail(orderId) {
			uni.navigateTo({
				url: `/pages/package-user/pages/order-detail/order-detail?orderId=` + orderId
			})
		},
		// 取消订单
		cancelOrder(orderId) {
			let obj = {
				orderId: orderId,
				userId: this.userId,
				loginToken: this.loginToken,
			}
			const params = {
				url: "/pub/order/cancel",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify(obj),
				},
				callBack: (res) => {
					uni.showToast({
						title: "取消成功~",
						icon: "none",
					});
					this.getOrderLists()
				},
			}
			http.request(params);
		},
		deleteOrder(orderId) {
			let obj = {
				orderId: orderId,
				loginToken: this.loginToken
			}
			const params = {
				url: "/pub/order/delete",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify(obj),
				},
				callBack: (res) => {
					uni.showToast({
						title: "删除成功",
						icon: "none",
					});
					this.getOrderLists()
				},
			}
			http.request(params);
		},
		// 支付 dvyType 2自提 1快递
		payOrder(orderId) {
			const params = {
				url: '/pub/pay/order',
				method: 'POST',
				data: {
					sign: "qcsd",
					data: JSON.stringify({
						orderId: orderId,
						payType: 50,
						loginToken: this.loginToken
					})
				},
				callBack: (res) => {
					uni.setStorageSync('payInfo', res)
					wxpay.config({
						debug: false,
						appId: res.appId,
						timestamp: res.timeStamp,
						nonceStr: res.nonceStr,
						signature: res.paySign,
						// jsApiList: ['chooseWXPay']
					})
					WeixinJSBridge.invoke(
						'getBrandWCPayRequest', {
						appId: res.appId, //公众号名称，由商户传入
						timeStamp: res.timeStamp, //时间戳，自1970年以来的秒数
						nonceStr: res.nonceStr, //随机串
						package: res.package,
						signType: res.signType, //微信签名方式：
						paySign: res.paySign //微信签名
					},
						function (res) {
							// 支付成功
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								// 使用以上方式判断前端返回,微信团队郑重提示：
								//res.err_msg将在用户支付成功后返回ok，但并不保证它绝对可靠。
								// 支付成功后的跳转
								window.location.href = window.location.href.split("#")[0] + '#/pages/package-pay/pages/pay-result/pay-result?sts=1&orderNumbers=' + orderId
							}
							// 支付过程中用户取消
							if (res.err_msg == "get_brand_wcpay_request:cancel") {
								window.location.href = window.location.href.split("#")[0] + '#/pages/package-pay/pages/pay-result/pay-result?sts=0&orderNumbers=' + orderId
							}
							// 支付失败
							if (res.err_msg == "get_brand_wcpay_request:fail") {
								window.location.href = window.location.href.split("#")[0] + '#/pages/package-pay/pages/pay-result/pay-result?sts=0&orderNumbers=' + orderId
							}
						}
					)

				}
			}
			http.request(params)
		},
		// 确认收货
		receive(orderId) {
			const params = {
				url: '/pub/order/confirm',
				method: 'POST',
				data: {
					sign: "qcsd",
					data: JSON.stringify({
						orderId: orderId,
						loginToken: this.loginToken
					})
				},
				callBack: (res) => {
					this.getOrderLists()
				}
			}
			http.request(params)
		},
		handleTabClick(e) {
			this.currentTab = e.index;
			this.pageNo = 1
			this.orderLists = []
			this.status = e.id
			this.getOrderLists()
		},
		// 获取订单信息
		getOrderLists() {
			this.isLoaded = false
			let obj = {
				pageNo: this.pageNo,
				pageSize: this.pageSize,
				loginToken: this.loginToken,
				status: this.status,
			}
			const params = {
				url: "/pub/order/list",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify(obj),
				},
				callBack: (res) => {
					this.isLoaded = true
					this.orderLists = this.pageNo == 1 ? res : this.orderLists.concat(res)
					if (this.pageNo != 1 && res.length == 0) {
						this.isAll = true
					}
				},
			}
			http.request(params);
		},
	},
	/**
		 * 页面上拉触底事件的处理函数
		 */
	onReachBottom() {
		if ((this.orderLists.length % this.pageSize == 0) && this.orderLists.length >= this.pageSize && this.isAll == false) {
			this.pageNo = this.pageNo + 1
			this.getOrderLists()
		} else {
			this.isAll = true
		}
	}
}
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

/deep/ .u-tabs__wrapper__nav__line {
	left: -12rpx;
	width: 58rpx !important;

}


/deep/ .u-tabs__wrapper__nav__item__text {
	font-size: 28rpx !important;
}

.order-list {
	overflow-x: hidden;
	overflow-y: auto;
}

.order-list-content {
	.order-list-content-box {
		background: #fff;
		margin-top: 20rpx;
		width: 750rpx;
		// height: 398rpx;
		box-sizing: border-box;
		padding: 18rpx 22rpx;
		font-size: 28rpx;
	}

	.order-list-content-box-title {
		display: flex;
		justify-content: space-between;
		margin-bottom: 26rpx;

		.blue {
			color: #025BFF;
		}
	}

	.order-list-content-box-content {
		display: flex;

		.order-list-content-box-content-img {
			width: 220rpx;
			height: 220rpx;
			margin-right: 22rpx;
			border-radius: 12rpx
		}

		.order-list-content-box-content-text {
			display: flex;
			flex-direction: column;
			justify-content: space-between;


			.title {
				font-size: 32rpx;
			}

			.size {
				margin-top: 10rpx;
				font-size: 22rpx;
				color: #696868;
			}

			.price {
				width: 474rpx;
				display: flex;
				justify-content: space-between;
				margin-top: 20rpx;
				font-size: 24rpx;

			}
		}
	}

	.order-list-content-box-count {
		margin-top: 18rpx;
		display: flex;
		justify-content: flex-end;
	}

	.order-list-content-box-btn {
		width: 100%;
		height: 54rpx;
		display: flex;
		justify-content: flex-end;
		margin: 10rpx;

		.cancelBtn {
			width: 168rpx;
			height: 54rpx;
			border: 2rpx solid #979797;
			font-weight: 400;
			font-size: 24rpx;
			color: #979797;
			line-height: 54rpx;
			text-align: center;
			border-radius: 30rpx;
		}
	}
}
</style>
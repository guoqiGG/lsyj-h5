<template>
	<view class="container">
		<navigation />
		<view v-if="showText" class="prod-detail-text">商品详情</view>
		<view :class="['image-con', (showText ? '' : 'image-conh')]">
			<image class="image" :src="productDetail.thumbail" @error="handlePicError" />
		</view>
		<view class="prod-content" v-if="productDetail.name">
			<view class="prod-name">{{ productDetail.name }}</view>
			<view class="price">
				<text class="symbol">￥</text>
				<text class="big-num">{{ parsePrice(price)[0] }}</text>
				<text class="small-num">.{{ parsePrice(price)[1] }}</text>
			</view>
			<view class="prod-number">仅剩<text class="red">{{ productDetail.stock }}</text>件</view>
			<view class="prod-number" v-if="productDetail.canUseCoupon"><text
					style="color: #9e9e9e;font-size: 24rpx;">{{ productDetail.canUseCoupon === 0 ? '不可用优惠券' : ''
					}}</text>
			</view>
		</view>
		<view class="prod-select-number">
			<view class="prod-select-number-left">
				<view class="has-select-text">已选</view>
				<view class="has-select-number">{{ numberValue }}件</view>
			</view>
			<view class="prod-select-number-right" @tap="openSkuPopup">
				...
			</view>
		</view>
		<view class="prod-description"
			style="margin-top: 10rpx;background: #fff;padding:30rpx;width:100%;overflow-x:hidden;box-sizing:border-box;">
			<rich-text :nodes="productDetail.description"></rich-text>
		</view>

		<view class="footer">
			<view class="con">
				<!-- <view class="left" @tap="toHomePage()">
					<image src="/static/tabbar/uncheck-home.png" mode="scaleToFill" />
					<view class="text">首页</view>
				</view> -->
				<view class="right">
					<view class="buy-now" @tap="openSkuPopup()">立即购买</view>
				</view>
			</view>
		</view>
		<!-- 规格 弹出层 -->
		<view class="sku-con">
			<u-popup :show="skuShow">
				<view class="close" @tap="closeSkuPopup">
					<image class="close-img" src="/static/close.png" />
				</view>
				<view class="con-container">
					<view class="sku-info">
						<view class="sku-info-left">
							<image class="image" :src="productDetail.thumbail" mode="aspectFit"
								@error="handlePicError" />
						</view>
						<view class="sku-info-right">
							<view class="price">
								<text class="symbol">￥</text>
								<!--        <text class="big-num">{{ parseInt(totalPrice) }}</text>
                <text class="big-num">.{{ totalSmallPrice }}</text> -->
								<text class="big-num">{{ parsePrice(totalPrice)[0] }}</text>
								<text class="small-num">.{{ parsePrice(totalPrice)[1] }}</text>
							</view>
							<view class="select-number">已选：<text class="number">{{ numberValue }}件</text></view>
							<view class="stock">库存：<text class="stock-number">{{ productDetail.stock }}</text></view>
						</view>
					</view>

					<view class="select-number-con">
						<view class="number-title"><text>数量</text></view>
						<view class="number-con">
							<view class="minus" @tap="numberValueMinus">-</view>
							<input class="input" type="number" min="1" v-model="numberValue" @input="numberInput()" />
							<view class="add" @tap="numberValueAdd">+</view>
						</view>
					</view>
					<scroll-view v-if="goodsSkus.length > 1" scroll-y="true" style="height: 300rpx;">
						<view class="goods-sku">
							<view class="goods-sku-title"><text>规格</text></view>
							<view class="goods-sku-list">
								<view :class="['goods-sku-list-item', chechIndex == item.id ? 'checked' : '']"
									v-for="item in goodsSkus" :key="item.id" @tap="skuSelectClick(item.id)">
									{{ item.specificationName }}
								</view>
							</view>
						</view>
					</scroll-view>
					<view class="buy-now" @tap="buyNow()"><text>立即购买</text></view>
				</view>
			</u-popup>
		</view>
		<!-- 加载状态 -->
		<view v-if="!productDetail.name">
			<u-loading-icon :show="loadingShow" text="加载中" textSize="40"></u-loading-icon>
		</view>
	</view>
</template>
<script>
const http = require("@/utils/http");
const util = require("@/utils/util");
// 引入wxjs
import wx from "weixin-js-sdk";
export default {
	data() {
		return {
			userInfo: {},
			leaderId: null,
			loadingShow: true,
			skuShow: false, //规格弹窗显示
			goodsSkus: [], // 商品规格
			numberValue: 1, // 选择件数默认为 1
			goodsId: null, //商品id
			productDetail: {},
			price: null, // 总价格
			// smallPrice: null, // 小数价格
			totalPrice: null, //总价格
			// totalSmallPrice: null,//总的小数
			chechIndex: 0, //选中商品规格 默认第一个
			orderType: 1, // 1-配送单，2-自提单   leaderType 0-有店 1-无店
			showGoLiveRoom: false,
			showText: false
		}
	},
	onLoad(option) {
		util.checkAuthInfo(() => {
			if (option.prodId) {
				this.goodsId = option.prodId
				this.getProductDetail()
			}
			if (uni.getStorageSync('bbcUserInfo').puid) {
				this.getShareInfo()
			}
		})
	},
	onShow() {
		this.showText = window.parent !== window
		util.checkAuthInfo(() => {
			this.getUserInfo()
			this.skuShow = false
		})
	},
	methods: {
		// 获取用户信息
		getUserInfo() {
			const params = {
				url: "/pub/user/get/detail?userId=" + uni.getStorageSync('bbcUserInfo').id,
				method: "GET",
				callBack: (res) => {
					uni.setStorageSync('bbcUserInfo', res)
					this.userInfo = res
					if (this.userInfo.leaderType === 0) {
						this.orderType = 2
					} else if (this.userInfo.leaderType === 1) {
						this.orderType = 1
					}
				},
			};
			http.request(params);
		},
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
								// console.log('可以用');
							},
							fail: function (err) {
								// console.log('不可以用', err);
							},
						});
						wx.updateAppMessageShareData({
							title: this.productDetail.name,
							desc: '快来选购吧！',
							link: window.location.href.split("#")[0] + '#/pages/package-prod/pages/prod/prod?prodId=' + this.goodsId,
							imgUrl: this.productDetail.thumbail,
							success: function () {
								// console.log('分享成功')
							},
							fail: function (err) {
								// console.log('分享失败', err)
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
		toHomePage() {
			util.toHomePage()
		},
		/**
		 * 图片加载失败时，现实默认图片
		 */
		handlePicError() {
			this.categoryImg = '../../static/def.png'
		},
		// 打开规格弹窗
		openSkuPopup() {
			this.skuShow = true
		},
		// 关闭规格弹窗
		closeSkuPopup() {
			this.skuShow = false
		},
		// 减少数量
		numberValueMinus() {
			this.numberValue = Number(this.numberValue)
			this.numberValue = this.numberValue <= 1 ? 1 : this.numberValue - 1
			this.totalPrice = (this.price * this.numberValue)

		},
		// 增加商品数量
		numberValueAdd() {
			this.numberValue = Number(this.numberValue)
			this.numberValue = this.numberValue + 1
			this.totalPrice = (this.price * this.numberValue)

		},
		numberInput() {
			if (isNaN(this.numberValue)) { //判断值是不是数字
				this.$nextTick(() => {
					this.numberValue = 1
					this.totalPrice = (this.price * this.numberValue)
				})
			} else if (this.numberValue == "") { //这是当只有1位的时候，删除这个会进入这个判断，如果没有该判断，当只有一位的时候就不能删除
				this.$nextTick(() => {
					this.numberValue = 1
					this.totalPrice = (this.price * this.numberValue)
				})
			} else if (this.numberValue == 0) { //判断值是不是1
				this.$nextTick(() => {
					this.numberValue = 1
					this.totalPrice = (this.price * this.numberValue)
				})
			} else if (this.numberValue.indexOf(".") != -1) { //判断有没有输入小数点
				this.$nextTick(() => {
					this.numberValue = Math.floor(this.numberValue);
					this.totalPrice = (this.price * this.numberValue)

				})
			} else {
				this.totalPrice = (this.price * this.numberValue)
			}

		},
		getProductDetail() {
			let obj = {
				goodsId: this.goodsId
			}
			const params = {
				url: "/pub/goods/detail",
				method: "POST",
				data: {
					sign: 'qcsd',
					data: JSON.stringify(obj),
				},
				callBack: (res) => {
					this.productDetail = res
					this.price = this.totalPrice = res.goodsSkus[0].price
					// this.totalPrice = this.price
					this.goodsSkus = res.goodsSkus
					this.chechIndex = res.goodsSkus[0].id
				},
			}
			http.request(params);
		},
		skuSelectClick(id) {
			this.chechIndex = id
		},
		buyNow() {
			util.checkAuthInfo(() => {
				// 订单预检
				let obj = {
					loginToken: uni.getStorageSync('bbcToken'),
					userId: uni.getStorageSync('bbcUserInfo').id,
					orderType: this.orderType,
					goods: [{
						goodsId: this.goodsId,
						skuId: this.chechIndex,
						buyNumber: this.numberValue
					}]
				}
				const params = {
					url: "/pub/order/preview",
					method: "POST",
					data: {
						sign: 'qcsd',
						data: JSON.stringify(obj),
					},
					callBack: (res) => {
						let orderItem = res
						let url = '/pages/package-pay/pages/submit-order/submit-order'
						this.toSubmitOrder(orderItem, url)
					},
					errCallBack: (errMsg) => {
						if (errMsg.code === 500) {
							uni.showToast({
								title: errMsg.msg,
								icon: 'none',
								mask: true
							})
						}
						this.closeSkuPopup()
					},

				}
				http.request(params);
			})
		},
		/**
		 * 跳转提交订单页
		 */
		toSubmitOrder(orderItem, url) {
			uni.setStorageSync("bbcOrderItem", Object.assign({}, orderItem));

			if (window.parent === window) {
				uni.navigateTo({
					url,
				});
			} else {
				window.location.replace(window.location.href.split("#")[0] + '#/pages/package-pay/pages/submit-order/submit-order')
			}


		},
	}
}
</script>
<style>
@import './prod.css'
</style>
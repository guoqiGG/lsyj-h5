<template>
  <view class="container">
    <navigation />
    <view v-if="showGoLiveRoom" class="go-live"><text @tap="toLiveAddress">返回直播间</text></view>
    <!-- 失败 -->
    <view v-if="sts == 0" class="pay-fail">
      <view class="img">
        <image src="/static/pay-fail.png" mode=""></image>
      </view>
      <view class="pay-sts fail">支付失败，请重新支付</view>
      <view class="order-detail-title">订单信息</view>
      <view class="tips">
        该订单会为您保留
        <text class="warn">5分钟</text>
        ,<text class="tips">5分钟之后如果还未付款,系统将自动取消该订单</text>
      </view>

      <view class="btns">
        <text class="button checkorder" @tap="toOrderList">查看订单</text>
      </view>
    </view>
    <!-- 成功 -->
    <view v-if="sts == 1" class="pay-success">
      <view class="img">
        <image src="/static/pay-success.png" mode=""></image>
      </view>
      <view class="pay-sts succ">支付成功</view>
      <view class="tips">支付成功，您可以去<text class="my-order" @tap="toOrderList">我的订单</text>里查看订单详情</view>
      <view class="btns">
        <text class="button checkorder" @tap="toOrderList">查看订单</text>
        <text class="button shopcontinue" @tap="toCategory">继续购物</text>
      </view>
    </view>
  </view>
</template>

<script>
const util = require("@/utils/util");
export default {
  components: {},
  props: {},
  data() {
    return {
      sts: 0,
      orderNumbers: "",
      showGoLiveRoom: false
    };
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      sts: options.sts,
      orderNumbers: options.orderNumbers,
    });
  },
  onShow() {
    if (uni.getStorageSync('coureIdExpiredTime')) {
			if ((new Date().getTime() - 2 * 3600 * 1000) >= uni.getStorageSync('coureIdExpiredTime')) {
				this.showGoLiveRoom = false
			} else {
				this.showGoLiveRoom = true
			}
		} else {
			this.showGoLiveRoom = false
		}
  },

  methods: {
    toOrderList: function () {
      uni.navigateTo({
        url: "/pages/package-user/pages/order-list/order-list?id=0"
      });
    },
    // 继续购物
    toCategory: function () {
      uni.switchTab({
        url: "/pages/category/category",
      });
    },
    // 跳转到欢拓直播地址
    toLiveAddress() {
      util.checkAuthInfo(() => {
        uni.navigateTo({ url: '/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url') })
      })
    },
  },
};
</script>
<style>
@import "./pay-result.css";
</style>

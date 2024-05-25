<template>
  <!-- 我的优惠券 -->
  <view class="container">
    <navigation />
    <view class="h-tabs">
      <view :class="'h-tab ' + (status == 0 ? 'on' : '')" data-status="0" @tap="changeTab">未使用</view>
      <view :class="'h-tab ' + (status == 1 ? 'on' : '')" data-status="1" @tap="changeTab">使用记录</view>
      <view :class="'h-tab ' + (status == 2 ? 'on' : '')" data-status="2" @tap="changeTab">已过期</view>
    </view>
    <view class="coupons">
      <block v-for="(item, index) in couponList" :key="index">
        <coupon :data-couponid="item.couponId" :can-use="status == 0" :coupon-item="item" :status="status"
          :my-coupon="true" />
      </block>
    </view>

    <!-- 空列表或加载全部提示 -->
    <EmptyAllTips v-if="isLoaded" :isEmpty="!couponList.length || couponList == []" :emptyTips="'暂无更多内容'"
      :isAll="isAll" />
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
const http = require('@/utils/http.js')
const util = require("@/utils/util");
import coupon from '@/components/coupon/index.vue'
export default {
  components: {
    coupon
  },
  props: {},
  data() {
    return {
      status: 0,
      couponList: [],
      pages: 1,
      current: 1,
      pageSize: 20,
      isLoaded: false,
      userId: 0,
      isAll: false,
      showGoLiveRoom: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (uni.getStorageSync('coureIdExpiredTime')&& window.parent === window) {
      if ((new Date().getTime() - 2 * 3600 * 1000) >= uni.getStorageSync('coureIdExpiredTime')) {
        this.showGoLiveRoom = false
      } else {
        this.showGoLiveRoom = true
      }
    } else {
      this.showGoLiveRoom = false
    }
    if (uni.getStorageSync('bbcUserInfo')) {
      this.userId = uni.getStorageSync('bbcUserInfo').id
    }
    this.loadMyCouponData(this.status)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.current < this.pages) {
      this.loadOrderData(this.sts, this.current + 1)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.current < this.pages) {
      this.current = this.current + 1
      this.loadMyCouponData(this.status)
    } else {
      this.isAll = true
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () { },
  methods: {
    // 跳转到欢拓直播地址
    toLiveAddress() {
      util.checkAuthInfo(() => {
        window.location.replace(window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url'))
      })
    },
    /**
     * 获取我的优惠券列表
     */
    loadMyCouponData(status) {
      this.isLoaded = false
      // 我的优惠券状态(status优惠券状态 0待使用 1已使用 2已过期)
      let data = {
        pageNo: this.current,
        pageSize: this.pageSize,
        userId: this.userId,
        status: status
      }
      const params = {
        url: '/pub/user/coupon/list',
        method: 'POST',
        data: {
          sign: 'qcsd',
          data: JSON.stringify(data)
        },
        callBack: (res) => {
          this.isLoaded = true
          this.couponList = this.current == 1 ? res.list : this.couponList.concat(res.list)
          this.pages = res.total == 0 ? 1 : Math.ceil(res.total / this.pageSize)
        }
      }
      http.request(params)
    },

    /**
     *  标签切换事件
     */
    changeTab(e) {
      this.status = e.currentTarget.dataset.status
      this.current = 1
      this.pages = 1
      this.couponList = []

      this.loadMyCouponData(this.status)
    }
  }
}
</script>
<style>
@import "./coupon.css";
</style>
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
</style>
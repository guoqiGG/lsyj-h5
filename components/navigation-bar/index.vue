<template>
  <view class=" bar-sticky" :style="{ background: navigationBarStyle.background }">
    <view class="content-wrap">
      <view class="status-line" :style="{
    height: lineHeight,
  }" />
      <view class="bar-line">
        <view class="bar-line container-in">
          <view v-if="!custom" class="bar-font bar-content" :class="{ 'left-text': isLeft }">
            <image v-if="!showHome" class="back-img" src="../../static/back-white.png" mode=""
              @click="$turnPage('1', 'navigateBack')" />
            <image v-else class="home" src="../../static/home.png" mode="" @click="goHome" />
            <view class="bar-title" :style="{ color: navigationBarStyle.fontColor || normal.fontColor }">
              {{ title }}
            </view>
          </view>
          <view v-else class="bar-font container-in">
            <slot />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const util = require("@/utils/util.js");
export default {
  data() {
    return {
      custom: false,
      navigationBarStyle: {
        background: '#025BFF',
        fontColor: '#ffffff',
        iconColor: '#000000'
      },
      title: '欢迎来到氢春态',
      isLeft: false,
      isWhiteBack: true,
      lineHeight: '',
      showHome: false
    }
  },
  mounted() {
    // this.lineHeight = this.$system.ktxStatusHeight + 'rpx'
    const pages = getCurrentPages()
    console.log(pages.length)
    if (pages.length <= 1) {
      this.showHome = true
    } else {
      this.showHome = false
    }
  },
  methods: {
    $turnPage(x, y) {
      uni.navigateBack(-1)
    },
    goHome() {
      util.toHomePage()
    }
  }
}
</script>

<style scoped>
/*正中*/
.bar-content {
  width: 100%;
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  justify-content: center;
}

/* 导航栏吸顶效果 */
.bar-sticky {
  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 101;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  -moz-background-size: 100% 100%;
}

.left-text {
  justify-content: flex-start;
  margin-left: 30rpx;
}

/*垂直居中*/
.container-in {
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  width: 100%;
  height: 44px;
}

.bar-line {
  height: 44px;
  /* 导航栏高度 */
}

.bar-line .bar-back {
  font-size: 52rpx !important;
  position: absolute;
  left: 30rpx;
}

.bar-line .bar-title {
  font-size: 30rpx;
  /* font-weight: bold; */
  line-height: 44rpx;
}

/*
.rt_pos {
  position: absolute;
  right: 50rpx;
  top: 150rpx;
  content: "";
  display: inline-block;
  height: 20rpx;
  width: 20rpx;
  border-width: 0 0 2px 2px;
  border-color: #fff;
  border-style: solid;
  transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
  -webkit-transform: matrix(0.71, 0.71, -.71, 0.71, 0, 0);
} */
.back-img {
  width: 34rpx;
  height: 34rpx;
  position: absolute;
  left: 30rpx;
}

.top-bg-img {
  top: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
}

.content-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.home {
  width: 50rpx;
  height: 50rpx;
  position: absolute;
  left: 30rpx;
}
</style>

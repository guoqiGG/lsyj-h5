<template>
    <view class="con">
        <iframe :src="urls" frameborder="0" allow="geolocation; microphone; camera; midi; encrypted-media; autoplay;"
            width="100%" height="100%">
        </iframe>
        <view v-if="urls" class="home" @tap="goHome">
            <image src="/static/tabbar/selected-home.png" @tap="goHome" />
        </view>
    </view>
</template>
<script>
export default {
    data() {
        return {
            urls: null
        }
    },
    onLoad(options) {
        if (options.urls) {
            this.urls = options.urls
        }
    },
    methods: {
        goHome() {
            uni.switchTab({ url: "/pages/index/index" });
        }
    },

}
</script>
<style>
.con {
    height: 100vh;
    width: 100vw;
    position: relative;
}

.home {
    position: absolute;
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    background: #FFF;
    top: 70%;
    right: 10%;
    z-index: 10000;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
   
   
}

.home image {
    margin-top: 10rpx;
    margin-left: 10rpx;
    width: 50rpx;
    height: 50rpx;
}
</style>
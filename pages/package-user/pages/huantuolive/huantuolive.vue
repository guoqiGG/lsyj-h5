<template>
    <view class="con">
        <iframe :src="urls" frameborder="0" allow="geolocation; microphone; camera; midi; encrypted-media; autoplay;"
            width="100%" height="100%">
        </iframe>
        <!-- <web-view :src="urls" /> -->
        <view v-if="urls" class="home" @tap="goHome">
            <image src="/static/tabbar/selected-home.png" @tap="goHome" />
        </view>
    </view>
</template>
<script>
const util = require("@/utils/util.js");
const http = require("@/utils/http");
// 引入wxjs
import wx from "weixin-js-sdk";
export default {
    data() {
        return {
            urls: null,
            courseId: null,
            courseName: null
        }
    },
    onLoad(options) {
        if (options.courseName) {
            this.courseName = options.courseName
        }
        this.getShareInfo()
        util.checkAuthInfo(() => {

            if (options.courseId) {
                this.courseId = options.courseId
                uni.setStorageSync('courseId', options.courseId)
                uni.setStorageSync('courseIdExpiredTime', new Date().getTime())
                this.toLiveAddress(options.courseId)
            }
            if (options.userId) {
                if (!uni.getStorageSync('bbcUserInfo').puid) {
                    http.request({
                        url: '/pub/leader/binding',
                        methods: 'POST',
                        data: {
                            sign: 'qcsd',
                            data: JSON.stringify({
                                loginToken: uni.getStorageSync('bbcToken'),
                                parentId: options.userId
                            })
                        },
                        callBack: (res) => {
                            if (res.loginToken) {
                                uni.setStorageSync('bbcToken', res.loginToken)
                                uni.setStorageSync('bbcUserInfo', res)
                            }
                            uni.showToast({
                                title: '绑定成功',
                                icon: 'none',
                                duration: 2000
                            })
                        }
                    })
                }
            }
        })
    },
    onShow() {
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
                            desc: this.courseName,
                            link: window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?userId=' + res.userId + '&courseId=' + this.courseId,
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
        goHome() {
            uni.switchTab({ url: "/pages/index/index" });
        },
        // 跳转到欢拓直播地址
        toLiveAddress(courseId) {
            util.checkAuthInfo(() => {
                const params = {
                    url: '/huan/tuo/user/courseId',
                    data: JSON.stringify({
                        userId: uni.getStorageSync("bbcUserInfo").id,
                        type: 0,  // 0 h5  1 小程序
                        course_id: courseId
                    }),
                    callBack: (res) => {
                        this.urls = res
                    }
                };
                http.request(params);
            })
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
    left: 10%;
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
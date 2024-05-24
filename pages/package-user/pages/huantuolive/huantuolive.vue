<template>
    <view class="con">
        <view class="top" v-if="urls">
            <view class="item">
                <image class="image" src="/static/live-logo.png" />
                <text>上品时代</text>
            </view>
            <view class="item" @tap="goUserPage">
                <image style="width: 40rpx;height:40rpx;" class="image" src="/static/live-user.png" />
                <text>个人中心</text>
            </view>
        </view>
        <iframe ref="myIframe" id="iframe" class="iframe" :src="urls" frameborder="0" allowfullscreen='true'
            allow="geolocation; microphone; camera; midi; encrypted-media; autoplay;"></iframe>
        <view v-if="urls && status == 1" class="send-beans">
            <text>
                {{ countDown > 0 ? '倒计时' + countDown + '分钟' : '青春豆已送' }}
            </text>
        </view>
    </view>
</template>
<script>
const util = require("@/utils/util.js");
const http = require("@/utils/http");
// 引入wxjs
import wxpay from "weixin-js-sdk";

export default {
    data() {
        return {
            urls: null,
            coureId: null,
            coureName: null,
            liveUrl: null,
            timer: null,
            countDown: null,
            status: 0,
        }
    },
    // mounted() {
    //     let iframeWindow = this.$refs.myIframe.contentWindow
    //     console.log(this.$refs.myIframe.contentWindow)
    //     iframeWindow.ByteLiveJsBridge.invokeNative = (data) => {
    //         if (data.eventKey === 11000) {
    //             iframeWindow.commonPlayer.unRegisterPlugin('PageChangePlugin');
    //         }
    //     }
    // },
    onLoad(options) {
        let options1 = options
        util.checkAuthInfo(() => {
            if (uni.getStorageSync('bbcUserInfo').puid) {
                this.getShareInfo()
            }
            this.getdySign(options1.dy == 1 ? uni.getStorageSync('url') : options1.url)
            if (options1.url || options1.dy) {
                this.liveUrl = decodeURIComponent(options1.dy == 1 ? uni.getStorageSync('url') : options1.url)
            }
            if (options1.coureName) {
                this.coureName = options1.dy == 1 ? uni.getStorageSync('coureName') : options1.coureName
            }
            if (options1.coureId || options1.dy) {
                this.coureId = options1.dy == 1 ? uni.getStorageSync('coureId') : options1.coureId
                uni.setStorageSync('coureId', options1.dy == 1 ? uni.getStorageSync('coureId') : options1.coureId)
                uni.setStorageSync('coureName', options1.dy == 1 ? uni.getStorageSync('coureName') : options1.coureName)
                uni.setStorageSync('url', options1.dy == 1 ? uni.getStorageSync('url') : options1.url)
                uni.setStorageSync('coureIdExpiredTime', new Date().getTime())
            }
            if (options1.userId) {
                if (!uni.getStorageSync('bbcUserInfo').puid) {
                    http.request({
                        url: '/pub/leader/binding',
                        methods: 'POST',
                        data: {
                            sign: 'qcsd',
                            data: JSON.stringify({
                                loginToken: uni.getStorageSync('bbcToken'),
                                parentId: options1.userId
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

        if (window.addEventListener) {
            if (uni.getStorageSync('payInfo')) {
                uni.removeStorageSync('payInfo')
            }
            window.addEventListener("storage", function (e) {
                if (uni.getStorageSync('payInfo').appId) {
                    wxpay.config({
                        debug: false,
                        appId: uni.getStorageSync('payInfo').appId,
                        timestamp: uni.getStorageSync('payInfo').timeStamp,
                        nonceStr: uni.getStorageSync('payInfo').nonceStr,
                        signature: uni.getStorageSync('payInfo').paySign,
                        // jsApiList: ['chooseWXPay']
                    })
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                        appId: uni.getStorageSync('payInfo').appId, //公众号名称，由商户传入
                        timeStamp: uni.getStorageSync('payInfo').timeStamp, //时间戳，自1970年以来的秒数
                        nonceStr: uni.getStorageSync('payInfo').nonceStr, //随机串
                        package: uni.getStorageSync('payInfo').package,
                        signType: uni.getStorageSync('payInfo').signType, //微信签名方式：
                        paySign: uni.getStorageSync('payInfo').paySign //微信签名
                    },
                        function (res) {
                            uni.removeStorageSync('payInfo')
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
            });
        }
    },
    onShow() {
        console.log('onShow')
        clearInterval(this.timer)
        this.timer = null
        this.timer = setInterval(() => {
            this.insertWatchTime()
        }, 60000);
        this.countdownSendingBeans()
        this.noSleep()
    },
    methods: {
        //屏幕常亮
        noSleep() {
            let noSleep = new this.$NoSleep();
            document.addEventListener('click',
                function enableNoSleep() {
                    noSleep.enable();
                    document.removeEventListener('click', enableNoSleep, false);
                },
                false);
        },
        // 跳转个人中心
        goUserPage() {
            uni.switchTab({ url: '/pages/user/user' })
        },
        // 倒计时
        countdownSendingBeans() {
            const params = {
                url: `/voice/engine/dao/time?course_id=${this.coureId}&userId=${uni.getStorageSync('bbcUserInfo').id}`,
                method: "GET",
                callBack: (res) => {
                    this.status = res.status
                    this.countDown = res.time
                    let startTime = new Date(res.startTime).getTime()
                    let nowTime = new Date().getTime()
                    if (nowTime <= startTime) { // 提前进入
                        setTimeout(() => {
                            this.status = 1
                            let timer = setInterval(() => {
                                if (this.countDown == 0) {
                                    clearInterval(timer)
                                    timer = null
                                }
                                this.countDown--
                            }, 60000);
                        }, startTime - nowTime);
                    } else { // 直播开始时
                        if (res.status == 1) {
                            let timer = setInterval(() => {
                                if (this.countDown == 0) {
                                    clearInterval(timer)
                                    timer = null
                                }
                                this.countDown--
                            }, 60000);
                        }
                    }
                }
            };
            http.request(params);
        },
        stringToBase64(str) {
            let base64 = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            for (let i = 0; i < str.length; i += 3) {
                const char1 = str.charCodeAt(i);
                const char2 = str.charCodeAt(i + 1);
                const char3 = str.charCodeAt(i + 2);

                const enc1 = char1 >> 2;
                const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
                const enc3 = ((char2 & 15) << 2) | (char3 >> 6);
                const enc4 = char3 & 63;

                base64 += characters.charAt(enc1) + characters.charAt(enc2) + characters.charAt(enc3) + characters.charAt(enc4);
            }
            return base64
        },

        utf8_encode(str) {
            var output = '';
            for (var n = 0; n < str.length; n++) {
                var c = str.charCodeAt(n);
                if (c < 128) {
                    output += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    output += String.fromCharCode((c >> 6) | 192);
                    output += String.fromCharCode((c & 63) | 128);
                } else {
                    output += String.fromCharCode((c >> 12) | 224);
                    output += String.fromCharCode(((c >> 6) & 63) | 128);
                    output += String.fromCharCode((c & 63) | 128);
                }
            }
            return output;
        },
        // 插入观看时间 
        insertWatchTime() {
            const params = {
                url: `/voice/engine/time?course_id=${this.coureId}&userId=${uni.getStorageSync('bbcUserInfo').id}`,
                method: "GET",
                callBack: (res) => {
                }
            };
            http.request(params);
        },
        // 生成抖音签名信息 并生成直播间地址
        getdySign(url) {
            let userId = uni.getStorageSync('bbcUserInfo').id
            const params = {
                url: `/voice/engine/sign?userId=${userId}`,
                method: "GET",
                callBack: (res) => {
                    let Sign = res.sign
                    let Nickname = encodeURIComponent(this.stringToBase64(this.utf8_encode(uni.getStorageSync('bbcUserInfo').name)))
                    let UserId = uni.getStorageSync('bbcUserInfo').id
                    this.urls = `${url}?Sign=${Sign}&Nickname=${Nickname}&UserId=${UserId}&Timestamp=${res.timeStamp}&forceCheck=true`
                }
            };
            http.request(params);
        },
        // 分享
        getShareInfo() {
            var url = encodeURIComponent(window.location.href.split("#")[0]);
            let userId = uni.getStorageSync('bbcUserInfo').id
            const params = {
                url: `/wx/h5/getSing?url=${url}&userId=${userId}`,
                method: "GET",
                callBack: (res) => {
                    wxpay.config({
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

                    wxpay.ready(() => {
                        wxpay.checkJsApi({
                            jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
                            success: function (res) {
                                // console.log('可以用');
                            },
                            fail: function (err) {
                                // console.log('不可以用', err);
                            },
                        });
                        wxpay.updateAppMessageShareData({
                            title: res.title,
                            desc: this.coureName,
                            link: window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?userId=' + res.userId + '&coureId=' + this.coureId + '&url=' + this.liveUrl,
                            imgUrl: res.img,
                            success: function () {
                                // console.log('分享成功')
                            },
                            fail: function (err) {
                                // console.log('分享失败', err)
                            },
                        })
                    });
                    //错误了会走 这里
                    wxpay.error(function (err) {
                        // console.log('微信分享错误信息', err)
                    });
                },
                errCallBack: () => {
                    console.log('失败')
                },
            };
            http.request(params);

        },
        // 返回首页
        goHome() {
            uni.switchTab({ url: "/pages/index/index" });
        },
    },
    onHide() {
        console.log('onHide')
        clearInterval(this.timer)
        this.timer = null
    },
    onUnload() {
        console.log('onUnload')
        clearInterval(this.timer)
        this.timer = null
    }

}
</script>
<style>
.con {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 100%;
}

.top {
    height: 80rpx;
    line-height: 80rpx;
    margin: 0 48rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-weight: 400;
    font-size: 28rpx;
    color: #101010;


}

.top .item {
    display: flex;
    align-items: center;
    flex-direction: row;



}

.top .item .image {
    width: 56rpx;
    height: 56rpx;
}

.top .item text {
    margin-left: 10rpx;

}

.iframe {
    width: 100%;
    height: calc(100% - 80rpx);
}

.send-beans {
    position: fixed;
    width: 116rpx;
    height: 92rpx;
    z-index: 2;
    top: 500rpx;
    right: 5%;
    width: 80rpx;
    font-size: 24rpx;
    font-weight: 400;
    border-radius: 8px;
    overflow: hidden;
    padding: 10rpx;
    text-align: center;
    background: none;
    background-image: url(/static/countdown.png);
    background-size: cover;
}

.send-beans text {
    display: block;
    width: 68rpx;
    height: 60rpx;
    color: #FFF;
    font-weight: 400;
    font-size: 2.5vw;
    color: #FFFFFF;
    margin: 28rpx auto;
}
</style>
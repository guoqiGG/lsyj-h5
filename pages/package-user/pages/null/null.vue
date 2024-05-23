<template>
    <view class="page-box" style="display: grid;">
        <view class="text">
            <u-icon name="checkbox-mark" color="#07c160" size="50"></u-icon>您的订单支付完成
        </view>
        <u-button style="width:300rpx" type="primary" size='medium' shape="circle" @click='toLiveRoom()'
            :plain="true">返回直播间</u-button>
        <u-button style="width:300rpx;margin-top:30rpx;" type="primary" size='medium' shape="circle" @click='toOrder()'
            :plain="true">返回查看订单</u-button>
    </view>
</template>
<script>
var loadScript = function (url, callback, opt1) {
    var script = document.createElement('script')
    var opt = opt1 || {}
    script.type = 'text/javascript'
    script.charset = opt.charset || 'UTF-8'
    script.id = opt.id || 'sptId'
    if (script.readyState) {
        script.onreadystatechange = function () {
            if (script.readyState === 'loaded' || script.readyState === 'complete') {
                script.onreadystatechange = null
                callback()
            }
        }
    } else {
        script.onload = function () {
            callback()
        }
    }
    script.src = url
    document.head.appendChild(script)
}
var cb = () => {
    console.log('加载完了')
}
loadScript('https://wx.gtimg.com/pay_h5/goldplan/js/jgoldplan-1.0.0.js', cb)

export default {
    data() {
        return {
            sub_mch_id: '',
            out_trade_no: '',
            orderInfo: {}
        }
    },
    onLoad(option) {
        this.sub_mch_id = option.sub_mch_id; //特约商户号
        this.out_trade_no = option.out_trade_no; //商户订单号
    },
    onReady() {
        let mchData = {
            action: 'onIframeReady',
            displayStyle: 'SHOW_CUSTOM_PAGE'
        };
        let postData = JSON.stringify(mchData);
        parent.postMessage(postData, 'https://payapp.weixin.qq.com');
    },
    methods: {
        //注册点击事件(去详情)
        // getOrder() {
        //     setTimeout(async function () {
        //         let info = await api.getOrderInfo(this.out_trade_no);
        //         this.orderInfo = info;
        //     }, 1000);
        // },
        toLiveRoom: function () {
            var mchData = {
                action: 'jumpOut',
                jumpOutUrl: window.location.href.split("#")[0] + '#/pages/package-user/pages/huantuolive/huantuolive?coureId=' + uni.getStorageSync('coureId') + '&coureName=' + uni.getStorageSync('coureName') + '&url=' + uni.getStorageSync('url') //跳转的页面
            }
            var pData = JSON.stringify(mchData);
            parent.postMessage(pData, 'https://payapp.weixin.qq.com')
        },
        toOrder: function () {
            var mchData = {
                action: 'jumpOut',
                jumpOutUrl: window.location.href.split("#")[0] + '#/pages/package-user/pages/order-list/order-list?id=0' //跳转的页面
            }
            var pData = JSON.stringify(mchData);
            parent.postMessage(pData, 'https://payapp.weixin.qq.com')
        }
    }
}
</script>
<style>
.text {
    display: flex;
    align-items: center;
    text-align: center;
    justify-content: center;
    margin: 100rpx;
}
</style>
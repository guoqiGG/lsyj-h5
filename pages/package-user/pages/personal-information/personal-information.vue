<template>
	<view class="Mall4j personal-information">
		<view class="item-wrap">
			<view class="cloumn-item">
				<view class="txt-wrap">头像</view>
				<view class="infor-right-wrap"
					style="background-color: transparent; margin: 0; padding: 0;border: none !important;"
					open-type="chooseAvatar" >
					<u-upload :fileList="fileList1" @afterRead="afterRead" :previewImage="previewImage" :deletable="deletable"  name="1" 
						:maxCount="1">
						<image :src="photoFiles? photoFiles: pic? pic: '/static/head04.png'" mode="scaleToFill"
							class="avatar-picture" style="  width: 30px;height: 30px;  border-radius: 50%;" ></image>
					</u-upload>
					<image class="right-img" src="/static/arrow-right.png" mode="scaleToFill" />
				</view>
				<!-- <view class="infor-right-wrap" style="background-color: transparent; margin: 0; padding: 0;border: none !important;"
					open-type="chooseAvatar" @chooseavatar="getUploadImg">
					<image class="avatar-picture" :src="photoFiles
						? photoFiles
						: pic
							? pic
							: '/static/head04.png'
						" mode="scaleToFill" />
					<image class="right-img" src="/static/arrow-right.png" mode="scaleToFill" />
				</view> -->
			</view>
		</view>
		<view class="item-wrap">
			<view class="cloumn-item">
				<view class="txt-wrap">手机号</view>
				<view class="right-wrap">
					<input class="txt-infor" v-model="phoneNumber" disabled />
				</view>
			</view>
			<view class="cloumn-item" >
				<view class="txt-wrap">昵称</view>
				<view class="right-wrap">
						 <u--input
						 class="txt-infor"
						    placeholder="请输入您的昵称"
						    border="none"
						    v-model="nickName"
						    @change="getNickNameInt"
						  ></u--input>
				</view>
			</view>
		</view>
		<!-- 确认按钮 -->
		<view v-if="isChange" class="confirm" @tap="setUserInfo">确定</view>
		<!-- 确认按钮 end -->
		<hCompress ref="hCompress" />
	</view>
</template>
<script>
	const config = require("@/utils/config.js"); // 统一的网络请求方法
	// 获取应用实例
	const http = require("@/utils/http.js");
	var t = 0;
	var show = false;
	var moveY = 200;
	import hCompress from "@/components/helang-compress/helang-compress";
	export default {
		components: {
			hCompress,
		},
		data() {
			return {
				deletable:false,
				previewImage:true,
				fileList1: [],
				photoFiles: "",
				dateIndex: 0,
				isChange: false, // 是否修改用户信息
				animation: "",
				show: "",
				username: "",
				bbcUserInfo: {},
				userId: null, //用户Id
				nickName: "", // 用户昵称
				phoneNumber: "null", // 手机号
				pic: "", // 用户头像
			};
		},
		onLoad: function() {
			// 加载会员信息
			this.queryUserInfo();
		},
		onShow: function() {

			// 头部导航标题
			uni.setNavigationBarTitle({
				title: '账户设置',
			});

		},
		onHide: function() {
			this.showPicker = false;
		},
		onReady: function() {
			this.animation = wx.createAnimation({
				transformOrigin: "50% 50%",
				duration: 0,
				timingFunction: "ease",
				delay: 0,
			});
			this.animation.translateY(200 + "vh").step();
			this.setData({
				animation: this.animation.export(),
				show: show,
			});
		},
		methods: {
		
			// 新增图片
			async afterRead(event) {
				// 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
				let lists = [].concat(event.file)
				let fileListLen = this[`fileList${event.name}`].length
				lists.map((item) => {
					this[`fileList${event.name}`].push({
						...item,
						status: 'uploading',
						message: '上传中'
					})
				})
				for (let i = 0; i < lists.length; i++) {
					const result = await this.uploadFilePromise(lists[i].url)
					let item = this[`fileList${event.name}`][fileListLen]
					this[`fileList${event.name}`].splice(fileListLen, 1, Object.assign(item, {
						status: 'success',
						url: result
					}))
					fileListLen++
				}
			},
			uploadFilePromise(url) {
				return new Promise((resolve, reject) => {
					let a = uni.uploadFile({
						url: config.domain+'/upload/oss', // 仅为示例，非真实的接口地址
						filePath: url,
						name: 'file',
						formData: {
							user: 'test'
						},
						success: (res) => {
							setTimeout(() => {
								resolve(res.data)
								this.photoFiles = res.data
								this.isChange = true;
							}, 1000)
						}
					});
				})
			},

			getDate() {
				const date = new Date();
				const year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();
				month = month > 9 ? month : "0" + month;
				day = day > 9 ? day : "0" + day;
				return `${year}-${month}-${day}`;
			},
			/**
			 * 用户名点击事件
			 */
			handleUserNameClick() {
				uni.showToast({
					title: this.i18n.userNameCannotChange,
					icon: "none",
				});
			},
			/**
			 * 上传图片
			 */
			getUploadImg: function(e) {
				var tempFilePaths = e.detail.avatarUrl;
				const params = {
					url: "/upload/oss",
					filePath: tempFilePaths,
					name: "file",
					callBack: (res2) => {
						this.photoFiles = res2
						this.isChange = true;
					},
				};
				const obj = {
					src: tempFilePaths,
					quality: 0.2,
				};
				this.$refs.hCompress.compress(obj, e.detail.avatarUrl).then((res) => {
					params.filePath = res;
					http.upload(params);
				});
			},

			// 获取用户信息
			queryUserInfo: function() {
				this.bbcUserInfo = uni.getStorageSync("bbcUserInfo"); //用户信息
				this.userId = this.bbcUserInfo.id
				this.nickName = this.bbcUserInfo.name
				this.pic = this.bbcUserInfo.avatar
				this.photoFiles = this.bbcUserInfo.avatar
				this.phoneNumber = this.bbcUserInfo.mobile; // 用户手机号
			},

			// 移动按钮点击事件
			translate: function(e) {
				if (t == 0) {
					moveY = 0;
					show = false;
					t = 1;
				} else {
					moveY = 200;
					show = true;
					t = 0;
				}
				this.setData({
					show: true,
					showPicker: true,
				}); // this.animation.translate(arr[0], arr[1]).step();

				this.animationEvents(this, moveY, show);
			},

			// 隐藏弹窗浮层
			hiddenFloatView(e) {
				if (!this.sexNumber) {
					this.setData({
						sex: 0,
					});
					if (this.sex !== this.oldSex) {
						this.isSexChange = true;
					}
				}
				moveY = 200;
				show = true;
				t = 0;
				this.animationEvents(this, moveY, show);
			},

			// 动画事件
			animationEvents: function(that, moveY, show) {
				that.animation = wx.createAnimation({
					transformOrigin: "50% 50%",
					duration: 400,
					timingFunction: "ease",
					delay: 0,
				});
				that.animation.translateY(moveY + "vh").step();
				that.setData({
					animation: that.animation.export(),
				});
			},

			// 用户昵称
			getNickNameInt(e) {
				this.nickName = e;
				this.isChange = true;
			},
			/**
			 * 设置用户信息
			 */
			setUserInfo() {
				if (!this.nickName || !this.nickName.trim()) {
					uni.showToast({
						title: "请先更改信息",
						icon: "none",
					});
					return;
				}
				if (this.isChange) {
					let obj = {
						userId: this.userId,
						avatar: this.photoFiles,
						name: this.nickName,
						loginToken: uni.getStorageSync('bbcToken')
					}
					const params = {
						url: "/pub/user/update",
						method: "POST",
						data: {
							sign: 'qcsd',
							data: JSON.stringify(obj),
						},
						callBack: (res) => {
							let info = this.bbcUserInfo
							info.name = this.nickName
							info.avatar = this.photoFiles,
								uni.setStorageSync('bbcUserInfo', info); //用户信息
							if (res.loginToken) {
								uni.setStorageSync('bbcToken', res.loginToken)
							}
							uni.showToast({
								title: "更改成功",
								icon: "none",
								duration: 1000,

							});
							setTimeout(() => {
								this.queryUserInfo();
								uni.switchTab({
									url: '/pages/user/user'
								});
							}, 1000);
						},
					};
					http.request(params);
				}
			},


		},


	};
</script>
<style>
	@import "./personal-information.css";
</style>
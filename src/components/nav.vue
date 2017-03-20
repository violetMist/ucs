<template>
	<nav>
		<a href="#" class="icon-logo"></a>
		<router-link :to="{name: item.name}" v-for="item in navList" class="nav-item">{{item.title}}</router-link>
		<div class="power rt">
			<div class="alarm-box" title="点击查看全部告警" @click="goFn()">
				<div :class="{
					'btn': true,
					'icon-bell': !alarm,
					'icon-bell-gif': alarm
				}">
					<div class="alarm-num">{{num}}</div>
				</div>
				<div class="alarm-bg"></div>
			</div>
			<div class="admin-box">
				<div :class="{
						'nav-user': true,
						'rt': true,
						'active': showOut
					}" @click="showOut = !showOut">{{session.account}}
				</div>
				<transition name="logout">
					<div v-show="showOut">
						<div class="version">
							<div>统一存储云管理系统
								<span class="version-value">{{session.sysVer}}</span>
							</div>
							<div>视频集群
								<span class="version-value">{{session.videoVer}}</span>
							</div>
							<div>文件集群
								<span class="version-value">{{session.fileVer}}</span>
							</div>
						</div>
						<div class="out" @click="logout">
							<div class="icon-logout"></div>
							退出
						</div>
					</div>
				</transition>
			</div>
		</div>
	</nav>
</template>
<script>

	import {formatFault} from '../filters.js';
	import EventListener from '../lib/eventListener.js';


	/**
	 * params: {
	 * 	navList: [
	 * 		{name, title}
	 * 	]
	 * }
	 */
	export default {
		props: {
			navList: Array
		},
		data () {
			return {
				alarm: false,
				num: 0,
				show: false,
				timer: null,
				showOut: false,
				max: 0
			};
		},
		computed: {
			session () {
				return this.$store.state.session;
			}
		},
		methods: {
			logout () {
				this.showOut = false;
				UCS.Common('logout', {}, () => {
					this.$store.commit('cleanSession');
					this.$store.commit('cleanAccess');
					this.$store.commit('cleanShopData');
					this.max = 0;
					this.num = 0;
					this.alarm = false;
					this.$router.push({name: 'entry'});
				});
			},
			init () {
				if (!this.session.userId)
					return;
				UCS.Common('getRtFault', {lastId: localStorage.getItem('lastId')}, result => {
					if (result.length)
						localStorage.setItem('lastId', result[0].id);
					if (this.num === 0 && localStorage.getItem('num'))
						this.num = localStorage.getItem('num');
					this.max = Math.min(Number(this.num.toString().split('+')[0]) + (result ? result.length : 0), 100);
					if (this.max > 99)
						this.num = '99+';
					else
						this.num = this.max;
					localStorage.setItem('num', this.num);
					if (this.num)
						this.alarm = true;
				});
			},
			goFn () {
				if (!this.alarm)
					return;
				this.max = 0;
				this.num = 0;
				this.alarm = false;
				localStorage.setItem('num', this.num);
				if (this.$route.name == 'log') 
					window.bus.$emit('showLog');
				else 
					this.$router.push({name: 'log'});
			}
		},
		mounted () {
			setTimeout(() => {
				this.init();
			}, 1000);
			this.timer = setInterval(() => {
				this.init();
			}, 10000);
			this._closeEvent = EventListener.listen(window, 'click', (e)=> {
				let el2 = e.target;
				while (el2.parentElement) {
					if (el2.parentElement.className && el2.parentElement.className.indexOf('admin-box') !== -1) {
						break;
					} else {
						this.showOut = false;
					}
					el2 = el2.parentElement;
				}
			});
		},
		beforeDestroy() {
			clearInterval(this.timer);
			if (this._closeEvent) this._closeEvent.remove();
		}
	}
</script>
<style lang="less">
	nav{
		height: 50px;
		line-height: 50px;
		position: fixed;
	      top: 0;
	      left: 0;
	      right: 0;
	      height: 50px;
	      font-size: 14px;
	      font-weight: bold;
	      z-index: 100;
	      min-width: 1360px;
	      border-bottom: 1px solid #030b11;
		.icon-logo{
			margin-right: 8%;
		}
		a{
			display: inline-block;
			width: 100px;
			text-align: center;
			line-height: 50px;
			vertical-align: top;
			color: #6c94ad;
		}
		.router-link-active{
			color: #00c6ff;
		}
		.power{
			width: 230px;
			height: 40px;
			line-height: 50px;
			position: relative;
			.alarm-box{
				position: relative;
				display: inline-block;
			}
			.admin-box{
				float: right;
			}
			.btn{
				position: relative;
				vertical-align: top;
				height: 49px;
				.alarm-num{
					position: absolute;
					right: 2px;
					top: 19px;
					height: 14px;
					width: 30px;
					line-height: 14px;
					text-align: center;
					background: rgba(172, 227, 255, 0.2);
					border-radius: 7px;
					cursor: pointer;
					font-size: 12px;
					color: #48a3ed;
				}
			}
			&>div{
				vertical-align: middle;
				position: relative;
			}
			.alarm-bg{
				display: inline-block;
				position: absolute;
				height: 50px;
				top: 0;
				left: 0;
				width: 80px;
				cursor: pointer;
				&:hover{
					background: rgba(68, 133, 174, 0.2);
				}
			}
			.icon-bell-gif{
				width: 80px;
				height: 49px;
				background: url(../assets/bg/bell.gif);
			}
			.alarm-detail{
				position: absolute;
				top: 49px;
				left: -117px;
				width: 285px;
				height: 500px;
				background: rgba(7, 48, 78, 0.95);
				border-radius: 4px;
				border: 1px solid #305671;
				z-index: 100;
				box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.35), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
				cursor: default;
				&:before{
					content: "";
					position: absolute;
					width: 15px;
					height: 15px;
					top: -9px;
					left: 135px;
					transform: rotate(45deg);
					background: rgba(7, 48, 78, 0.95);
					border-top: 1px solid #305671;
					border-left: 1px solid #305671;
				}
			}
			.title{
				color: #fff;
				padding-left: 10px;
				height: 40px;
				line-height: 40px;
				border-bottom: 1px solid #030b11;
				position: relative;
				&:after{
					position: absolute;
					content: "";
					bottom: -2px;
					left: 0;
					right: 0;
					height: 0;
					border-top: 1px solid #255778;
				}
				.go-log{
					position: absolute;
					right: 2px;
					top: 10px;
					color: #15a0c2;
					width: 60px;
					height: 20px;
					line-height: 20px;
					font-size: 12px;
					cursor: pointer;
				}
			}
			.rt-content{
				height: 450px;
				overflow-y: auto;
				font-size: 12px;
				// padding: 0 6px;
				& li {
					border-bottom: 1px solid rgba(255, 255, 255, 0.1);
					// &:last-of-type{
					// 	border-bottom: none;
					// }
				}
				// ul:last-child{
				// 	li:last-child{
				// 	}
				// }
				& *{
					color: #fff;
					font-weight: normal;
					font-size: 12px;
				}
			}
			.fault-list-title{
				text-align: center;
				height: 35px;
				line-height: 35px;
			}
			.fault{
				height: 70px;
				padding-left: 30px;
				padding-top: 15px;
				cursor: pointer;
				&:hover{
					background: #295671;
				}
			}
			.fault-message{
				height: 20px;
				line-height: 20px;
				position: relative;
				&:before{
					content: "";
					position: absolute;
					left: -13px;
					top: 8px;
					width: 6px;
					height: 6px;
					border-radius: 50%;
				}
				.rt{
					margin-right: 10px;
				}
			}
			.level1:before{
				background: #fd3b37;
			}
			.level2:before{
				background: #ffeb00;
			}
			.fault-detail{
				height: 25px;
				line-height: 25px;
				color: #15a0c2 !important;
			}
			.nav-user{
				width: 150px;
				cursor: pointer;
				padding: 0 20px;
				color: #fff;
				height: 50px;
				line-height: 50px;
				display: inline-block;
				position: relative;
				font-weight: normal;
				transition: all 0.3s;
				border: 1px solid transparent;
				border-bottom: none;
				&.active{
					border: 1px solid #305671;
					border-bottom: none;
					background: rgba(7, 48, 78, 0.95);	
				}
				&:after{
					content: "";
					position: absolute;
					top: 22px;
					right: 12px;
					border-top: 5px solid #fff;
					border-left: 5px solid transparent;
					border-right: 5px solid transparent;
					border-bottom: 5px solid transparent;
				}
			}
			.version{
				position: absolute;
				cursor: pointer;
				top: 50px;
				height: 136px;
				line-height: 12px;
				width: 150px;
				color: #5984b7;
				font-size: 12px;
				font-weight: normal;
				right: 0px;
				padding: 13px 20px;
				background: rgba(7, 48, 78, 0.95);
				border-top: 1px solid #305671;
				border-bottom: 1px solid #305671;
				border-left: 1px solid #305671;
				border-right: 1px solid #305671;
				box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.35), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
				z-index: 100;
				.version-value{
					display: block;
					margin-top: 6px;
					margin-bottom: 10px;
					color: #fff;
					opacity: 0.5;
				}
			}
			.out{
				position: absolute;
				cursor: pointer;
				top: 186px;
				height: 42px;
				line-height: 42px;
				width: 150px;
				color: #fff;
				font-size: 12px;
				font-weight: normal;
				right: 0px;
				padding-left: 40px;
				background: rgba(7, 48, 78, 0.95);
				border-bottom: 1px solid #305671;
				border-left: 1px solid #305671;
				border-right: 1px solid #305671;
				box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.35), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
				z-index: 100;
				.icon-logout{
					position: absolute;
					left: 20px;
					top: 14px;
				}
			}
		}
		.detail-enter-active, .detail-leave-active {
			transition: all .4s;
			transform-origin: 51% -5%;
		}
		.detail-enter, .detail-leave-active {
			opacity: 0.5;
			transform: scale(0);
		}
		.logout-enter-active, .logout-leave-active {
			transition: all .3s;
		}
		.logout-enter, .logout-leave-active {
			height: 0px;
			opacity: 0;
		}
	}
</style>
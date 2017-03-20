<template>
<div id="body" class="log">
	<div class="grid-box">
		<div class="title">系统日志</div>
		<div class="log-tab">
			<Tab
				:items="tabs"
				@clickFn="tabFn"
			></Tab>
		</div>
		<div class="back" v-if="back" @click="backFn">返回</div>
		<div class="grid-content log-content">
			<Grid
				:clz="grid.clz"
				:tools="grid.tools"
				:hasCheckbox="grid.hasCheckbox"
				sequence="序号"
				:headers="grid.headers"
				:html="grid.html"
				:items="grid.items"
				:total="total"
				:params="params"
				:date="date"
				@pageFn="pageFn"
				@toolFn="toolFn"
				@dropdownFn="dropdownFn"
			></Grid>
		</div>
	</div>
	<diy-dialog
		clz="show-export"
		title="提示"
		:show="show"
		@check="exportFn"
	>
		<div class="confirm-content">本次共导出<span class="hight">{{total}}</span>条数据，生成<span class="hight">{{Math.ceil(total/5000)}}</span>个excel表格</div>
		<div class="explain">(一个excel表格最多保存5000条数据)</div>
	</diy-dialog>
</div>
</template>
<script>
	
	import Grid from '../../components/grid/grid.vue';
	import Tab from '../../components/tab.vue';
	import diyDialog from '../../components/dialog.vue';

	export default {
		data () {
			return {
				show: false,
				back: false,
				active: 1,
				total: 0,
				params: {
					type: '所有',
					pageNo: 0,
					pageSize: 20
				},
				date: null,
				tabs: [
					{Key: 1, title: '告警日志'},
					{Key: 2, title: '操作日志'}
				],
				grid: {
					tools: {},
					headers: [],
					clz: 'alarm-log-grid',
					hasCheckbox: false,
					html: [],
					items: []
				},
				gridAlarm: {
					tools: {
						datePicker: {
							title: '起止时间',
							placeholder: '请选择时间',
							type: 'datetimerange'
						},
						btns: [
							{Key: 'export', title: '导出Excel', disable: true}
						],
						dropdowns: [
							{
								title: '告警类型',
								Key: 'type',
								value: '所有',
								list: [
									{name: '所有', value: '所有'},
									{name: '节点故障', value: '节点故障'},
									{name: '磁盘故障', value: '磁盘故障'},
									{name: '取流失败', value: '取流失败'},
									{name: '读写失败', value: '读写失败'},
									{name: '性能不足', value: '性能不足'},
									{name: '存储空间不足', value: '存储空间不足'}
								]
							}
						]
					},
					headers: [
						{title: '告警种类', column: 'type'},
						{title: '告警节点', column: 'ip'},
						{title: '告警详情', column: 'detail'},
						{title: '告警时间', column: 'date'}
					]
				},
				gridMessage: {
					tools: {
						datePicker: {
							title: '起止时间',
							placeholder: '请选择时间',
							type: 'datetimerange'
						}
					},
					headers: [
						{title: '操作详情', column: 'detail'},
						{title: '操作时间', column: 'date'}
					]
				}
			};
		},
		methods: {
			init (name) {
				UCS.LogManger(name, _.assign({}, this.params), result => {
					this.total = result.total;
					this.grid = _.assign(this.grid, {items: result.items});
				});
			},
			getGridData () {
				if (this.active == 1){
					this.grid.tools = this.gridAlarm.tools;
					this.grid.headers = this.gridAlarm.headers;
					this.grid.clz = 'alarm-log-grid';
					this.init('getAlarmList');
				} else {
					this.grid.tools = this.gridMessage.tools;
					this.grid.headers = this.gridMessage.headers;
					this.grid.clz = 'handle-log-grid';
					this.init('getMessageList');
				}
			},
			tabFn (item) {
				this.params.pageNo = 0;
				this.active = item.Key;
				this.total = 0;
				this.grid.items = [];
				delete this.params.beginTime;
				delete this.params.endTime;
				delete this.params.id;
				this.getGridData();
			},
			pageFn (no, size) {
				this.params.pageNo = no;
				this.params.pageSize = size;
				this.getGridData();
			},
			toolFn (btn, selectData) {
				if (btn == 'date') {
					if (selectData && selectData[0]) {
						this.params.beginTime = selectData[0].getTime();
						this.params.endTime = selectData[1].getTime();
						this.gridAlarm.tools.btns[0].disable = false;
					} else{
						delete this.params.beginTime;
						delete this.params.endTime;
						this.gridAlarm.tools.btns[0].disable = true;
					}
					delete this.params.id;
					this.getGridData();
				} else {
					this.show = true;
				}
			},
			dropdownFn (key, value) {
				this.params[key] = value;
				this.params.pageNo = 0;
				delete this.params.id;
				this.getGridData();
			},
			backFn () {
				this.$router.go(-1);
			},
			exportFn (key) {
				this.show = false;
				if (key == 'channel') 
					return;
				let times = Math.ceil(this.total/5000);
				_.times(times, idx => {
					window.open(`/user/log/export.json?beginTime=${this.params.beginTime}&endTime=${this.params.endTime}&type=${this.params.type}&pageNo=${idx}`);	
				});
			}
		},
		components: {
			Grid,
			Tab,
			diyDialog
		},
		mounted () {
			if (this.$route.params.date) {
				this.back = true;
				return this.date = this.$route.params.date;
			}
			if (this.$route.params.id)
				this.params.id = this.$route.params.id;
			this.getGridData();
			window.bus.$on('showLog', id => {
				if (id)
					this.params.id = id;
				else
					delete this.params.id;
				this.params.pageNo = 0;
				this.active = 1;
				this.tabs = _.assign([], this.tabs);
				this.getGridData();
			});
		}
	}

</script>
<style lang="less">
	.log{
		.confirm-content{
			color: #fff;
			text-align: center;
			margin-top: 40px;
			.hight{
				color: #00c6ff;
			}
		}
		.explain{
			font-size: 12px;
			text-align: center;
			color: rgba(255, 255, 255, 0.7);
			margin-top: 20px;
		}
		.back{
			position: absolute;
			right: 25px;
			top: 60px;
			height: 25px;
			border: 1px solid #00f0ff;
			line-height: 25px;
			padding: 0 8px;
			color: #fff;
			font-weight: normal;
			font-size: 12px;
			margin: 10px 15px 0 0;
			background: rgba(0, 157, 220, 0.5);
			cursor: pointer;
			&:hover{
				background: rgba(0, 157, 220, 1);
			}
		}
		.log-tab{
			position: absolute;
			top: 77px;
			left: 40px;
			height: 24px;
		}
		.log-content{
			top: 120px;
		}
		.alarm-log-grid{
			.dropdown, .dropdown-button{
				width: 170px;
				.selected{
					width: 80px;
				}
			}
		}
		.alarm-log-grid, .handle-log-grid{
			.row:hover{
				cursor: default !important;
			}
			.col-type{
				width: 10%;
			}
			.col-ip{
				width: 8%;
				min-width: 100px;
			}
			.col-detail{
				width: 60%;
			}
		}
		.icon-btn-export, .icon-btn-export-hover{
			height: 25px;
			border: 1px solid #00f0ff;
			line-height: 25px;
			padding: 0 8px;
			color: #fff;
			font-size: 12px;
		}
		.icon-btn-export{
			background: rgba(0, 157, 220, 0.5);
		}
		.icon-btn-export-hover{
			background: rgba(0, 157, 220, 1);
		}
		.icon-btn-export-disable{
			cursor: default;
			height: 25px;
			line-height: 25px;
			padding: 0 8px;
			color: #fff;
			font-size: 12px;
			border: 1px solid rgba(0, 157, 220, 0.3);
			background: rgba(0, 157, 220, 0.3);
			opacity: 0.5;
		}
	}
</style>
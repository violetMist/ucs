<template>
	<div class="page-nation">
		<div class="page-total">
			<span>从 {{total ? (pno * pageSize + 1) : 0}} 到 {{Math.min(((pno + 1) * pageSize), total)}} </span>
			<span>/ 共 {{total}} 条数据</span>
		</div>
		<div class="page-items" v-if="total !== 0">
			<a :class="{'previous btn': true, 'disable': pno === 0}" @click="change(-1)"><span></span>上一页</a>
			<a :id="`pageItemNo${item}`" :class="{'btn': true, active: item == pno+1}" v-for="item of items" @click="jump(item)" :style="{'width':`${pageItemLevel(item)*4 + 28}px`}">{{item}}</a>
			<a :class="{'next btn': true, 'disable': pno === pages - 1}" @click="change(1)">下一页<span></span></a>
			<input type="text" v-model="jumpNo" class="page-jump" v-on:keyup.enter="jump(jumpNo)">
			<a class="go btn" @click="jump(jumpNo)">跳转</a>		
		</div>
		<div class="page-size">
			<span>每页显示</span>
			<dropdown class="page-down"
				:value="pageSize"
				:list="dropdowns"
				@checkFn="checkDropdown"
			></dropdown>
			<span>条</span>
		</div>
	</div>
</template>
<script>

	import dropdown from './dropdown.vue';

	export default {
		props: {
			total: {
				type: Number,
				defatult: 0
			},
			pageNo: {
				type: Number,
				default: 0
			},
			pageSize: {
				type: Number,
				default: 20
			}
		},
		data () {
			return {
				jumpNo: '',
				dropdowns: [
					{name: '20', value: 20},
					{name: '50', value: 50},
					{name: '100', value: 100}
				]
			};
		},
		computed: {
			pno () {
				return this.pageNo;
			},
			pages () {
				return Math.ceil(this.total / this.pageSize); 
			},
			items () {
				if (this.pages <= 6)
					return _.repeat('0', this.pages).split('').map((item, idx) => {return idx + 1;});
				else {
					if (this.pno < 4)
						return [1, 2, 3, 4, 5, '...', this.pages];
					else if (this.pno > this.pages - 5) 
						return [1, '...',this.pages - 4,  this.pages - 3, this.pages - 2, this.pages - 1, this.pages];
					else
						return [1, '...', this.pno, this.pno + 1, this.pno + 2, '...', this.pages];
				}
			}
		},
		methods: {
			jump (no) {
				if (no == '...') return;
				if (_.isNaN(Number(no)) || Number(no) <= 0 || no > this.pages ||_.round(no) != no) {
					store.commit('alertShow', "请输入有效的页码！");
					return;	
				}
				this.$emit('change-page', no - 1, this.pageSize);
			},
			change (no) {
				const number = this.pno + no;
				if (event.target.className.indexOf('disable') === -1)
					this.$emit('change-page', Math.max(0, Math.min(this.pages - 1, number)), this.pageSize);
			},
			pageItemLevel (item) {
				if (_.isNumber(item)) {
					return Math.floor(Math.log10(item)+1);
				}
				return 1;
			},
			checkDropdown (key, value) {
				if (_.isNumber(value)) {
					this.$emit('change-page', (this.pno+1)*value > this.total? (Math.ceil((this.pno+1)*this.pageSize/value)-1): this.pno, value);
				}
			}
		},
		components: {
			dropdown
		}
	}
</script>
<style lang="less">
	.page-nation{
		width: 100%;
		height: 30px;
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		color: #fff;
		.page-total{
			position: absolute;
			left: 5px;
			line-height: 30px;
			font-size: 12px;
		}
		.page-items{
			font-size: 12px;
		}
		.go{
			width: 30px;
		}
		.previous, .next, .go, [id^='pageItemNo'] {
			text-align: center;
			line-height: 30px;
			height: 30px;
			border: 1px solid #fff;
			margin-right: 10px;
		}
		.previous, .next{
			width: 70px;
			span{
				width: 8px;
				height: 8px;
				display: inline-block;
				border-top: 1px solid #fff;
				border-right: 1px solid #fff;
			}
		}
		.previous{
			span{
				transform: rotate(-135deg);
				margin-right: 2px;
			}
		}
		.next{
			span{
				transform: rotate(45deg);
				margin-left: 2px;
			}
		}
		.active{
			background: rgba(0, 157, 220, 0.5);
		}
		.btn.disable{
			cursor: default;
		}
		.page-jump{
			display: inline-block;
			width: 40px;
			height: 30px;
			margin-right: 5px;
			vertical-align: top;
			color: #fff;
			border-radius: 4px;
			background: rgba(0, 0, 0, 0.3);
			border: 1px solid transparent;
			text-align: center;
			padding: 4px;
			&:focus{
				border: 1px solid #0993b0;
			}
		}
		.go{
			width: 40px;
		}
		.page-size{
			position: absolute;
			line-height: 24px;
			font-size: 12px;
			right: 10px;
			&>*{
				display: inline-block;
				line-height: 24px;
				vertical-align: middle;
			}
			.page-down{
				margin-left: 2px;
				width: 54px !important;
				height: 24px;
				border-radius: 2px;
				background-color: rgba(0, 0, 0, 0.5);
				.dropdown-button{
					width: 54px;
					height: 24px;
					.selected{
						color: #fff;
						top: -3px;
					}
					.pic{
						top: 12px;
					}
				}
				.dropdown-content{
					height: 72px !important;
					top: -72px;
					background: rgba(6, 26, 49, 0.9);
					overflow-y: auto;
					box-shadow:  0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12);
				}
				.dropdown-list{
					height: 24px !important;
					line-height: 24px !important;
					padding-left: 14px;
					&.active, &:hover{
						background: rgba(0, 198, 255, 0.3);
					}
				}
			}

		}
		// input{
		// 	border: 1px solid #fff;
		// 	background: #fff;
		// 	width: 40px;
		// 	height: 30px;
		// 	margin-right: 10px;
		// }
	}
</style>
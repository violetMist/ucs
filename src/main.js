import '../src/less/cv.less';
import pro from 'es6-promise';
window.Promise = pro.Promise;
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import routerConfig from './router.js';
import TWEEN from './lib/tweenjs-16.3.4.js';
import md5 from 'blueimp-md5';
// import Velocity from './lib/Velocity.js';
import filters from './filters.js';
import App from './App.vue';

import UCS from '../global.js';
window.UCS = UCS;

window.md5 = md5;
window.bus = new Vue();
window.TWEEN = TWEEN;

Vue.use(VueRouter);
Vue.use(Vuex);

//实例化router
const router = new VueRouter({
	routes: routerConfig
});

let timer = null;

const store = new Vuex.Store({
	state: {
		session: {},
		shopData: [],
		access: false,
		showAlert: false,
		alertConent: ''
	},
	mutations: {
		add (state, payload) {
			let a = [];
			_.each(payload, item => {
				let k = 0;
				_.each(state.shopData, obj => {
					if (obj.id == item.id) {
						k = 1;
						obj.name = item.name;
						return;
					}
				})
				if (!k)
					a.push(item);
			});
			let arr = _.concat(state.shopData, a);
			if (arr.length > 100) 
				return store.commit('alertShow', '比对队列最多为100个，请确保空位后再添加。');
			else 
				state.shopData = arr;
		},
		deleted (state, payload) {
			state.shopData.splice(_.indexOf(state.shopData, payload), 1);
		},
		cleanShopData (state) {
			state.shopData = [];
		},
		setSession (state, payload) {
			state.session = payload;
		},
		cleanSession (state) {
			state.session = {};
		},
		alertShow (state, payload) {
			state.alertConent = payload;
			state.showAlert = true;
			if (!timer) 
				timer = setTimeout(() => {
					if (state.showAlert) {
						state.showAlert = false;
						clearTimeout(timer);
						timer = null;
					}
				}, 5000);
		},
		alertHide (state) {
			state.showAlert = false;
			clearTimeout(timer);
			timer = null;
		},
		hasAccess (state) {
			state.access = true;
		},
		cleanAccess (state) {
			state.access = false;
		}
	}
});

window.router = router;
window.store = store;

let toParams = null;

UCS.Common('checkSession', {}, result => {
	if (!result) 
		return;
	store.commit('setSession', result);
	router.push(toParams || '/');
});

router.beforeEach((to, from, next) => {
	store.commit('alertHide');
	if (to.name != 'entry')
		toParams = {path: to.path, params: to.params};
	if (to.name == 'entry') {
		if (!store.state.session.userId)
			return next();
		else 
			return next('/');
	}
	if (!store.state.session.userId)
		return next('/entry');
	next();
	document.body.setAttribute('class', '');
});

//实例化Vue的filter
Object.keys(filters).forEach(k => Vue.filter(k, filters[k]));

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
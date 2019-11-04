// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import iView from 'iview'
import i18n from '@/locale'
import config from '@/config'
import importDirective from '@/directive'
import { directive as clickOutside } from 'v-click-outside-x'
import axios from '@/libs/api.request'
import { setStore, getStore, removeStore } from '@/libs/storage'
import util from '@/libs/utils'
import Router from 'vue-router'
import installPlugin from '@/plugin'
import './index.less'
import '@/assets/icons/iconfont.css'
import TreeTable from 'tree-table-vue'
import VOrgTree from 'v-org-tree'
import 'v-org-tree/dist/v-org-tree.css'
// 实际打包时应该不引入mock
/* eslint-disable */
/*if (process.env.NODE_ENV !== 'production') require('@/mock')*/

Vue.use(iView, {
  i18n: (key, value) => i18n.t(key, value)
})
Vue.use(TreeTable)
Vue.use(VOrgTree)
/**
 * @description 注册admin内置插件
 */
installPlugin(Vue)
/**
 * @description 生产环境关掉提示
 */
Vue.config.productionTip = false
/**
 * @description 全局注册应用配置
 */
Vue.prototype.$config = config
Vue.prototype.setStore = setStore;
Vue.prototype.getStore = getStore;
Vue.prototype.removeStore = removeStore;
/**
 * 注册指令
 */
importDirective(Vue)
Vue.directive('clickOutside', clickOutside)

const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.prototype.axios = axios;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  i18n,
  store,
  render: h => h(App),
  mounted() {
      // 初始化菜单
      util.initRouter(this);
      this.currentPageName = this.$route.name;
      // 显示打开的页面的列表
      this.$store.commit('setOpenedList');
      this.$store.commit('initCachepage');
  }
})

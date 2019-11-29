import Main from '@/view/Main.vue'
// import parentView from '@/components/parent-view'

/**
 * iview-admin中meta除了原生参数外可配置的参数:
 * meta: {
 *  title: { String|Number|Function }
 *         显示在侧边栏、面包屑和标签栏的文字
 *         使用'{{ 多语言字段 }}'形式结合多语言使用，例子看多语言的路由配置;
 *         可以传入一个回调函数，参数是当前路由对象，例子看动态路由和带参路由
 *  hideInBread: (false) 设为true后此级路由将不会出现在面包屑中，示例看QQ群路由配置
 *  hideInMenu: (false) 设为true后在左侧菜单不会显示该页面选项
 *  notCache: (false) 设为true后页面在切换标签后不会缓存，如果需要缓存，无需设置这个字段，而且需要设置页面组件name属性和路由配置的name一致
 *  access: (null) 可访问该页面的权限数组，当前路由设置的权限会影响子路由
 *  icon: (-) 该页面在左侧菜单、面包屑和标签导航处显示的图标，如果是自定义图标，需要在图标名称前加下划线'_'
 *  beforeCloseName: (-) 设置该字段，则在关闭当前tab页时会去'@/router/before-close.js'里寻找该字段名对应的方法，作为关闭前的钩子函数
 * }
 */

export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: 'Login - 登录 ',
    hideInMenu: true
  },
  component: () => import('@/view/login/login.vue')
}

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  children: [
    { path: 'home', title: { i18n: 'home' }, name: 'home_index', component: () => import('@/view/single-page/home/home.vue') },
    { path: 'process-node-edit', title: '流程节点设置', name: 'process_node_edit', component: () => import('@/view/activiti/act-process/node.vue') },
    { path: 'add-edit-message', title: '消息详情', name: 'add-edit-message_page', component: () => import('@/view/sys/message/add-edit.vue') },
    { path: 'send-detail-message', title: '消息发送详情', name: 'message-send-detail_page', component: () => import('@/view/sys/message/send-detail.vue') },
    { path: 'message', title: '消息中心', name: 'message_page', component: () => import('@/view/single-page/message/index.vue') }
  ]
}

export const appRouter = []

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
  loginRouter,
  // registRouter,
  // registResult,
  // reset,
  // relateRouter,
  otherRouter,
  // locking,
  ...appRouter
  // page500,
  // page403
]

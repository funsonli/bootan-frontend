import {
  getBreadCrumbList,
  setTagNavListInLocalstorage,
  getMenuByRouter,
  getTagNavListFromLocalstorage,
  getHomeRoute,
  getNextRoute,
  routeHasExist,
  routeEqual,
  getRouteTitleHandled,
  localSave,
  localRead
} from '@/libs/util'
import { saveErrorLogger } from '@/api/data'
import router from '@/router'
import routes from '@/router/routers'
import Util from '@/libs/utils.js'
import { otherRouter } from '@/router/routers'
import config from '@/config'
const { homeName } = config

const closePage = (state, route) => {
  const nextRoute = getNextRoute(state.tagNavList, route)
  state.tagNavList = state.tagNavList.filter(item => {
    return !routeEqual(item, route)
  })
  router.push(nextRoute)
}

export default {
  state: {
    breadCrumbList: [],
    tagNavList: [],
    homeRoute: {},
    local: localRead('local'),
    errorList: [],
    hasReadErrorPage: false,
    currNav: '',
    menuList: [],
    navList: [],
    added: false,
    currNavTitle: '',
    routers: [
      otherRouter
    ],
    currentPath: [
      {
        title: '首页',
        path: '',
        name: 'home_index'
      }
    ],
    pageOpenedList: [{
      title: '首页',
      path: '',
      name: 'home_index'
    }],
    tagsList: [],
    dontCache: ['test', 'test'],
    cachePage: [],
    openedSubmenuArr: [] // 要展开的菜单数组
  },
  getters: {
    // menuList: (state, getters, rootState) => getMenuByRouter(routers, ['admin']), // 假数据 rootState.user.access
    errorCount: state => state.errorList.length
  },
  mutations: {
    setBreadCrumb (state, route) {
      state.breadCrumbList = getBreadCrumbList(route, state.homeRoute)
    },
    setCurrNav (state, v) {
      state.currNav = v
    },
    setCurrNavTitle (state, v) {
      state.currNavTitle = v
    },
    setNavList (state, list) {
      state.navList = list
    },
    // 动态添加主界面路由，需要缓存
    updateAppRouter (state, routes) {
      state.routers.push(...routes)
        router.addRoutes(routes)
    },
    // 动态添加全局路由404、500等页面，不需要缓存
    updateDefaultRouter (state, routes) {
      router.addRoutes(routes)
    },
    updateMenulist (state, routes) {
      state.menuList = routes
    },
    setCurrentPath (state, pathArr) {
      state.currentPath = pathArr
    },
    setAdded (state, v) {
      state.added = v
    },
    setHomeRoute (state, routes) {
      state.homeRoute = getHomeRoute(routes, homeName)
    },
    setTagNavList (state, list) {
      let tagList = []
      if (list) {
        tagList = [...list]
      } else tagList = getTagNavListFromLocalstorage() || []
      if (tagList[0] && tagList[0].name !== homeName) tagList.shift()
      let homeTagIndex = tagList.findIndex(item => item.name === homeName)
      if (homeTagIndex > 0) {
        let homeTag = tagList.splice(homeTagIndex, 1)[0]
        tagList.unshift(homeTag)
      }
      state.tagNavList = tagList
      setTagNavListInLocalstorage([...tagList])
    },
    setTagsList (state, list) {
      state.tagsList.push(...list)
    },
    closeTag (state, route) {
      let tag = state.tagNavList.filter(item => routeEqual(item, route))
      route = tag[0] ? tag[0] : null
      if (!route) return
      closePage(state, route)
    },
    addTag (state, { route, type = 'unshift' }) {
      let router = getRouteTitleHandled(route)
      if (!routeHasExist(state.tagNavList, router)) {
        if (type === 'push') state.tagNavList.push(router)
        else {
          if (router.name === homeName) state.tagNavList.unshift(router)
          else state.tagNavList.splice(1, 0, router)
        }
        setTagNavListInLocalstorage([...state.tagNavList])
      }
    },
    setLocal (state, lang) {
      localSave('local', lang)
      state.local = lang
    },
    addError (state, error) {
      state.errorList.push(error)
    },
    setHasReadErrorLoggerStatus (state, status = true) {
      state.hasReadErrorPage = status
    },
    removeTag (state, name) {
      state.pageOpenedList.map((item, index) => {
        if (item.name == name) {
          state.pageOpenedList.splice(index, 1)
            }
      })
    },
    pageOpenedList (state, get) {
      let openedPage = state.pageOpenedList[get.index]
        if (get.argu) {
        openedPage.argu = get.argu
        }
      if (get.query) {
        openedPage.query = get.query
        }
      state.pageOpenedList.splice(get.index, 1, openedPage)
        localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList)
    },
    clearAllTags (state) {
      state.pageOpenedList.splice(1)
        state.cachePage.length = 0
        localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList)
    },
    clearOtherTags (state, vm) {
      let currentName = vm.$route.name
        let currentIndex = 0
        state.pageOpenedList.forEach((item, index) => {
        if (item.name == currentName) {
          currentIndex = index
            }
      })
        if (currentIndex == 0) {
        state.pageOpenedList.splice(1)
        } else {
        state.pageOpenedList.splice(currentIndex + 1)
            state.pageOpenedList.splice(1, currentIndex - 1)
        }
      let newCachepage = state.cachePage.filter(item => {
        return item == currentName
        });
      state.cachePage = newCachepage
        localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList)
    },
    setCurrentPageName (state, name) {
      state.currentPageName = name
    },
    setOpenedList (state) {
      state.pageOpenedList = localStorage.pageOpenedList ? JSON.parse(localStorage.pageOpenedList) : [otherRouter.children[0]]
    },
    addOpenSubmenu (state, name) {
      let hasThisName = false
        let isEmpty = false
        if (name.length == 0) {
        isEmpty = true
        }
      if (state.openedSubmenuArr.indexOf(name) > -1) {
        hasThisName = true
        }
      if (!hasThisName && !isEmpty) {
        state.openedSubmenuArr.push(name)
        }
    },
    increateTag (state, tagObj) {
      if (!Util.oneOf(tagObj.name, state.dontCache)) {
        state.cachePage.push(tagObj.name)
            localStorage.cachePage = JSON.stringify(state.cachePage)
        }
      state.pageOpenedList.push(tagObj)
        localStorage.pageOpenedList = JSON.stringify(state.pageOpenedList)
    }
  },
  actions: {
    addErrorLog ({ commit, rootState }, info) {
      if (!window.location.href.includes('error_logger_page')) commit('setHasReadErrorLoggerStatus', false)
      const { user: { token, userId, username } } = rootState
      let data = {
        ...info,
        time: Date.parse(new Date()),
        token,
        userId,
        username
      }
      saveErrorLogger(info).then(() => {
        commit('addError', data)
      })
    }
  }
}

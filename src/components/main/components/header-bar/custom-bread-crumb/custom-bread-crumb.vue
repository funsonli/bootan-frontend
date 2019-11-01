<template>
  <!-- 顶部导航内容 -->
  <div class="header-middle-con">
    <!-- <div class="custom-bread-crumb">
      <Breadcrumb :style="{fontSize: `${fontSize}px`}">
        <BreadcrumbItem v-for="item in list" :to="item.to" :key="`bread-crumb-${item.name}`">
          <common-icon style="margin-right: 4px;" :type="item.icon || ''"/>
          {{ showTitle(item) }}
        </BreadcrumbItem>
      </Breadcrumb>
    </div> -->
    <div class="main-nav-menu">
      <Menu mode="horizontal" :active-name="currNav" @on-select="selectNav">
        <MenuItem v-for="(item, i) in navList.slice(0, 3)" :key="i" :name="item.name">
          <Icon :type="item.icon" style="margin-bottom:3px" />
          {{item.title}}
        </MenuItem>
        <Submenu name="sub" v-if="navList.length>3">
          <template slot="title">更多</template>
          <MenuItem
            v-for="(item, i) in navList.slice(3, navList.length)"
            :key="i"
            :name="item.name"
          >
            <Icon :type="item.icon" style="margin-bottom:3px" />
            {{item.title}}
          </MenuItem>
        </Submenu>
      </Menu>
    </div>
  </div>
</template>
<script>
import { showTitle } from '@/libs/util'
import CommonIcon from '_c/common-icon'
import './custom-bread-crumb.less'
import util from '@/libs/utils.js'
export default {
  name: 'customBreadCrumb',
  components: {
    CommonIcon
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    fontSize: {
      type: Number,
      default: 14
    },
    showIcon: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    currNav () {
      return this.$store.state.app.currNav
    },
    navList () {
      return this.$store.state.app.navList
    }
  },
  methods: {
    selectNav (name) {
      this.$store.commit('setCurrNav', name)
      this.setStore('currNav', name)
      // 清空所有已打开标签
      // this.$store.commit('clearAllTags')
      this.$router.push({
        name: 'home_index'
      })
      util.initRouter(this)
    },
    showTitle (item) {
      return showTitle(item, this)
    },
    isCustomIcon (iconName) {
      return iconName.indexOf('_') === 0
    },
    getCustomIconName (iconName) {
      return iconName.slice(1)
    }
  }
}
</script>

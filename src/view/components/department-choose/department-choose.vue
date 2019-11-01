<template>
  <div>
    <Cascader
      v-model="selectDep"
      :data="department"
      :load-data="loadData"
      @on-change="handleChangeDep"
      change-on-select
      filterable
      clearable
      placeholder="请选择或输入搜索部门"
    ></Cascader>
  </div>
</template>

<script>
import { apiDepartmentList } from '@/api/index'
export default {
  name: 'departmentChoose',
  props: {

  },
  data () {
    return {
      selectDep: [],
      department: []
    }
  },
  methods: {
    initDepartmentData () {
      apiDepartmentList('0').then(res => {
        if (parseInt(res.data.code) === 200) {
          res.data.data.content.forEach(function (e) {
            if (e.isParent) {
              e.value = e.id
              e.label = e.name
              e.loading = false
              e.children = []
            } else {
              e.value = e.id
              e.label = e.name
            }
            if (e.status === -1) {
              e.label = '[已禁用]' + e.label
              e.disabled = true
            }
          })
          this.department = res.data.data.content
        }
      })
    },
    loadData (item, callback) {
      item.loading = true
      apiDepartmentList(item.value).then(res => {
        item.loading = false
        if (parseInt(res.data.code) === 200) {
          res.data.data.content.forEach(function (e) {
            if (e.isParent) {
              e.value = e.id
              e.label = e.name
              e.loading = false
              e.children = []
            } else {
              e.value = e.id
              e.label = e.name
            }
            if (e.status === -1) {
              e.label = '[已禁用]' + e.label
              e.disabled = true
            }
          })
          item.children = res.data.data.content
          callback()
        }
      })
    },
    handleChangeDep (value, selectedData) {
      let departmentId = ''
      // 获取最后一个值
      if (value && value.length > 0) {
        departmentId = value[value.length - 1]
      }
      this.$emit('on-change', departmentId)
    },
    clearSelect () {
      this.selectDep = []
    }
  },
  created () {
    this.initDepartmentData()
  }
}
</script>

<style lang="less">
</style>

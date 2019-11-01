<template>
  <div>
    <Poptip trigger="click" placement="right" title="选择部门" width="250">
      <div style="display:flex;">
        <Input
          v-model="departmentName"
          readonly
          style="margin-right:10px;"
          :placeholder="placeholder"
        />
        <Button icon="md-trash" @click="clearSelect">清空已选</Button>
      </div>
      <div slot="content" class="tree-bar">
        <Input
          v-model="searchKey"
          suffix="ios-search"
          @on-change="searchDep"
          placeholder="输入部门名搜索"
          clearable
        />
        <Tree
          :data="dataDep"
          :load-data="loadData"
          @on-select-change="selectTree"
          :multiple="multiple"
        ></Tree>
        <Spin size="large" fix v-if="depLoading"></Spin>
      </div>
    </Poptip>
  </div>
</template>

<script>
import { apiDepartmentList, apiDepartmentSearch } from '@/api/index'
export default {
  name: 'departmentTreeChoose',
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '点击选择部门'
    }
  },
  data () {
    return {
      depLoading: false,
      departmentName: '',
      searchKey: '',
      dataDep: [],
      selectDep: [],
      department: [],
      childrenData: []
    }
  },
  methods: {
    initDepartmentData () {
      this.dataDep = []
      apiDepartmentList('0').then(res => {
        if (parseInt(res.data.code) === 200) {
          let data = res.data.data.content
          data.forEach(item => {
            let title = {
              title: item.name,
              content: item
            }
            if (this.dataDep.length < res.data.data.content.length) {
              this.dataDep.push(title)
            }
          })
          this.dataDep.forEach(item => {
            if (item.content.isParent) {
              item.loading = false
              item.children = []
            }
            if (item.content.status === -1) {
              item.title = '[已禁用] ' + e.title
              item.disabled = true
            }
          })
        }
      })
    },
    loadData (item, callback) {
      this.childrenData = []
      apiDepartmentList(item.content.id).then(res => {
        if (parseInt(res.data.code) === 200) {
          let ldata = res.data.data.content
          ldata.forEach(item => {
            let title = {
              title: item.name,
              content: item
            }
            if (this.childrenData.length < res.data.data.content.length) {
              this.childrenData.push(title)
            }
          })
          this.childrenData.forEach(item => {
            if (item.content.isParent) {
              item.loading = false
              item.children = []
            }
          })
          callback(this.childrenData)
        }
      })
    },
    searchDep () {
      // 搜索部门
      if (this.searchKey) {
        this.depLoading = true
        let keyword = this.searchKey
        apiDepartmentSearch(keyword).then(res => {
          this.depLoading = false
          this.dataDep = []
          if (parseInt(res.data.code) === 200) {
            let searchData = res.data.data.content
            this.dataDep = []
            searchData.forEach(item => {
              let title = {
                title: item.name,
                content: item
              }
              this.dataDep.push(title)
            })
            this.dataDep.forEach(item => {
              if (item.content.status === -1) {
                item.title = '[已禁用] ' + item.title
                item.disabled = true
              }
            })
          }
        })
      } else {
        this.initDepartmentData()
      }
    },
    selectTree (v) {
      let ids = []
      let title = ''
      v.forEach(e => {
        ids.push(e.content.id)
        if (title === '') {
          title = e.title
        } else {
          title = title + '、' + e.title
        }
      })
      this.departmentId = ids
      this.departmentName = title
      this.$emit('on-change', this.departmentId)
    },
    clearSelect () {
      this.departmentId = []
      this.departmentName = ''
      this.initDepartmentData()
      this.$emit('on-change', this.departmentId)
    },
    setData (ids, title) {
      this.departmentId = ids
      this.departmentName = title
      this.$emit('on-change', this.departmentId)
    }
  },
  created () {
    this.initDepartmentData()
  }
}
</script>

<style lang="less">
.tree-bar {
    max-height: 500px;
    overflow: auto;
    margin-top: 5px;
}

.tree-bar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}

.tree-bar::-webkit-scrollbar-thumb {
    border-radius: 4px;
    -webkit-box-shadow: inset 0 0 2px #d1d1d1;
    background: #e4e4e4;
}

.ivu-tree .ivu-tree-empty {
    margin-top: 10px;
    font-size: 12px;
}
</style>

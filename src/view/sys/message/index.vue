<template>
  <div>
    <Row @keydown.enter.native="handleSearch" class="table-search-con">
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form">
        <Form-item label="消息标题" prop="name">
          <Input
            type="text"
            v-model="searchForm.name"
            placeholder="请输入消息标题"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="消息内容" prop="content">
          <Input
            type="text"
            v-model="searchForm.content"
            placeholder="请输入消息内容"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <span v-if="drop">
          <Form-item label="消息类型" prop="type">
            <Select
              v-model="searchForm.type"
              placeholder="请选择消息类型"
              clearable
              style="width: 200px"
            >
              <Option
                v-for="(item, i) in messageType"
                :key="i"
                :value="item.value"
              >{{item.label}}</Option>
            </Select>
          </Form-item>
          <Form-item label="创建时间">
            <DatePicker
              v-model="selectDate"
              type="daterange"
              format="yyyy-MM-dd"
              clearable
              @on-change="selectDateRange"
              placeholder="选择起始时间"
              style="width: 200px"
            ></DatePicker>
          </Form-item>
        </span>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
          <Button @click="handleReset">重置</Button>
          <a class="drop-down" @click="changeSearchDropDown">
            {{dropDownContent}}
            <Icon :type="dropDownIcon"></Icon>
          </a>
        </Form-item>
      </Form>
    </Row>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">发送新消息</Button>
      <Button @click="deleteBatch" icon="md-trash">批量删除撤回</Button>
      <Button @click="getModel" icon="md-refresh">刷新</Button>
    </Row>
    <Row>
      <Alert show-icon>
        已选择
        <span class="select-count">{{selectCount}}</span> 项
        <a class="select-clear" @click="handleSelectNone">清空</a>
      </Alert>
    </Row>
    <Row>
      <Table
        :loading="loading"
        border
        :columns="columns"
        :data="data"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
        ref="table"
      ></Table>
    </Row>
    <Row type="flex" justify="end" class="page">
      <Page
        :current="searchForm.pageNumber"
        :total="total"
        :page-size="searchForm.pageSize"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        :page-size-opts="[10,20,50]"
        size="small"
        show-total
        show-elevator
        show-sizer
      ></Page>
    </Row>
  </div>
</template>

<script>
import {
  apiMessageListIndex,
  apiMessageDelete
} from '@/api/index'
export default {
  name: 'message-manage',
  data () {
    let that = this
    return {
      loading: true, // 表单加载状态
      userLoading: true,
      selectCount: 0, // 多选计数
      selectList: [], // 多选数据
      drop: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: {
        // 搜索框对应data对象
        name: '',
        content: '',
        pageNumber: 1, // 当前页数
        pageSize: 10, // 页面大小
        sort: 'createdAt', // 默认排序字段
        order: 'desc', // 默认排序方式
        startDate: '', // 起始时间
        endDate: '' // 终止时间

      },
      selectDate: null, // 选择日期绑定modal
      columns: [
        // 表头
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          title: '消息标题',
          key: 'name',
          width: 200,
          sortable: true
        },
        {
          title: '消息内容',
          key: 'content',
          minWidth: 275,
          tooltip: true
        },
        {
          title: '类型',
          key: 'type',
          width: 120,
          align: 'center',
          render: (h, params) => {
            let re = ''
            this.messageType.forEach((item) => {
              if (item.value === params.row.type) {
                re = item.label
              }
            })
            return h('div', re)
          },
          filters: [],
          filterMultiple: false,
          filterRemote (value, row) {
            that.searchForm.type = value[0]
            that.searchForm.type = that.searchForm.type + ''
            that.getModel()
          }
        },
        {
          title: '新创建账号推送',
          key: 'newAutoSend',
          align: 'center',
          width: 135,
          render: (h, params) => {
            if (params.row.newAutoSend) {
              return h('div', [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'blue'
                    }
                  },
                  '开启'
                )
              ])
            } else {
              return h('div', [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'default'
                    }
                  },
                  '关闭'
                )
              ])
            }
          }
        },
        {
          title: '创建时间',
          key: 'createdAt',
          width: 150,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '操作',
          key: 'action',
          width: 280,
          align: 'center',
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.edit(params.row)
                    }
                  }
                },
                '编辑消息'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.sendDetail(params.row)
                    }
                  }
                },
                '查看发送详情'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                },
                '删除撤回'
              )
            ])
          }
        }
      ],
      total: 0,
      data: [], // 表单数据
      messageType: [
        {
          label: '系统公告',
          value: 1
        },
        {
          label: '提醒',
          value: 2
        },
        {
          label: '私信',
          value: 3
        },
        {
          label: '工作流',
          value: 4
        }
      ]
    }
  },
  created () {
    let i = 0
    let that = this
    that.columns.forEach(function (e) {
      if (e.key === 'type') {
        that.columns[i].filters = that.messageType
      }
      i++
    })
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getModel()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModel () {
      this.loading = true
      // 避免后台默认值
      if (typeof this.searchForm.type === 'undefined' || this.searchForm.type === 'undefined') {
        this.searchForm.type = ''
      }
      apiMessageListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    deleteBatch () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
        loading: true,
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function (e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          // 批量删除
          apiMessageDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.handleSelectNone()
              this.getModel()
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          // 删除
          apiMessageDelete(v.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModel()
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    addModal () {
      let query = { type: 0, backRoute: this.$route.name }
      this.$router.push({
        name: 'add-edit-message_page',
        query: query
      })
    },
    edit (v) {
      let query = { type: 1, id: v.id, backRoute: this.$route.name }
      this.$router.push({
        name: 'add-edit-message_page',
        query: query
      })
    },
    sendDetail (v) {
      let query = { id: v.id }
      this.$router.push({
        name: 'message-send-detail_page',
        query: query
      })
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModel()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.selectDate = null
      this.searchForm.startDate = ''
      this.searchForm.endDate = ''
      // 重新加载数据
      this.getModel()
    },
    changeSearchDropDown () {
      if (this.drop) {
        this.dropDownContent = '展开'
        this.dropDownIcon = 'ios-arrow-down'
      } else {
        this.dropDownContent = '收起'
        this.dropDownIcon = 'ios-arrow-up'
      }
      this.drop = !this.drop
    },
    selectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
    },
    changeSort (e) {
      this.searchForm.sort = e.key
      this.searchForm.order = e.order
      if (e.order === 'normal') {
        this.searchForm.order = ''
      }
      this.getModel()
    },
    changePage (v) {
      this.searchForm.pageNumber = v
      this.getModel()
      this.handleSelectNone()
    },
    changePageSize (v) {
      this.searchForm.pageSize = v
      this.getModel()
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  }
}
</script>

<style>
</style>

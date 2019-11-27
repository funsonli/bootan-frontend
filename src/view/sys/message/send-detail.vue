<template>
  <div>
    <Row class="table-search-con">
      <Form ref="searchForm" inline :label-width="80" class="search-form">
        <Form-item label="发送用户ID" prop="userId">
          <Input
            type="text"
            v-model="userId"
            placeholder="请输入发送用户完整ID"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="发送状态" prop="status">
          <Select v-model="status" placeholder="请选择" style="width: 200px" clearable>
            <Option v-for="(item) in statusList" :key="item.value" :value="item.value">{{item.label}}</Option>
          </Select>
        </Form-item>
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="getModel" type="primary" icon="ios-search">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </Form-item>
      </Form>
    </Row>
    <Row class="table-operation-con">
      <Button @hasRole="'ROLE_ADMIN'" @click="delAll" icon="md-trash">批量删除</Button>
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
        ref="table"
        sortable="custom"
        @on-sort-change="changeSort"
        @on-selection-change="changeSelect"
      ></Table>
    </Row>
    <Row type="flex" justify="end" class="page">
      <Page
        :current="pageNumber"
        :total="total"
        :page-size="pageSize"
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
  apiMessageStateListIndex,
  apiMessageStateDelete
} from '@/api/index'
export default {
  name: 'message_send_detail',
  data () {
    return {
      loading: true, // 表单加载状态
      messageId: '',
      sortColumn: 'createdAt', // 排序字段
      sortType: 'desc', // 排序方式
      status: '', // 发送状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
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
          title: '发送消息标题',
          key: 'name'
        },
        {
          title: '发送用户',
          key: 'username',
          sortable: true
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          sortable: true,
          render: (h, params) => {
            if (params.row.status === 1) {
              return h('div', [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'default'
                    }
                  },
                  '未读'
                )
              ])
            } else if (params.row.status === 2) {
              return h('div', [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'green'
                    }
                  },
                  '已读'
                )
              ])
            } else if (params.row.status === 0) {
              return h('div', [
                h(
                  'Tag',
                  {
                    props: {
                      color: 'orange'
                    }
                  },
                  '回收站'
                )
              ])
            }
          }
        },
        {
          title: '创建时间',
          key: 'createdAt',
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '更新时间',
          key: 'updatedAt',
          sortable: true
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'error',
                    size: 'small',
                    icon: 'md-trash'
                  },
                  on: {
                    click: () => {
                      this.remove(params.row)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      statusList: [
        {
          label: '未读',
          value: 1
        },
        {
          label: '已读',
          value: 2
        },
        {
          label: '回收站',
          value: '0'
        }
      ],
      data: [], // 表单数据
      pageNumber: 1, // 当前页数
      pageSize: 10, // 页面大小
      total: 0, // 表单数据总数
      userId: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.messageId = this.$route.query.id
      this.getModel()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModel (v) {
      this.loading = true
      if (v === 0) {
        this.userId = ''
      }
      let params = {
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        sort: this.sortColumn,
        order: this.sortType,
        messageId: this.messageId,
        status: this.status,
        userId: this.userId
      }
      // 避免后台默认值
      if (!params.status) {
        params.status = ''
      }
      this.loading = false
      apiMessageStateListIndex(params).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        // 记得确认修改此处
        content: '您确认要删除该条数据?',
        loading: true,
        onOk: () => {
          // 删除
          apiMessageStateDelete(v.id).then(res => {
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
    delAll () {
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
          apiMessageStateDelete(ids).then(res => {
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
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */

    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
    handleReset () {
      this.userId = ''
      this.status = ''
      this.getModel()
    },
    changePage (v) {
      this.pageNumber = v
      this.getModel()
      this.handleSelectNone()
    },
    changePageSize (v) {
      this.pageSize = v
      this.getModel()
    },
    changeSort (e) {
      this.sortColumn = e.key
      this.sortType = e.order
      if (e.order === 'normal') {
        this.sortType = ''
      }
      this.getModel()
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  },
  watch: {
    // 监听路由变化通过id获取数据
    $route (to, from) {
      if (to.name === 'message-send-detail_page') {
        this.messageId = this.$route.query.id
        this.getModel()
      }
    }
  }
}
</script>

<style>
</style>

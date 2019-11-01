<!--<style lang="less">
@import "./template.less";
</style>-->
<template>
  <div>
    <Row type="flex" justify="space-between" class="code-row-bg">
      <Col v-if="expand" span="5">
        <Row class="table-operation-con">
          <Button @click="addDcit" type="primary" icon="md-add">添加字典</Button>
          <Dropdown @on-click="handleDropdown">
            <Button>
              更多操作
              <Icon type="md-arrow-dropdown"/>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="editDcit">编辑字典</DropdownItem>
              <DropdownItem name="delDcit">删除字典</DropdownItem>
              <DropdownItem name="refreshDcit">刷新</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </Row>
        <Alert show-icon>
          当前选择：
          <span class="select-title">{{editTitle}}</span>
          <a class="select-clear" v-if="editTitle" @click="cancelEdit">取消选择</a>
        </Alert>
        <Input
          v-model="searchKey"
          suffix="ios-search"
          @on-change="search"
          placeholder="输入搜索字典"
          clearable
        />
        <div class="tree-bar" :style="{maxHeight: maxHeight}">
          <Tree ref="tree" :data="treeData" @on-select-change="selectTree"></Tree>
        </div>
        <Spin size="large" fix v-if="treeLoading"></Spin>
      </Col>
      <div class="expand">
        <Icon :type="expandIcon" size="16" class="icon" @click="changeExpand"/>
      </div>
      <Col :span="span">
        <Row class="table-search-con">
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form" @keydown.native.enter.prevent ="handleSearch">
            <Form-item label="用户名称" prop="name">
              <Input type="text" v-model="searchForm.name" clearable placeholder="请输入用户名" class="search-input" @on-change="handleClear" />
            </Form-item>
            <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
            <Button @click="handleReset">重置</Button>
          </Form>
        </Row>
        <Row class="table-operation-con">
          <Button @click="addModal" type="primary" icon="md-add">添加</Button>
          <Button @click="deleteData" icon="md-trash">批量删除</Button>
          <Button @click="getModelsData" icon="md-refresh">刷新</Button>
        </Row>
        <Row>
          <Alert show-icon>
            已选择
            <span class="select-count">{{selectCount}}</span> 项
            <a class="select-clear" @click="clearSelectAll">清空</a>
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
        <Row>
          <Button class="export" type="primary" @click="exportExcel">导出为Csv文件</Button>

          <Row class="table-page-con" type="flex" justify="end">
            <Page
              :current="searchForm.pageNumber"
              :total="total"
              :page-size="searchForm.pageSize"
              @on-change="changePage"
              @on-page-size-change="changePageSize"
              :page-size-opts="[10,20,50]"
              show-total
              show-elevator
              show-sizer
            ></Page>
          </Row>
        </Row>
      </Col>
    </Row>

    <!-- 添加字典 -->
    <Modal :title="modalTitleDict" v-model="modalVisibleDict" :mask-closable="false" :width="500" :styles="{top: '30px'}" >
      <Form ref="dictForm" :model="dictForm" :label-width="75" :rules="formValidateDict">
        <FormItem label="名称" prop="title">
          <Input v-model="dictForm.title" placeholder="请输入名称"/>
        </FormItem>
        <FormItem label="类型" prop="name">
          <Input v-model="dictForm.name" placeholder="请输入类型"/>
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="1000" :min="0" v-model="dictForm.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modalVisibleDict=false">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="saveModel">提交</Button>
      </div>
    </Modal>

    <!-- 添加编辑弹出框 -->
    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="500" @keydown.native.enter.prevent ="saveModel">
      <Form ref="modelForm" :model="modelForm" :label-width="80" :rules="modelFormValidate">
        <FormItem label="名称" prop="name">
          <Input v-model="modelForm.name" placeholder="请输入名称"/>
        </FormItem>
        <FormItem label="数据值" prop="value">
          <Input v-model="modelForm.value" placeholder="请输入数据值"/>
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="1000" :min="0" v-model="modelForm.sortOrder" @keyup.native="changeNumber"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelModel">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="saveModelData">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  apiDictIndex,
  apiDictAll,
  apiDictSave,
  apiDictDelete,
  apiDictDataIndex,
  apiDictDataSave,
  apiDictDataDelete,
  apiDictSearch
} from '@/api/index'
export default {
  name: 'model-manage',
  data () {
    return {
      expand: true,
      expandIcon: 'ios-arrow-back',
      editTitle: '',
      searchKey: '',
      maxHeight: '500px',
      treeData: [],
      treeLoading: false,
      span: 18,
      modalTitleDict: '',
      modalVisibleDict: false,
      dictForm: {
        title: '',
        name: '',
        sortOrder: 50
      },
      formValidateDict: {
        // 表单验证规则
        name: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        sortOrder: [{ required: true, trigger: 'blur', type: 'number' }]
      },
      selectNode: {},
      selectCount: 0,
      loading: true,
      searchForm: {
        name: '',
        pageNumber: 1,
        pageSize: 10,
        sort: 'sortOrder',
        order: 'asc'
      },
      columns: [
        { type: 'selection', width: 60, align: 'center' },
        { type: 'index', width: 60, align: 'center' },
        { title: '名称', key: 'name', minwidth: 240, sortable: true },
        { title: '数据值', key: 'value', minwidth: 240, sortable: true },
        { title: '排序值', key: 'sortOrder', minwidth: 90, sortable: true, sortType: 'asc' },
        { title: '创建时间', key: 'createdAt', width: 265, sortable: true },
        { title: '更新时间', key: 'updatedAt', width: 265, sortable: true },

        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 258,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.editModal(params.row)
                    }
                  }
                },
                '编辑'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'error'
                  },
                  on: {
                    click: () => {
                      this.deleteOneData(params.row)
                    }
                  }
                },
                '删除'
              )
            ])
          }
        }
      ],
      data: [],
      total: 0,
      modalTitle: '',
      modelModalVisible: false,
      modelForm: {
        name: '',
        value: '',
        sortOrder: 50
      },
      modelFormValidate: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '数据值不能为空', trigger: 'blur' }],
        sortOrder: [{ required: true, message: '排序值不能为空或小数', trigger: 'blur', pattern: /^[a-z0-9]+$/ }]
      },
      submitLoading: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getDictAll()
      this.getModelsData()
    },

    /* **** 和后台交互代码区块 begin **** */
    getDictAll () {
      this.treeLoading = true
      apiDictAll(this.searchForm).then(res => {
        this.treeLoading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.treeData = res.data.data.content
        }
      })
    },
    getModels () {
    // 多条件带分页搜索用户列表
      this.treeLoading = true
      apiDictIndex().then(res => {
        this.treeLoading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.treeData = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    getModelsData () {
    // 多条件带分页搜索用户列表
      this.loading = true
      if (this.selectNode.id) {
        this.searchForm.dictId = this.selectNode.id
      } else {
        delete this.searchForm.dictId
      }
      if (!this.searchForm.status) {
        this.searchForm.status = ''
      }
      apiDictDataIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    saveModel () {
      this.$refs.dictForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          apiDictSave(this.dictForm).then(res => {
            this.submitLoading = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getDictAll()
              this.modalVisibleDict = false
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    saveModelData () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            delete this.modelForm.id
            this.modelForm.dictId = this.selectNode.id
          }
          this.submitLoading = true
          apiDictDataSave(this.modelForm).then(res => {
            this.submitLoading = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModelsData()
              this.modelModalVisible = false
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    deleteOne () {
      if (!this.selectNode.id) {
        this.$Message.warning('您还未选择要删除的字典')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除 ' + this.selectNode.title + ' ?',
        loading: true,
        onOk: () => {
          apiDictDelete(this.selectNode.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getDictAll()
            } else {
              this.$Message.success(res.data.message)
            }
          })
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
          apiDictDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.clearSelectAll()
              this.getModels()
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    deleteOneData (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除数据 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiDictDataDelete(v.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModelsData()
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    deleteData () {
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
          apiDictDataDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.clearSelectAll()
              this.getModelsData()
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    search () {
      // 搜索树
      if (this.searchKey) {
        this.treeLoading = true
        let keyword = this.searchKey
        apiDictSearch(keyword).then(res => {
          this.treeLoading = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.treeData = res.data.data.content
          }
        })
      } else {
        // 为空重新加载
        this.getDictAll()
      }
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    selectTree (v) {
      if (v.length > 0) {
        this.$refs.dictForm.resetFields()
        // 转换null为''
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = ''
          }
        }
        let str = JSON.stringify(v[0])
        let data = JSON.parse(str)
        this.selectNode = data
        this.dictForm = data
        this.editTitle = data.title + '(' + data.name + ')'
        // 重新加载表
        this.searchForm.pageNumber = 1
        this.searchForm.pageSize = 10
        this.getModelsData()
      } else {
        this.cancelEdit()
      }
    },
    handleDropdown (name) {
      if (name === 'editDcit') {
        if (!this.selectNode.id) {
          this.$Message.warning('您还未选择要编辑的字典')
          return
        }
        this.editDcit()
      } else if (name === 'delDcit') {
        this.deleteOne()
      } else if (name === 'refreshDcit') {
        this.refreshDict()
      }
    },
    addDcit () {
      this.modalType = 0
      this.modalTitleDict = '添加字典'
      this.$refs.dictForm.resetFields()
      this.modalVisibleDict = true
    },
    editDcit () {
      this.modalType = 1
      this.modalTitleDict = '编辑字典'
      this.modalVisibleDict = true
    },
    addModal () {
      if (!this.selectNode.id) {
        this.$Message.warning('请先选择一个字典类别')
        return
      }
      this.modalType = 0
      this.modalTitle = '添加' + this.editTitle + ' 的数据'
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
      this.modelModalVisible = true
    },
    editModal (v) {
      this.modalType = 1
      this.modalTitle = '编辑'
      this.$refs.modelForm.resetFields()
      // 转换null为''
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let modelInfo = JSON.parse(str)
      this.modelForm = modelInfo
      this.modelModalVisible = true
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModelsData()
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.getModelsData()
      }
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      // 重新加载数据
      this.getModelsData()
    },
    refreshDict () {
      this.getDictAll()
      this.selectNode = {}
      this.editTitle = ''
      this.getModelsData()
    },
    cancelEdit () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      // 取消选择后获取全部数据
      this.selectNode = {}
      this.editTitle = ''
      this.getModelsData()
    },
    changeExpand () {
      this.expand = !this.expand
      if (this.expand) {
        this.expandIcon = 'ios-arrow-back'
        this.span = 18
      } else {
        this.expandIcon = 'ios-arrow-forward'
        this.span = 23
      }
    },
    clearSelectAll () {
      this.$refs.table.selectAll(false)
    },
    changeSort (e) {
      this.searchForm.sort = e.key
      this.searchForm.order = e.order
      if (e.order === 'normal') {
        this.searchForm.order = ''
      }
      this.getModelsData()
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
    },
    changePage (v) {
      this.searchForm.pageNumber = v
      this.getModelsData()
      this.clearSelectAll()
    },
    changePageSize (v) {
      this.searchForm.pageSize = v
      this.getModelsData()
    },
    cancelModel () {
      this.modelModalVisible = false
    },
    exportExcel () {
      this.$refs.table.exportCsv({
        filename: `table-${(new Date()).valueOf()}.csv`
      })
    },
    changeNumber () {
      let str = '' + this.modelForm.sortOrder
      if (str.indexOf('.') !== -1) {
        let arr = str.split('')
        arr.splice(arr.length - 1)
        let str2 = arr.join('')
        this.modelForm.sortOrder = +str2
      }
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */

  }
}
</script>

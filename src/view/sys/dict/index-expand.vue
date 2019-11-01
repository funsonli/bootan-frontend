<!--<style lang="less">
@import "./index.less";
</style>-->
<template>
  <div>
    <Row type="flex" justify="space-between" class="code-row-bg">

      <Col v-if="expand" span="5">
        <Row class="table-operation-con">
          <Button @click="addModalDict" type="primary" icon="md-add">添加</Button>
          <Dropdown @on-click="changeOperationDropDownDict">
            <Button>
              更多操作
              <Icon type="md-arrow-dropdown"/>
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="editModalDict">编辑</DropdownItem>
              <DropdownItem name="deleteOneDict">删除</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button @click="initDict" icon="md-refresh">刷新</Button>
        </Row>
        <Alert show-icon>
          当前选择：
          <span class="select-title">{{selectTitle}}</span>
          <a class="select-clear" v-if="selectTitle" @click="handleSelectNoneDict">取消选择</a>
        </Alert>
        <Input
          v-model="searchKeyDict"
          suffix="ios-search"
          @on-change="handleSearchDict"
          placeholder="输入名称搜索"
          clearable
        />
        <div class="tree-bar" :style="{maxHeight: maxHeight}">
          <Tree ref="tree" :data="dataDict" @on-select-change="changeSelect"></Tree>
        </div>
        <Spin size="large" fix v-if="loadingDict"></Spin>
      </Col>

      <div class="expand">
        <Icon :type="expandIcon" size="16" class="icon" @click="changeExpand"/>
      </div>

      <Col :span="span">

        <Row class="table-search-con">
          <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form" @keydown.native.enter.prevent ="handleSearch">
            <Form-item label="名称" prop="name">
              <Input type="text" v-model="searchForm.name" clearable placeholder="请输入名称" class="search-input" @on-change="handleClear" />
            </Form-item>
            <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
            <Button @click="handleReset">重置</Button>
          </Form>
        </Row>
        <Row class="table-operation-con">
          <Button @click="addModal" type="primary" icon="md-add">添加</Button>
          <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
          <Dropdown @on-click="changeOperationDropDown">
            <Button>
              更多操作 <Icon type="md-arrow-dropdown" />
            </Button>
            <DropdownMenu slot="list">
              <DropdownItem name="exportData">导出所选数据</DropdownItem>
              <DropdownItem name="exportAll">导出全部数据</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <Button @click="initDictData" icon="md-refresh">刷新</Button>
        </Row>
        <Row>
          <Alert show-icon>
            已选择 <span class="select-count">{{selectCount}}</span> 项
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
            @on-selection-change="changeSelection"
          ></Table>
        </Row>
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

      </Col>
    </Row>

    <!-- 添加编辑弹出框 -->
    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="520" @keydown.native.enter.prevent="saveModel">
      <Form ref="modelForm" :model="modelForm" :label-width="80" :rules="modelFormValidate">
        <FormItem label="名称" prop="name">
          <Input v-model="modelForm.name" placeholder="请输入名称"/>
        </FormItem>
        <FormItem label="值" prop="value">
          <Input v-model="modelForm.value" placeholder="请输入值"/>
        </FormItem>
        <FormItem label="排序" prop="sortOrder">
          <Input type="number" v-model="modelForm.sortOrder" placeholder="值越小越靠前"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelModal">取消</Button>
        <Button type="primary" :loading="loadingSubmit" @click="saveModel">提交</Button>
      </div>
    </Modal>

    <Modal :title="modalTitleDict" v-model="modelModalVisibleDict" :mask-closable="false" :width="500" :styles="{top: '30px'}" >
      <Form ref="modelFormDict" :model="modelFormDict" :label-width="75" :rules="modelFormValidateDict">
        <FormItem label="类型" prop="name">
          <Input v-model="modelFormDict.name" placeholder="请输入类型"/>
        </FormItem>
        <FormItem label="标签" prop="title">
          <Input v-model="modelFormDict.title" placeholder="请输入标签"/>
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="1000" :min="0" v-model="modelFormDict.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="modelModalVisibleDict=false">取消</Button>
        <Button type="primary" :loading="loadingSubmit" @click="saveModelDict">提交</Button>
      </div>
    </Modal>

    <Drawer width="640" v-model="viewModalVisible" title="查看详情">
      <div class="bootan-drawer-view">
        <Row>
          <Col span="12">名称： {{viewForm.name}} </Col>
          <Col span="12">类型： {{viewForm.type}} </Col>
        </Row>
        <Divider/>
        <Row>
          <Col span="12">状态: {{viewForm.status}} </Col>
          <Col span="12">创建时间: {{viewForm.createdAt}} </Col>
        </Row>
        <Divider/>
      </div>
    </Drawer>

    <Modal :title="modalExportTitle" v-model="exportModalVisible" :mask-closable="false" @on-ok="exportModelData">
      <Form ref="exportForm" :label-width="85">
        <FormItem label="导出文件名">
          <Input v-model="exportFileName"/>
        </FormItem>
        <FormItem label="自定义导出列">
          <CheckboxGroup v-model="chooseColumns">
            <Checkbox
              v-for="(item, idx) in exportColumns"
              :label="item.title"
              :key="idx"
              :value="item.checked"
              :disabled="item.disabled"
            ></Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
    </Modal>

    <Drawer title="导入数据" closable v-model="importModalVisible" width="1000">
      <Upload action :before-upload="beforeUploadImport" accept=".xls, .xlsx">
        <Button icon="ios-cloud-upload-outline" style="margin-right:10px">上传Excel文件</Button>
        <span v-if="importFile.name != ''">当前选择文件：{{ importFile.name }}</span>
      </Upload>
      <Alert type="warning" show-icon>导入前请按照模板填写必要字段，其中必要字段为：name</Alert>
      <Table
        :columns="importColumns"
        border
        :height="importHeight"
        :data="importTableData"
        ref="importTable"
      ></Table>
      <div class="drawer-footer">
        <Button @click="downloadTemple" type="info" style="position:absolute;left:15px;">下载导入模板</Button>
        <Button @click="importModalVisible == false">关闭</Button>
        <Button
          :loading="loadingImport"
          :disabled="importTableData.length<=0"
          @click="importData"
          style="margin-left:5px"
          type="primary"
        >
          确认导入
          <span v-if="importTableData.length > 0">{{importTableData.length}} 条数据</span>
        </Button>
      </div>
    </Drawer>
  </div>
</template>

<script>
import {
  apiDictDataIndex,
  apiDictDataSave,
  apiDictDataDelete,
  apiDictDataImportData,
  apiDictDataEnable,
  apiDictDataDisable,
  apiDictAll,
  apiDictSave,
  apiDictDelete,
  apiDictSearch
} from '@/api/index'
import excel from '@/libs/excel'
import { importDataColumns, importData } from './import-excel.js'

export default {
  name: 'model-manage',
  data () {
    return {
      selectNode: {},
      selectCount: 0,
      loading: true,
      loadingDict: false,
      loadingSubmit: false,
      loadingImport: false,
      expand: true,
      expandIcon: 'ios-arrow-back',
      span: 18,
      selectTitle: '',
      searchKey: '',
      searchKeyDict: '',
      maxHeight: '520px',
      searchDropDown: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: {
        name: '',
        value: '',
        status: '',
        pageNumber: 1,
        pageSize: 10,
        sort: 'createdAt',
        order: 'desc',
        startDate: '',
        endDate: ''
      },
      columns: [
        { type: 'selection', width: 60, align: 'center', fixed: 'left' },
        { type: 'index', width: 60, align: 'center', fixed: 'left' },

        { title: '名称', key: 'name', sortable: true, fixed: 'left' },
        { title: '数据值', key: 'value', sortable: true },

        { title: '排序', key: 'sortOrder', sortable: true },

        {
          title: '状态',
          key: 'status',
          align: 'center',
          render: (h, params) => {
            return h(
              'i-switch',
              {
                props: {
                  value: params.row.status,
                  size: 'large',
                  'true-value': 1,
                  'false-value': 0
                },
                on: {
                  'on-change': v => {
                    this.changeStatus(params.row, v)
                  }
                }
              },
              this.statusList.map((item) => {
                return h('span', { slot: item.slot }, item.label)
              })
            )
          },
          filters: [],
          filterMultiple: false,
          filterMethod (value, row) {
            if (value === 1) {
              row.status = 1
              return row.status
            } else if (value !== 1) {
              row.status = 0
              return row.status
            }
          }
        },
        { title: '创建时间', key: 'createdAt', sortable: true, sortType: 'desc' },
        { title: '更新时间', key: 'updatedAt', sortable: true },

        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 256,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'primary',
                    size: 'small',
                    icon: 'ios-create-outline'
                  },
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
                    type: 'error',
                    size: 'small',
                    icon: 'ios-trash'
                  },
                  on: {
                    click: () => {
                      this.deleteOne(params.row)
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
      dataDict: [],
      total: 0,
      modalTitle: '',
      modelModalVisible: false,
      modelForm: {
        id: '',
        name: '',
        value: '',
        sortOrder: 50
      },
      modelFormValidate: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '值不能为空', trigger: 'blur' }]
      },
      modalTitleDict: '',
      modelModalVisibleDict: false,
      modelFormDict: {
        id: '',
        name: '',
        title: '',
        sortOrder: 50
      },
      modelFormValidateDict: {
        name: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      viewModalVisible: false,
      viewForm: {},
      modalExportTitle: '确认导出数据',
      exportModalVisible: false,
      chooseColumns: [],
      exportColumns: [{ title: '名称', key: 'name' }, { title: '值', key: 'value' }],
      exportDataList: [],
      exportFileName: '',
      importModalVisible: false,
      importHeight: 520,
      importFile: {
        'name': ''
      },
      importTableData: [],
      importColumns: [],
      typeList: [
        {
          label: '类型1',
          value: 1
        },
        {
          label: '类型2',
          value: 2
        }
      ],
      statusList: [
        {
          label: '启用',
          value: 1,
          slot: 'open'
        },
        {
          label: '禁用',
          value: 0,
          slot: 'close'
        }
      ]
    }
  },
  created () {
    let i = 0
    let that = this
    that.columns.forEach(function (e) {
      if (e.key === 'type') {
        that.columns[i].filters = that.typeList
      } else if (e.key === 'status') {
        that.columns[i].filters = that.statusList
      }
      i++
    })
  },
  mounted () {
    this.importHeight = Number(document.documentElement.clientHeight - 230)
    this.init()
  },
  methods: {
    init () {
      this.getModelsDict()
      this.getModels()
    },
    initDict () {
      this.getModelsDict()
      this.selectNode = {}
      this.editTitle = ''
      this.getModels()
    },
    initDictData () {
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
    // 多条件带分页搜索列表
      this.loading = true
      if (this.selectNode.id) {
        this.searchForm.dictId = this.selectNode.id
      } else {
        delete this.searchForm.dictId
      }
      // 避免后台默认值
      if (typeof this.searchForm.status === 'undefined') {
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
    getModelsDict () {
      apiDictAll(this.searchForm).then(res => {
        this.loadingDict = true
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.loadingDict = false
          this.dataDict = res.data.data.content
        }
      })
    },
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          if (this.modalType === 0) {
            delete this.modelForm.id
            this.modelForm.dictId = this.selectNode.id
          }

          apiDictDataSave(this.modelForm).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModels()
              this.modelModalVisible = false
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    saveModelDict () {
      this.$refs.modelFormDict.validate(valid => {
        if (valid) {
          this.submitLoading = true
          apiDictSave(this.modelFormDict).then(res => {
            this.submitLoading = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModelsDict()
              this.modelModalVisibleDict = false
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    deleteOne (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除数据 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiDictDataDelete(v.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModels()
            } else {
              this.$Message.error(res.data.message)
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
          apiDictDataDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.handleSelectNone()
              this.getModels()
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    deleteOneDict () {
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
              this.getModelsDict()
            } else {
              this.$Message.success(res.data.message)
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码 begin **** */
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
    changeSelect (v) {
      if (v.length > 0) {
        this.$refs.modelFormDict.resetFields()
        // 转换null为''
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = ''
          }
        }
        let str = JSON.stringify(v[0])
        let data = JSON.parse(str)
        this.selectNode = data
        this.modelFormDict = data
        this.selectTitle = data.title + '(' + data.name + ')'
        // 重新加载表
        this.searchForm.pageNumber = 1
        this.searchForm.pageSize = 10
        this.getModels()
      } else {
        this.cancelEdit()
      }
    },
    cancelEdit () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      // 取消选择后获取全部数据
      this.selectNode = {}
      this.editTitle = ''
      this.getModels()
    },
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModels()
    },
    handleSearchDict () {
      if (this.searchKeyDict) {
        this.loadingDict = true
        let keyword = this.searchKeyDict
        apiDictSearch(keyword).then(res => {
          this.loadingDict = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.dataDict = res.data.data.content
          }
        })
      } else {
        this.initDict()
      }
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.getModels()
      }
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      // 重新加载数据
      this.getModels()
    },
    changeStatus (row, v) {
      if (row.status === 1) {
        apiDictDataDisable(row.id).then(res => {
          this.$Modal.remove()
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.$Message.success(res.data.message)
            this.getModels()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        apiDictDataEnable(row.id).then(res => {
          this.$Modal.remove()
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.$Message.success(res.data.message)
            this.getModels()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      }
    },
    addModal () {
      this.modalType = 0
      this.modalTitle = '添加'
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
      this.modelModalVisible = true
    },
    addModalDict () {
      this.modalType = 0
      this.modalTitleDict = '添加字典'
      this.$refs.modelFormDict.resetFields()
      this.modelModalVisibleDict = true
    },

    editModal (v) {
      if (!this.selectNode.id) {
        this.$Message.warning('请先选择一个字典类别')
        return
      }
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
    editModalDict (v) {
      this.modalType = 1
      this.modalTitle = '编辑'
      this.modelModalVisibleDict = true
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无须修改） begin **** */
    changeSelectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
    },
    handleSelectNoneDict () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      this.selectTitle = ''
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
      this.getModels()
    },
    changeSort (e) {
      this.searchForm.sortColumn = e.key
      this.searchForm.sortType = e.order
      if (e.order === 'normal') {
        this.searchForm.sortType = ''
      }
      this.getModels()
    },
    changeSelection (e) {
      this.exportDataList = e
      this.selectList = e
      this.selectCount = e.length
    },
    changePage (v) {
      this.searchForm.pageNumber = v
      this.getModels()
      this.handleSelectNone()
    },
    changePageSize (v) {
      this.searchForm.pageSize = v
      this.getModels()
    },
    cancelModal () {
      this.modelModalVisible = false
    },
    changeOperationDropDownDict (name) {
      if (name === 'editModalDict') {
        if (!this.selectNode.id) {
          this.$Message.warning('您还未选择要编辑的数据')
          return
        }
        this.editModalDict()
      } else if (name === 'deleteOneDict') {
        this.deleteOneDict()
      } else if (name === 'initDict') {
        this.initDict()
      }
    },
    changeOperationDropDown (name) {
      if (name === 'exportData') {
        if (parseInt(this.selectCount) <= 0) {
          this.$Message.warning('您还未选择要导出的数据')
          return
        }
        this.exportType = 'part'
        this.exportModalVisible = true
        this.exportTitle = '确认导出 ' + this.selectCount + ' 条数据'
      } else if (name === 'exportAll') {
        this.exportType = 'all'
        this.exportModalVisible = true
        this.exportTitle = '确认导出全部 ' + this.total + ' 条数据'
        apiDictDataIndex().then(res => {
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.exportDataList = res.data.data
          }
        })
      } else if (name === 'importData') {
        this.importModalVisible = true
      }
    },
    exportModelData () {
      if (this.exportFileName === '') {
        this.exportFileName = '数据' + `${(new Date()).valueOf()}`
      }
      // 判断勾选导出列
      let array = []
      this.exportColumns.forEach(e => {
        this.chooseColumns.forEach(c => {
          if (e.title === c && !e.disabled) {
            array.push(e)
          }
        })
      })
      this.exportColumns = array
      this.exportModalVisible = false
      let title = []
      let key = []
      this.exportColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: this.exportDataList,
        autoWidth: true,
        filename: this.exportFileName
      }
      excel.export_array_to_excel(params)
    },
    beforeUploadImport (file) {
      this.importFile = file
      const fileExt = file.name
        .split('.')
        .pop()
        .toLocaleLowerCase()
      if (fileExt === 'xlsx' || fileExt === 'xls') {
        this.readFile(file)
        this.file = file
      } else {
        this.$Notice.warning({
          title: '文件类型错误',
          desc:
            '所选文件‘ ' +
            file.name +
            ' ’不是EXCEL文件，请选择后缀为.xlsx或者.xls的EXCEL文件。'
        })
      }
      return false
    },
    // 读取文件
    readFile (file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onerror = e => {
        this.$Message.error('文件读取出错')
      }
      reader.onload = e => {
        this.$Message.success('读取数据成功')
        const data = e.target.result
        const { header, results } = excel.read(data, 'array')
        const tableTitle = header.map(item => {
          return { title: item, key: item }
        })
        this.importTableData = results
        this.importColumns = tableTitle
      }
    },
    downloadTemple () {
      let title = []
      let key = []
      importDataColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: importData,
        autoWidth: true,
        filename: '导入数据模版'
      }
      excel.export_array_to_excel(params)
    },
    importData () {
      this.loadingImport = true
      apiDictDataImportData(this.importTableData).then(res => {
        this.loadingImport = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.importModalVisible = false
          this.getModels()
          this.$Modal.info({
            title: '导入结果',
            content: res.data.message
          })
        }
      })
    }
    /* **** 页面内控件标准代码（一般无须修改） end **** */

  }
}
</script>

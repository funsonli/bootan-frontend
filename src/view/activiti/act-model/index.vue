<style lang="less">
@import "./index.less";
</style>
<template>
  <div>
    <Row class="table-search-con">
      <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form" @keydown.native.enter.prevent ="handleSearch">
        <Form-item label="名称" prop="name">
          <Input type="text" v-model="searchForm.name" clearable placeholder="请输入名称" class="search-input" @on-change="handleClear" />
        </Form-item>
        <Form-item label="创建时间">
          <DatePicker
            v-model="selectDate"
            type="daterange"
            format="yyyy-MM-dd"
            clearable
            @on-change="changeSelectDateRange"
            placeholder="选择起始时间"
            style="width: 200px"
          ></DatePicker>
        </Form-item>
        <Form-item label="类型" prop="type">
          <Select
            v-model="searchForm.type"
            placeholder="请选择"
            clearable
            style="width: 200px" >
            <Option v-for="(item) in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
          </Select>
        </Form-item>
        <span v-if="searchDropDown">
          <Form-item label="状态" prop="status">
            <Select
              v-model="searchForm.status"
              placeholder="请选择"
              clearable
              style="width: 200px" >
              <Option v-for="(item) in statusList" :key="item.value" :value="item.value">{{item.label}}</Option>
            </Select>
          </Form-item>
        </span>
        <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
        <Button @click="handleReset">重置</Button>
        <a class="drop-down" @click="changeSearchDropDown">
          {{dropDownContent}}
          <Icon :type="dropDownIcon"></Icon>
        </a>
      </Form>
    </Row>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">创建</Button>
      <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
      <Dropdown @on-click="changeOperationDropDown">
        <Button>
          更多操作 <Icon type="md-arrow-dropdown" />
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name="exportData">导出所选数据</DropdownItem>
          <DropdownItem name="exportAll">导出全部数据</DropdownItem>
          <DropdownItem name="importData">导入数据</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Button @click="init" icon="md-refresh">刷新</Button>
    </Row>
    <Row>
      <Alert show-icon>
        已选择<span class="select-count">{{selectCount}}</span> 项
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

    <!-- 创建编辑弹出框 -->
    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="520" @keydown.native.enter.prevent="saveModel">
      <Form ref="modelForm" :model="modelForm" :label-width="88" :rules="modelFormValidate">
        <FormItem label="名称" prop="name">
          <Input v-model="modelForm.name" placeholder="请输入名称"/>
        </FormItem>
        <Form-item label="模型key" prop="modelKey">
          <Input  v-model="modelForm.modelKey" placeholder="请输入模型key"/>
        </Form-item>
        <Form-item label="描述" prop="description">
          <Input  v-model="modelForm.description" placeholder="请输入描述"/>
        </Form-item>
        <FormItem label="类型" prop="type">
          <Select v-model="modelForm.type" placeholder="请选择">
            <Option
              v-for="(item) in typeList"
              :key="item.value"
              :value="item.value"
            >{{item.label}}</Option>
          </Select>
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

    <Modal
      :closable="false"
      @on-cancel="handleClose"
      v-model="modelerModalVisible"
      :mask-closable="false"
      footer-hide
      fullscreen
      class="modeler"
    >
      <div slot="header">
        <div class="ivu-modal-header-inner">Activiti工作流在线流程设计</div>
        <a @click="handleClose" class="ivu-modal-close">
          <Icon type="ios-close" size="31" class="ivu-icon-ios-close"/>
        </a>
      </div>
      <div style="position:relative;height: 100%;">
        <iframe
          id="iframe"
          :src="modelerUrl"
          frameborder="0"
          width="100%"
          height="100%"
          scrolling="auto"
        ></iframe>
        <Spin fix size="large" v-if="loadingModeler"></Spin>
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
  apiActModelListIndex,
  apiActModelCreate,
  apiActModelUpdate,
  apiActModelDelete,
  apiActModelListAll,
  apiActModelImportData,
  apiActModelEnable,
  apiActModelDisable
} from '@/api/index'
import { getToken } from '@/libs/util'
import excel from '@/libs/excel'
import { importDataColumns, importData } from './import-excel.js'

export default {
  name: 'model-manage',
  data () {
    let that = this
    return {
      selectCount: 0,
      loading: true,
      loadingSubmit: false,
      loadingImport: false,
      loadingModeler: false,
      selectDate: null,
      searchDropDown: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: {
        name: '',
        description: '',
        version: '',
        modelKey: '',
        type: '',
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
        { title: '模型key', key: 'modelKey', sortable: true },
        { title: '模型版本', key: 'version', sortable: true },
        { title: '描述', key: 'description', sortable: true },

        {
          title: '类型',
          key: 'type',
          align: 'center',
          render: (h, params) => {
            let re = ''
            this.typeList.forEach((item) => {
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
            that.getModels()
          }
        },

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
          filterRemote (value, row) {
            that.searchForm.status = value[0]
            that.searchForm.status = that.searchForm.status + ''
            that.getModels()
          }
        },
        { title: '创建时间', key: 'createdAt', sortable: true, sortType: 'desc' },
        //{ title: '更新时间', key: 'updatedAt', sortable: true },

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
                    type: 'default',
                    size: 'small',
                    icon: 'ios-eye'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.viewModal(params.row)
                    }
                  }
                },
                '查看'
              ),
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
                      this.designModal(params.row)
                    }
                  }
                },
                '在线设计'
              ),
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
      total: 0,
      modalTitle: '',
      modelModalVisible: false,
      modelForm: {
        id: '',
        name: '',
        description: '',
        version: '',
        modelKey: '',
        type: 1,
        sortOrder: 50
      },
      modelFormValidate: {
        modelKey: [{ required: true, message: '模型key不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
      },
      viewModalVisible: false,
      viewForm: {},
      modalExportTitle: '确认导出数据',
      exportModalVisible: false,
      chooseColumns: [],
      exportColumns: [{ title: '名称', key: 'name' }],
      exportDataList: [],
      exportFileName: '',
      importModalVisible: false,
      importHeight: 520,
      importFile: {
        'name': ''
      },
      importTableData: [],
      importColumns: [],
      modelerModalVisible: false,
      domain: "",
      modelerUrl: "",
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
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
    // 多条件带分页搜索列表
      this.loading = true
      // 避免后台默认值
      if (typeof this.searchForm.type === 'undefined' || this.searchForm.type === 'undefined') {
        this.searchForm.type = ''
      }
      if (typeof this.searchForm.status === 'undefined' || this.searchForm.status === 'undefined') {
        this.searchForm.status = ''
      }
      apiActModelListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          if (this.modalType == 0) {
            apiActModelCreate(this.modelForm).then(res => {
              this.loadingSubmit = false
              if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                this.$Message.success(res.data.message)
                this.getModels()
                this.modelModalVisible = false
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            apiActModelUpdate(this.modelForm).then(res => {
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
        }
      })
    },
    deleteOne (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除数据 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiActModelDelete(v.id).then(res => {
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
          apiActModelDelete(ids).then(res => {
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
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码 begin **** */
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModels()
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.getModels()
      }
    },
    handleReset () {
      this.searchForm.type = this.searchForm.type.toString()
      this.searchForm.status = this.searchForm.status.toString()
      this.$nextTick(() => {
        this.$refs.searchForm.resetFields()
      })
      this.searchForm.startDate = ''
      this.searchForm.endDate = ''
      this.selectDate = null
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      // 重新加载数据
      this.getModels()
    },
    changeStatus (row, v) {
      if (row.status === 1) {
        apiActModelDisable(row.id).then(res => {
          this.$Modal.remove()
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.$Message.success(res.data.message)
            this.getModels()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        apiActModelEnable(row.id).then(res => {
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
      this.modalTitle = '创建'
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
      this.modelModalVisible = true
    },
    viewModal (v) {
      let list = []
      for (let attr in v) {
        list[attr] = v[attr]
        if (v[attr] == null) {
          list[attr] = ''
        } else {
          if (attr === 'type') {
            this.typeList.forEach((item) => {
              if (item.value === v[attr]) {
                list[attr] = item.label
              }
            })
          } else if (attr === 'status') {
            this.statusList.forEach((item) => {
              if (item.value === v[attr]) {
                list[attr] = item.label
              }
            })
          }
        }
      }

      this.viewForm = Object.assign({}, list)
      this.viewModalVisible = true
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
    designModal(v) {
      // if (!this.domain) {
      //   this.$Modal.confirm({
      //     title: "您还未配置访问域名",
      //     content: "您还未配置应用部署访问域名，是否现在立即去配置?",
      //     onOk: () => {
      //       this.$router.push({
      //         name: "setting",
      //         query: { name: "other" }
      //       });
      //     }
      //   });
      //   return;
      // }
      this.modelerUrl = `http://localhost:8686/modeler.html?modelId=${
        v.id
      }&access-token=${getToken()}`;
      this.modelerModalVisible = true;
      this.loadingModeler = true;
      let that = this;
      // 判断iframe是否加载完毕
      let iframe = document.getElementById("iframe");
      if (iframe.attachEvent) {
        iframe.attachEvent("onload", function() {
          //iframe加载完成后你需要进行的操作
          that.loadingModeler = false;
        });
      } else {
        iframe.onload = function() {
          //iframe加载完成后你需要进行的操作
          that.loadingModeler = false;
        };
      }
    },
    handleClose() {
      this.$Modal.confirm({
        title: "确认关闭",
        content: "请记得点击左上角保存按钮，确定关闭编辑器?",
        onOk: () => {
          this.getModels();
          this.modelerModalVisible = false;
        }
      });
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无须修改） begin **** */
    changeSearchDropDown () {
      if (this.searchDropDown) {
        this.dropDownContent = '展开'
        this.dropDownIcon = 'ios-arrow-down'
      } else {
        this.dropDownContent = '收起'
        this.dropDownIcon = 'ios-arrow-up'
      }
      this.searchDropDown = !this.searchDropDown
    },
    changeSelectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
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
        apiActModelListAll().then(res => {
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
      apiActModelImportData(this.importTableData).then(res => {
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

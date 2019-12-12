<!--<style lang="less">
@import "./act_leave.less"
</style>-->
<template>
  <div>
    <Card>
      <p slot="title">
        <span v-if="category==1">新增请假申请</span>
        <span v-else-if="category==2">编辑请假申请</span>
        <span v-else>查看请假申请详情</span>
      </p>

      <Form ref="modelForm" :model="modelForm" :label-width="88" :rules="modelFormValidate">
        <FormItem label="类型" prop="type">
          <Select v-model="modelForm.type" style="width: 220px" placeholder="请选择">
            <Option
              v-for="(item) in typeList"
              :key="item.value"
              :value="item.value"
            >{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="标题" prop="name">
          <Input v-model="modelForm.name" style="width: 560px" placeholder="请输入名称"/>
        </FormItem>
        <FormItem label="详情" prop="description">
          <Input type="textarea" :rows="5" v-model="modelForm.description" placeholder="请输入名称" style="width: 560px" />
        </FormItem>
        <FormItem label="请假时间范围" :error="errorMsg">
          <DatePicker
            v-model="selectDate"
            :options="options"
            type="datetimerange"
            format="yyyy-MM-dd HH:mm"
            clearable
            @on-change="selectDateRange"
            style="width: 560px"
            placeholder="选择起始时间"
          ></DatePicker>
        </FormItem>
        <FormItem label="请假时长">{{modelForm.duration}} 小时</FormItem>
      </Form>
      <p class="br" style="margin-left: 50px">
        <Button type="primary" :loading="loadingSubmit" @click="saveModel" v-if="category == 1 || category == 2">保存并关闭</Button>
        <Button type="info" @click="printModel" v-if="!(category == 1 || category == 2)">打印</Button>
        <Button @click="cancelModal">关闭</Button>
      </p>
    </Card>
  </div>
</template>

<script>
import {
  apiActLeaveListIndex,
  // apiActLeaveListAll,
  apiActLeaveView,
  apiActLeaveCreate,
  apiActLeaveUpdate,
  apiActLeaveDelete,
  // apiActLeaveSearch,
  apiActLeaveImportData,
  apiActLeaveExportData,
  apiActLeaveDeployFile,
  apiActLeaveConvertModel,
  apiActLeaveEnable,
  apiActLeaveDisable
} from '@/api/index'
import excel from '@/libs/excel'
import { getToken } from '@/libs/util'
import printJS from "print-js"
import { importDataColumns, importData } from './import-excel.js'

export default {
  name: 'model-manage',
  data () {
    let that = this
    return {
      category: 1,
      errorMsg: '',
      options: {
        shortcuts: [
          {
            text: "1 天",
            value() {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime());
              return [start, end];
            }
          },
          {
            text: "2 天",
            value() {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 1);
              return [start, end];
            }
          },
          {
            text: "3 天",
            value() {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 2);
              return [start, end];
            }
          },
          {
            text: "1 周",
            value() {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 6);
              return [start, end];
            }
          },
          {
            text: "1 个月",
            value() {
              const end = new Date();
              const start = new Date();
              end.setTime(start.getTime() + 3600 * 1000 * 24 * 29);
              return [start, end];
            }
          }
        ]
      },
      selectCount: 0,
      loading: true,
      loadingSubmit: false,
      loadingImport: false,
      selectDate: null,
      searchDropDown: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      searchForm: {
        name: '',
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
                      this.nodeModal(params.row)
                    }
                  }
                },
                '节点设置'
              ),
              h(
                'Button',
                {
                  props: {
                    type: 'default',
                    size: 'small'
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
                    type: 'info',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.convertModel(params.row)
                    }
                  }
                },
                '转模型'
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
      modalType: 0,
      modalTitle: '',
      modelModalVisible: false,
      modelForm: {
        id: '',
        name: '',
        startedAt: '',
        endedAt: '',
        description: '',
        duration: 0,
        processDefinitionId: '',
        type: 1,
        sortOrder: 50
      },
      modelFormValidate: {
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
      deployModalVisible: false,
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
      this.accessToken = {
        'access-token': getToken()
      }
      this.category = this.$route.query.category
      this.backRoute = this.$route.query.backRoute
      this.modelForm.processDefinitionId = this.$route.query.processDefinitionId
      if (this.category != 1) {
        this.modelForm.id = this.$route.query.id
        this.getModel()
      } else {
        this.$refs.modelForm.resetFields()
        this.selectDate = []
      }
      //this.getModels()
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
      apiActLeaveListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    getModel () {
      apiActLeaveView(this.modelForm.id).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.modelForm = res.data.data
          this.selectDate = [];
          this.selectDate[0] = this.modelForm.startedAt;
          this.selectDate[1] = this.modelForm.endedAt;
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          if (this.modelForm.id === '') {
            apiActLeaveCreate(this.modelForm).then(res => {
              this.loadingSubmit = false
              if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                this.$Message.success(res.data.message)
                this.getModels()
                this.modelModalVisible = false
                this.closeCurrentPage()
              } else {
                this.$Message.error(res.data.message)
              }
            })
          } else {
            apiActLeaveUpdate(this.modelForm).then(res => {
              this.loadingSubmit = false
              if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                this.$Message.success(res.data.message)
                this.getModels()
                this.modelModalVisible = false
                this.closeCurrentPage()
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
          apiActLeaveDelete(v.id).then(res => {
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
          apiActLeaveDelete(ids).then(res => {
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
        apiActLeaveDisable(row.id).then(res => {
          this.$Modal.remove()
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.$Message.success(res.data.message)
            this.getModels()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        apiActLeaveEnable(row.id).then(res => {
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
    uploadModal () {
      this.deployModalVisible = true
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
    nodeModal (v) {
      let query = { id: v.id, name: v.name, backRoute: this.$route.name }
      this.$router.push({
        name: 'process_node_edit',
        query: query
      })
    },
    convertModel (v) {
      let that = this
      this.$Modal.confirm({
        title: "确认转化",
        content: "您确认要转化流程 " + v.name + " 为模型?",
        loading: true,
        onOk: () => {
          apiActLeaveConvertModel(v.id).then(res => {
            this.$Modal.remove()
            if (res.success) {
              setTimeout(function () {
                that.showJump()
              }, 300)
            }
          })
        }
      })
    },
    handleFormatError(file) {
      this.$Notice.warning({
        title: "不支持的文件格式",
        desc:
          "所选文件‘ " +
          file.name +
          " ’格式不正确, 请选择 .zip .bar .bpmn .bpmn20.xml格式文件"
      })
    },
    handleMaxSize(file) {
      this.$Notice.warning({
        title: "文件大小过大",
        desc: "所选文件‘ " + file.name + " ’大小过大, 不得超过 5M."
      })
    },
    handleSuccess(res, file) {
      if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
        this.$Message.success('部署成功，请继续编辑完善流程信息')
        this.modalVisible = false
        this.getModels()
      } else {
        this.$Message.error(res.message)
      }
    },
    handleError(error, file, fileList) {
      this.$Message.error(error.toString())
    },
    selectDateRange(v) {
      if (v[0]) {
        this.modelForm.startedAt = v[0]
        this.modelForm.endedAt = v[1]
        let date1 = this.stringToDate(this.modelForm.startedAt)
        let date2 = this.stringToDate(this.modelForm.endedAt)
        let date = date2.getTime() - date1.getTime()
        let hours = Math.round(date / (60 * 60 * 1000))
        this.modelForm.duration = hours
      } else {
        this.modelForm.startedAt = ""
        this.modelForm.endedAt = ""
        this.modelForm.duration = 0
      }
    },
    stringToDate(str) {
      let tempStrs = str.split(" ");
      let dateStrs = tempStrs[0].split("-");
      let year = parseInt(dateStrs[0], 10);
      let month = parseInt(dateStrs[1], 10) - 1;
      let day = parseInt(dateStrs[2], 10);
      let timeStrs = tempStrs[1].split(":");
      let hour = parseInt(timeStrs[0], 10);
      let minute = parseInt(timeStrs[1], 10);
      let date = new Date(year, month, day, hour, minute, 0);
      return date;
    },
    printModel () {
      let data = [];
      let leave = {
        申请人: this.modelForm.createBy,
        请假类型: this.modelForm.type,
        标题: this.modelForm.title,
        原因: this.modelForm.description,
        请假开始时间: this.modelForm.startedAt,
        请假结束时间: this.modelForm.endedAt,
        持续时长: this.modelForm.duration + " 小时"
      };
      data.push(leave);
      printJS({
        printable: data,
        type: "json",
        header: "请假申请表",
        gridStyle: "border: 1px solid lightgray;text-align:center",
        properties: [
          "申请人",
          "请假类型",
          "标题",
          "原因",
          "请假开始时间",
          "请假结束时间",
          "持续时长"
        ]
      });
    },
    handelCancel() {
      this.closeCurrentPage();
    },
    // 关闭当前页面
    closeCurrentPage() {
      this.$store.commit("removeTag", "leave");
      localStorage.pageOpenedList = JSON.stringify(
        this.$store.state.app.pageOpenedList
      );
      this.$router.push({
        name: this.backRoute
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
        apiActLeaveExportData().then(res => {
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
      apiActLeaveImportData(this.importTableData).then(res => {
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

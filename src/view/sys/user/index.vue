<template>
  <div class="search">
    <Row>
      <Col>
        <Card>
          <Row class="table-search-con">
            <Form ref="searchForm" :model="searchForm" inline :label-width="70" class="search-form" @keydown.native.enter.prevent ="handleSearch">
              <Form-item label="用户名称" prop="username">
                <Input type="text" v-model="searchForm.username" clearable placeholder="请输入名称" class="search-input" @on-change="handleClear" />
              </Form-item>
              <Form-item label="部门" prop="department">
                <department-choose @on-change="handleSelectDep" style="width: 200px" ref="dep"></department-choose>
              </Form-item>
              <span v-if="searchDropDown">
                  <Form-item label="手机号" prop="mobile">
                    <Input
                      type="text"
                      v-model="searchForm.mobile"
                      clearable
                      placeholder="请输入手机号"
                      style="width: 200px"
                    />
                  </Form-item>
                  <Form-item label="邮箱" prop="email">
                    <Input
                      type="text"
                      v-model="searchForm.email"
                      clearable
                      placeholder="请输入邮箱"
                      style="width: 200px"
                    />
                  </Form-item>
                  <Form-item label="性别" prop="sex">
                    <Select v-model="searchForm.sex" placeholder="请选择" clearable style="width: 200px">
                      <Option v-for="(item, i) in dictSex" :key="i" :value="item.value">{{item.title}}</Option>
                    </Select>
                  </Form-item>
                  <Form-item label="用户类型" prop="type">
                    <Select
                      v-model="searchForm.type"
                      placeholder="请选择"
                      clearable
                      style="width: 200px" >
                      <Option v-for="(item) in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
                    </Select>
                  </Form-item>
                  <Form-item label="用户状态" prop="status">
                    <Select
                      v-model="searchForm.status"
                      placeholder="请选择"
                      clearable
                      style="width: 200px" >
                      <Option v-for="(item) in statusList" :key="item.value" :value="item.value">{{item.label}}</Option>
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
              <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
              <Button @click="handleReset">重置</Button>
              <a class="drop-down" @click="changeSearchDropDown">
                {{dropDownContent}}
                <Icon :type="dropDownIcon"></Icon>
              </a>
            </Form>
          </Row>
          <Row class="table-operation-con">
            <Button @click="addModal" type="primary" icon="md-add">添加用户</Button>
            <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
            <Dropdown @on-click="changeOperationDropDown">
              <Button>
                更多操作
                <Icon type="md-arrow-dropdown" />
              </Button>
              <DropdownMenu slot="list">
                <DropdownItem name="refresh">刷新</DropdownItem>
                <DropdownItem name="reset">重置用户密码</DropdownItem>
                <DropdownItem name="exportData">导出所选数据</DropdownItem>
                <DropdownItem name="exportAll">导出全部数据</DropdownItem>
                <DropdownItem name="importData">导入数据</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <circleLoading v-if="operationLoading" />
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
              @on-selection-change="changeSelection"
              ref="table"
            ></Table>
            <Table
              :columns="exportColumns"
              :data="exportData"
              ref="exportTable"
              style="display:none"
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
        </Card>
      </Col>
    </Row>

    <!-- 添加和编辑 -->
    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="500" :styles="{top: '30px'}" @keydown.native.enter.prevent="saveModel">
      <Form ref="modelForm" :model="modelForm" :label-width="70" :rules="modelFormValidate">
        <FormItem label="用户名" prop="username">
          <Input v-model="modelForm.username" autocomplete="off" />
        </FormItem>
        <FormItem label="密码" prop="password" v-if="modalType==0" :error="errorPass">
          <Input type="password" v-model="modelForm.password" autocomplete="off" />
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="modelForm.email" />
        </FormItem>
        <FormItem label="手机号" prop="mobile">
          <Input v-model="modelForm.mobile" />
        </FormItem>
        <FormItem label="性别" prop="sex">
          <RadioGroup v-model="modelForm.sex">
            <Radio v-for="(item, i) in dictSex" :key="i" :label="item.value">{{item.title}}</Radio>
          </RadioGroup>
        </FormItem>
        <Form-item label="头像" prop="avatar">
          <upload-pic-input v-model="modelForm.avatar"></upload-pic-input>
        </Form-item>
        <Form-item label="所属部门">
          <department-tree-choose @on-change="handleSelectDepTree" ref="depTree"></department-tree-choose>
        </Form-item>
        <FormItem label="用户类型" prop="type">
          <Select
            v-model="modelForm.type"
            placeholder="请选择"
            clearable
            style="width: 200px" >
            <Option v-for="(item) in typeList" :key="item.value" :value="item.value">{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="角色分配" prop="roles">
          <Select v-model="modelForm.roles" multiple>
            <Option v-for="item in roleList" :value="item.id" :key="item.id" :label="item.name">
              <span style="margin-right:10px;">{{ item.name }}</span>
              <span style="color:#ccc;">{{ item.description }}</span>
            </Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelModal">取消</Button>
        <Button type="primary" :loading="loadingSubmit" @click="saveModel">提交</Button>
      </div>
    </Modal>

    <!-- 查看 -->
    <Drawer width="640" v-model="viewModalVisible" title="查看详情">
      <div class="bootan-drawer-view">
        <Row>
          <Col span="12">用户名： {{viewForm.username}} </Col>
          <Col span="12">用户类型： {{viewForm.type}} </Col>
        </Row>
        <Divider/>
        <Row>
          <Col span="12">手机： {{viewForm.mobile}} </Col>
          <Col span="12">邮箱： {{viewForm.email}} </Col>
        </Row>
        <Divider/>
        <Row>
          <Col span="12">性别： {{viewForm.sex}} </Col>
          <Col span="12">所属部门： {{viewForm.departmentName}} </Col>
        </Row>
        <Divider/>
        <Row>
          <Col span="12">状态: {{viewForm.status}} </Col>
          <Col span="12">创建时间: {{viewForm.createdAt}} </Col>
        </Row>
        <Divider/>
      </div>
    </Drawer>

    <!-- 自定义导出数据 -->
    <Modal v-model="exportModalVisible" :title="exportTitle" :loading="loadingExport" @on-ok="exportModelData">
      <Form ref="exportForm" :label-width="85">
        <FormItem label="导出文件名">
          <Input v-model="exportFileName"/>
        </FormItem>
        <FormItem label="自定义导出列">
          <CheckboxGroup v-model="chooseColumns">
            <Checkbox
              v-for="(item, i) in exportColumns"
              :label="item.title"
              :key="i"
              :value="item.checked"
              :disabled="item.disabled"
            ></Checkbox>
          </CheckboxGroup>
        </FormItem>
      </Form>
    </Modal>

    <!-- 导入数据 -->
    <Drawer title="导入数据" closable v-model="importModalVisible" width="1000">
      <Upload action :before-upload="beforeUploadImport" accept=".xls, .xlsx">
        <Button icon="ios-cloud-upload-outline" style="margin-right:10px">上传Excel文件</Button>
        <span v-if="uploadfile.name!=''">当前选择文件：{{ uploadfile.name }}</span>
      </Upload>
      <Alert type="warning" show-icon>导入前请下载查看导入模版数据文件，确保数据格式正确，不得修改列英文名称。必需数据字段：用户名(唯一)、密码(明文)</Alert>
      <Table
        :columns="importColumns"
        border
        :height="height"
        :data="importTableData"
        ref="importTable"
      ></Table>
      <div class="drawer-footer">
        <Button @click="downloadTemple" type="info" style="position:absolute;left:15px;">下载导入模板</Button>
        <Button @click="importModalVisible=false">关闭</Button>
        <Button
          :loading="importLoading"
          :disabled="importTableData.length<=0"
          @click="importData"
          style="margin-left:5px"
          type="primary"
        >
          确认导入
          <span v-if="importTableData.length>0">{{importTableData.length}} 条数据</span>
        </Button>
      </div>
    </Drawer>

    <!-- 重置密码 -->
    <check-password ref="checkPass" @on-success="resetPass" />
  </div>
</template>
<script>
import {
  apiRoleListIndex,
  apiUserListIndex,
  apiUserDelete,
  apiUserCreate,
  apiUserUpdate,
  apiUserResetPassword,
  apiUserEnable,
  apiUserDisable,
  apiUserExportData,
  apiUserImportData
} from '@/api/index'
import { exportColumn } from '@/view/sys/user/exportColumn'
import expandRow from '@/view/sys/user/expand.vue'
import excel from '@/libs/excel'
import { validateMobile } from '@/libs/validate'
// 模版导入文件表数据
import { importModelColumns, importModelData } from './importModelTemplate'
import departmentChoose from '@/view/components/department-choose/department-choose'
import uploadPicInput from '@/view/components/upload-pic-input/upload-pic-input'
import departmentTreeChoose from '@/view/components/department-tree-choose/department-tree-choose'
import checkPassword from '@/view/components/check-password/check-password'
export default {
  name: 'user-manage',
  components: {
    expandRow,
    departmentChoose,
    uploadPicInput,
    departmentTreeChoose,
    checkPassword
  },
  data () {
    let that = this
    return {
      loading: true,
      operationLoading: false,
      loadingExport: true,
      modalExportAll: false,
      drop: false,
      searchDropDown: false,
      dropDownContent: '展开',
      dropDownIcon: 'ios-arrow-down',
      selectCount: 0,
      selectList: [],
      dataDep: [],
      searchKey: '',
      searchForm: {
        username: '',
        departmentId: '',
        mobile: '',
        email: '',
        sex: '',
        type: '',
        status: '',
        pageNumber: 1,
        pageSize: 10,
        sort: 'createdAt',
        order: 'desc',
        startDate: '',
        endDate: '',
        avatar: ''
      },
      dictSex: [{ 'title': '男', 'value': '男' }, { 'title': '女', 'value': '女' }],
      selectDate: null,
      modalType: 0,
      modelModalVisible: false,
      modalTitle: '',
      modelForm: {
        username: '',
        mobile: '',
        email: '',
        sex: '',
        type: 0,
        avatar: '',
        roles: [],
        departmentId: '',
        departmentName: ''
      },
      userRoles: [],
      roleList: [],
      errorPass: '',
      modelFormValidate: {
        username: [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址' },
          { type: 'email', message: '邮箱格式不正确' }
        ]
      },
      loadingSubmit: false,
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          type: 'expand',
          width: 50,
          fixed: 'left',
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row,
                index: params.index
              }
            })
          }
        },
        {
          type: 'index',
          width: 60,
          align: 'center',
          fixed: 'left'
        },
        {
          title: '用户名',
          key: 'username',
          minWidth: 125,
          sortable: true,
          fixed: 'left',
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'username') {
              return h('Input', {
                props: {
                  value: params.row.username
                },
                on: {
                  input: val => {
                    params.row.username = val
                  },
                  'on-enter': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  },
                  'on-blur': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  }
                }
              })
            } else {
              return h('div',
                {
                  on: {
                    click: (e) => {
                      this.editRow = params.index
                      this.editColumn = 'username'
                      let el = e.currentTarget.parentElement
                      this.$nextTick(() => {
                        el.getElementsByTagName('input')[0].focus()
                      })
                    }
                  }
                },
                [
                  h('span', { style: { 'margin-right': '1px' } }, params.row.username)
                ]
              )
            }
          }
        },
        {
          title: '头像',
          key: 'avatar',
          width: 80,
          align: 'center',
          render: (h, params) => {
            return h('Avatar', {
              props: {
                src: params.row.avatar
              }
            })
          }
        },
        {
          title: '所属部门',
          key: 'departmentName',
          width: 120
        },
        {
          title: '手机',
          key: 'mobile',
          width: 115,
          sortable: true,
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'mobile') {
              return h('Input', {
                props: {
                  value: params.row.mobile
                },
                on: {
                  input: val => {
                    params.row.mobile = val
                  },
                  'on-enter': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  },
                  'on-blur': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  }
                }
              })
            } else {
              return h('div',
                {
                  on: {
                    click: (e) => {
                      this.editRow = params.index
                      this.editColumn = 'mobile'
                      let el = e.currentTarget.parentElement
                      this.$nextTick(() => {
                        el.getElementsByTagName('input')[0].focus()
                      })
                    }
                  }
                },
                [
                  h('span', { style: { 'margin-right': '1px' } }, params.row.mobile)
                ]
              )
            }
          }
        },
        {
          title: '邮箱',
          key: 'email',
          width: 180,
          sortable: true,
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'email') {
              return h('Input', {
                props: {
                  value: params.row.email
                },
                on: {
                  input: val => {
                    params.row.email = val
                  },
                  'on-enter': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  },
                  'on-blur': () => {
                    if (!this.isSaving) {
                      this.isSaving = true
                      this.saveField(params.row)
                    }
                  }
                }
              })
            } else {
              return h('div',
                {
                  on: {
                    click: (e) => {
                      this.editRow = params.index
                      this.editColumn = 'email'
                      let el = e.currentTarget.parentElement
                      this.$nextTick(() => {
                        el.getElementsByTagName('input')[0].focus()
                      })
                    }
                  }
                },
                [
                  h('span', { style: { 'margin-right': '1px' } }, params.row.email)
                ]
              )
            }
          }
        },
        {
          title: '性别',
          key: 'sex',
          width: 70,
          align: 'center'
        },
        {
          title: '用户类型',
          key: 'type',
          align: 'center',
          width: 120,
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'type') {
              return h(
                'Select',
                {
                  props: {
                    value: params.row.type
                  },
                  on: {
                    'on-change': (val) => {
                      if (!this.isSaving) {
                        params.row.type = val
                        this.isSaving = true
                        this.saveField(params.row)
                      }
                    },
                    'on-open-change': (e) => {
                      if (e === false) {
                        this.editRow = -1
                      }
                    }
                  }
                },
                this.typeList.map((item) => {
                  return h('Option', {
                    props: {
                      value: item.value,
                      label: item.label
                    }
                  })
                })
              )
            } else {
              let re = ''
              this.typeList.forEach((item) => {
                if (item.value === params.row.type) {
                  re = item.label
                }
              })

              return h('div',
                {
                  on: {
                    click: () => {
                      this.editRow = params.index
                      this.editColumn = 'type'
                    }
                  }
                },
                re
              )
            }
          },
          filters: [],
          filterMultiple: false,
          filterRemote (value, row) {
            that.searchForm.type = value[0]
            that.searchForm.type = that.searchForm.type + ''
            that.getModels()
          }
        },
        {
          title: '状态',
          key: 'status',
          align: 'center',
          width: 140,
          render: (h, params) => {
            if (params.row.status === null) {
              params.row.status = 1
            }
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
        {
          title: '创建时间',
          key: 'createdAt',
          sortable: true,
          sortType: 'desc',
          width: 150
        },
        {
          title: '操作',
          key: 'action',
          width: 240,
          align: 'center',
          fixed: 'right',
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
                '编辑'
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
                '删除'
              )
            ])
          }
        }
      ],
      viewModalVisible: false,
      viewForm: {},
      data: [],
      exportData: [],
      total: 0,
      exportTitle: '确认导出',
      exportModalVisible: false,
      exportFileName: '用户数据',
      exportColumns: exportColumn,
      chooseColumns: [],
      importModalVisible: false,
      uploadfile: {
        name: ''
      },
      importColumns: [],
      height: 510,
      importTableData: [],
      importLoading: false,
      isSaving: false, // 是否正在提交 防止enter和blur冲突
      editRow: -1, // 当前聚焦的输入框的行数
      editColumn: '',
      typeList: [
        {
          label: '普通用户',
          value: 0
        },
        {
          label: '管理员',
          value: 1
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
    this.init()
    this.getRoleList()
  },
  methods: {
    init () {
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
      // 多条件搜索用户列表
      this.loading = true
      // 避免后台默认值
      if (typeof this.searchForm.type === 'undefined' || this.searchForm.type === 'undefined') {
        this.searchForm.type = ''
      }
      if (typeof this.searchForm.status === 'undefined' || this.searchForm.status === 'undefined') {
        this.searchForm.status = ''
      }
      apiUserListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    getRoleList () {
      apiRoleListIndex().then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.roleList = res.data.data.content
        }
      })
    },
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          if (this.modalType === 0) {
            // 添加用户 避免编辑后传入id
            delete this.modelForm.id
            delete this.modelForm.status
            if (this.modelForm.password === '' || this.modelForm.password === undefined) {
              this.errorPass = '密码不能为空'
              return
            }
            if (this.modelForm.password.length < 6) {
              this.errorPass = '密码长度不得少于6位'
              return
            }
            this.loadingSubmit = true
            apiUserCreate(this.modelForm).then(res => {
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
              this.loadingSubmit = true
              apiUserUpdate(this.modelForm).then(res => {
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
    saveField (row) {
      this.editRow = -1
      this.editColumn = ''
      apiUserUpdate(row).then(res => {
        this.isSaving = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.$Message.success(res.data.message)
        } else {
          this.$Message.error(res.data.message)
        }
        this.getModels()
      })
    },
    changeStatus (row, v) {
      if (row.status === 1) {
        apiUserDisable(row.id).then(res => {
          this.$Modal.remove()
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.$Message.success(res.data.message)
            this.getModels()
          } else {
            this.$Message.error(res.data.message)
          }
        })
      } else {
        apiUserEnable(row.id).then(res => {
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
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除用户 ' + v.username + ' ?',
        loading: true,
        onOk: () => {
          apiUserDelete(v.id).then(res => {
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
          apiUserDelete(ids).then(res => {
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
    changeOperationDropDown (name) {
      if (name === 'refresh') {
        this.getModels()
      } else if (name === 'reset') {
        if (this.selectCount <= 0) {
          this.$Message.warning('您还未选择要重置密码的用户')
          return
        }
        this.$refs.checkPass.show()
      } else if (name === 'exportData') {
        if (this.selectCount <= 0) {
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
        this.searchForm.pageNumber = 1
        apiUserListIndex(this.searchForm).then(res => {
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.exportData = res.data.data.content
          }
        })
        for (var i = 0; i < Math.ceil(this.total / this.searchForm.pageSize) - 1; i++) {
          setTimeout(() => {
            apiUserListIndex(this.searchForm).then(res => {
              if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                this.exportData = this.exportData.concat(res.data.data.content)
                this.searchForm.pageNumber = 1
              }
            })
            this.searchForm.pageNumber = this.searchForm.pageNumber + 1
          }, 500)
        }
      } else if (name === 'importData') {
        this.importModalVisible = true
      }
    },
    resetPass () {
      this.$Modal.confirm({
        title: '确认重置',
        content:
          '您确认要重置所选的 ' +
          this.selectCount +
          ' 条用户数据密码为【123456】?',
        loading: true,
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function (e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          apiUserResetPassword({ ids: ids }).then(res => {
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
    importData () {
      this.importLoading = true
      apiUserImportData(this.importTableData).then(res => {
        this.importLoading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.importModalVisible = false
          this.getModels()
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    addModal () {
      this.modalType = 0
      this.modalTitle = '添加用户'
      this.$refs.modelForm.resetFields()
      this.modelModalVisible = true
    },
    edit (v) {
      this.modalType = 1
      this.modalTitle = '编辑用户'
      this.$refs.modelForm.resetFields()
      // 转换null为''
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      this.modelForm = data
      this.$refs.depTree.setData([data.departmentId], data.departmentName)
      let selectRolesId = []
      if (this.modelForm.roles[0] !== null) {
        this.modelForm.roles.forEach(item => {
          selectRolesId.push(item.id)
        })
      }
      this.modelForm.roles = selectRolesId
      this.modelModalVisible = true
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
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
    cancelModal () {
      this.modelModalVisible = false
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.getModels()
      }
    },
    handleSelectDepTree (v) {
      this.modelForm.departmentId = v[0]
    },
    handleSelectDep (v) {
      this.searchForm.departmentId = v
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
    selectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModels()
    },
    handleReset () {
      this.searchForm.type = this.searchForm.type.toString()
      this.searchForm.status = this.searchForm.status.toString()
      this.$nextTick(() => {
        this.$refs.searchForm.resetFields()
      })
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.selectDate = null
      this.searchForm.startDate = ''
      this.searchForm.endDate = ''
      this.$refs.dep.clearSelect()
      this.searchForm.departmentId = ''
      // 重新加载数据
      this.getModels()
    },
    changeSort (e) {
      this.searchForm.sort = e.key
      this.searchForm.order = e.order
      if (e.order === 'normal') {
        this.searchForm.order = ''
      }
      this.getModels()
    },
    dropDown () {
      if (this.drop) {
        this.dropDownContent = '展开'
        this.dropDownIcon = 'ios-arrow-down'
      } else {
        this.dropDownContent = '收起'
        this.dropDownIcon = 'ios-arrow-up'
      }
      this.drop = !this.drop
    },
    changeSelection (e) {
      this.exportData = e
      this.selectList = e
      this.selectCount = e.length
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
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
        data: this.exportData,
        autoWidth: true,
        filename: this.exportFileName
      }
      excel.export_array_to_excel(params)
      this.exportColumns = exportColumn
      this.getModels()
    },
    beforeUploadImport (file) {
      this.uploadfile = file
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
      importModelColumns.forEach(e => {
        title.push(e.title)
        key.push(e.key)
      })
      const params = {
        title: title,
        key: key,
        data: importModelData,
        autoWidth: true,
        filename: '导入用户数据模版'
      }
      excel.export_array_to_excel(params)
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  }
}
</script>

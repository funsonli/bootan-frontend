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
        <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
        <Button @click="handleReset">重置</Button>
      </Form>
    </Row>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">添加角色</Button>
      <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
      <Button @click="init" icon="md-refresh">刷新</Button>
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

    <!-- 添加和编辑 -->
    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="500" @keydown.native.enter.prevent="saveModel">
      <Form ref="modelForm" :model="modelForm" :label-width="80" :rules="modelFormValidate">
        <FormItem label="角色名称" prop="name">
          <Input v-model="modelForm.name" placeholder="按照Spring Security约定建议以‘ROLE_’开头"/>
        </FormItem>
        <FormItem label="备注" prop="description">
          <Input v-model="modelForm.description"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelRole">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="saveModel">提交</Button>
      </div>
    </Modal>

    <!-- 菜单权限 -->
    <Modal
      :title="modalPermissionTitle"
      v-model="modalPermissionVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
      class="permModal"
    >
    <i-switch v-model="strict" size="large" style="float: right;">
      <span slot="open">级联</span>
      <span slot="close">单选</span>
    </i-switch>
      <Tree
        ref="tree"
        :data="permData"
        multiple
        show-checkbox
        :render="renderContent"
        :check-strictly="!strict"
      ></Tree>
      <Spin size="large" v-if="treeLoading"></Spin>
      <div slot="footer">
        <Button type="text" @click="cancelPermEdit">取消</Button>
        <Select
          v-model="openLevel"
          @on-change="changeOpen"
          style="width:100px;text-align:left;margin-right:10px"
        >
          <Option value="0">展开所有</Option>
          <Option value="1">收合所有</Option>
          <Option value="2">仅展开一级</Option>
          <Option value="3">仅展开两级</Option>
        </Select>
        <Button @click="selectTreeAll">全选/反选</Button>
        <Button type="primary" :loading="loadingPermission" @click="submitPermEdit">提交</Button>
      </div>
    </Modal>

    <!-- 数据权限 -->
    <Modal
      :title="modalDepartmentTitle"
      v-model="modalDepartmentVisible"
      :mask-closable="false"
      :width="500"
      :styles="{top: '30px'}"
      class="depModal"
    >
      <Form :label-width="65">
        <FormItem label="数据范围">
          <Select v-model="dataType">
            <Option :value="0">全部数据权限</Option>
            <Option :value="1">自定义数据权限</Option>
          </Select>
        </FormItem>
      </Form>
      <Alert show-icon>默认可查看全部数据，自定义数据范围请点击选择下方数据</Alert>
      <div v-if="dataType!=0" style="margin-top:15px">
        <i-switch v-model="strict" size="large" style="float: right;">
          <span slot="open">级联</span>
          <span slot="close">单选</span>
        </i-switch>
        <Tree
          ref="depTree"
          :data="depData"
          :load-data="loadData"
          show-checkbox
          @on-toggle-expand="expandCheckDep"
          :check-strictly="!strict"
          style="margin-top:15px"
        ></Tree>
        <Spin size="large" v-if="loadingDepTree"></Spin>
      </div>
      <div slot="footer">
        <Button type="text" @click="cancelDepEdit">取消</Button>
        <Button type="primary" :loading="loadingDepartment" @click="submitDepEdit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  apiRoleIndex,
  apiPermissionAll,
  apiDepartmentList,
  apiRoleSaveDefault,
  apiRoleDelete,
  apiRoleSave,
  apiRoleSaveDepartment,
  apiRoleSavePermission
} from '@/api/index'
export default {
  name: 'role-permission',
  data () {
    return {
      selectCount: 0,
      loading: true,
      strict: true,
      selectDate: null,
      columns: [
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
          title: '角色名称',
          key: 'name',
          width: 150,
          sortable: true,
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'name') {
              return h('Input', {
                props: {
                  value: params.row.name
                },
                on: {
                  input: val => {
                    params.row.name = val
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
                      this.editColumn = 'name'
                      let el = e.currentTarget.parentElement
                      this.$nextTick(() => {
                        el.getElementsByTagName('input')[0].focus()
                      })
                    }
                  }
                },
                [
                  h('span', { style: { 'margin-right': '1px' } }, params.row.name)
                ]
              )
            }
          }
        },
        {
          title: '备注',
          key: 'description',
          minWidth: 190,
          sortable: true,
          render: (h, params) => {
            if (this.editRow === params.index && this.editColumn === 'description') {
              return h('Input', {
                props: {
                  value: params.row.description
                },
                on: {
                  input: val => {
                    params.row.description = val
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
                      this.editColumn = 'description'
                      let el = e.currentTarget.parentElement
                      this.$nextTick(() => {
                        el.getElementsByTagName('input')[0].focus()
                      })
                    }
                  }
                },
                [
                  h('span', { style: { 'margin-right': '1px' } }, params.row.description)
                ]
              )
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
          title: '是否设置为注册用户默认角色',
          key: 'isDefault',
          align: 'center',
          render: (h, params) => {
            if (params.row.isDefault) {
              return h('div', [
                h(
                  'Button',
                  {
                    props: {
                      type: 'success',
                      size: 'small'
                    },
                    style: {
                      marginRight: '5px'
                    },
                    on: {
                      click: () => {
                        this.cancelDefault(params.row)
                      }
                    }
                  },
                  '取消默认'
                )
              ])
            } else {
              return h('div', [
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
                        this.setDefault(params.row)
                      }
                    }
                  },
                  '设为默认'
                )
              ])
            }
          }
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 300,
          render: (h, params) => {
            return h('div', [
              h(
                'Button',
                {
                  props: {
                    type: 'warning',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.editPerm(params.row)
                    }
                  }
                },
                '菜单权限'
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
                      this.editDep(params.row)
                    }
                  }
                },
                '数据权限'
              ),
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
      data: [],
      pageNumber: 1,
      total: 0,
      pageSize: 10,
      modalTitle: '',
      modalPermissionTitle: '',
      modalDepartmentTitle: '',
      modalPermissionVisible: false,
      permData: [],
      treeLoading: true,
      openLevel: '0',
      loadingPermission: false,
      modelModalVisible: false,
      modelForm: {
        name: '',
        description: ''
      },
      modelFormValidate: {
        name: [{ required: true, message: '角色名称不能为空', trigger: 'blur' }]
      },
      submitLoading: false,
      modalDepartmentVisible: false,
      dataType: 0,
      loadingDepartment: false,
      depData: [],
      loadingDepTree: true,
      childrenData: [],
      searchForm: {
        name: '',
        pageNumber: 1,
        pageSize: 10,
        sort: 'createdAt',
        order: 'desc',
        startDate: '',
        endDate: ''
      },
      editDepartments: [],
      isSaving: false, // 是否正在提交 防止enter和blur冲突
      editRow: -1, // 当前聚焦的输入框的行数
      editColumn: '',
      selectCountDep: 0,
      selectListDep: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getModels()
      // 获取所有菜单权限树
      this.getPermissionAll()
    },
    /* **** 和后台交互代码区块 begin **** */
    getModels () {
    // 多条件带分页搜索用户列表
      this.loading = true
      apiRoleIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    getPermissionAll () {
      this.treeLoading = true
      apiPermissionAll().then(res => {
        this.treeLoading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.deleteDisableNode(res.data.data)
          this.permData = res.data.data
        }
      })
    },
    saveField (row) {
      this.editRow = -1
      this.editColumn = ''
      apiRoleSave(row).then(res => {
        this.isSaving = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.$Message.success(res.data.message)
        } else {
          this.$Message.error(res.data.message)
        }
        this.getModels()
      })
    },
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          apiRoleSave(this.modelForm).then(res => {
            this.submitLoading = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('操作成功')
              this.getModels()
              this.modelModalVisible = false
            }
          })
        }
      })
    },
    submitPermEdit () {
      this.loadingPermission = true
      let permIds = ''
      let selectedNodes = this.$refs.tree.getCheckedNodes()
      selectedNodes.forEach(function (e) {
        permIds += e.id + ','
      })
      permIds = permIds.substring(0, permIds.length - 1)
      apiRoleSavePermission({
        roleId: this.editRolePermId,
        permissionIds: permIds
      }).then(res => {
        this.loadingPermission = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.$Message.success('操作成功')
          // 标记重新获取菜单数据
          // this.$store.commit('setAdded', false)
          // util.initRouter(this)
          this.getModels()
          this.modalPermissionVisible = false
        }
      })
    },
    submitDepEdit () {
      let depIds = ''
      if (this.dataType !== 0) {
        let selectedNodes = this.$refs.depTree.getCheckedNodes()
        if (selectedNodes.length < 1) {
          this.$Message.error('请至少选择一条数据')
          return
        }
        selectedNodes.forEach(function (e) {
          depIds += e.content.id + ','
        })
        depIds = depIds.substring(0, depIds.length - 1)
      }
      this.loadingDepartment = true
      apiRoleSaveDepartment({
        roleId: this.editRolePermId,
        departmentType: this.dataType,
        departmentIds: depIds
      }).then(res => {
        this.loadingDepartment = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.$Message.success('操作成功')
          this.getModels()
          this.modalDepartmentVisible = false
        }
      })
    },
    editDep (v) {
      this.dataType = 0
      this.editRolePermId = v.id
      this.modalDepartmentTitle = '分配 ' + v.name + ' 的数据权限'
      if (v.departmentType) {
        this.dataType = v.departmentType
      }
      // 匹配勾选
      let roleDepIds = v.departments
      this.editDepartments = roleDepIds
      this.loadingDepTree = true
      apiDepartmentList('0').then(res => {
        this.loadingDepTree = false
        this.depData = []
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          let data = res.data.data.content
          data.forEach(item => {
            let title = {
              title: item.name,
              content: item
            }
            if (this.depData.length < res.data.data.content.length) {
              this.depData.push(title)
            }
          })
          this.depData.forEach(item => {
            item.checked = false
            if (item.content.isParent) {
              item.loading = false
              item.children = []
            }
            if (item.content.status === -1) {
              item.title = '[已禁用] ' + item.title
              item.disabled = true
            }
          })
          // 判断子节点
          this.checkDepTree(this.depData, roleDepIds)
          this.modalDepartmentVisible = true
        }
      })
    },
    loadData (item, callback) {
      let childrenDataChildren = []
      this.childrenData = []
      apiDepartmentList(item.content.id).then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          let ldata = res.data.data.content
          ldata.forEach(item => {
            let title = {
              title: item.name,
              content: item
            }
            if (childrenDataChildren.length < res.data.data.content.length) {
              childrenDataChildren.push(title)
            }
          })
          childrenDataChildren.forEach(item => {
            item.checked = false
            if (item.content.isParent) {
              item.loading = false
              item.children = []
            }
            this.childrenData.push(JSON.parse(JSON.stringify(item)))
          })
          callback(this.childrenData)
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
          apiRoleDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除成功')
              this.handleSelectNone()
              this.getModels()
            }
          })
        }
      })
    },
    remove (v) {
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除角色 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiRoleDelete(v.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除成功')
              this.getModels()
            }
          })
        }
      })
    },
    setDefault (v) {
      this.$Modal.confirm({
        title: '确认设置',
        content: '您确认要设置所选的 ' + v.name + ' 为注册用户默认角色?',
        loading: true,
        onOk: () => {
          let params = {
            roleId: v.id,
            isDefault: 1
          }
          apiRoleSaveDefault(params).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('操作成功')
              this.getModels()
            }
          })
        }
      })
    },
    cancelDefault (v) {
      this.$Modal.confirm({
        title: '确认取消',
        content: '您确认要取消所选的 ' + v.name + ' 角色为默认?',
        loading: true,
        onOk: () => {
          let params = {
            roleId: v.id,
            isDefault: 0
          }
          apiRoleSaveDefault(params).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('操作成功')
              this.getModels()
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    handleSearch () {
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      this.getModels()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.startDate = ''
      this.searchForm.endDate = ''
      this.selectDate = null
      this.searchForm.pageNumber = 1
      this.searchForm.pageSize = 10
      // 重新加载数据
      this.getModels()
    },
    handleClear (e) {
      if (e.target.value === '') {
        this.getModels()
      }
    },
    changeSelectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
    addModal () {
      this.modalType = 0
      this.modalTitle = '添加角色'
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
      this.modelModalVisible = true
    },
    // 递归标记禁用节点
    deleteDisableNode (permData) {
      let that = this
      permData.forEach(function (e) {
        if (e.status === -1) {
          e.title = '[已禁用] ' + e.title
          e.disabled = true
        }
        if (e.children && e.children.length > 0) {
          that.deleteDisableNode(e.children)
        }
      })
    },
    editPerm (v) {
      this.editRolePermId = v.id
      this.modalPermissionTitle = '分配 ' + v.name + ' 的菜单权限'
      // 匹配勾选
      let rolePerms = v.permissions
      // 递归判断子节点
      this.checkPermTree(this.permData, rolePerms)
      this.modalPermissionVisible = true
    },
    checkPermTree (permData, rolePerms) {
      let that = this
      permData.forEach(function (p) {
        if (that.hasPerm(p, rolePerms) && p.status !== -1) {
          p.checked = true
        } else {
          p.checked = false
        }
        if (p.children && p.children.length > 0) {
          that.checkPermTree(p.children, rolePerms)
        }
      })
    },
    // 判断角色拥有的权限节点勾选
    hasPerm (p, rolePerms) {
      let flag = false
      for (let i = 0; i < rolePerms.length; i++) {
        if (p.id === rolePerms[i].permissionId) {
          flag = true
          break
        }
      }
      if (flag) {
        return true
      }
      return false
    },
    renderContent (h, { root, node, data }) {
      let icon = ''
      if (data.level === 0) {
        icon = 'ios-navigate'
      } else if (data.level === 1) {
        icon = 'md-list-box'
      } else if (data.level === 2) {
        icon = 'md-list'
      } else if (data.level === 3) {
        icon = 'md-radio-button-on'
      } else {
        icon = 'md-radio-button-off'
      }
      return h(
        'span',
        {
          style: {
            display: 'inline-block',
            cursor: 'pointer'
          },
          on: {
            click: () => {
              data.checked = !data.checked
            }
          }
        },
        [
          h('span', [
            h('Icon', {
              props: {
                type: icon,
                size: '16'
              },
              style: {
                'margin-right': '8px',
                'margin-bottom': '3px'
              }
            }),
            h('span', { class: 'ivu-tree-title' }, data.title)
          ])
        ]
      )
    },
    cancelPermEdit () {
      this.modalPermissionVisible = false
    },
    cancelDepEdit () {
      this.modalDepartmentVisible = false
    },
    changeOpen (v) {
      if (v === '0') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = true
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = true
                })
              }
            })
          }
        })
      } else if (v === '1') {
        this.permData.forEach(e => {
          e.expand = false
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = false
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      } else if (v === '2') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = false
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      } else if (v === '3') {
        this.permData.forEach(e => {
          e.expand = true
          if (e.children && e.children.length > 0) {
            e.children.forEach(c => {
              c.expand = true
              if (c.children && c.children.length > 0) {
                c.children.forEach(function (b) {
                  b.expand = false
                })
              }
            })
          }
        })
      }
    },
    // 全选反选
    selectTreeAll () {
      this.selectAllFlag = !this.selectAllFlag
      let select = this.selectAllFlag
      this.selectedTreeAll(this.permData, select)
    },
    // 递归全选节点
    selectedTreeAll (permData, select) {
      let that = this
      permData.forEach(function (e) {
        e.checked = select
        if (e.children && e.children.length > 0) {
          that.selectedTreeAll(e.children, select)
        }
      })
    },
    expandCheckDep (v) {
      // 判断展开子节点
      this.checkDepTree(v.children, this.editDepartments)
    },
    // 判断子节点
    checkDepTree (depData, roleDepIds) {
      let that = this
      depData.forEach(function (p) {
        if (that.hasDepPerm(p, roleDepIds)) {
          p.checked = true
        } else {
          p.checked = false
        }
      })
    },
    // 判断角色拥有的权限节点勾选
    hasDepPerm (p, roleDepIds) {
      let flag = false
      for (let i = 0; i < roleDepIds.length; i++) {
        if (p.content.id === roleDepIds[i].departmentId) {
          flag = true
          break
        }
      }
      if (flag) {
        return true
      }
      return false
    },
    edit (v) {
      this.modalType = 1
      this.modalTitle = '编辑角色'
      this.$refs.modelForm.resetFields()
      // 转换null为''
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let roleInfo = JSON.parse(str)
      this.modelForm = roleInfo
      this.modelModalVisible = true
    },
    cancelRole () {
      this.modelModalVisible = false
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
    },
    changeSort (e) {
      this.searchForm.sort = e.key
      this.searchForm.order = e.order
      if (e.order === 'normal') {
        this.searchForm.order = ''
      }
      this.getModels()
    },
    changeSelect (e) {
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
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  }
}
</script>

<style>
</style>

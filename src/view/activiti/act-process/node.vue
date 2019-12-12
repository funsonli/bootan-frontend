<!--<style lang="less">
@import "./index.less";
</style>-->
<template>
  <div>
    <!-- <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">添加子节点</Button>
      <Button @click="addModalRoot" icon="md-add">添加一级节点</Button>
      <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
      <Button @click="changeOperationDropdown('expandAll')" icon="md-list">展开所有</Button>
      <Dropdown @on-click="changeOperationDropdown">
        <Button>
          更多操作
          <Icon type="md-arrow-dropdown"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem name="refresh">刷新</DropdownItem>
          <DropdownItem name="expandOne">收合所有</DropdownItem>
          <DropdownItem name="expandTwo">仅展开一级</DropdownItem>
          <DropdownItem name="expandThree">仅展开两级</DropdownItem>
          <DropdownItem name="expandAll">展开所有</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <i-switch v-model="strictly" size="large" style="margin-left:5px">
        <span slot="open">级联</span>
        <span slot="close">单选</span>
      </i-switch>
    </Row> -->
    <Row type="flex" justify="start" class="code-row-bg">
      <Col span="6">
        <Alert show-icon>
          当前选择编辑：<span> {{selectTitle}} </span>
          <a class="select-clear" v-if="modelForm.id" @click="handleSelectNone"> 取消选择</a>
        </Alert>
        <!-- <Input
          v-model="searchKey"
          suffix="ios-search"
          @on-change="handleSearch"
          placeholder="输入名称搜索"
          clearable
        /> -->
        <div class="tree-bar" :style="{maxHeight: maxHeight}">
          <Tree
            ref="tree"
            :data="data"
            :render="renderContent"
            @on-check-change="changeCheck"
            :check-strictly="!strictly"
          ></Tree>
        </div>
        <Spin size="large" fix v-if="loading"></Spin>
      </Col>
      <Col span="9">
        <Form ref="modelForm" :model="modelForm" :label-width="85" :rules="modelFormValidate">
          <!-- <FormItem label="上级节点" prop="parentName">
            <Poptip trigger="click" placement="right-start" title="选择上级节点" width="250">
              <Input v-model="modelForm.parentName" readonly style="width: 300px;" />
              <div slot="content" style="position:relative;min-height:5vh">
                <Tree :data="dataEdit" @on-select-change="changeSelectParent"></Tree>
                <Spin size="large" fix v-if="loadingEdit"></Spin>
              </div>
            </Poptip>
          </FormItem> -->
          <FormItem label="名称" prop="title">
            {{modelForm.title}}
          </FormItem>
          <FormItem label="类型" prop="type">
            <Select v-model="modelForm.type" disabled placeholder="请选择">
              <Option
                v-for="(item) in typeList"
                :key="item.value"
                :value="item.value"
              >{{item.label}}</Option>
            </Select>
          </FormItem>
          <div v-show="modelForm.type == 2">
            <FormItem label="可审批人员">
              <Checkbox v-model="chooseRole" label="0" @on-change="clickRole">
                <Icon type="md-people" size="14" style="margin:0 2px 2px 0"></Icon>
                <span>根据角色选择</span>
              </Checkbox>
              <Checkbox v-model="chooseDepartment" label="1" @on-change="clickDepartment">
                <Icon type="ios-people" style="margin:0 2px 2px 0"></Icon>
                <span>部门负责人</span>
              </Checkbox>
              <Checkbox v-model="chooseUser" label="1" @on-change="clickUser">
                <Icon type="md-person" style="margin:0 2px 2px 0"></Icon>
                <span>直接选择人员</span>
              </Checkbox>
            </FormItem>
            <FormItem label="选择角色" v-if="chooseRole">
              <Select v-model="modelForm.roleIds" multiple>
                <Option
                  v-for="item in roleList"
                  :value="item.id"
                  :key="item.id"
                  :label="item.name"
                >
                  <span style="margin-right:10px;">{{ item.name }}</span>
                  <span style="color:#ccc;">{{ item.description }}</span>
                </Option>
              </Select>
            </FormItem>
            <div v-show="chooseDepartment">
              <FormItem label="选择部门">
                <department-tree-choose
                  multiple
                  width="250px"
                  @on-change="handleSelectDepTree"
                  ref="depTree"
                ></department-tree-choose>
              </FormItem>
            </div>
            <div v-show="chooseUser">
              <FormItem label="选择用户">
                <user-choose @on-change="handleSelectUser" ref="user"></user-choose>
              </FormItem>
            </div>
          </div>
          <Form-item>
            <Button
              @click="editModel"
              :loading="loadingSubmit"
              type="primary"
              icon="ios-create-outline"
              :disabled="modelForm.type!=2"
            >修改并保存</Button>
          </Form-item>
        </Form>
      </Col>
    </Row>

    <!-- <Modal draggable :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="520" :styles="{top: '30px'}"  @keydown.native.enter.prevent="saveModel" >
      <Form ref="modelFormAdd" :model="modelFormAdd" :label-width="88" :rules="modelFormValidate">
        <FormItem label="上级名称" v-if="showParent">
          {{modelForm.name}}
        </FormItem>
        <FormItem label="名称" prop="name">
          <Input v-model="modelFormAdd.name" placeholder="请输入名称"/>
        </FormItem>
        <Form-item label="关联其他表id" prop="relateId">
          <Input  v-model="modelFormAdd.relateId" placeholder="请输入关联其他表id"/>
        </Form-item>
        <Form-item label="Activiti节点ID" prop="nodeId">
          <Input  v-model="modelFormAdd.nodeId" placeholder="请输入Activiti节点ID"/>
        </Form-item>
        <FormItem label="类型" prop="type">
          <Select v-model="modelFormAdd.type" placeholder="请选择">
            <Option
              v-for="(item) in typeList"
              :key="item.value"
              :value="item.value"
            >{{item.label}}</Option>
          </Select>
        </FormItem>
        <FormItem label="排序" prop="sortOrder">
          <Input type="number" v-model="modelFormAdd.sortOrder" placeholder="值越小越靠前"/>
        </FormItem>
        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="modelFormAdd.status" :true-value="1" :false-value="0">
            <span v-for="(item) in statusList" :key="item.value" :value="item.value" :slot="item.slot">{{item.label}}</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelModal">取消</Button>
        <Button type="primary" :loading="loadingSubmit" @click="saveModel">提交</Button>
      </div>
    </Modal> -->
  </div>
</template>

<script>
import {
  apiActProcessViewNode,
  apiActProcessUpdateNode,
  apiRoleListAll,
  apiActNodeCreate,
  // apiActNodeUpdate,
  apiActNodeDelete,
  apiActNodeSearch
} from '@/api/index'
import departmentTreeChoose from '@/view/components/department-tree-choose/department-tree-choose'
import userChoose from '@/view/components/user-choose/user-choose'

export default {
  name: 'process-node-edit',
  components: {
    departmentTreeChoose,
    userChoose
  },
  data () {
    return {
      processId: '',
      processName: '',
      backRoute: '',
      chooseUser: false,
      chooseRole: false,
      chooseDepartment: false,
      roleList: [],
      selectUsers: [],
      loading: true,
      loadingSubmit: false,
      loadingEdit: false,
      strictly: true,
      selectTitle: '',
      searchKey: '',
      modalTitle: '',
      modelModalVisible: false,
      maxHeight: '520px',
      showParent: false,
      expandLevel: 1,
      modelForm: {
        id: '',
        nodeId: '',
        title: '',
        type: 0,
        userIds: [],
        roleIds: [],
        departmentIds: []
      },
      modelFormValidate: {
        // name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        // relateId: [{ required: true, message: '关联其他表id不能为空', trigger: 'blur' }],
        // nodeId: [{ required: true, message: 'Activiti节点ID不能为空', trigger: 'blur' }],
        // sortOrder: [{ required: true, message: '排序值不能为空', trigger: 'blur', type: 'number' }]
      },
      selectCount: 0,
      selectList: [],
      data: [],
      modelFormAdd: {
        parentId: '0',
        name: '',
        relateId: '',
        nodeId: '',
        type: 1,
        sortOrder: 50,
        status: 1
      },
      dataEdit: [],
      childrenData: [],
      typeList: [
        {
          label: '开始节点',
          value: 1
        },
        {
          label: '审批节点',
          value: 2
        },
        {
          label: '结束节点',
          value: 9
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
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.backRoute = this.$route.query.backRoute
      this.processId = this.$route.query.id
      this.processName = this.$route.query.processName
      this.getModels(this.processId)
      this.getRoleList()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels (processId) {
      this.loading = true
      apiActProcessViewNode(processId).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          // 仅展开指定级数 默认后台已展开所有
          let expandLevel = this.expandLevel
          res.data.data.forEach(function (e) {
            if (expandLevel === 1) {
              if (e.level === 0) {
                e.expand = false
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level === 1) {
                    c.expand = false
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level === 2) {
                        b.expand = false
                      }
                    })
                  }
                })
              }
            } else if (expandLevel === 2) {
              if (e.level === 0) {
                e.expand = true
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level === 1) {
                    c.expand = false
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level === 2) {
                        b.expand = false
                      }
                    })
                  }
                })
              }
            } else if (expandLevel === 3) {
              if (e.level === 0) {
                e.expand = true
              }
              if (e.children && e.children.length > 0) {
                e.children.forEach(function (c) {
                  if (c.level === 1) {
                    c.expand = true
                  }
                  if (c.children && c.children.length > 0) {
                    c.children.forEach(function (b) {
                      if (b.level === 2) {
                        b.expand = false
                      }
                    })
                  }
                })
              }
            }
          })
          this.data = this.dataEdit = res.data.data
          this.dataEdit = JSON.parse(JSON.stringify(this.data))
          this.dataEdit.unshift({ id: '0', title: '改为[一级节点]' })
        } else {
          this.$Message.error(res.data.message)
        }
      })
    },
    getRoleList () {
      let that = this
      apiRoleListAll().then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          that.roleList = res.data.data
        }
      })
    },
    deleteBatch () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未勾选要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 条数据?',
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function (e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          apiActNodeDelete(ids).then(res => {
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除成功')
              // 标记重新获取数据
              // this.$store.commit('setAdded', false)
              // util.initRouter(this)
              this.selectList = []
              this.selectCount = 0
              this.handleSelectNone()
              this.init()
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    handleSearch () {
      if (this.searchKey) {
        this.loading = true
        let keyword = this.searchKey
        apiActNodeSearch(keyword).then(res => {
          this.loading = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.data = res.data.data.content
          }
        })
      } else {
        this.getModels()
      }
    },
    saveModel () {
      this.$refs.modelFormAdd.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          apiActNodeCreate(this.modelFormAdd).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              // 标记重新获取数据
              // this.$store.commit('setAdded', false)
              // util.initRouter(this)
              this.init()
              this.modelModalVisible = false
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    editModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          if (!this.modelForm.id) {
            this.$Message.warning('请先点击选择要修改的节点')
            return
          }
          this.modelForm.nodeId = this.modelForm.id
          let ids = []
          this.selectUsers.forEach(e => {
            ids += e.id + ','
          })
          if (ids.length > 0) {
            ids = ids.substring(0, ids.length - 1)
          }

          if (!this.chooseRole) {
            this.modelForm.roleIds = []
          }
          if (this.chooseUser) {
            this.modelForm.userIds = ids
          } else {
            this.modelForm.userIds = []
          }
          if (!this.chooseDepartment) {
            this.modelForm.departmentIds = []
          }
          this.loadingSubmit = true
          apiActProcessUpdateNode(this.modelForm).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.init()
              this.modelModalVisible = false
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    renderContent (h, { root, node, data }) {
      let color = ''
      let word = ''
      if (data.type === 1) {
        color = '#47cb89'
        word = '开'
      } else if (data.type === 2) {
        color = '#2db7f5'
        word = '审'
      } else if (data.type === 9) {
        word = '结'
      } else {
        color = '#f90'
        word = '其他'
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
              this.changeSelect(data)
            }
          }
        },
        [
          h('span', [
            h(
              'Avatar',
              {
                props: {
                  size: 'small'
                },
                style: {
                  background: color,
                  'margin-right': '5px'
                }
              },
              word
            ),
            h(
              'span',
              {
                class: {
                  'ivu-tree-title': true,
                  'ivu-tree-title-selected': data.id === this.modelForm.id
                }
              },
              data.title
            )
          ])
        ]
      )
    },
    clickRole (v) {
      this.chooseRole = v
    },
    clickUser (v) {
      this.chooseUser = v
    },
    clickDepartment (v) {
      this.chooseDepartment = v
    },
    handleSelectDepTree (v) {
      this.modelForm.departmentIds = v
    },
    handleSelectUser (v) {
      this.selectUsers = v
    },
    changeSelectParent (v) {
      if (v.length > 0) {
        // 转换null为''
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = ''
          }
        }
        let str = JSON.stringify(v[0])
        let data = JSON.parse(str)
        // 加载节点用户数据
        if (data.title === '改为[一级节点]') {
          this.modelForm.parentId = data.id
        } else {
          this.modelForm.parentId = data.id
        }
        this.modelForm.parentName = data.title
      }
    },
    addModal () {
      if (this.modelForm.id === '' || this.modelForm.id == null) {
        this.$Message.warning('请先点击选择一个节点')
        return
      }
      this.parentTitle = this.modelForm.title
      this.modalTitle = '添加子节点'
      this.showParent = true
      this.modelFormAdd = {
        parentId: this.modelForm.id,
        type: 1,
        sortOrder: 50,
        status: 1,
        showAlways: true
      }
      this.modelModalVisible = true
    },
    addModalRoot () {
      this.modalTitle = '添加一级节点'
      this.showParent = false
      this.modelFormAdd = {
        parentId: '0',
        type: 1,
        sortOrder: 50,
        status: 1
      }
      this.modelModalVisible = true
    },
    changeOperationDropdown (name) {
      if (name === 'expandOne') {
        this.expandLevel = 1
        this.getModels()
      } else if (name === 'expandTwo') {
        this.expandLevel = 2
        this.getModels()
      } else if (name === 'expandThree') {
        this.expandLevel = 3
        this.getModels()
      }
      if (name === 'expandAll') {
        this.expandLevel = 4
        this.getModels()
      } else if (name === 'refresh') {
        this.getModels()
      }
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无须修改） begin **** */
    changeSelect (v) {
      if (v && v.id !== this.modelForm.id) {
        // 转换null为''
        for (let attr in v) {
          if (v[attr] == null) {
            v[attr] = ''
          }
        }
        let str = JSON.stringify(v)
        let item = JSON.parse(str)
        this.modelForm = item
        this.selectTitle = item.title
        
        if (item.users && item.users.length > 0) {
          this.chooseUser = true
          this.$refs.user.setData(item.users)
        } else {
          this.chooseUser = false
          this.$refs.user.setData([])
        }

        if (item.departments && item.departments.length > 0) {
          this.chooseDepartment = true
          let departmentIds = []
          let titles = ''
          item.departments.forEach(e => {
            departmentIds.push(e.id)
            if (titles === '') {
              titles = e.name
            } else {
              titles = titles + '、' + e.name
            }
          })
          this.$refs.depTree.setData(departmentIds, titles)
          item.departmentIds = departmentIds
        } else {
          this.chooseDepartment = false;
          this.$refs.depTree.setData([], "");
        }

        // 角色
        if (item.roles && item.roles.length > 0) {
          this.chooseRole = true
          let roleIds = []
          item.roles.forEach (e => {
            roleIds.push(e.id)
          })
          item.roleIds = roleIds
        } else {
          this.chooseRole = false
          item.roleIds = []
        }
      }
    },
    changeCheck (v) {
      this.selectCount = v.length
      this.selectList = v
    },
    handleSelectNone () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      this.$refs.modelForm.resetFields()
      this.modelForm.id = ''
      delete this.modelForm.id
      this.selectTitle = ''
    },
    handleReset () {
      let type = this.modelForm.type
      this.$refs.modelForm.resetFields()
      this.modelForm.icon = ''
      this.modelForm.component = ''
      this.modelForm.type = type
    },
    cancelModal () {
      this.modelModalVisible = false
    }
    /* **** 页面内控件标准代码（一般无须修改） end **** */
  }
}
</script>

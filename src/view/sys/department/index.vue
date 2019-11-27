<!--<style lang="less">
@import "./index.less";
</style>-->
<template>
  <div>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">添加子部门</Button>
      <Button @click="addModalRoot" icon="md-add">添加一级部门</Button>
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
    </Row>
    <Row type="flex" justify="start" class="code-row-bg">
      <Col span="6">
        <Alert show-icon>
          当前选择编辑：<span> {{selectTitle}} </span>
          <a class="select-clear" v-if="modelForm.id" @click="handleSelectNone"> 取消选择</a>
        </Alert>
        <Input
          v-model="searchKey"
          suffix="ios-search"
          @on-change="handleSearch"
          placeholder="输入名称搜索"
          clearable
        />
        <div class="tree-bar" :style="{maxHeight: maxHeight}">
          <Tree
            ref="tree"
            :data="data"
            show-checkbox
            :render="renderContent"
            @on-check-change="changeCheck"
            :check-strictly="!strictly"
          ></Tree>
        </div>
        <Spin size="large" fix v-if="loading"></Spin>
      </Col>
      <Col span="9">
        <Form ref="modelForm" :model="modelForm" :label-width="85" :rules="modelFormValidate">
          <FormItem label="上级部门" prop="parentName">
            <Poptip trigger="click" placement="right-start" title="选择上级部门" width="250">
              <Input v-model="modelForm.parentName" readonly style="width: 300px;" />
              <div slot="content" style="position:relative;min-height:5vh">
                <Tree :data="dataEdit" @on-select-change="changeSelectParent"></Tree>
                <Spin size="large" fix v-if="loadingEdit"></Spin>
              </div>
            </Poptip>
          </FormItem>
          <FormItem label="部门名称" prop="name">
            <Input v-model="modelForm.name" />
          </FormItem>
          <FormItem label="部门负责人" prop="head">
            <Select
              :loading="loadingUser"
              placeholder="请选择"
              clearable
              not-found-text="该部门暂无用户数据"
              v-model="modelForm.head"
            >
              <Option v-for="item in users" :value="item.id" :key="item.id">{{ item.username }}</Option>
            </Select>
          </FormItem>
          <FormItem label="副负责人" prop="viceHead">
            <Select
              :loading="loadingUser"
              placeholder="请选择"
              clearable
              not-found-text="该部门暂无用户数据"
              v-model="modelForm.viceHead"
            >
              <Option v-for="item in users" :value="item.id" :key="item.id">{{ item.username }}</Option>
            </Select>
          </FormItem>
          <FormItem label="排序值" prop="sortOrder">
            <InputNumber :max="1000" :min="0" v-model="modelForm.sortOrder"></InputNumber>
            <span style="margin-left:5px">值越小越靠前</span>
          </FormItem>
          <FormItem label="是否启用" prop="status">
            <i-switch size="large" v-model="modelForm.status" :true-value="1" :false-value="0">
              <span v-for="(item) in statusList" :key="item.value" :value="item.value" :slot="item.slot">{{item.label}}</span>
            </i-switch>
          </FormItem>
          <Form-item>
            <Button
              @click="updateModel"
              :loading="loadingSubmit"
              type="primary"
              icon="ios-create-outline"
            >修改并保存</Button>
          </Form-item>
        </Form>
      </Col>
    </Row>

    <Modal draggable :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="520" :styles="{top: '30px'}"  @keydown.native.enter.prevent="saveModelNew" >
      <Form ref="modelFormAdd" :model="modelFormAdd" :label-width="88" :rules="modelFormValidate">
        <FormItem label="上级名称" v-if="showParent">
          {{modelForm.name}}
        </FormItem>
        <FormItem label="名称" prop="name">
          <Input v-model="modelFormAdd.name" placeholder="请输入名称"/>
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
    </Modal>
  </div>
</template>

<script>
import {
  apiDepartmentAll,
  apiUserDepartmentUser,
  apiDepartmentList,
  apiDepartmentCreate,
  apiDepartmentUpdate,
  apiDepartmentDelete,
  apiDepartmentSearch
} from '@/api/index'
import IconChoose from '@/view/components/icon-choose/icon-choose'
export default {
  name: 'permission-manage',
  components: {
    IconChoose
  },
  data () {
    return {
      loading: true,
      loadingSubmit: false,
      loadingUser: false,
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
        name: '',
        parentId: '',
        parentName: '',
        head: '',
        viceHead: '',
        sortOrder: 50,
        status: 1
      },
      modelFormValidate: {
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        sortOrder: [{ required: true, message: '排序值不能为空', trigger: 'blur', type: 'number' }]
      },
      selectCount: 0,
      selectList: [],
      data: [],
      modelFormAdd: {
        parentId: '0',
        name: '',
        sortOrder: 50,
        status: 1
      },
      dataEdit: [],
      childrenData: [],
      users: [],
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
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
      this.loading = true
      apiDepartmentAll().then(res => {
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
          this.dataEdit.unshift({ id: '0', title: '改为[一级部门]' })
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
          apiDepartmentDelete(ids).then(res => {
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除成功')
              // 标记重新获取数据
              // this.$store.commit('setAdded', false)
              // util.initRouter(this)
              this.selectList = []
              this.selectCount = 0
              this.handleSelectNone()
              this.init()
            }
          })
        }
      })
    },
    handleSearch () {
      if (this.searchKey) {
        this.loading = true
        let keyword = this.searchKey
        apiDepartmentSearch(keyword).then(res => {
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
          apiDepartmentCreate(this.modelFormAdd).then(res => {
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
    updateModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          if (!this.modelForm.id) {
            this.$Message.warning('请先点击选择要修改的部门节点')
            return
          }
          this.loadingSubmit = true
          if (this.modelForm.head == null) {
            this.modelForm.head = ''
          }
          if (this.modelForm.viceHead == null) {
            this.modelForm.viceHead = ''
          }
          apiDepartmentUpdate(this.modelForm).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('编辑成功')
              // 标记重新获取数据
              // this.$store.commit('setAdded', false)
              // util.initRouter(this)
              this.init()
              this.modelModalVisible = false
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    renderContent (h, { root, node, data }) {
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
        // 加载部门用户数据
        if (data.title === '改为[一级部门]') {
          this.modelForm.parentId = data.id
        } else {
          this.modelForm.parentId = data.id
        }
        this.modelForm.parentName = data.title
      }
    },
    addModal () {
      if (this.modelForm.id === '' || this.modelForm.id == null) {
        this.$Message.warning('请先点击选择一个部门节点')
        return
      }
      this.parentTitle = this.modelForm.title
      this.modalTitle = '添加子节点'
      this.showParent = true
      this.modelFormAdd = {
        parentId: this.modelForm.id,
        sortOrder: 50,
        status: 1,
        showAlways: true
      }
      this.modelModalVisible = true
    },
    addModalRoot () {
      this.modalTitle = '添加一级部门'
      this.showParent = false
      this.modelFormAdd = {
        parentId: '0',
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

        this.loadingUser = true
        apiUserDepartmentUser(v.id).then(res => {
          this.loadingUser = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.users = res.data.data
            // 回显
            this.modelForm = item
          }
        })
      } else {
        this.handleSelectNone()
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

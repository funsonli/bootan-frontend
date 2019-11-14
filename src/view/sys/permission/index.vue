<template>
  <div>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">添加子节点</Button>
      <Button @click="addModalRoot" icon="md-add">添加顶部菜单</Button>
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
        <Form ref="modelForm" :model="modelForm" :label-width="100" :rules="modelFormValidate">
          <FormItem label="类型" prop="level">
            <div v-show="modelForm.level==0">
              <Icon type="ios-navigate-outline" size="16" class="icon-item"></Icon>
              <span>顶部菜单</span>
            </div>
            <div v-show="modelForm.level==1||modelForm.level==2">
              <Icon type="ios-list-box-outline" size="16" class="icon-item"></Icon>
              <span>页面菜单</span>
            </div>
            <div v-show="modelForm.level==3">
              <Icon type="md-radio-button-on" size="16" class="icon-item"></Icon>
              <span>操作按钮</span>
            </div>
          </FormItem>
          <FormItem label="名称" prop="title" v-if="modelForm.level==0||modelForm.level==1||modelForm.level==2">
            <Input v-model="modelForm.title"/>
          </FormItem>
          <FormItem label="名称" prop="title" v-if="modelForm.level==3">
            <Tooltip placement="right" content="操作按钮名称不得重复">
              <Input v-model="modelForm.title" class="permission-form-input"/>
            </Tooltip>
          </FormItem>
          <FormItem label="路径" prop="path" v-if="modelForm.level==1||modelForm.level==2">
            <Input v-model="modelForm.path"/>
          </FormItem>
          <FormItem label="请求路径" prop="path" v-if="modelForm.level==3">
            <Tooltip
              placement="right"
              :max-width="230"
              transfer
              content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他"
            >
              <Input v-model="modelForm.path" class="permission-form-input"/>
            </Tooltip>
          </FormItem>
          <FormItem label="按钮权限类型" prop="buttonType" v-if="modelForm.level==3">
            <Select v-model="modelForm.buttonType" placeholder="请选择或输入搜索" filterable clearable>
              <Option
                v-for="(item, i) in PermissionTypeList"
                :key="i"
                :value="item.value"
              >{{item.name}}</Option>
            </Select>
          </FormItem>
          <FormItem label="英文名" prop="name" v-if="modelForm.level==0">
            <Tooltip placement="right" content="需唯一">
              <Input v-model="modelForm.name" class="permission-form-input" />
            </Tooltip>
          </FormItem>
          <FormItem label="路由英文名" prop="name" v-if="modelForm.level==1||modelForm.level==2">
            <Tooltip placement="right" content="需唯一">
              <Input v-model="modelForm.name" class="permission-form-input"/>
            </Tooltip>
          </FormItem>
          <FormItem label="图标" prop="icon" v-if="modelForm.level==0||modelForm.level==1||modelForm.level==2">
            <icon-choose v-model="modelForm.icon"></icon-choose>
          </FormItem>
          <FormItem label="前端组件" prop="component" v-if="modelForm.level==1||modelForm.level==2">
            <Input v-model="modelForm.component"/>
          </FormItem>
          <FormItem label="第三方网页链接" prop="redirectUrl" v-if="modelForm.level==1||modelForm.level==2">
            <Tooltip placement="right" content="前端组件需为 /sys/monitor/monitor 时生效">
              <Input v-model="modelForm.redirectUrl" placeholder="http://" class="permission-form-input" />
            </Tooltip>
          </FormItem>
          <FormItem label="排序值" prop="sortOrder">
            <InputNumber :max="1000" :min="0" v-model="modelForm.sortOrder" ></InputNumber>
            <span style="margin-left:5px">值越小越靠前</span>
          </FormItem>
          <FormItem label="始终显示" prop="showAlways" v-if="modelForm.level==2">
            <i-switch size="large" v-model="modelForm.showAlways">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </i-switch>
            <Tooltip
              content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
              placement="right"
              transfer
              max-width="280"
              style="display: inline-block !important;"
            >
              <Icon
                type="md-help-circle"
                size="20"
                color="#c5c5c5"
                style="margin-left:10px;cursor:pointer;"
              />
            </Tooltip>
          </FormItem>
          <FormItem label="是否启用" prop="status">
            <i-switch size="large" v-model="modelForm.status" :true-value="1" :false-value="0">
              <span slot="open">启用</span>
              <span slot="close">禁用</span>
            </i-switch>
          </FormItem>
          <Form-item>
            <Button
              style="margin-right:5px"
              @click="updateModel"
              :loading="loadingSubmit"
              type="primary"
              icon="ios-create-outline"
            >修改并保存</Button>
            <Button @click="handleReset">重置</Button>
          </Form-item>
        </Form>
      </Col>
    </Row>

    <Modal draggable :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="500" :styles="{top: '30px'}" >
      <Form ref="modelFormAdd" :model="modelFormAdd" :label-width="100" :rules="modelFormValidate">
        <div v-if="showParent">
          <FormItem label="上级节点：">{{parentTitle}}</FormItem>
        </div>
        <FormItem label="类型" prop="type">
          <div v-show="modelFormAdd.level==0">
            <Icon type="ios-navigate-outline" size="16" style="margin:0 5px 3px 0;"></Icon>
            <span>顶部菜单</span>
          </div>
          <div v-show="modelFormAdd.level==1||modelFormAdd.level==2">
            <Icon type="ios-list-box-outline" size="16" style="margin:0 5px 3px 0;"></Icon>
            <span>页面菜单</span>
          </div>
          <div v-show="modelFormAdd.level==3">
            <Icon type="md-radio-button-on" size="16" style="margin:0 5px 3px 0;"></Icon>
            <span>操作按钮</span>
          </div>
        </FormItem>
        <FormItem label="名称" prop="title" v-if="modelFormAdd.level==0||modelFormAdd.level==1||modelFormAdd.level==2">
          <Input v-model="modelFormAdd.title"/>
        </FormItem>
        <FormItem label="名称" prop="title" v-if="modelFormAdd.level==3">
          <Tooltip placement="right" content="操作按钮名称不得重复">
            <Input v-model="modelFormAdd.title" style="width:368px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="路径" prop="path" v-if="modelFormAdd.level==1||modelFormAdd.level==2">
          <Input v-model="modelFormAdd.path"/>
        </FormItem>
        <FormItem label="请求路径" prop="path" v-if="modelFormAdd.level==3">
          <Tooltip
            placement="right"
            :max-width="230"
            transfer
            content="填写后台请求URL，后台将作权限拦截，若无可填写'无'或其他"
          >
            <Input v-model="modelFormAdd.path" style="width:368px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="按钮权限类型" prop="buttonType" v-if="modelFormAdd.level==3">
          <Select v-model="modelFormAdd.buttonType" placeholder="请选择或输入搜索" filterable clearable>
            <Option v-for="(item, i) in PermissionTypeList" :key="i" :value="item.value">{{item.name}}</Option>
          </Select>
        </FormItem>
        <FormItem label="英文名" prop="name" v-if="modelFormAdd.level==0">
          <Tooltip placement="right" content="需唯一">
            <Input v-model="modelFormAdd.name"/>
          </Tooltip>
        </FormItem>
        <FormItem label="路由英文名" prop="name" v-if="modelFormAdd.level==1||modelFormAdd.level==2">
          <Tooltip placement="right" content="需唯一">
            <Input v-model="modelFormAdd.name" style="width:368px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="图标" prop="icon" v-if="modelFormAdd.level==0||modelFormAdd.level==1||modelFormAdd.level==2">
          <icon-choose v-model="modelFormAdd.icon"></icon-choose>
        </FormItem>
        <FormItem label="前端组件" prop="component" v-if="modelFormAdd.level==1||modelFormAdd.level==2">
          <Input v-model="modelFormAdd.component"/>
        </FormItem>
        <FormItem label="第三方网页链接" prop="redirectUrl" v-if="modelFormAdd.level==1||modelFormAdd.level==2">
          <Tooltip placement="right" content="前端组件需为 /sys/monitor/monitor 时生效">
            <Input v-model="modelFormAdd.redirectUrl" placeholder="http://" style="width:368px"/>
          </Tooltip>
        </FormItem>
        <FormItem label="排序值" prop="sortOrder">
          <InputNumber :max="1000" :min="0" v-model="modelFormAdd.sortOrder"></InputNumber>
          <span style="margin-left:5px">值越小越靠前</span>
        </FormItem>
        <FormItem label="始终显示" prop="showAlways" v-if="modelFormAdd.level==1">
          <i-switch size="large" v-model="modelFormAdd.showAlways">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
          <Tooltip
            content="当设为不始终显示时，一级菜单下仅有一个子级菜单只会显示该子级菜单，避免用户多次点击"
            placement="right"
            transfer
            max-width="280"
            style="display: inline-block !important;"
          >
            <Icon
              type="md-help-circle"
              size="20"
              color="#c5c5c5"
              style="margin-left:10px;cursor:pointer;"
            />
          </Tooltip>
        </FormItem>
        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="modelFormAdd.status" :true-value="1" :false-value="-1">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
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
  apiPermissionAll,
  apiDictDataViewName,
  apiPermissionSave,
  apiPermissionDelete,
  apiPermissionSearch
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
        title: '',
        name: '',
        icon: '',
        path: '',
        component: '',
        parentId: '',
        buttonType: '',
        type: 0,
        sortOrder: 50,
        level: 1,
        status: 1,
        redirectUrl: '',
        showAlways: true
      },
      modelFormValidate: {
        title: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        name: [
          { required: true, message: '路由英文名不能为空', trigger: 'blur' }
        ],
        icon: [{ required: true, message: '图标不能为空', trigger: 'click' }],
        path: [{ required: true, message: '路径不能为空', trigger: 'blur' }],
        component: [
          { required: true, message: '前端组件不能为空', trigger: 'blur' }
        ],
        sortOrder: [{ required: true, message: '排序值不能为空', trigger: 'blur', type: 'number' }]
      },
      selectCount: 0,
      selectList: [],
      data: [],
      modelFormAdd: {
        buttonType: ''
      },
      PermissionTypeList: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.getModels()
      this.getPermissionType()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
      this.loading = true
      apiPermissionAll().then(res => {
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
          this.data = res.data.data
        }
      })
    },
    getPermissionType () {
      apiDictDataViewName('permission_button_type').then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.PermissionTypeList = res.data.data
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
          apiPermissionDelete(ids).then(res => {
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除成功')
              // 标记重新获取菜单数据
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
        apiPermissionSearch(keyword).then(res => {
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
          if (this.modelFormAdd.level === 3) {
            this.modelFormAdd.name = ''
            this.modelFormAdd.icon = ''
            this.modelFormAdd.component = ''
          }
          apiPermissionSave(this.modelFormAdd).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('添加成功')
              // 标记重新获取菜单数据
              // this.$store.commit('setAdded', false)
              // util.initRouter(this)
              this.init()
              this.modelModalVisible = false
            }
          })
        }
      })
    },
    updateModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          if (!this.modelForm.id) {
            this.$Message.warning('请先点击选择要修改的菜单节点')
            return
          }
          this.loadingSubmit = true
          if (this.modelForm.sortOrder == null) {
            this.modelForm.sortOrder = ''
          }
          if (this.modelForm.buttonType == null) {
            this.modelForm.buttonType = ''
          }
          if (this.modelForm.level === 3) {
            this.modelForm.name = ''
            this.modelForm.icon = ''
            this.modelForm.component = ''
          }
          apiPermissionSave(this.modelForm).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('编辑成功')
              // 标记重新获取菜单数据
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
              this.changeSelect(data)
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
    addModal () {
      if (this.modelForm.id === '' || this.modelForm.id == null) {
        this.$Message.warning('请先点击选择一个菜单权限节点')
        return
      }
      this.parentTitle = this.modelForm.title
      this.modalTitle = '添加子节点'
      this.showParent = true
      let type = 0
      if (this.modelForm.level === 1) {
        type = 0
      } else if (this.modelForm.level === 2) {
        type = 1
      } else if (this.modelForm.level === 3) {
        this.$Modal.warning({
          title: '抱歉，不能添加啦',
          content: '仅支持2级菜单目录'
        })
        return
      } else {
        type = 0
      }
      this.modelFormAdd = {
        icon: '',
        type: type,
        parentId: this.modelForm.id,
        level: Number(this.modelForm.level) + 1,
        sortOrder: 50,
        buttonType: '',
        status: 1,
        showAlways: true
      }
      if (this.modelForm.level === 0) {
        this.modelFormAdd.path = '/'
        this.modelFormAdd.component = 'Main'
      }
      this.modelModalVisible = true
    },
    addModalRoot () {
      this.modalTitle = '添加顶部菜单'
      this.showParent = false
      this.modelFormAdd = {
        parentId: '0',
        type: 1,
        level: 0,
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
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  }
}
</script>

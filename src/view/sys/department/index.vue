<!--<style lang="less">
@import "./index.less";
</style>-->
<template>
  <div>
    <Row class="table-operation-con">
      <Button @click="addModal" type="primary" icon="md-add">添加子部门</Button>
      <Button @click="addModalRoot" icon="md-add">添加一级部门</Button>
      <Button @click="deleteBatch" icon="md-trash">批量删除</Button>
      <Button @click="init" icon="md-refresh">刷新</Button>
      <i-switch v-model="strictly" size="large" style="margin-left:8px">
        <span slot="open">级联</span>
        <span slot="close">单选</span>
      </i-switch>
    </Row>

    <Row type="flex" justify="start">
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
            :load-data="loadData"
            show-checkbox
            @on-check-change="changeCheck"
            @on-select-change="changeSelect"
            :check-strictly="!strictly"
          ></Tree>
        </div>
        <Spin size="large" fix v-if="loading"></Spin>
      </Col>
      <Col span="9" class="right-form">
        <Form ref="modelForm" :model="modelForm" :label-width="85" :rules="modelFormValidate">
          <FormItem label="上级部门" prop="parentName">
            <Poptip trigger="click" placement="right-start" title="选择上级部门" width="250">
              <Input v-model="modelForm.parentName" readonly style="width: 300px;" />
              <div slot="content" style="position:relative;min-height:5vh">
                <Tree :data="dataEdit" :load-data="loadData" @on-select-change="changeSelectParent"></Tree>
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
              not-found-text="该部门暂无用户数据"
              v-model="modelForm.head"
            >
              <Option v-for="item in users" :value="item.id" :key="item.id">{{ item.username }}</Option>
            </Select>
          </FormItem>
          <FormItem label="副负责人" prop="viceHead">
            <Select
              :loading="loadingUser"
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

    <Modal :title="modalTitle" v-model="modelModalVisible" :mask-closable="false" :width="520" @keydown.native.enter.prevent="saveModelNew">
      <Form ref="modelFormNew" :model="modelFormNew" :label-width="80" :rules="modelFormValidate">
        <FormItem label="上级名称" v-if="showParent">
          {{modelForm.name}}
        </FormItem>
        <FormItem label="名称" prop="name">
          <Input v-model="modelFormNew.name" placeholder="请输入名称"/>
        </FormItem>
        <FormItem label="排序" prop="sortOrder">
          <Input type="number" v-model="modelFormNew.sortOrder" placeholder="值越小越靠前"/>
        </FormItem>
        <FormItem label="是否启用" prop="status">
          <i-switch size="large" v-model="modelFormNew.status" :true-value="1" :false-value="0">
            <span v-for="(item) in statusList" :key="item.value" :value="item.value" :slot="item.slot">{{item.label}}</span>
          </i-switch>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="cancelModal">取消</Button>
        <Button type="primary" :loading="loadingSubmit" @click="saveModelNew">提交</Button>
      </div>
    </Modal>

  </div>
</template>
<script>
import {
  apiUserDepartmentUser,
  apiDepartmentList,
  apiDepartmentSave,
  apiDepartmentDelete,
  apiDepartmentSearch
} from '@/api/index'

export default {
  name: 'model-manage',
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
      modelFormNew: {
        parentId: '0',
        name: '',
        type: 1,
        sortOrder: 50,
        status: 1
      },
      modelForm: {
        id: '',
        name: '',
        parentId: '',
        parentName: '',
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
  created () {
  },
  mounted () {
    this.importHeight = Number(document.documentElement.clientHeight - 230)
    this.init()
  },
  methods: {
    init () {
      this.data = []
      this.dataEdit = []
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
      this.loading = true
      let dataChildren = []
      apiDepartmentList('0').then(res => {
        this.loading = false
        this.data = []
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          let data = res.data.data.content
          data.forEach(item => {
            let title = {
              title: item.name,
              content: item
            }
            if (dataChildren.length < res.data.data.content.length) {
              dataChildren.push(title)
            }
          })
          dataChildren.forEach(item => {
            if (item.content.isParent) {
              item.loading = false
              item.children = []
            }
            this.data.push(JSON.parse(JSON.stringify(item)))
            this.dataEdit.push(JSON.parse(JSON.stringify(item)))
          })
        }
      })
      this.dataEdit.unshift({ id: '0', title: '改为[一级部门]' })
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
    saveModelNew () {
      this.$refs.modelFormNew.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          if (this.modalType === 0) {
            this.modelFormNew.parentId = this.modelForm.id
          }
          apiDepartmentSave(this.modelFormNew).then(res => {
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
    saveModel () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = this.loadingEdit = true
          apiDepartmentSave(this.modelForm).then(res => {
            this.loadingSubmit = this.loadingEdit = false
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
    updateModel () {
      this.loadingEdit = true
      if (!this.modelForm.id) {
        this.$Message.warning('请先点击选择要修改的部门')
        return
      }
      this.saveModel()
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
            ids += e.content.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          apiDepartmentDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.handleSelectNone()
              this.init()
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
      if (this.searchKey) {
        this.loading = true
        let keyword = this.searchKey
        apiDepartmentSearch(keyword).then(res => {
          this.loading = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            let searchData = res.data.data.content
            this.data = []
            searchData.forEach(item => {
              let title = {
                title: item.name,
                content: item
              }
              this.data.push(title)
            })
          }
        })
      } else {
        this.init()
      }
    },
    changeCheck (v) {
      this.selectCount = v.length
      this.selectList = v
    },
    changeSelect (v) {
      if (v.length > 0) {
        for (let attr in v[0]) {
          if (v[0][attr] == null) {
            v[0][attr] = ''
          }
        }
        let str = JSON.stringify(v[0])
        let data = JSON.parse(str)
        this.selectTitle = data.title

        this.loadingUser = true
        apiUserDepartmentUser(data.content.id).then(res => {
          this.loadingUser = false
          if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
            this.users = res.data.data
            // 回显
            this.modelForm = data.content
          }
        })
      }
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
          this.modelForm.parentId = data.content.id
        }
        this.modelForm.parentName = data.title
      }
    },
    addModal () {
      if (this.modelForm.id === '' || this.modelForm.id == null) {
        this.$Message.warning('请先点击选择一个部门')
        return
      }
      this.modalType = 0
      this.modalTitle = '添加子部门'
      this.$refs.modelFormNew.resetFields()
      delete this.modelFormNew.id
      this.showParent = true
      this.modelModalVisible = true
    },
    addModalRoot () {
      this.modalType = 1
      this.modalTitle = '添加一级部门'
      this.$refs.modelFormNew.resetFields()
      this.$refs.modelForm.resetFields()
      delete this.modelFormNew.id
      this.showParent = false
      this.modelModalVisible = true
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无须修改） begin **** */
    handleSelectNone () {
      let data = this.$refs.tree.getSelectedNodes()[0]
      if (data) {
        data.selected = false
      }
      this.selectTitle = ''
      this.$refs.modelForm.resetFields()
      delete this.modelForm.id
    },
    cancelModal () {
      this.modelModalVisible = false
    }
    /* **** 页面内控件标准代码（一般无须修改） end **** */

  }
}
</script>

<template>
  <div>
    <Card>
      <p slot="title">
        <span v-if="type==0">发送新消息</span>
        <span v-else>编辑消息</span>
      </p>
      <Row>
        <Form
          ref="modelForm"
          :model="modelForm"
          :label-width="70"
          :rules="modelFormValidate"
          style="position:relative"
        >
          <FormItem label="消息类型" prop="type">
            <Select v-model="modelForm.type" placeholder="请选择" style="width:250px">
              <Option
                v-for="(item, i) in messageType"
                :key="i"
                :value="item.value"
              >{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem label="标题" prop="name">
            <Input v-model="modelForm.name" style="width:600px"/>
          </FormItem>
          <FormItem label="内容" prop="content">
            <editor v-model="modelForm.content" ref="editor"></editor>
          </FormItem>
          <FormItem label="新创建账号也推送" prop="newAutoSend">
            <i-switch size="large" v-model="modelForm.newAutoSend"  :true-value="1" :false-value="0">
              <span v-for="item in newAutoSendList" :key="item.value" :value="item.value" :slot="item.slot">{{item.label}}</span>
            </i-switch>
          </FormItem>
          <div v-if="type==0">
            <FormItem label="发送范围">
              <RadioGroup v-model="modelForm.range">
                <Radio :label="0">全体用户</Radio>
                <Radio :label="1">指定用户成员</Radio>
              </RadioGroup>
            </FormItem>
            <div>
              <FormItem label="选择用户" v-if="modelForm.range==1">
                <user-choose text="选择发送用户" @on-change="handleSelectUser" ref="user"></user-choose>
              </FormItem>
              </FormItem>
            </div>
          </div>
          <Form-item class="br">
            <Button
              type="primary"
              :loading="loadingSubmit"
              @click="handelSubmit"
              style="width:100px"
            >提交</Button>
            <Button @click="handelCancel">取消</Button>
          </Form-item>
          <Spin size="large" fix v-if="loading"></Spin>
        </Form>
      </Row>
    </Card>
  </div>
</template>

<script>
import {
  apiMessageSave,
  apiMessageView
} from '@/api/index'
import editor from '@/view/components/editor/editor'
import userChoose from '@/view/components/user-choose/user-choose'
export default {
  name: 'add_edit_message',
  components: {
    editor,
    userChoose
  },
  data () {
    return {
      type: 0,
      loading: false, // 表单加载状态
      selectUsers: [],
      modalTitle: '', // 添加或编辑标题
      modelForm: {
        // 添加或编辑表单对象初始化数据
        name: '',
        content: '',
        type: 1,
        range: 0,
        newAutoSend: 0,
        userIds: []
      },
      modelFormValidate: {
        // 表单验证规则
        name: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
        content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
      },
      loadingSubmit: false, // 添加或编辑提交状态
      messageType: [
        {
          label: '系统公告',
          value: 1
        },
        {
          label: '提醒',
          value: 2
        },
        {
          label: '私信',
          value: 3
        },
        {
          label: '工作流',
          value: 4
        }
      ],
      newAutoSendList: [
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
      ],
      backRoute: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.type = this.$route.query.type
      this.backRoute = this.$route.query.backRoute
      if (this.type === 1) {
        this.modelForm.id = this.$route.query.id
        this.getModel()
      }
    },

    /* **** 和后台交互代码区块 begin **** */
    getModel () {
      this.loading = true
      apiMessageView(this.modelForm.id).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          // 转换null为''
          let v = res.data.data
          for (let attr in v) {
            if (v[attr] == null) {
              v[attr] = ''
            }
          }
          let str = JSON.stringify(v)
          let data = JSON.parse(str)
          this.modelForm = data
          this.$refs.editor.setData(data.content)
        }
      })
    },
    handelSubmit () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.loadingSubmit = true
          if (this.type === 0) {
            // 添加 避免编辑后传入id等数据 记得删除
            delete this.modelForm.id
            let ids = []
            this.selectUsers.forEach(e => {
              ids += e.id + ','
            })
            if (ids.length > 0) {
              ids = ids.substring(0, ids.length - 1)
            }
            this.modelForm.userIds = ids
          }
          apiMessageSave(this.modelForm).then(res => {
            this.loadingSubmit = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('操作成功')
              this.closeCurrentPage()
            }
          })
        }
      })
    },

    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */

    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */

    handleSelectUser (v) {
      this.selectUsers = v
    },
    handelCancel () {
      this.closeCurrentPage()
    },
    // 关闭当前页面
    closeCurrentPage () {
      this.$store.commit('removeTag', 'add-edit-message_page')
      localStorage.pageOpenedList = JSON.stringify(
        this.$store.state.app.pageOpenedList
      )
      this.$router.push({
        name: this.backRoute
      })
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  },
  watch: {
    // 监听路由变化
    $route (to, from) {
      if (to.name === 'add-edit-message_page') {
        this.type = this.$route.query.type
        if (this.type === 1) {
          this.modelForm.id = this.$route.query.id
          this.getModel()
        }
      }
    }
  }
}
</script>

<style>
</style>

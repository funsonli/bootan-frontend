<template>
  <Card shadow>
    <div>
      <div class="message-page-con message-category-con">
        <Menu width="auto" active-name="unread" @on-select="handleSelect">
          <MenuItem name="unread">
            <span class="category-title">未读消息</span><Badge style="margin-left: 10px" :count="messageUnreadCount"></Badge>
          </MenuItem>
          <MenuItem name="readed">
            <span class="category-title">已读消息</span><Badge style="margin-left: 10px" class-name="gray-dadge" :count="messageReadedCount"></Badge>
          </MenuItem>
          <MenuItem name="trash">
            <span class="category-title">回收站</span><Badge style="margin-left: 10px" class-name="gray-dadge" :count="messageTrashCount"></Badge>
          </MenuItem>
        </Menu>
      </div>
      <div class="message-page-con message-list-con">
        <div v-if="showMessageList">
          <Table ref="messageList" :loading="loading" :columns="mesTitleColumns" :data="currentMesList" :no-data-text="noDataText"></Table>
          <Page :current="searchForm.pageNumber" :total="total" :page-size="searchForm.pageSize" @on-change="changePage" @on-page-size-change="changePageSize" :page-size-opts="[5,10]" size="small" show-total show-elevator show-sizer class="page-fix"></Page>
        </div>
        <div v-if="!showMessageList" class="message-view-content-con">
            <div class="message-content-top-bar">
                <span class="mes-back-btn-con"><Button type="text" @click="backMessageList"><Icon type="ios-arrow-back" style="margin-bottom:2px"></Icon>&nbsp;&nbsp;返回</Button></span>
                <h3 class="mes-title">{{ messageForm.title }}</h3>
            </div>
            <p class="mes-time-con">
                <Icon type="android-time"></Icon>&nbsp;&nbsp;{{ messageForm.time }}</p>
            <div class="message-content-body">
                <p class="message-content" v-html="messageForm.content">{{ messageForm.content }}</p>
            </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import {
  apiMessageStateListIndex,
  apiMessageStateDelete,
  apiMessageStateSave
} from '@/api/index'
export default {
  name: 'message_page',
  data () {
    const markReadedBtn = (h, params) => {
      return h(
        'Button',
        {
          props: {
            icon: 'md-eye-off',
            size: 'small'
          },
          on: {
            click: () => {
              // 标记已读
              let v = params.row
              // 转换null为''
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = ''
                }
              }
              let str = JSON.stringify(v)
              let data = JSON.parse(str)
              data.status = 2
              this.loading = true
              apiMessageStateSave(data).then(res => {
                this.loading = false
                if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                  this.$Message.success(res.data.message)
                  this.messageUnreadCount -= 1
                  this.messageReadedCount += 1
                  this.$store.commit('setMessageCount', this.messageUnreadCount)
                  this.refreshMessage()
                } else {
                  this.$Message.error(res.data.message)
                }
              })
            }
          }
        },
        '标为已读'
      )
    }
    const markUnreadBtn = (h, params) => {
      return h(
        'Button',
        {
          props: {
            icon: 'md-eye',
            size: 'small'
          },
          style: {
            margin: '0 5px 0 0'
          },
          on: {
            click: () => {
              // 标记已读
              let v = params.row
              // 转换null为''
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = ''
                }
              }
              let str = JSON.stringify(v)
              let data = JSON.parse(str)
              data.status = 1
              this.loading = true
              apiMessageStateSave(data).then(res => {
                this.loading = false
                if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                  this.$Message.success(res.data.message)
                  this.messageUnreadCount += 1
                  this.messageReadedCount -= 1
                  this.$store.commit('setMessageCount', this.messageUnreadCount)
                  this.refreshMessage()
                } else {
                  this.$Message.error(res.data.message)
                }
              })
            }
          }
        },
        '标为未读'
      )
    }
    const deleteMesBtn = (h, params) => {
      return h(
        'Button',
        {
          props: {
            icon: 'md-trash',
            size: 'small',
            type: 'error'
          },
          on: {
            click: () => {
              // 移除
              let v = params.row
              // 转换null为''
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = ''
                }
              }
              let str = JSON.stringify(v)
              let data = JSON.parse(str)
              data.status = 0
              this.loading = true
              apiMessageStateSave(data).then(res => {
                this.loading = false
                if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                  this.$Message.success(res.data.message)
                  this.messageReadedCount -= 1
                  this.messageTrashCount += 1
                  this.refreshMessage()
                } else {
                  this.$Message.error(res.data.message)
                }
              })
            }
          }
        },
        '删除'
      )
    }
    const restoreBtn = (h, params) => {
      return h(
        'Button',
        {
          props: {
            icon: 'md-redo',
            size: 'small'
          },
          style: {
            margin: '0 5px 0 0'
          },
          on: {
            click: () => {
              // 还原
              let v = params.row
              // 转换null为''
              for (let attr in v) {
                if (v[attr] == null) {
                  v[attr] = ''
                }
              }
              let str = JSON.stringify(v)
              let data = JSON.parse(str)
              data.status = 2
              this.loading = true
              apiMessageStateSave(data).then(res => {
                this.loading = false
                if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                  this.$Message.success('操作成功')
                  this.messageReadedCount += 1
                  this.messageTrashCount -= 1
                  this.refreshMessage()
                }
              })
            }
          }
        },
        '还原'
      )
    }
    const deleteRealBtn = (h, params) => {
      return h(
        'Button',
        {
          props: {
            icon: 'md-trash',
            size: 'small',
            type: 'error'
          },
          on: {
            click: () => {
              // 彻底删除
              let v = params.row
              this.loading = true
              apiMessageStateDelete(v.id).then(res => {
                this.loading = false
                if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
                  this.$Message.success('操作成功')
                  this.messageTrashCount -= 1
                  this.refreshMessage()
                }
              })
            }
          }
        },
        '彻底删除'
      )
    }
    return {
      loading: true,
      currentMessageType: 'unread',
      mesTitleColumns: [
        {
          type: 'index',
          width: 50,
          align: 'center'
        },
        {
          title: ' ',
          key: 'name',
          align: 'left',
          ellipsis: true,
          render: (h, params) => {
            let re = ''
            this.messageType.forEach((item) => {
              if (item.value === params.row.type) {
                re = item.label
              }
            })
            return h('span', [
              h(
                'a',
                {
                  style: {
                    margin: '0 30px 0 0'
                  },
                  on: {
                    click: () => {
                      this.showMessageList = false
                      this.messageForm.title = params.row.name
                      this.messageForm.time = params.row.createdAt
                      this.showMessageContent(params.row)
                    }
                  }
                },
                '【' + re + '】 ' + params.row.name
              )
            ])
          }
        },
        {
          title: ' ',
          key: 'time',
          align: 'center',
          width: 180,
          render: (h, params) => {
            return h('span', [
              h('Icon', {
                props: {
                  type: 'md-time',
                  size: 12
                },
                style: {
                  margin: '0 5px 3px 0'
                }
              }),
              h('span', params.row.createdAt)
            ])
          }
        },
        {
          title: ' ',
          key: 'asread',
          align: 'center',
          width: 190,
          render: (h, params) => {
            if (this.currentMessageType === 'unread') {
              return h('div', [markReadedBtn(h, params)])
            } else if (this.currentMessageType === 'readed') {
              return h('div', [markUnreadBtn(h, params), deleteMesBtn(h, params)])
            } else {
              return h('div', [restoreBtn(h, params), deleteRealBtn(h, params)])
            }
          }
        }
      ],
      noDataText: '暂无未读消息',
      searchForm: {
        pageNumber: 1, // 当前页数
        pageSize: 10,
        status: 1
      },
      messageForm: {
        title: '',
        time: '',
        content: ''
      },
      showMessageList: true,
      messageUnreadCount: 0,
      messageReadedCount: 0,
      messageTrashCount: 0,
      currentMesList: [],
      total: 0,
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
      ]
    }
  },
  mounted () {
    // 请求获取消息列表
    this.initUnreadMessage()
  },
  methods: {
    initUnreadMessage () {
      this.loading = true
      this.searchForm.status = 1
      apiMessageStateListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.messageUnreadCount = res.data.data.content.length
          this.currentMesList = res.data.data.content
          this.total = res.data.data.totalElements
          this.initReadedMessage()
        }
      })
    },
    initReadedMessage () {
      this.searchForm.status = 2
      apiMessageStateListIndex(this.searchForm).then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.messageReadedCount = res.data.data.content.length
          this.initTrashMessage()
        }
      })
    },
    initTrashMessage () {
      this.searchForm.status = 0
      apiMessageStateListIndex(this.searchForm).then(res => {
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.messageTrashCount = res.data.data.content.length
        }
      })
    },
    refreshMessage () {
      let status = 0
      let type = this.currentMessageType
      if (type === 'unread') {
        status = 1
      } else if (type === 'readed') {
        status = 2
      } else {
        status = 0
      }
      this.loading = true
      this.searchForm.status = status
      apiMessageStateListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.currentMesList = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    handleSelect (name) {
      if (this.currentMessageType !== name) {
        this.showMessageList = true
      }
      this.currentMessageType = name
      if (name === 'unread') {
        this.noDataText = '暂无未读消息'
      } else if (name === 'readed') {
        this.noDataText = '暂无已读消息'
      } else {
        this.noDataText = '回收站无消息'
      }
      this.searchForm.pageNumber = 1
      this.refreshMessage()
    },
    showMessageContent (v) {
      this.messageForm.content = v.content
    },
    backMessageList () {
      this.showMessageList = true
    },
    changePage (v) {
      this.searchForm.pageNumber = v
      this.refreshMessage()
    },
    changePageSize (v) {
      this.searchForm.pageSize = v
      this.refreshMessage()
    }
  }
}
</script>

<style lang="less">
.message-page{
  &-con{
    height: ~"calc(100vh - 176px)";
    display: inline-block;
    vertical-align: top;
    &.message-category-con{
      border-right: 1px solid #e6e6e6;
      width: 200px;
    }
    &.message-list-con{
      // border-right: 1px solid #e6e6e6;
      width: 85%;
      position: relative;

      .message-content-top-bar {
        height: 40px;
        width: 100%;
        background: white;
        position: absolute;
        left: 0;
        top: 0;
        border-bottom: 1px solid #dededb;
        .mes-back-btn-con {
          position: absolute;
          width: 70px;
          height: 30px;
          left: 0;
          top: 5px;
        }
        .mes-title {
          position: absolute;
          top: 0;
          right: 70px;
          bottom: 0;
          left: 70px;
          line-height: 40px;
          padding: 0 30px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
        }
      }
      .mes-time-con {
        position: absolute;
        width: 100%;
        top: 40px;
        left: 0;
        padding: 20px 0;
        text-align: center;
        font-size: 14px;
        color: #b7b7b5;
      }
      .message-content-body {
        position: absolute;
        top: 90px;
        right: 0;
        bottom: 0;
        left: 0;
        overflow: auto;
        .message-content {
          padding: 10px 20px;
        }
      }
    }
    .page-fix{
      float: right;
      margin-top: 10px;
    }
    &.message-view-con{
      position: absolute;
      left: 446px;
      top: 16px;
      right: 16px;
      bottom: 16px;
      overflow: auto;
      padding: 12px 20px 0;
      .message-view-header{
        margin-bottom: 20px;
        .message-view-title{
          display: inline-block;
        }
        .message-view-time{
          margin-left: 20px;
        }
      }
    }
    .category-title{
      display: inline-block;
      width: 65px;
    }
    .gray-dadge{
      background: gainsboro;
    }
    .not-unread-list{
      .msg-title{
        color: rgb(170, 169, 169);
      }
      .ivu-menu-item{
        .ivu-btn.ivu-btn-text.ivu-btn-small.ivu-btn-icon-only{
          display: none;
        }
        &:hover{
          .ivu-btn.ivu-btn-text.ivu-btn-small.ivu-btn-icon-only{
            display: inline-block;
          }
        }
      }
    }
  }
}
</style>

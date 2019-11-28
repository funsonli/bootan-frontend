<style lang="less">
@import "./index.less";
</style>
<template>
  <div>
    <Row @keydown.enter.native="handleSearch">
      <Form
        ref="searchForm"
        :model="searchForm"
        inline
        :label-width="75"
        class="search-form"
      >
        <Form-item label="原文件名" prop="name">
          <Input
            type="text"
            v-model="searchForm.name"
            placeholder="请输入"
            clearable
            style="width: 200px"
          />
        </Form-item>
        <Form-item label="存储文件名" prop="fileKey">
          <Input
            type="text"
            v-model="searchForm.fileKey"
            placeholder="请输入"
            clearable
            style="width: 200px"
          />
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
        <Form-item style="margin-left:-35px;" class="br">
          <Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
          <Button @click="handleReset">重置</Button>
        </Form-item>
      </Form>
    </Row>
    <div class="file-operation">
      <div>
        <Button @click="uploadVisible=true" type="primary" icon="md-cloud-upload">上传文件</Button>
        <Button v-if="showType=='list'" @click="removeAll" icon="md-trash">批量删除</Button>
        <Button @click="init" icon="md-refresh">刷新</Button>
      </div>

      <div>
        <RadioGroup
          v-model="fileType"
          @on-change="changeFileType"
          type="button"
          style="margin-right:25px"
        >
          <Radio label="all">所有文件</Radio>
          <Radio label="pic">图片</Radio>
          <Radio label="video">视频</Radio>
        </RadioGroup>
        <RadioGroup v-model="showType" type="button" @on-change="changeShowType">
          <Radio title="列表" label="list">
            <Icon type="md-list" style="margin-bottom:3px;"></Icon>
          </Radio>
          <Radio title="缩略图" label="thumb">
            <Icon type="ios-apps" style="margin-bottom:3px;"></Icon>
          </Radio>
        </RadioGroup>
      </div>
    </div>

    <div v-if="showType=='list'">
      <Row>
        <Alert show-icon>
          已选择
          <span class="select-count">{{selectCount}}</span> 项
          <a class="select-clear" @click="handleSelectNone">清空</a>
          <span v-if="selectCount>0" style="margin-left:15px">共计 {{totalSize}} 存储量</span>
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
    </div>

    <div v-if="showType=='thumb'">
      <div class="file-wrapper">
        <Card v-for="(item, i) in data" :key="i" class="file-card">
          <div class="content">
            <img
              @click="showPic(item)"
              v-if="item.contentType.indexOf('image')>=0"
              class="img"
              :src="item.url"
            >
            <div
              v-else-if="item.contentType.indexOf('video')>=0"
              class="video"
              @click="showVideo(item)"
            >
              <!-- 文件小于5MB显示video -->
              <video class="cover" v-if="item.size<1024 * 1024 * 5">
                <source :src="item.url">
              </video>
              <img class="play" src="@/assets/play.png">
            </div>
            <div v-else class="other">
              <div class="name">{{item.name}}</div>
              <div class="key">{{item.fileKey}}</div>
              <div
                class="info"
              >文件类型：{{item.contentType}} 文件大小：{{((item.size * 1.0) / (1024 * 1024)).toFixed(2)}} MB 创建时间：{{item.createdAt}}</div>
            </div>
            <div class="actions">
              <div class="btn">
                <Tooltip content="下载" placement="top">
                  <Icon @click="download(item)" type="md-download" size="16"/>
                </Tooltip>
              </div>
              <div class="btn">
                <Tooltip content="重命名" placement="top">
                  <Icon @click="rename(item)" type="md-create" size="16"/>
                </Tooltip>
              </div>
              <div class="btn">
                <Tooltip content="复制" placement="top">
                  <Icon @click="copy(item)" type="md-copy" size="16"/>
                </Tooltip>
              </div>
              <div class="btn-no">
                <Tooltip content="删除" placement="top">
                  <Icon @click="remove(item)" type="md-trash" size="16"/>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <Row type="flex" justify="end" class="page">
      <Page
        :current="searchForm.pageNumber"
        :total="total"
        :page-size="searchForm.pageSize"
        @on-change="changePage"
        @on-page-size-change="changePageSize"
        :page-size-opts="pageSizeOpts"
        size="small"
        show-total
        show-elevator
        show-sizer
      ></Page>
    </Row>

    <Drawer title="文件上传" closable v-model="uploadVisible" width="500">
      <Upload
        :action="uploadFileUrl"
        :headers="accessToken"
        :on-success="handleSuccess"
        :on-error="handleError"
        :max-size="5120"
        :on-exceeded-size="handleMaxSize"
        :before-upload="beforeUpload"
        multiple
        type="drag"
        ref="up"
      >
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
          <p>点击这里或将文件拖拽到这里上传</p>
        </div>
      </Upload>
      <div class="drawer-footer">
        <Button @click="clearFiles">清空上传列表</Button>
      </div>
    </Drawer>

    <Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
      <Form ref="modelForm" :model="modelForm" :label-width="85" :rules="modelFormValidate">
        <FormItem label="原文件名" prop="name">
          <Input v-model="modelForm.name"/>
        </FormItem>
        <FormItem label="存储文件名" prop="fileKey">
          <Input v-model="modelForm.fileKey"/>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="text" @click="handleCancel">取消</Button>
        <Button type="primary" :loading="submitLoading" @click="handleSubmit">提交</Button>
      </div>
    </Modal>

    <Modal v-model="picVisible" :title="picTitle" draggable>
      <img :src="file.url" alt="无效的图片链接" style="width: 100%;margin: 0 auto;display: block;">
      <div slot="footer">
        <span>文件类型：{{file.contentType}} 文件大小：{{file.size}} 创建时间：{{file.createdAt}}</span>
      </div>
    </Modal>

    <Modal v-model="videoVisible" :title="videoTitle" :width="800" @on-cancel="closeVideo" draggable>
      <div id="dplayer"></div>
      <div slot="footer">
        <span>文件类型：{{file.contentType}} 文件大小：{{file.size}} 创建时间：{{file.createdAt}}</span>
      </div>
    </Modal>
  </div>
</template>

<script>
import {
  apiFileListIndex,
  apiFileSave,
  uploadFile,
  apiFileDelete,
  apiFileCopy
} from '@/api/index'
import { getToken } from '@/libs/util'
import 'dplayer/dist/DPlayer.min.css'
import DPlayer from 'dplayer'
var dp
export default {
  name: 'file-manage',
  data () {
    return {
      accessToken: {}, // 上传token鉴权
      loading: false, // 表单加载状态
      uploadFileUrl: uploadFile,
      fileType: 'all',
      showType: 'list',
      modalVisible: false, // 添加或编辑显示
      uploadVisible: false,
      videoVisible: false,
      picVisible: false,
      picTitle: '',
      videoTitle: '',
      modalTitle: '', // 添加或编辑标题
      searchForm: {
        // 搜索框对应data对象
        name: '',
        fileKey: '',
        contentType: '',
        type: '',
        pageNumber: 1, // 当前页数
        pageSize: 5, // 页面大小
        sort: 'createdAt', // 默认排序字段
        order: 'desc', // 默认排序方式
        startDate: '', // 起始时间
        endDate: '' // 终止时间
      },
      selectDate: null, // 选择日期绑定modal
      oldKey: '',
      modelForm: {
        name: '',
        fileKey: ''
      },
      file: {},
      // 表单验证规则
      modelFormValidate: {
        name: [{ required: true, message: '不能为空', trigger: 'blur' }],
        fileKey: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      submitLoading: false, // 添加或编辑提交状态
      selectList: [], // 多选数据
      selectCount: 0, // 多选计数
      totalSize: '', // 文件大小统计
      columns: [
        // 表头
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
          title: '原文件名',
          key: 'name',
          minWidth: 130,
          sortable: true
        },
        {
          title: '存储文件名',
          key: 'fileKey',
          width: 165,
          sortable: true
        },
        {
          title: '缩略图(点击预览)',
          key: 'url',
          width: 130,
          align: 'center',
          render: (h, params) => {
            if (params.row.contentType.includes('image') > 0) {
              return h('img', {
                attrs: {
                  src: params.row.url,
                  alt: '加载图片失败'
                },
                style: {
                  cursor: 'pointer',
                  width: '80px',
                  height: '60px',
                  margin: '10px 0',
                  'object-fit': 'contain'
                },
                on: {
                  click: () => {
                    this.showPic(params.row)
                  }
                }
              })
            } else if (params.row.contentType.includes('video') > 0) {
              // 如果视频文件大小超过5MB不予加载video
              if (params.row.size < 1024 * 1024 * 5) {
                return h(
                  'video',
                  {
                    style: {
                      cursor: 'pointer',
                      width: '80px',
                      height: '60px',
                      margin: '10px 0',
                      'object-fit': 'contain'
                    },
                    on: {
                      click: () => {
                        this.showVideo(params.row)
                      }
                    }
                  },
                  [
                    h('source', {
                      attrs: {
                        src: params.row.url
                      }
                    })
                  ]
                )
              } else {
                return h('img', {
                  attrs: {
                    src: require('@/assets/play.png')
                  },
                  style: {
                    cursor: 'pointer',
                    width: '80px',
                    height: '60px',
                    margin: '10px 0',
                    'object-fit': 'contain'
                  },
                  on: {
                    click: () => {
                      this.showVideo(params.row)
                    }
                  }
                })
              }
            } else {
              return h('span', '非多媒体类型')
            }
          }
        },
        {
          title: '文件类型',
          key: 'contentType',
          width: 110,
          sortable: true
        },
        {
          title: '文件大小',
          key: 'size',
          width: 110,
          sortable: true,
          render: (h, params) => {
            let m =
              ((params.row.size * 1.0) / (1024 * 1024)).toFixed(2) + ' MB'
            return h('span', m)
          }
        },
        {
          title: '上传者',
          key: 'createdBy',
          width: 120,
          sortable: true
        },
        {
          title: '存储位置',
          key: 'location',
          align: 'center',
          width: 110,
          render: (h, params) => {
            let location = ''
            let color = ''
            if (params.row.location === 0) {
              location = '本地服务器'
              color = 'green'
            } else if (params.row.location === 1) {
              location = '七牛云'
              color = 'blue'
            } else if (params.row.location === 2) {
              location = '阿里云'
              color = 'orange'
            } else if (params.row.location === 3) {
              location = '腾讯云'
              color = 'geekblue'
            } else if (params.row.location === 4) {
              location = 'MinIO'
              color = 'magenta'
            }
            return h('div', [
              h(
                'Tag',
                {
                  props: {
                    color: color
                  }
                },
                location
              )
            ])
          }
        },
        {
          title: '创建时间',
          key: 'createdAt',
          width: 150,
          sortable: true,
          sortType: 'desc'
        },
        {
          title: '操作',
          key: 'action',
          align: 'center',
          fixed: 'right',
          width: 235,
          render: (h, params) => {
            return h('div', [
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
                      this.download(params.row)
                    }
                  }
                },
                '下载'
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
                      this.rename(params.row)
                    }
                  }
                },
                '重命名'
              ),
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
                      this.copy(params.row)
                    }
                  }
                },
                '复制'
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
      data: [], // 表单数据
      total: 0, // 表单数据总数
      pageSizeOpts: [5, 10, 20]
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.accessToken = {
        'access-token': getToken()
      }
      this.getModels()
    },

    /* **** 和后台交互代码区块 begin **** */
    getModels () {
      if (this.showType === 'list') {
        this.pageSizeOpts = [5, 10, 20]
      } else {
        this.pageSizeOpts = [12, 24]
      }
      this.loading = true
      apiFileListIndex(this.searchForm).then(res => {
        this.loading = false
        if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
          this.data = res.data.data.content
          this.total = res.data.data.totalElements
        }
      })
    },
    copy (v) {
      this.$Modal.confirm({
        title: '确认复制',
        content: '您确认要复制文件 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiFileCopy({ id: v.id, key: v.fileKey }).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(
                '复制文件成功，新文件名为 ' + v.name + '_副本'
              )
              this.getModels()
            }
          })
        }
      })
    },
    removeAll () {
      if (this.selectCount <= 0) {
        this.$Message.warning('您还未选择要删除的数据')
        return
      }
      this.$Modal.confirm({
        title: '确认删除',
        content: '您确认要删除所选的 ' + this.selectCount + ' 个文件?',
        loading: true,
        onOk: () => {
          let ids = ''
          this.selectList.forEach(function (e) {
            ids += e.id + ','
          })
          ids = ids.substring(0, ids.length - 1)
          apiFileDelete(ids).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('批量删除文件成功')
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
        content: '您确认要删除文件 ' + v.name + ' ?',
        loading: true,
        onOk: () => {
          apiFileDelete(v.id).then(res => {
            this.$Modal.remove()
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success('删除文件 ' + v.name + ' 成功')
              this.getModels()
            }
          })
        }
      })
    },
    handleSubmit () {
      this.$refs.modelForm.validate(valid => {
        if (valid) {
          this.submitLoading = true
          apiFileSave(this.modelForm).then(res => {
            this.submitLoading = false
            if (parseInt(res.status) === 200 && parseInt(res.data.code) === 200) {
              this.$Message.success(res.data.message)
              this.getModels()
              this.modalVisible = false
            } else {
              this.$Message.error(res.data.message)
            }
          })
        }
      })
    },
    /* **** 和后台交互代码区块 end **** */

    /* **** 页面内按钮交互代码(和后台有交互) begin **** */
    rename (v) {
      this.modalTitle = '编辑文件名'
      // 转换null为''
      for (let attr in v) {
        if (v[attr] == null) {
          v[attr] = ''
        }
      }
      let str = JSON.stringify(v)
      let data = JSON.parse(str)
      this.modelForm = data
      this.oldKey = data.fileKey
      this.modalVisible = true
    },
    beforeUpload () {
      this.loading = true
      return true
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '文件大小过大',
        desc: '所选文件‘ ' + file.name + ' ’大小过大, 不得超过 5M.'
      })
    },
    handleSuccess (res, file) {
      if (parseInt(res.status) === 200 && parseInt(res.code) === 200) {
        this.$Message.success('上传文件 ' + file.name + ' 成功')
        this.getModels()
      } else {
        this.$Message.error('上传失败')
      }
    },
    handleError (error, file, fileList) {
      this.$Message.error(error.toString())
    },
    download (v) {
      window.open(
        v.url + '?attname=&response-content-type=application/octet-stream'
      )
    },
    /* **** 页面内按钮交互代码 end **** */

    /* **** 页面内控件标准代码（一般无限续修改） begin **** */
    handleSearch () {
      this.searchForm.pageNumber = 1
      if (this.showType === 'list') {
        this.searchForm.pageSize = 5
      } else {
        this.searchForm.pageSize = 12
      }
      this.getModels()
    },
    handleReset () {
      this.$refs.searchForm.resetFields()
      this.searchForm.pageNumber = 1
      if (this.showType === 'list') {
        this.searchForm.pageSize = 5
      } else {
        this.searchForm.pageSize = 12
      }
      this.selectDate = null
      this.searchForm.startDate = ''
      this.searchForm.endDate = ''
      // 重新加载数据
      this.getModels()
    },
    handleCancel () {
      this.modalVisible = false
    },
    clearFiles () {
      this.$refs.up.clearFiles()
    },
    changeFileType () {
      let name = this.fileType
      if (name === 'all') {
        this.searchForm.contentType = ''
      } else if (name === 'pic') {
        this.searchForm.contentType = 'image'
      } else if (name === 'video') {
        this.searchForm.contentType = 'video'
      }
      this.handleSearch()
    },
    showPic (v) {
      this.file = v
      this.file.msize = ((v.size * 1.0) / (1024 * 1024)).toFixed(2) + ' MB'
      this.picTitle = v.name + '(' + v.fileKey + ')'
      this.picVisible = true
    },
    showVideo (v) {
      dp = new DPlayer({
        container: document.getElementById('dplayer'),
        screenshot: true,
        video: {
          url: v.url
        },
        danmaku: {
          id: v.fileKey,
          api: 'https://api.prprpr.me/dplayer/'
        }
      })
      this.file = v
      this.file.msize = ((v.size * 1.0) / (1024 * 1024)).toFixed(2) + ' MB'
      this.videoTitle = v.name + '(' + v.fileKey + ')'
      this.videoVisible = true
    },
    closeVideo () {
      dp.destroy()
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
    changeSort (e) {
      this.searchForm.sort = e.key
      this.searchForm.order = e.order
      if (e.order === 'normal') {
        this.searchForm.order = ''
      }
      this.getModels()
    },
    selectDateRange (v) {
      if (v) {
        this.searchForm.startDate = v[0]
        this.searchForm.endDate = v[1]
      }
    },
    changeShowType () {
      this.searchForm.pageNumber = 1
      if (this.showType === 'list') {
        this.searchForm.pageSize = 5
      } else {
        this.searchForm.pageSize = 12
      }
      this.getModels()
    },
    handleSelectNone () {
      this.$refs.table.selectAll(false)
      this.totalSize = ''
    },
    changeSelect (e) {
      this.selectList = e
      this.selectCount = e.length
      let size = 0
      e.forEach(item => {
        size += item.size * 1.0
      })
      this.totalSize = ((size * 1.0) / (1024 * 1024)).toFixed(2) + ' MB'
    }
    /* **** 页面内控件标准代码（一般无限续修改） end **** */
  }
}
</script>

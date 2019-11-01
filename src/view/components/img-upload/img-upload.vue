<template>
  <div class="img-upload">
    <div class="img-upload-list" v-for="(item,index) in imageList" :key="index">
        <img :src="item" />
        <div class="img-upload-list-cover">
          <Icon type="ios-eye-outline" @click.native="handleView(item)"></Icon>
          <Icon type="ios-trash-outline" @click.native="handleRemove(index)"></Icon>
        </div>
    </div>

    <Upload
      :show-upload-list="false"
      :on-exceeded-size="handleMaxSize"
      :on-success="handleSuccess"
      :format="['jpg','jpeg','png']"
      :max-size="2048"
      multiple
      type="drag"
      :action="actionUrl"
      :headers="accessToken"
      style="display: inline-block;width:58px;">
      <div style="width: 58px;height:58px;line-height: 58px;">
        <Icon type="ios-camera" size="20"></Icon>
      </div>
    </Upload>
    <Modal title="图片预览" v-model="visible">
      <img :src="showImageUrl" v-if="visible" style="width: 100%" />
    </Modal>
  </div>
</template>
<script>
import { uploadFile } from '@/api/index'
import { getToken } from '@/libs/util'
export default {
  name: 'imgUpload',
  data () {
    return {
      actionUrl: uploadFile,
      imageUrl: '',
      hasImage: false,
      showImageUrl: '',
      visible: false,
      imageUrlList: [],
      accessToken: {}
    }
  },
  props: {
    imageList: {
      type: Array,
      default: function () { return [] }
    }
  },
  mounted () {
    this.accessToken = {
      'access-token': getToken()
    }
  },
  methods: {
    upload () {
      this.loadingStatus = true
      setTimeout(() => {
        this.file = null
        this.loadingStatus = false
        this.$Message.success('Success')
      }, 1500)
    },
    handleMaxSize (file) {
      this.$Notice.warning({
        title: '图片大小限制',
        desc: '文件 ' + file.name + '太大,不能超过 2M.'
      })
    },
    handleView (imageUrl) {
      this.showImageUrl = imageUrl
      this.visible = true
    },
    handleRemove (index) {
      // 删除
      this.imageList.splice(index, 1)
      this.$emit('on-change', this.imageList)
    },

    handleSuccess (res, file) {
      let image = res.message
      this.imageList.push(image)
      this.$emit('on-change', this.imageList)
    }
  }
}
</script>
<style>
  .img-upload {
    max-width: 360px;
    /* height: 150px; */
    border: 1px #EEEEEE solid;
    border-radius: 5px;
    padding: 10px;
  }
  .img-upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
    margin-right: 4px;
  }
  .img-upload-list img {
    width: 100%;
    height: 100%;
  }
  .img-upload-list-cover {
    display: none;
    position: absolute;
    top: 0;bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.6);
  }
  .img-upload-list:hover .img-upload-list-cover {
    display: block;
  }
  .img-upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>

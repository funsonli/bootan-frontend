<template>
  <div>
    <Form ref="formDynamic" :model="formDynamic" class="formDynamic" inline @keydown.native.enter ="handleSubmit('formDynamic')">
      <div class="form-title">
        <FormItem class="form-title-button">
          <Button @click="handleAdd" icon="md-add"></Button>
        </FormItem>
        <FormItem v-for="(item, index) in formTitle" :key="index" class="form-title-item">
          <label>{{item.value}}</label>
        </FormItem>
      </div>
      <div v-for="(item, index) in formDynamic.items" :key="index" v-if="item.status" class="dynamic-form">
        <FormItem class="form-item-button">
          <Button @click="handleAdd" icon="md-add" style="margin-right: 10px;"></Button>
          <Button @click="handleRemove(item, index)" icon="md-remove"></Button>
        </FormItem>
        <FormItem :prop="'items.' + index + '.relation'" :rules="formValidate.relation" class="form-item">
          <Input type="text" v-model="item.relation"></Input>
        </FormItem>
        <FormItem :prop="'items.' + index + '.mobile'" :rules="formValidate.mobile" class="form-item">
          <Input type="text" v-model="item.mobile"></Input>
        </FormItem>
        <FormItem :prop="'items.' + index + '.age'" :rules="formValidate.age" class="form-item">
          <Input type="text" v-model="item.age" @on-blur="handleSubmit('formDynamic')"></Input>
        </FormItem>
      </div>
      <!-- <FormItem class="form-button">
        <Button type="primary" @click="handleSubmit('formDynamic')">提交</Button>
        <Button @click="handleReset('formDynamic')" style="margin-left: 8px">重置</Button>
      </FormItem> -->
    </Form>
  </div>
</template>

<script>
import { validateMobile, validateAge } from '@/libs/validate'
export default {
  name: 'formDynamic',
  data () {
    return {
      index: 1,
      formTitle: [
        {
          index: 1,
          value: '关系'
        },
        {
          index: 2,
          value: '电话'
        },
        {
          index: 3,
          value: '年龄'
        }
      ],
      formDynamic: {
        items: [
          {
            relation: '',
            mobile: '',
            age: '',
            index: 1,
            status: 1
          }
        ]
      },
      formValidate: {
        relation: [{ required: true, message: '关系不能为空', trigger: 'blur' }],
        mobile: [
          { required: true, message: '手机号不能为空', trigger: 'blur' },
          { validator: validateMobile, trigger: 'blur' }
        ],
        age: [
          { required: true, message: '年龄不能为空', trigger: 'blur' },
          { validator: validateAge, trigger: 'blur' }
        ]
      }
    }
  },
  props: {
    relations: {
      type: Array,
      default: function () { return [] }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      if (this.relations.length !== 0) {
        this.formDynamic.items = this.relations
      }
    },
    handleSubmit (name) {
      this.$refs[name].validate((valid) => {
        if (valid) {
          this.$Message.success('Success!')
        } else {
          this.$Message.error('Fail!')
        }
      })
      this.$emit('on-change', this.formDynamic.items)
    },
    handleRemove (item, index) {
      this.formDynamic.items[index].status = 0
      this.index = this.formDynamic.items.indexOf(item)
      if (index !== -1) {
        this.formDynamic.items.splice(index, 1)
      }
      this.$emit('on-change', this.formDynamic.items)
    },
    handleAdd () {
      this.index++
      this.formDynamic.items.push({
        relation: '',
        mobile: '',
        age: '',
        index: this.index,
        status: 1
      })
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
  .formDynamic {
    width: 400px;
  }
  .form-title {
    // margin-bottom: 10px;
  }
  .form-title-button {
    width: 105px;
    text-align: center;
    margin-bottom: 10px;
  }
  .form-title-item {
    width: 80px;
    text-align: center;
    margin-bottom: 10px;
  }
  .dynamic-form {
    // margin-bottom: 10px;
  }
  .form-item-button {
    width: 100px;
    text-align: center;
    margin-right: 20px;
    margin-bottom: 10px;
  }
  .form-item {
    width: 80px;
    text-align: center;
    margin-bottom: 10px;
  }
  .form-button {
    float: right;
    margin-right: 30px !important;
  }
</style>

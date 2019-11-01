<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-bg">
      <video autoplay loop muted class="login-bg-video">
        <source src="./Ipad.mp4"></source>
        <source src="./Ipad.webm"></source>
        <!-- <source src="./Ipad.ogv"></source> -->
      </video>
    </div>
    <div class="login-container">
      <div class="login-container-con">
        <Card icon="log-in" title="欢迎登录" :bordered="false">
          <div class="form-con">
            <login-form @on-success-valid="handleSubmit"></login-form>
            <p class="login-tip">输入任意用户名和密码即可</p>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from '_c/login-form'
import { mapActions } from 'vuex'
import util from '@/libs/utils.js'
export default {
  components: {
    LoginForm
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit ({ username, password }) {
      this.handleLogin({ username, password }).then(res => {
        this.getUserInfo().then(res => {
          util.initRouter(this)
          this.$router.push({
            name: this.$config.homeName
          })
        })
      })
    }
  }
}
</script>

<style>

</style>

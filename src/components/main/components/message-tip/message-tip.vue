<template>
  <div @click='showMessage' class='message-con'>
    <Tooltip :always="value > 0" :content="value > 0 ? '有' + value + '条未读消息' : '无未读消息'" placement='bottom'>
      <Badge :count='value' dot>
        <Icon type='md-notifications' :size='22' />
      </Badge>
    </Tooltip>
  </div>
</template>

<script>
import './message-tip.less'
import util from '@/libs/utils.js'
export default {
  name: 'MessageTip',
  props: {
    value: {
      type: Number,
      default: 0
    }
  },
  methods: {
    showMessage () {
      util.openNewPage(this, 'message_page')
      this.$router.push({
        name: 'message_page'
      })
    }
  }
}
</script>

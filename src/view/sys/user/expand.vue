<style scoped>
.expand-row {
  margin-bottom: 16px;
}

.expand-input {
  width: 200px;
}
</style>
<template>
    <div>
      <Row class="expand-row">
        <Col span="6">
          <div>
            <span>昵称: </span>
            <span>{{ row.description }}</span>
          </div>
        </Col>
        <Col span="6">
          <span>个人简介: </span>
          <span>{{ row.description }}</span>
        </Col>
        <Col span="6">
          <span>所在省市: </span>
          <span>{{ row.address}}</span>
        </Col>
        <Col span="6">
          <span>街道地址: </span>
          <span>{{ row.address }}</span>
        </Col>
      </Row>
      <Row>
        <Col span="6">
          <span>密码强度: </span>
          <span>{{ row.passStrength }}</span>
        </Col>
      </Row>
    </div>
</template>
<script>
export default {
  name: 'expandRow',
  props: {
    row: Object,
    index: Number
  }
}
</script>

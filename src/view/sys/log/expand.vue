<style scoped>
.expand-row {
  margin-bottom: 16px;
}
</style>
<template>
    <div>
      <Row class="expand-row">
        <Col span="24">
          <div>
            <span>请求参数: </span>
            <span>{{ row.requestParam }}</span>
          </div>
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

// 导入表格模版数据
export const importDataColumns = [
  {
    title: 'name',
    key: 'name'
  },
  {
    title: 'result',
    key: 'result'
  },
  {
    title: 'processDefinitionId',
    key: 'processDefinitionId'
  },
  {
    title: 'processInstanceId',
    key: 'processInstanceId'
  },
  {
    title: 'tableId',
    key: 'tableId'
  },
  {
    title: 'isHistory',
    key: 'isHistory'
  },
  {
    title: 'userId',
    key: 'userId'
  },
  {
    title: 'appliedAt',
    key: 'appliedAt'
  },
  {
    title: 'type',
    key: 'type'
  },
  {
    title: 'status',
    key: 'status'
  },
  {
    title: 'sortOrder',
    key: 'sortOrder'
  },
  {
    title: 'value',
    key: 'value'
  }
]

export const importData = [
  {
    name: '【记得删除该说明列】名称不能为空',
    result: '结果 0草稿默认 1出体重 2通过 3驳回',
    processDefinitionId: '流程定义id',
    processInstanceId: '流程实例id',
    tableId: '关联其他表id',
    isHistory: '是否为历史记录',
    userId: '申请用户id',
    appliedAt: '提交申请时间',
    type: '类型 1(类型1) 2(类型2)',
    status: '状态 1(启用) 0(禁用)',
    sortOrder: '只能填入整数，值越小，排在越前面(默认50)',
    value: '无特定要求'
  },
  {
    name: 'role',
    result: '结果 0草稿默认 1出体重 2通过 3驳回',
    processDefinitionId: '流程定义id',
    processInstanceId: '流程实例id',
    tableId: '关联其他表id',
    isHistory: '是否为历史记录',
    userId: '申请用户id',
    appliedAt: '提交申请时间',
    type: 1,
    status: 1,
    sortOrder: 50,
    value: 'leave'
  }
]

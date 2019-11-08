// 导入表格模版数据
export const importDataColumns = [
  {
    title: 'name',
    key: 'name'
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
  }
]

export const importData = [
  {
    name: '【记得删除该说明列】名称不能为空',
    type: '类型 1(类型1) 2(类型2)',
    status: '状态 1(启用) 0(禁用)',
    sortOrder: '只能填入整数，值越小，排在越前面(默认50)'
  },
  {
    name: 'role',
    type: 1,
    status: 1,
    sortOrder: 50
  }
]

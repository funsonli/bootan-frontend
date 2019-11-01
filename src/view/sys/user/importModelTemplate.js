// 导入表格模版数据
export const importModelColumns = [
  {
    title: 'username',
    key: 'username'
  },
  {
    title: 'password',
    key: 'password'
  },
  {
    title: 'email',
    key: 'email'
  },
  {
    title: 'nickName',
    key: 'nickName'
  },
  {
    title: 'avatar',
    key: 'avatar'
  },
  {
    title: 'description',
    key: 'description'
  },
  {
    title: 'sex',
    key: 'sex'
  },
  {
    title: 'address',
    key: 'address'
  },
  {
    title: 'mobile',
    key: 'mobile'
  },
  {
    title: 'remark',
    key: 'remark'
  },
  {
    title: 'departmentId',
    key: 'departmentId'
  },
  {
    title: 'type',
    key: 'type'
  },
  {
    title: 'status',
    key: 'status'
  }
]

export const importModelData = [
  {
    username: '【记得删除该说明列】唯一用户名不能为空',
    password: '密码不能为空',
    email: '邮箱不能为空',
    nickName: '昵称',
    avatar: '头像图片链接',
    description: '描述',
    sex: '性别 (女/男)',
    address: '地址数据省市编号 请勿乱填',
    mobile: '手机号不能为空',
    remark: '备注',
    departmentId: '部门表主键id',
    type: '用户类型 0(普通用户) 1(管理员)',
    status: '用户状态 1(正常) 0(禁用)'
  },
  {
    username: 'admin',
    password: '123456',
    email: '1012139570@qq.com',
    nickName: '昵称',
    avatar: 'https://s1.ax1x.com/2018/05/19/CcdVQP.png',
    description: '描述',
    sex: '男',
    address: '[\'510000\',\'510100\',\'510104\']',
    mobile: '18782059038',
    remark: '备注',
    departmentId: '40652338142121984',
    type: 0,
    status: 1
  }
]

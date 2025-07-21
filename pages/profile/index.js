Page({
  data: {
    role: 'leader', // 登录后写死 leader / member
    currentTab: 'my', // 默认显示“我的档案”
    myInfo: {}, // 我的信息
    subList: [], // 所有下属成员列表
    filteredSubList: [], // 搜索过滤后的下属成员列表
    searchQuery: '', // 搜索框的内容
    approvalList: [
      { id: '001', name: '赵六', role: '新成员', applyTime: '2025-07-15', contact: '13800138000', showDetails: false },
      { id: '002', name: '钱七', role: '新成员', applyTime: '2025-07-14', contact: '13800138001', showDetails: false }
    ],
    approvalCount: 0, // 审批任务数量
    currentSubId: null // 当前展开的下属成员ID
  },

  onLoad() {
    // 1. 身份判断
    const role = wx.getStorageSync('role') || 'leader';
    this.setData({ role });

    // 2. 我的信息
    const myInfo = this.mockMyInfo();
    this.setData({ myInfo });

    // 3. 领导加载下属
    if (role === 'leader') {
      const subList = this.mockSubList();
      this.setData({ subList, filteredSubList: subList }); // 初始化 filteredSubList
      this.setData({ approvalList: this.mockApprovalList() }); // 新增审批列表
      this.updateApprovalCount(); // 更新审批任务数量
    } else {
      this.setData({ filteredSubList: this.mockSubList() }); // 初始化 filteredSubList
    }
  },

  // 切换标签
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
    if (e.currentTarget.dataset.tab === 'sub') {
      this.setData({ filteredSubList: this.data.subList, currentSubId: null, searchQuery: '' }); // 重置搜索结果和当前展开的下属成员ID
    }
  },

  // 展开/收起盟员详细信息
  toggleSubDetail(e) {
    const id = e.currentTarget.dataset.id;
    const filteredSubList = this.data.filteredSubList.map(item => {
      item.showDetails = item.id === id ? !item.showDetails : false; // 只展开当前点击的项，其他项收起
      return item;
    });
    this.setData({ filteredSubList });
  },

  // 展开/收起审批详情
  toggleDetails(e) {
    const index = e.currentTarget.dataset.index;
    const approvalList = this.data.approvalList;
    approvalList[index].showDetails = !approvalList[index].showDetails;
    this.setData({ approvalList });
  },

  // 单个审批 - 同意
  approve(e) {
    const index = e.currentTarget.dataset.index;
    const approvalList = this.data.approvalList;
    approvalList[index].status = 'approved';
    approvalList[index].showDetails = false; // 关闭详情
    approvalList.splice(index, 1); // 从列表中移除
    this.setData({ approvalList });
    this.updateApprovalCount(); // 更新审批任务数量
    wx.showToast({
      title: '审批通过',
      icon: 'success',
      duration: 2000
    });
  },

  // 单个审批 - 拒绝
  reject(e) {
    const index = e.currentTarget.dataset.index;
    const approvalList = this.data.approvalList;
    approvalList.splice(index, 1); // 从列表中移除
    this.setData({ approvalList });
    this.updateApprovalCount(); // 更新审批任务数量
    wx.showToast({
      title: '审批拒绝',
      icon: 'none',
      duration: 2000
    });
  },

  // 更新审批任务数量
  updateApprovalCount() {
    const approvalCount = this.data.approvalList.length;
    this.setData({ approvalCount });
  },

  // 搜索框输入事件
  onSearchInput(e) {
    const searchQuery = e.detail.value.trim();
    this.setData({ searchQuery });

    if (searchQuery === '') {
      // 如果搜索框为空，显示所有成员
      this.setData({ filteredSubList: this.data.subList });
    } else {
      // 模糊查找
      const filteredSubList = this.data.subList.filter(item =>
        item.name.includes(searchQuery) || item.company.includes(searchQuery)
      );
      this.setData({ filteredSubList });
    }
  },

  // 清空搜索框内容
  clearSearch() {
    this.setData({ searchQuery: '' });
    this.setData({ filteredSubList: this.data.subList });
  },

  // 模拟数据
  mockMyInfo() {
    return {
      avatarUrl: '/pages/image/mm.png',
      name: '张三',
      birth: '1990-05',
      sex:'男',
      phone: '13800138000',
      email: 'zhangsan@test.com',
      company: '中共XX市委',
      title: '科员'
    };
  },

  mockSubList() {
    return [
      { id: '001', avatarUrl: '/pages/image/mm.png', name: '李四', company: 'XX市委', title: '科员', phone: '13800138001', showDetails: false },
      { id: '002', avatarUrl: '/pages/image/mm.png', name: '王五', company: 'XX市委', title: '科员', phone: '13800138002', showDetails: false },
      { id: '003', avatarUrl: '/pages/image/mm.png', name: '孙八', company: 'XX市委', title: '科员', phone: '13800138003', showDetails: false },
      { id: '004', avatarUrl: '/pages/image/mm.png', name: '周九', company: 'XX市委', title: '科员', phone: '13800138004', showDetails: false }
    ];
  },

  mockApprovalList() {
    return [
      { id: '001', name: '高老师1', role: '新成员', applyTime: '2025-07-15', contact: '13800138000'},
      { id: '002', name: '高老师2', role: '新成员', applyTime: '2025-07-14', contact: '13800138001'},
      { id: '003', name: '高老师3', role: '新成员', applyTime: '2025-07-14', contact: '13800138001'}
    ];
  }
});
const app = getApp()
Page({
  data: {
    role: 'MEMBER', // 登录后写死 LEADER / MEMBER
    currentTab: 'my', // 默认显示“我的档案”
    myInfo: {}, // 我的信息
    subList: [], // 所有下属成员列表
    filteredSubList: [], // 搜索过滤后的下属成员列表
    searchQuery: '', // 搜索框的内容
    approvalList: [],
    approvalCount: 0, // 审批任务数量
    currentSubId: null // 当前展开的下属成员ID
  },

  onLoad() {
    app.verifyLogin('profile')
    // 1. 身份判断
    const role = wx.getStorageSync('role') || 'MEMBER';
    this.setData({ role });
    // 2. 我的信息
     this.mockMyInfo();
    
     this.mockSubList('');
    // 3. 领导加载下属
    if (role ==='LEADER') {
      
      this.setData({ approvalList: this.mockApprovalList() }); // 新增审批列表
       this.updateApprovalCount(); // 更新审批任务数量
    }
  },

  onShow() {
      
 },

  // 切换标签
  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
    if (e.currentTarget.dataset.tab === 'sub') {
      this.mockSubList('')
      this.setData({ currentSubId: null, searchQuery: '' }); // 重置搜索结果和当前展开的下属成员ID
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
      console.log("searchQuery:"+searchQuery)
      this.mockSubList(searchQuery);
      // const filteredSubList = this.data.subList.filter(item =>
      //   item.name.includes(searchQuery) || item.company.includes(searchQuery)
      // );


      // this.setData({ filteredSubList });
    }
  },

  // 清空搜索框内容
  clearSearch() {
    this.setData({ searchQuery: '' });
    this.setData({ filteredSubList: this.data.subList });
    this.mockSubList('');
  },

  // 模拟数据
  mockMyInfo() {
    const token = wx.getStorageSync('token')
    if(token){
      app.wxRequest(
        'GET',
        '/member/getMember', null,
        (res) => {
          const {code,message,content} = res.data
          const myInfo = content
          if(code == 200){
            this.setData({ myInfo });
          }
         },
         (err)=>{
          setTimeout(()=>{
            wx.showToast({
              title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
              icon: 'none',
              duration: 2000
            })
          },1000);
        })
      
    }
  },

  mockSubList(keyword) {
    console.log("keyword:"+keyword)
    const keywords = {keyword:keyword}
    app.wxRequest(
      'GET',
      '/member/search', keywords,
      (res) => {
          if( res.statusCode != 200){
            wx.showToast({ title: '服务器响应超时，请稍后再试', icon: 'error', duration: 2000 });
            wx.setStorageSync('loginSate', false)
            wx.setStorageSync('token', null)
           }else{
             const resl = res.data
             const {content} = resl
             console.log("subList=>"+ JSON.stringify(content))
             const subList = content
             this.setData({ subList, filteredSubList: subList }); // 初始化 filteredSubList
           }
         },
       (err)=>{
        setTimeout(()=>{
          wx.showToast({
            title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
            icon: 'none',
            duration: 2000
          })
        },1000);
      })
  
  },

  mockApprovalList() {

    // this.setData({ approvalList: this.mockApprovalList() }); 
    return [
      { id: '001', name: '11', role: '待开发', applyTime: '2025-07-15', contact: '13800138000'},
      { id: '002', name: '待开发', role: '待开发', applyTime: '2025-07-14', contact: '13800138001'},
      { id: '003', name: '待开发', role: '待开发', applyTime: '2025-07-14', contact: '13800138001'}
    ];
  }
});
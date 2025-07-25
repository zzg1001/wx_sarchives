const app = getApp();

Page({
  data: {
    isLogin: null,
    array: [], // 组队列表
    index: 0, // 当前选中的索引
    joinGroup: wx.getStorageSync('joinGroup') || false, // 是否已加入组队
    groupName: "", // 当前组队名称
    groupUserCount: 0, // 组队成员数量
    licensePlateError:""
  },

  // 获取组队列表
  updateGroupList: function () {
    app.wxRequest("GET", "/ext/getGroupList", null, res => {
      const { code, message, content } = res.data;
      if (code === 200) {
        // 将“请选择”作为第一个选项
        const groupList = ["请选择", ...content.map(item => item.groupName)];
        // 检查用户是否已有组
        const userHasGroup = this.data.joinGroup && this.data.groupName;
        const defaultIndex = userHasGroup
          ? groupList.indexOf(this.data.groupName) // 如果用户有组，设置为用户所在的组
          : 0; // 默认选中“请选择”
  
        this.setData({
          array: groupList,
          index: defaultIndex // 设置默认索引
        });
      } else {
        wx.showToast({ title: message || '加载失败', icon: 'none' });
      }
    },(err)=>{
      wx.setStorageSync('fail', true)
      wx.navigateTo({
        url: '/pages/index/index?registerStat=1'
      });
});
  },

  // 页面加载时
  onLoad() {
   
  },

  // 页面显示时
  onShow() {
    wx.showLoading({ title: '加载中...' });
    this.updateGroupList(); // 获取组队列表
    this.setData({
      joinGroup: wx.getStorageSync('joinGroup') || false // 刷新 joinGroup 状态
    });
    this.reFreshPage(); // 刷新页面数据
  },

  // 选择组队后提交
  bindPickerChange: function (e) {
    const token = wx.getStorageSync('token')
    if(!token){
      setTimeout(()=>{
        wx.showToast({
          title: "此功能需要注册",
          icon: 'none',
          duration: 1000
        },3000)
      })
      wx.navigateTo({
        url: '/pages/home/index?registerStat=ture'
      });

    }
    const selectedGroupName = this.data.array[e.detail.value];
    this.setData({ index: e.detail.value }); // 更新选中索引
  
    // 如果选中的是“请选择”，则不执行保存操作
    if (selectedGroupName === "请选择") {
      wx.showToast({ title: '请选择一个有效的支部', icon: 'none' });
      return;
    }
  
    wx.showLoading({ title: '正在保存...' });
    app.wxRequest('POST', '/group/joinGroup', { groupName: selectedGroupName }, res => {
      const { code, message } = res.data;
      wx.hideLoading();
      console.log(code)
      if (code === 200) {
        wx.setStorageSync('joinGroup', true); // 更新本地存储状态
        wx.setStorageSync('groupName', selectedGroupName)
        wx.showToast({ title: '保存成功', icon: 'success' });
         this.setData({
                   joinGroup: true
                    });   
        this.reFreshPage(); // 刷新页面数据
        app.wxRequest("GET", "/qa/homeStatus", null, res => {
          const { code, content } = res.data
          
          console.log(content)
          switch (code) {
            case 200:
              if (content.code == 0) {
                      wx.navigateTo({ url: '/pages/index/index' }); // 跳转到首页
                 }
          }
        },(err)=>{
          setTimeout(()=>{
            wx.showToast({
              title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
              icon: 'none',
              duration: 2000
            })
          },1000);
    })    
      } else {
        wx.showToast({ title: '该支部以存在' || '保存失败', icon: 'none' });
      }
    },(err)=>{
      setTimeout(()=>{
        wx.showToast({
          title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
          icon: 'none',
          duration: 2000
        })
      },1000);
});
  },

  // 刷新页面数据
  reFreshPage: function () {
    if (this.data.joinGroup) {
      app.wxRequest('GET', '/qa/getGroupNum', null, res => {
        const { code, message, content } = res.data;
        
        if (code === 200) {
          this.setData({
            groupName: content.groupName, // 当前组队名称
            groupUserCount: content.count // 组队成员数量
          });
        } else {
          wx.showToast({ title: message || '刷新失败', icon: 'none' });
        }
      },(err)=>{
        setTimeout(()=>{
          wx.showToast({
            title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
            icon: 'none',
            duration: 2000
          })
        },1000);
  });
    }
  },

  // 页面卸载时
  onUnload: function () {
    // 如果需要在返回时刷新上一页数据，可以在这里调用逻辑
    // 例如：wx.navigateBack({ delta: 1 });
  }
});
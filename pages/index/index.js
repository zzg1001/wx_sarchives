Page({
  data: {
    // 页面数据
  },

  onLoad() {
    // 页面加载时的逻辑
  },

  // 事件处理函数
  navigateToService(e) {
    const serviceName = e.currentTarget.dataset.service;
    wx.navigateTo({
      url: `/pages/${serviceName}/${serviceName}`
    });
  }
});
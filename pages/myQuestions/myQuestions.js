const app = getApp();
Page({
  data: {
    userData: {}
  },
  onLoad() {
    const joinGroup = wx.getStorageSync('joinGroup')
    app.wxRequest("GET", "/qa/getUserScore", null, res => {
      const { code, message, content } = res.data
      switch (code) {
        case 200:
          this.setData({ userData: content })
          break;

        default:
          break;
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
    if(!joinGroup){
      setTimeout(()=>{
        wx.showToast({
          title: "需要答题才有积分",
          icon: 'none',
          duration: 3000
        })
      },1000)
      
      setTimeout(()=>{
          wx.navigateTo({
            url: '/pages/index/index'
          });
        },2000)
     return;
    }
  },
  gotoRanking: function() {
    const token = wx.getStorageSync('token')
    if(!token){
      wx.reLaunch({
        url: '/pages/index/index' // 刷新首页
      });
      return;
    }
    wx.navigateTo({
      url: '/pages/rankingPage/rankingPage'
    });
  }

});
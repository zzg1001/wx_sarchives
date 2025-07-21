const app = getApp();
Page({
  data: {
    activeTab: 'personal',
    personalRankings: [],
    teamRankings: []
  },
  onLoad(){
    const joinGroup = wx.getStorageSync('joinGroup')
    if(!joinGroup){
      setTimeout(()=>{
        wx.showToast({
          title: "需要答题才能排名",
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
    app.wxRequest("GET", "/qa/getUserRank", null, res => {
      const { code, message, content } = res.data
      switch (code) {
        case 200:
          this.setData({personalRankings: content})
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
    app.wxRequest("GET", "/qa/getGroupRank", null, res => {
      const { code, message, content } = res.data
      console.log(res.data)
      switch (code) {
        case 200:
          this.setData({teamRankings: content})
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
  },
  switchTab(event) {
    const tab = event.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
  }
})
const app = getApp();
Page({
  data: {
    loginState: true // 控制弹框显示
    // 页面数据
  },

  onShow() {
    wx.login({
          success: (res) => {
            if(res.code){
              const obj = { code: res.code }
              this.onShowLogInfo(obj);
            }else{
              this.setData({
                loginState: true // 控制弹框显示
              })
            }
          }
     })
  },
  onShowLogInfo(obj){
    app.wxRequest(
      'POST',
      '/auth/login', obj,
      (res) => {
          if( res.statusCode != 200){
            wx.showToast({ title: '服务器响应超时，请稍后再试', icon: 'error', duration: 2000 });
            wx.setStorageSync('loginSate', false)
            wx.setStorageSync('token', null)
           }else{
             console.log("res.data:"+ JSON.stringify(res.data))
             const obje = JSON.stringify(res.data)
            this.onShowLogTaken(obje);
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
  onShowLogTaken(resData){
      const { code, content } =  resData
            if(code==200){
                if(content){
                    const { token } =  JSON.stringify(content)
                    if(token){
                      wx.setStorageSync('loginSate', true)
                      wx.setStorageSync('token', token)
                    }else{
                      wx.setStorageSync('loginSate', false)
                      wx.setStorageSync('token', null)
                  }
              }else{
                wx.setStorageSync('loginSate', false)
                wx.setStorageSync('token', null)
              }
      }

  },

  onLoad(option){
    const{ registerStat } = option
    if(registerStat){
      setTimeout(() => {
          this.setData({
            loginState: false // 控制弹框显示
          })
      }, 1000);
    }
  
    
  },
  handleLoginSuccess(event) {
    if (event.detail.success) {
      this.setData({
        loginState: true // 关闭弹框
      });
      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });
    }
  },
  // 事件处理函数
  navigateToService(e) {
    const serviceName = e.currentTarget.dataset.service;
    wx.navigateTo({
      url: `/pages/${serviceName}/${serviceName}`
    });
  },
  navigateToPesonInfo(){

    wx.navigateTo({
      url: `/pages/register/register`,
    })
    // wx.navigateTo({
    //   url: `pages/profile/index"`,
    // })
  },

  navigateToQa(){
    wx.navigateTo({
      url: `/pages/index/index`,
    })
  },

});
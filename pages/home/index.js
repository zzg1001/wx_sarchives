const app = getApp();
Page({
  data: {
    showModal: false,
    loginState: true // 控制弹框显示
    // 页面数据
  },
  showPolicyModal() {
    console.log("用户服务协议和隐私政策 请阅读以下内容并选择同意或不同意")
    this.setData({ showModal: true });
  },
  handleAgree: function() {
    wx.setStorageSync('userAgreement', true);
    console.log('用户已同意');

    // 可以在这里添加登录逻辑或其他需要用户同意后才能进行的操作
  },
  handleDisagree() {
    console.log('用户拒绝');
    wx.setStorageSync('userAgreement', false);
    wx.showToast({
      title: '请先阅读并同意协议',
      icon: 'none'
    });
  },
  onShow() {
    const token = wx.getStorageSync('token')
    console.log("入口的token:"+token)
    app.verifyLogin('home')
    const userAgreement = wx.getStorageSync('userAgreement')
    if(!token){
      if(!userAgreement){
        this.showPolicyModal()
      }
     }
   
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
             const obje = res.data
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
      const { code, content,message } =  resData
      console.log(`onShowLogTaken:`+ JSON.stringify(resData))
            if(code==200){
                      const { token } =  content
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
                  wx.showToast({
                    title: "系统日志："+JSON.stringify(resData),
                    icon: 'none',
                    duration: 2000
                  });
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
    const { success } = event.detail;
    if (success) {
      this.setData({
        loginState: true // 关闭弹框
      });
      setTimeout(()=>{
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000
        });

      },3000)
      
    }
  },
  // 事件处理函数
  navigateToService(e) {
    const serviceName = e.currentTarget.dataset.service;
    wx.navigateTo({
      url: `/pages/${serviceName}/${serviceName}`
    });
  },
  // 调试到注册/查询页面
  navigateToPesonInfo(){
      const token = wx.getStorageSync('token')
        if(token){
          app.wxRequest(
            'GET',
            '/member/getMember', null,
            (res) => {
              const {code,message,content} = res.data
              console.log(`code,message,content${code}${message}${content}`)
              if(code == 200){
                if(content){
                wx.navigateTo({
                      url: `/pages/profile/index`,
                    })
                }else{
                 const userAgreement = wx.getStorageSync('userAgreement') 
                 if(!userAgreement){
                  this.showPolicyModal()
                 }else{
                  wx.navigateTo({
                    url: `/pages/register/register`,
                  })
                 }
                 
                }
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
        }else{
          wx.navigateTo({
            url: `/pages/register/register`,
          })
        }
  },

  navigateToQa(){
    wx.navigateTo({
      url: `/pages/index/index`,
    })
  },

});
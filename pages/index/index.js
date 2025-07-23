const app = getApp();
Page({
  data: {
    buttons: [
      { icon: '/static/images/1.png', text: '每天问答' },
      { icon: '/static/images/2.png', text: '排行榜' },
      { icon: '/static/images/3.png', text: '我的积分' },
      { icon: '/static/images/4.png', text: '我的支部' }
    ],
    tipText: '',
    nowSelect: null,
    nickName: null,
    openName: null,
    avatarUrl: null,
    loginSate: true,
    showLoadingFlag: false
  },

  onShow(){
    console.log(" =>onShow ")
    wx.login({
      success: (res) => {
        if (res.code) {
          const obj = { code: res.code }
          // 将用户信息和code发送到后端
          app.wxRequest('POST', '/auth/login', obj, (res) => {
            if( res.statusCode != 200){
              wx.setStorageSync('fail', true)
              return;
            }
            const { code, content } =  res.data
            const { token,groupName } = content
            if(code==200){
              if(token){
                  wx.setStorageSync('loginSate', true)
                  wx.setStorageSync('token', token)
                  if(groupName){
                    wx.setStorageSync('joinGroup', true)
                    wx.setStorageSync('groupName', groupName)
                  }else{
                    wx.setStorageSync('joinGroup', false)
                    wx.setStorageSync('groupName', null)
                  }
              }else{
                wx.setStorageSync('loginSate', false)
                wx.setStorageSync('token', null)
                wx.setStorageSync('joinGroup', false)
                wx.setStorageSync('groupName', null)
              }
            }
          },(err)=>{
            wx.setStorageSync('fail', true)
            setTimeout(()=>{
              wx.showToast({
                title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
                icon: 'none',
                duration: 2000
              })
            },1000);
          })
        }
      }
    });
  },
  onLoad(options) { 
    console.log(" =>onLoad ")
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    const{ registerStat } = options
    const that = this;
    console.log(registerStat)
    //是否注册

      wx.removeStorageSync("token")
  },
  chechAuth(url, index) {
    const joinGroup = wx.getStorageSync('joinGroup')
     if (!joinGroup) {
      this.setData({ tipText: '请选择支部', nowSelect: index })
    } else {
      wx.navigateTo({
        url: url
      });
    }
    setTimeout(() => { this.setData({ tipText: '', nowSelect: null }) }, 1000)
  },
  navigateToPage(event) {
    const that = this
    const index = event.currentTarget.dataset.index;
    const token = wx.getStorageSync('token')
    const joinGroup = wx.getStorageSync('joinGroup')
    if(!token){
      switch (index){
        case 0:
          that.answerPage();
          break;
          case 1:
            if(!joinGroup){
              this.setData({ tipText: '请选择支部', nowSelect: index })
              setTimeout(() => { this.setData({ tipText: '', nowSelect: null }) }, 1000)
              return;
               }
            break;
          case 2:
            if(!joinGroup){
              this.setData({ tipText: '请选择支部', nowSelect: index })
              setTimeout(() => { this.setData({ tipText: '', nowSelect: null }) }, 1000)
              return;
               }
              break;
           case 3:
                wx.navigateTo({
                  url: '/pages/signupPage/signupPage'
                });
                break;
      }
    }else{
      switch (index){
        case 0:
          if(!joinGroup){
            this.setData({ tipText: '请选择支部', nowSelect: index })
            setTimeout(() => { this.setData({ tipText: '', nowSelect: null }) }, 1000)
            return;
             }
            app.wxRequest("GET", "/qa/homeStatus", null, res => {
                            const { code, content } = res.data
                            switch (code) {
                              case 200:
                                if (content.code == 0) {
                                  that.answerPage();
                                } else { 
                                  this.setData({ tipText: content.message, nowSelect: index })
                                  setTimeout(() => { this.setData({ tipText: '', nowSelect: null }) }, 1000)
                                }
                                break;
                              case 401:
                                this.chechAuth('/pages/index/index', index)
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
               break;
          case 1:
            wx.navigateTo({
              url: '/pages/rankingPage/rankingPage'
            });
            break;
          case 2:
              wx.navigateTo({
                url: '/pages/myQuestions/myQuestions'
              });
              break;
           case 3:
                wx.navigateTo({
                  url: '/pages/signupPage/signupPage'
                });
                break;
      }
    }
  },

  // 答题页面
  answerPage(){
    console.log(" =>answerPage ")
    wx.navigateTo({
      url: '/pages/answer/answer'
    });
  },



  getName(e) {
     this.setData({ openName: e.detail.value })
  },
  getAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl })
  },
  onLogin() {

  
    const that = this;
    wx.login({
      success: (res) => {
        const { openName, avatarUrl } = that.data
        
        const nickName = openName
        console.log("nickName:"+nickName)
        if (res.code && nickName && avatarUrl) {
          const obj = {  nickName, avatarUrl, code: res.code }
          // 将用户信息和code发送到后端
          app.wxUploadFile('POST', '/auth/register', obj,avatarUrl, (res) => {
            const { code, content } = JSON.parse(res.data)
            console.log("code:"+code)
            switch (code) {
              case 200:
                const { token } = content
                wx.setStorageSync('loginSate', true)
                wx.setStorageSync('token', token)
                setTimeout(()=>{
                  wx.showToast({ title: '登录成功', icon: 'success', duration: 2000 });
                },1000)
                setTimeout(() => { 
                  that.setData({ loginSate: true }) 
                }, 2000)
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
              });
            },1000)
          })
        }else {
          wx.showToast({
            title: '用户信息获取失败：' + res.errMsg,
            icon: 'none',
            duration: 2000
          });
        }
      }
    });
  },

})
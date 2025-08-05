const app = getApp();
Page({
  data: {
    showModal: false,
    loginState: true ,// 控制弹框显示
    messages: [
      
    ],
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
     }else{
     this.setUserMassge()
     }
  },
  setUserMassge(){
      app.wxRequest(
            'GET',
            '/member/getMember', null,
            (res) => {
              const {code,message,content} = res.data
              console.log(`code,message,content${code}${message}${content}`)
              if(code == 200){
                if(content){
                const {verify} =  content
                if(verify == 'PENDING'){
                  const newmessage =  [...this.data.messages, "【通讯录】等待审批中..." ]
                    this.setData({
                      messages:newmessage
                    })
                  }else if(verify == 'REJECTED'){
                    const newmessage =  [...this.data.messages, "【通讯录】您已经被拒绝，可以联系相关人" ]
                    this.setData({
                      messages:newmessage
                    })
                  }else if(verify == 'PASSED'){
                    const newmessage =  [...this.data.messages, "【通讯录】恭喜您审核通，您可以使用啦！" ]
                    this.setData({
                      messages:newmessage
                    })
                  }
                  const newmessage =  [...this.data.messages,  "知识竞赛已经结束，现在可以自由答题啦！！" ]
                  this.setData({
                    messages:newmessage
                  })

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
                const {verify} =  content
                if(verify == 'PENDING'){
                  wx.navigateTo({
                    url:   `/pages/status/status`,
                  })
                }else if(verify == 'PASSED'){
                  wx.navigateTo({
                    url: `/pages/profile/index`,
                  })
                }else if(verify == 'REJECTED'){
                  wx.navigateTo({
                    url: `/pages/register/register`,
                  })
                }
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
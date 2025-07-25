const app = getApp();
Component({
  properties: {
    loginState: {
      type: Boolean,
      value: false // 默认值为 false
    }
  },
  data: {
    nickName: null,
    avatarUrl: null,
    openName: null
  },
  methods: {
    getName(e) {
      this.setData({
       openName: e.detail.value
      });
    },
    getAvatar(e) {
        this.setData({
          avatarUrl: e.detail.avatarUrl
        });
    },
    onLogin(){
      wx.removeStorageSync("token")
      const that = this;
      console.log("onLogin.....开始")
       wx.showLoading({ title: '正在请求授权' });
      const { openName, avatarUrl } = that.data
      const nickName = openName
      console.log( `nickName:${nickName} && avatarUrl:${avatarUrl}`)
      if(this.validateFields(nickName,avatarUrl)){
        const loginInfo = {  nickName, avatarUrl}
        this.loginApp(loginInfo)
      }else{
        wx.showToast({
          title: '登录都不能为空' ,
          icon: 'none',
          duration: 2000
        });
      }

    },

    //登录应用
    loginApp(loginInfo){
      wx.login({
        success: (result) => {
          const obj = {  ...loginInfo, code: result.code }
          console.log("avatarUrl:"+obj.avatarUrl)
          app.wxUploadFile('POST', '/auth/register', obj,obj.avatarUrl, (res) => {
            const { code, content } = JSON.parse(res.data)
            console.log(`code:${code}  content:${content}  appId:${result.code} `)
            switch (code) {
              case 200:
                const { token } = content
                wx.setStorageSync('loginState', true)
                wx.setStorageSync('token', token)
                const success = true; // 假设登录成功
                this.triggerEvent('loginSuccess', { success }); // 触发 loginSuccess 事件
            }
          },(err)=>
          {
                setTimeout(()=>{
                  wx.showToast({
                    title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
                    icon: 'none',
                    duration: 2000
                  });
                },1000)
          })
        }
      })
  },
  // 判断是否为null
  validateFields(openName,avatarUrl){
    return (openName && avatarUrl);
 }
  },


});
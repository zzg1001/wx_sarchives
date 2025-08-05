App({
  globalData: {
   url: 'https://wx.ike-data.com'
    //  url: 'http://172.16.10.135:8090'
    // url: 'http://47.100.100.139:8043',
    ,pkg:'register'
  },
  
  /**
* 封装wx.request请求
* method： 请求方式
* url: 请求地址
* data： 要传递的参数
* callback： 请求成功回调函数
* errFun： 请求失败回调函数
* token: token值
**/
  wxRequest(method, url, data, callback, errFun, token) {
    wx.request({
      url: this.globalData.url + url,
      method: method,
      data: data,
      header: {
        // application/x-www-form-urlencoded
        'content-type': 'application/json;charset=UTF-8',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      timeout: 10000, // 设置超时时间为10秒
      // dataType: 'json',
      success: function (res) {
        callback(res);
      },
      fail: function (err) {
        errFun(err);
      },
      complete() {
        wx.hideLoading();
      }
    })
  },
  wxUploadFile(method, url, data,tempFilePath, callback,reject) {
    wx.uploadFile({
      method: method,
      url: this.globalData.url + url,
      filePath: tempFilePath, // 要上传文件资源的路径
      name: 'file', 
      formData: data,
      header: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      timeout: 10000, // 设置超时时间为10秒
      success: function (res) {
        callback(res);
      },
      fail: function (err) {
        reject(err);
      },
      complete() {
        wx.hideLoading();
      }
    })
  },  
  verifyLogin(pg) {
    this.globalData.pkg=pg
    wx.login({
        success: (res) => {
           if(res.code){
               const obj = { code: res.code }
               this.onShowLogInfo(obj);
             }else{
               wx.showToast({
                 title: "系统异常请刷新后重试！",
                 icon: 'none',
                 duration: 2000
               });
             }
       }
   })
},
onShowLogInfo(obj){
this.wxRequest(
'POST',
'/auth/login', obj,
(res) => {
    if( res.statusCode != 200){
      wx.showToast({ title: '服务器响应超时，请稍后再试', icon: 'error', duration: 2000 });
     }else{
      this.onShowLogTaken(res.data);
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
            const { token,permissionList,verify } =  content
            if(token){
              console.log("获取token值："+token)
              wx.setStorageSync('loginSate', true)
              wx.setStorageSync('token', token)
              wx.setStorageSync('role', permissionList[0])
              wx.setStorageSync('userStatus', verify)
            }else{
              wx.setStorageSync('loginSate', false)
              wx.setStorageSync('token', null)
              wx.setStorageSync('role',null)
              wx.setStorageSync('userStatus', null)
              const pg = this.globalData.pkg
              if(pg == 'home'){
                 return;
              }else{
                 setTimeout(() => {
                        wx.navigateTo({
                          url: '/pages/home/index?registerStat=true'
                        });
                  }, 2000);
                }
              }
      }else{
       wx.setStorageSync('loginSate', false)
       wx.setStorageSync('token', null)
       wx.setStorageSync('userStatus', null)
         setTimeout(()=>{
           wx.showToast({
             title: '服务器响异常，请试！' ,
             icon: 'none',
             duration: 2000
           })
         },1000);
      }
},
})
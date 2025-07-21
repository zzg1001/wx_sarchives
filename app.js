App({
  globalData: {
   url: 'https://wx.ike-data.com'
    //  url: 'http://172.16.10.135:8090',
    // url: 'http://47.100.100.139:8043',
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
})
const app = getApp();
Page({
  data: {
    photo: '', // 默认证件照占位图
    orgList: [],            // 云端拉取的组织列表
    orgIndex: 0,           // 选中组织的索引
    orgIds:[],
    sexOptions: ['男', '女'], // 性别选项
    sexIndex: 0, // 默认选中第一个选项（"男"）
    form: {
      name: '',
      birth: '',
      gender:'',
      phone: '',
      officePhone: '',       // 单位号码
      email: '',             // 邮件
      branch: '',           // 选中的组织
      position:'',          // 盟内职务
      organization: '',     // 单位名称（可手填）
      title: '',            // 职务/职称（手填）
      skills: '',           // 特长
      hobbies: '',          // 兴趣爱好
      other: ''             //其他
    }
  },

    /* 生命周期：加载组织列表 */
  async onLoad(options) {
    this.setData({ orgList: '' });
    const modifyInfo = options.modifyInfo
    if(modifyInfo){
      this.mockMyInfo()
    }

},
mockMyInfo() {
  const token = wx.getStorageSync('token')
  if(token){
    app.wxRequest(
      'GET',
      '/member/getMember', null,
      (res) => {
        const {code,message,content} = res.data
        const form = content
        delete form.haveMember
        if(code == 200){
          this.setData({ form
            ,photo:form.photo
           });
           this.updateGroupList(form.branch)
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
  }
},

downloadPhoto: function() {
  const { photo } = this.data;
  wx.downloadFile({
    url: photo,
    success: (downloadRes) => {
      if (downloadRes.statusCode === 200) {
        this.setData({ photo: downloadRes.tempFilePath });
      } else {
        wx.showToast({
          title: '图片下载失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('下载失败', err);
      wx.showToast({
        title: '图片下载失败',
        icon: 'none'
      });
    }
  });
},
  onShow() {
    this.updateGroupList(null); // 获取组队列表
    const token = wx.getStorageSync('token')
    console.log("入口的token:"+token)
    app.verifyLogin('register')
  },

  /* 统一输入处理 */
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },
    /* 选择性别 */
  onSexChange(e){
    console.log( e.detail.value)
    const { value } = e.detail; // 获取用户选择的索引
    this.setData({
      sexIndex: value[0] // 更新 sexIndex
    });
    this.setData({ 'form.gender':e.detail.value});
  },
  /* 出生年月选择 */
  onDateChange(e) {
    this.setData({ 'form.birth': e.detail.value });
  },

  /* 组织选择 */
  onOrgChange(e) {
    const idx = e.detail.value;
    this.setData({
      orgIndex: idx,
      'form.branch': this.data.orgIds[idx]
    });
  },

  /* 上传证件照 */
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ photo: res.tempFiles[0].tempFilePath });
      }
    });
  },

  /* 保存草稿到本地 */
  saveDraft() {
    wx.setStorageSync('registerDraft', this.data);
    wx.showToast({ title: '已保存草稿', icon: 'success' });
  },

  /* 表单校验 */
  validate() {
    const { name, birth, phone,branch } = this.data.form;
    const { photo } = this.data
    if (!name|| !branch ||!birth || !/^1\d{10}$/.test(phone) ) {
      wx.showToast({ title: '请完善带 * 项正确填写', icon: 'none' });
      return false;
    }else if(!photo){
      wx.showToast({ title: '请上传头像', icon: 'none' });
      return false;
    }else{
      return true;
    }
   
  },

  /* 提交 */
  async submit() {
        this.downloadPhoto()
        if (this.validate()){
          const token =  wx.getStorageSync('token')
          if(token){
            this.uploadUserInfo();
          }
        }else if(!this.validate()){
          return;
        }
       
    },
    // 提交用户信息
    uploadUserInfo(){
         wx.login({
          success: (res) => {
           const code = res.code
           this.userInfo(code);
           }
         });
     
    },
    userInfo(code){
    this.setData({ 'form.gender':this.data.form.gender||0});
     const userInfo = {...this.data.form,code}
     const photo = this.data.photo;
     wx.showLoading({ title: '正在请求授权' });
     console.log("提交:"+JSON.stringify(photo)+" 头像："+JSON.stringify( userInfo))

      app.wxUploadFile('POST', '/member/edit', userInfo,photo, (res) => { 
       // 跳转到查看页面
       const data = JSON.parse(res.data)
        this.navigateToProfile(data)
      },
      (err)=>{
            wx.showToast({
              title: '服务器响应异常：' +  JSON.stringify(err),
              icon: 'none',
              duration: 2000
            })
            wx.hideLoading();
      })
      wx.hideLoading();
    },
    // 跳转到查看页面
   navigateToProfile(relus){
    const {code ,message} = relus
    if(code == 200){
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000
        });
    
      wx.navigateTo({
          url: `/pages/status/status`,
       })

     }else{
          setTimeout(()=>{
                wx.showToast({
                  title: JSON.stringify(message),
                  icon: 'none',
                  duration: 2000
                })
          },1000);
     }

   },
     // 获取组队列表
  updateGroupList: function (currIndex) {
    app.wxRequest("GET", "/ext/getGroupList", null, res => {
      const { code, message, content } = res.data;
      if (code === 200) {
        const group = content.filter(item =>item.id>=46)
        if(currIndex){
          const currgroup = content.filter(item =>item.id==currIndex)
          const groupId = [currIndex,...group.map(item =>item.id)];
          const groupName = [currgroup.map(item =>item.groupName)[0],...group.map(item =>item.groupName)];
          this.setData({
            orgList: groupName,
            orgIds:groupId,
            orgIndex: 0 // 设置默认索引
          });
        }else{
          const groupId = [0, ...group.map(item =>item.id)];
          const groupName = ["请选择", ...group.map(item =>item.groupName)];
              this.setData({
                orgList: groupName,
                orgIds:groupId,
                orgIndex: 0 // 设置默认索引
              });
         }
      } else {
              wx.showToast({ title: message || '加载失败', icon: 'none' });
            }
      },(err)=>{
      });
    },
});


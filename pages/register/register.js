const app = getApp();
Page({
  data: {
    avatarUrl: '/static/images/2.png', // 默认证件照占位图
    orgList: [],            // 云端拉取的组织列表
    orgIndex: -1,           // 选中组织的索引
    form: {
      name: '',
      birth: '',
      sex: '',
      phone: '',
      officePhone: '',
      email: '',
      company: '',          // 选中的组织
      companyName: '',      // 单位名称（可手填）
      title: '',            // 职务/职称（手填）
      skills: '',
      hobbies: '',
      other: ''
    }
  },

    /* 生命周期：加载组织列表 */
    async onLoad() {
      this.setData({ orgList: '' });
 
  },
  /* 生命周期：加载组织列表 */
  async onLoad() {
      this.setData({ orgList: '' });
 
  },
  onShow() {
   const token =  wx.getStorageSync('token')
   console.log(`注册页：onShow token ${token}`)
   if (!token) {
            wx.login({
              success: (res) => {
                if(res.code){
                  const obj = { code: res.code }
                  this.onShowLogInfo(obj);
                }else{
             
                }
              }
        })
   }
},
onShowLogInfo(obj){
 
  app.wxRequest(
    'POST',
    '/auth/login', obj,
    (res) => {
        if( res.statusCode != 200){
          wx.showToast({ title: '服务器响应超时，请稍后再试', icon: 'error', duration: 2000 });
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
                  setTimeout(() => {
                            wx.navigateTo({
                              url: '/pages/home/index?registerStat=true'
                            });
                       }, 1000);
                }
            }
          }else{
            setTimeout(() => {
                    wx.navigateTo({
                      url: '/pages/home/index?registerStat=true'
                    });
              }, 1000);
          }
},
  /* 统一输入处理 */
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
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
      'form.company': this.data.orgList[idx]
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
        this.setData({ avatarUrl: res.tempFiles[0].tempFilePath });
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
    const { name, birth, phone } = this.data.form;
    if (!name|| !birth || !/^1\d{10}$/.test(phone) ) {
      wx.showToast({ title: '请完善带 * 项正确填写', icon: 'none' });
      return false;
    }
    return true;
  },

  /* 提交 */
  async submit() {
    // if (!this.validate()) return;

      wx.navigateTo({
        url: `/pages/profile/index`,
      })
    }
});
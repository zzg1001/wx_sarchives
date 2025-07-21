// pages/register/register.js
Page({
  data: {
    avatarUrl: '/assets/id-placeholder.png', // 默认证件照占位图
    orgList: [],            // 云端拉取的组织列表
    orgIndex: -1,           // 选中组织的索引
    form: {
      name: '',
      birth: '',
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
    const { name, birth, phone, company } = this.data.form;
    if (!name || !birth || !/^1\d{10}$/.test(phone) || !company) {
      wx.showToast({ title: '请完善带 * 项', icon: 'none' });
      return false;
    }
    return true;
  },

  /* 提交 */
  async submit() {
    if (!this.validate()) return;
    wx.showLoading({ title: '提交中' });
    try {
      await wx.cloud.callFunction({
        name: 'submitRegister',
        data: {
          ...this.data.form,
          avatarUrl: this.data.avatarUrl,
          status: 'pending'  // 等待审批
        }
      });
      wx.hideLoading();
      wx.redirectTo({ url: '/pages/status/status' });
    } catch (e) {
      wx.hideLoading();
      wx.showToast({ title: '提交失败，请重试', icon: 'none' });
    }
  }
});
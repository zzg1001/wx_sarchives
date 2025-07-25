const app = getApp();

Page({
  data: {
    questions: [], // 问题列表
    selectItems: [], // 用户选择的答案
    isZoomed: false, // 是否处于放大状态
    lastScale: 1, // 上一次的缩放比例
    lastTouchX: 0, // 上一次触摸的 X 坐标
    lastTouchY: 0, // 上一次触摸的 Y 坐标
    touchCount: 0, // 触摸点的数量
    zoomedLastScale: 1, // 放大状态下的上一次缩放比例
    zoomedLastTouchX: 0, // 放大状态下的上一次触摸 X 坐标
    zoomedLastTouchY: 0, // 放大状态下的上一次触摸 Y 坐标
    submitText: '检查回答', // 初始按钮文本
    isSubmitted: false, // 是否已经提交
    isCheck: false,
    allowSelect:true
  },

  onLoad: function () {
    let data = {};
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    app.wxRequest('GET', '/ext/getQuestion', data, (res) => {
      const {
        code,
        message,
        content
      } = res.data;
      if (code === 200) {
        this.setData({
          questions: content
        });
      }
    }
    ,(err)=>{
        wx.setStorageSync('fail', true)
        wx.navigateTo({
          url: '/pages/index/index'
        });
 });

  },
onShow(){
  app.verifyLogin('answer')
  // const fail = wx.getStorageSync('fail');
  // if(fail){
  //   setTimeout(()=>{
  //     wx.showToast({
  //       title: '服务器响应超时，请稍后再试',
  //       icon: 'none',
  //       duration: 2000
  //     })
  //   },1000);
  //   return;
  // }

  // let data = {};
  // const token = wx.getStorageSync('token');
  // if (!token) {
  //   setTimeout(() => {
  //     wx.navigateTo({
  //       url: '/pages/index/index?registerStat=0'
  //     });
  //   }, 1000);
  // } else {
  //   app.wxRequest('GET', '/qa/getQuestion', data, (res) => {
  //     const {
  //       code,
  //       message,
  //       content
  //     } = res.data;
  //     if (code === 200) {
  //       const list = content.map(item => ({
  //         ...item,
  //         comp: parseInt(item.comp)
  //       }))
  //       this.setData({
  //         questions: list
  //       });
  //     }
  //   },(err)=>{
  //       setTimeout(()=>{
  //             wx.showToast({
  //               title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
  //               icon: 'none',
  //               duration: 2000
  //             })
  //           },1000);
  //    });
  // }



},
  submitAnswers() {
    const token = wx.getStorageSync('token');
    if (this.data.selectItems.length === this.data.questions.length) {
      if (!token) {
        setTimeout(() => {
          wx.showToast({
            title: "此功能需要注册",
            icon: 'none',
            duration: 1000
          });
          wx.navigateTo({
            url: '/pages/index/index?registerStat=0'
          });
        }, 3000);
      } else {
        //提交和检查
        this.submitData();
      }
    } else {
      wx.showToast({
        title: "请全部答完再提交",
        icon: 'none',
        duration: 2000
      });
    }
  },

  submitData() {

    const {
      isSubmitted,
      questions
    } = this.data;
    if (!isSubmitted) {
      console.log(isSubmitted)
      this.setData({
        submitText: '提交答案',
        isSubmitted: true,
        questions: questions.map(item => ({
          ...item,
          showMark: item.selectedOptionIndex != item.comp ? item.comp : undefined
        })),
        allowSelect: false
      });

    } else {
      let data = this.data.selectItems;
      app.wxRequest('POST', '/qa/answer', data, (res) => {
        const {
          code,
          message,
          content
        } = res.data;
        console.log(code)
        if (code === 200) {
          wx.navigateTo({
            url: '/pages/resultPage/resultPage',
            success: res => {
              res.eventChannel.emit('results', content);
            }
          });
        }
      },(err)=>{
        setTimeout(()=>{
          wx.showToast({
            title: '服务器响应超时，请稍后再试' +  JSON.stringify(err),
            icon: 'none',
            duration: 2000
          })
        },1000);
  });

    }
  },

  radioChange(e) {
    const questionIndex = e.currentTarget.dataset.index;
    const optionIndex = Number(e.detail.value);
    const questions = [...this.data.questions];
    questions[questionIndex].selectedOptionIndex = optionIndex;
    const newSelectItems = this.data.selectItems.filter(item => item.index !== questionIndex); 
     
      newSelectItems.push({
        index: questionIndex,
        id: questions[questionIndex].id,
        value: optionIndex
      });
  
    this.setData({
      questions,
      selectItems: newSelectItems
    });
  },

  zoomedRadioChange(e) {
    const questionIndex = e.currentTarget.dataset.index;
    const optionIndex = Number(e.detail.value);

    const questions = [...this.data.questions];
    questions[questionIndex].selectedOptionIndex = optionIndex;

   // **修复点：移除旧的选择**
  const newSelectItems = this.data.selectItems.filter(item => item.index !== questionIndex);
   
      newSelectItems.push({
        index: questionIndex,
        id: questions[questionIndex].id,
        value: optionIndex
      });

    this.setData({
      questions: questions,
      selectItems: newSelectItems
    });
  },

  touchStart(e) {
    const touch = e.touches[0];
    this.setData({
      lastTouchX: touch.pageX,
      lastTouchY: touch.pageY,
      touchCount: e.touches.length
    });
  },

  touchEnd(e) {
    const touch = e.changedTouches[0];
    const currentX = touch.pageX;
    const currentY = touch.pageY;
    const deltaX = currentX - this.data.lastTouchX;
    const deltaY = currentY - this.data.lastTouchY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const scale = distance / (this.data.lastScale || 1);

    if (this.data.touchCount === 2) {
      if (scale > 1.5) {
        this.setData({
          isZoomed: true
        }); // 放大
      }
    }

    this.setData({
      lastScale: scale,
      lastTouchX: currentX,
      lastTouchY: currentY
    });
  },

  zoomedTouchStart(e) {
    const touch = e.touches[0];
    this.setData({
      zoomedLastTouchX: touch.pageX,
      zoomedLastTouchY: touch.pageY,
      touchCount: e.touches.length
    });
  },

  zoomedTouchEnd(e) {
    const touch = e.changedTouches[0];
    const currentX = touch.pageX;
    const currentY = touch.pageY;
    const deltaX = currentX - this.data.zoomedLastTouchX;
    const deltaY = currentY - this.data.zoomedLastTouchY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const scale = distance / (this.data.zoomedLastScale || 1);

    if (this.data.touchCount === 2) {
      if (scale < 0.8) {
        this.setData({
          isZoomed: false
        }); // 缩小
      }
    }

    this.setData({
      zoomedLastScale: scale,
      zoomedLastTouchX: currentX,
      zoomedLastTouchY: currentY
    });
  },

  toggleZoom() {
    this.setData({
      isZoomed: !this.data.isZoomed
    });
  },

  onScroll(e) {
    // 滚动事件的处理逻辑
    console.log('滚动事件', e.detail.scrollTop);
  }
});
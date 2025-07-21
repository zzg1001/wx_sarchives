Page({
  data: {
    // results: [
    //   { question: 1, correct: 'C', yourAnswer: 'B', result: '✘' },
    //   { question: 2, correct: 'B', yourAnswer: 'B', result: '✔' },
    //   { question: 3, correct: 'C', yourAnswer: 'B', result: '✔' },
    //   { question: 4, correct: 'B', yourAnswer: 'A', result: '✔' },
    //   { question: 5, correct: 'D', yourAnswer: 'B', result: '✔' },
    //   { question: 6, correct: 'B', yourAnswer: 'D', result: '✔' },
    //   { question: 7, correct: 'C', yourAnswer: 'B', result: '✔' },
    //   { question: 8, correct: 'B', yourAnswer: 'C', result: '✔' },
    //   { question: 9, correct: 'D', yourAnswer: 'B', result: '✔' },
    //   { question: 10, correct: 'B', yourAnswer: 'B', result: '✔' },
    //   // ... 其他题目结果 ...
    // ],
    score: 0,
    results: []
  },
  goBack() {
    wx.navigateTo({
      url: '/pages/index/index'
    });
  },
  onLoad: function (options) {
    //	获取所有打开的EventChannel事件
    const eventChannel = this.getOpenerEventChannel();
    // 监听 index页面定义的 toB 事件
    eventChannel.on('results', (res) => {
      const { results, score } = res
      this.setData({ results, score })
    })
  },
  onUnload: function() {
    wx.navigateBack({
      delta: 0,
      success: function(){},
      fail: function(){},
    })
  }
})

// Page({
//   data: {},
//   onLoad: function () {
//     wx.request({
//       url: 'https://example.com/data', // 请求的URL
//       method: 'GET', // 请求方法，默认为GET
//       data: { key: 'value' }, // 请求参数
//       header: {
//         'content-type': 'application/json' // 默认值
//       },
//       success: res => {
//         console.log(res.data) // 请求成功后的处理
//       },
//       fail: err => {
//         console.error(err) // 请求失败后的处理
//       }
//     })
//   }
// })
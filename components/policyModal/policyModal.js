Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  data: {
    canAgree: false, // 默认按钮不可点击
    promptY:'上滑阅读',
    promtN:''
  },
  methods: {
    onScrollToBottom: function() {
      this.setData({ 
        canAgree: true,
        promptY:'同意',
        promtN:'不同意'

      });
    },
    agreePolicy: function() {
      this.triggerEvent('agree', {}, {});
      this.setData({ visible: false });
    },
    disagreePolicy: function() {
      this.triggerEvent('disagree', {}, {});
      this.setData({ visible: false });
    }
  }
});
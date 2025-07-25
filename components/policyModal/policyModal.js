Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  data: {
    canAgree: false, // 默认按钮不可点击
  },
  methods: {
    onScrollToBottom: function() {
      this.setData({ canAgree: true });
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
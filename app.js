//app.js
App({
  onLaunch: function () {
    var that = this

    var uid = wx.getStorageSync('uid') || ''
    if (uid == '') {
      wx.login({
        success: function (res) {
          wx.request({
            url: that.globalData.url + 'login.php',
            data: { code: res.code },
            success: function (res) {
              wx.setStorageSync('uid', res.data)
            }
          })
        }
      })
    }



   
  },
  globalData: {
    url:'https://***/wohuanicai/'
  }
})
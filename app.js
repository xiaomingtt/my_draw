//app.js
App({
  onLaunch: function () {
    var that = this
    //wx.removeStorageSync('uid')
    var uid = wx.getStorageSync('uid') || ''
    console.log(uid)
    if (uid == '') {
      wx.login({
        success: function (res) {
          wx.request({
            url: that.globalData.url + 'login.php',
            data: { code: res.code },
            success: function (res) {
              console.log(res.data)
              wx.setStorageSync('uid', res.data)
            }
          })
        }
      })
    }
  },
  globalData: {
    url:'https://kkk.gg/wohuanicai/'
  }
})
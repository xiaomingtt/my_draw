const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    current: 0,//当前所在滑块的 index
    newnum: 0,//最新作品向服务器取数据起始ID
    hotnum: 0,//最火作品向服务器取数据起始ID
    fennum: 0,//分享榜单向服务器取数据起始ID
    steplong: 10,//每次向服务器取数组长度
    modes: ['time', 'bofang', 'fenxiang'],
    newdata: [],
    hotdata: [],
    fendata: []
  },
  //tab切换
  tab: function (event) {
    console.log(event.target.dataset.current);
    this.setData({ current: event.target.dataset.current })
  },
  //滑动事件
  eventchange: function (event) {
    console.log(event.detail.current)
    this.setData({ current: event.detail.current })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var leng = that.data.steplong
    var s = that.data.modes
    that.getdata(s[0], 0, leng)
    setTimeout(function () {
      that.getdata(s[1], 0, leng)
    }, 500)
    setTimeout(function () {
      that.getdata(s[2], 0, leng)
    }, 500)

    that.setData({ newnum: leng, hotnum: leng, fennum: leng })

  },
  getdata: function (fenlei, startnum, num) {
    var that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    console.log(fenlei, startnum, num)
    wx.request({
      url: app.globalData.url + 'showlist.php',
      data: { fenlei: fenlei, startnum: startnum, num: num },
      success: function (res) {
        var z = res.data
        if (fenlei == 'time') {
          var zu = that.data.newdata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ newdata: zu })
          console.log(that.data.newdata)
        }
        if (fenlei == 'bofang') {
          var zu = that.data.hotdata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ hotdata: zu })
        }
        if (fenlei == 'fenxiang') {
          var zu = that.data.fendata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ fendata: zu })
        }
      },
      complete: function (res) {
        wx.hideLoading()
      }
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var a = this.data.current
    var s = this.data.modes
    var leng = this.data.steplong
    this.getdata(s[a], 0, leng)
    if (a == 0) {
      this.setData({ newnum: leng })
    }
    if (a == 1) {
      this.setData({ hotnum: leng })
    }
    if (a == 2) {
      this.setData({ fennum: leng })
    }
    wx.stopPullDownRefresh()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var a = this.data.current
    var s = this.data.modes
    var leng = this.data.steplong
    if (a == 0) {
      var num = this.data.newnum
      this.getdata(s[a], num, leng)
      num = num + leng
      this.setData({ newnum: num })
    }
    if (a == 1) {
      var num = this.data.hotnum
      this.getdata(s[a], num, leng)
      num = num + leng
      this.setData({ hotnum: num })
    }
    if (a == 2) {
      var num = this.data.fennum
      this.getdata(s[a], num, leng)
      num = num + leng
      this.setData({ fennum: num })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
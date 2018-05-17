const app = getApp()
var Dec = require('../../utils/aes-public.js');//引用封装好的加密解密js
var time = 0;
var touchDot = 0;//触摸时的原点
var interval = "";


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
    fendata: [],
    nending: false,
    hending: false,
    fending: false,
  },
  //tab切换
  tab: function (event) {
    console.log(event.target.dataset.current);
    this.setData({ current: event.target.dataset.current })
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
    var uid = wx.getStorageSync('uid') || ''
    uid = Dec.Decrypt(uid)
    wx.request({
      url: app.globalData.url + 'showlist.php',
      data: { fenlei: fenlei, startnum: startnum, num: num, uid: uid },
      success: function (res) {
        var z = res.data
        console.log(z)
        if (z.length == 0) {
          var end = true;
        } else {
          var end = false;
        }
        if (fenlei == 'time') {
          var zu = that.data.newdata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ newdata: zu, nending: end })
        }
        if (fenlei == 'bofang') {
          var zu = that.data.hotdata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ hotdata: zu, hending: end })
        }
        if (fenlei == 'fenxiang') {
          var zu = that.data.fendata
          for (var i = 0; i < z.length; i++) {
            zu.push(z[i])
          }
          that.setData({ fendata: zu, fending: end })
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
    time = 0;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(interval); // 清除setInterval
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(interval); // 清除setInterval
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
      this.setData({ newnum: leng, newdata: [], nending: false })
    }
    if (a == 1) {
      this.setData({ hotnum: leng, hotdata: [], hending: false })
    }
    if (a == 2) {
      this.setData({ fennum: leng, fendata: [], fending: false })
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

  },
  goShow: function (e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../show/show?id=' + id,
    })
  },
  // 触摸开始事件
  touchStart: function (e) {
    touchDot = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(function () {
      time++;
    }, 100);

  },
  // 触摸结束事件
  touchEnd: function (e) {
    var touchMove = e.changedTouches[0].pageX;
    console.log(touchMove - touchDot, time)
    var current = this.data.current
    // 向左滑动   
    if (touchMove - touchDot <= -100 && time < 50) {
      current++;
      if (current > 2) { current = 0 }
      this.setData({ current: current })
      //执行切换页面的方法
      console.log("向右滑动");

    }
    // 向右滑动   
    if (touchMove - touchDot >= 100 && time < 50) {
      current--;
      if (current < 0) { current = 2 }
      this.setData({ current: current })
      //执行切换页面的方法
      console.log("向左滑动");

    }
    clearInterval(interval); // 清除setInterval
    time = 0;
  }
})
var Dec = require('../../utils/aes-public.js');//引用封装好的加密解密js
const app = getApp()
var ctx = null
var canvasw = 318;//画布宽度
var canvash = 318;//画布高度
var dijibi = 0;//复原画作的时候，记录复原的是第几笔（0开始）
var dijidian = 0;//复原画作时，记录当前画笔的第几个点（0开始）
var caozuo = [];//记录所有绘图操作，用于复原图像
var ys1,ys2

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    tishi: '',
    zid: 0,
    img: '',
    canyurenshu:0,//参与人数
    bofangcishu:0,//播放此时
    fenxiangcishu:0,//分享次数
    weigui:0,//是否违规
    huida:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var id = options.id//作品ID
    var uid = wx.getStorageSync('uid') || ''
    uid = Dec.Decrypt(uid)
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    ctx = wx.createCanvasContext('canvas')
    wx.request({
      url: app.globalData.url + 'show.php',
      data: { id: id, uid: uid, user: "my" },
      success: function (res) {
        console.log(res.data)
        var shuzu=res.data.info
        that.setData({
          title: res.data.name,//作品名称
          tishi: res.data.tishi,
          zid: id,
          img: res.data.image,
          bofangcishu:res.data.bofang,
          fenxiangcishu:res.data.fenxiang,
          weigui:res.data.weigui,
          canyurenshu:shuzu.length,
          huida:shuzu
        })
        caozuo = res.data.step//绘图数据
        wx.hideLoading()
        that.redraw(res.data.step)
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  outer: function (e) {
    //每一笔
    if (dijibi < e.length) {
      var a = e[dijibi++];
      this.inner(a);
    } else {
      console.log("over")
    }
  },
  inner: function (e) {
    //每一笔中的每一点
    var that = this
    var se = e.color;
    var cu = e.width;
    var heng = e.x;
    var shu = e.y;
    var startx, starty, endx, endy
    if (dijidian < heng.length) {
      ys2=setTimeout(function () {
        if (dijidian == 0) {
          startx = heng[0]
          starty = shu[0]
          endx = heng[1]
          endy = shu[1]
        } else {
          startx = heng[dijidian - 1]//X起点
          starty = shu[dijidian - 1]//Y起点
          endx = heng[dijidian]
          endy = shu[dijidian]
        }
        if (se == 'clean') {
          ctx.globalCompositeOperation = "destination-out";
          se = "#ffffff";
        } else {
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.beginPath();
        ctx.setStrokeStyle(se);
        ctx.setLineWidth(cu);
        ctx.setLineJoin("round");
        ctx.setLineCap("round");
        ctx.moveTo(startx, starty);
        ctx.lineTo(endx, endy);
        ctx.closePath();
        ctx.stroke();
        ctx.draw(true);
        dijidian++;
        that.inner(e);
      }, 40)
    } else {
      //一笔画完后画下一笔
      dijidian = 0;
      ys1=setTimeout(function () {
        that.outer(caozuo);
      }, 500);
    }
  },

  redraw: function (options) {
    //重画，复原画作
    var data = options
    dijibi = 0
    dijidian = 0
    console.log(data)
    this.outer(data)
  }
})
var Dec = require('../../utils/aes-public.js');//引用封装好的加密解密js
const app = getApp()
var ctx = null
var canvasw = 318;//画布宽度
var canvash = 318;//画布高度
var dijibi = 0;//复原画作的时候，记录复原的是第几笔（0开始）
var dijidian = 0;//复原画作时，记录当前画笔的第几个点（0开始）
var caozuo = [];//记录所有绘图操作，用于复原图像
var dingshi//计时器
var yanshi
var keyizuoda = false//是否可以开始作答
var ys1, ys2//复原图像时的演示器
var zzid = ''//作者ID

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',//图画名称
    tishi: '',//图画提示
    titlelength: 0,//答案字数
    over: false,//图画复原是否完成
    t: 0,//答题用时
    jifen: 0,//用户当前积分
    stishi: false,//是否显示提示
    fxinfo: "请好友帮忙",//分享按钮的内容
    daan: "",//用户输入的答案内容
    istishi: false,//是否已经显示提示内容
    zid: 0,//作品ID
    zhengque: 0,//是否已经回答正确
    jilu: [],//回答记录
    showjb: false,//显示举报窗口
    items: [
      { name: 'seqing', value: '色情' },
      { name: 'weifa', value: '违法', checked: 'true' },
      { name: 'disu', value: '低俗' },
      { name: 'qinquan', value: '侵权' },
      { name: 'zhengzhi', value: '设政' },
      { name: 'qita', value: '其他' }
    ],
    jubao: 'weifa',//提交的违规类型
    img: ''//分享的图片地址
  },
  radioChange: function (e) {
    this.setData({ jubao: e.detail.value })
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
      data: { id: id, uid: uid, user: "ta" },
      success: function (res) {
        console.log(res.data)
        var n = res.data.name//作品名称
        var zq = res.data.istrue//是否正确作答
        var fx = zq == 1 ? "挑战好友" : "请好友帮忙"
        that.setData({
          title: n,
          tishi: res.data.tishi,
          jifen: res.data.jifen,
          titlelength: n.length,
          zid: id,
          zhengque: zq,
          jilu: res.data.jilu,
          fxinfo: fx,
          img: res.data.image
        })
        caozuo = res.data.step//绘图数据
        zzid = res.data.uid
        wx.hideLoading()
        ctx.setFontSize(100)
        ctx.setFillStyle("#ff0000")
        ctx.fillText('3', 130, 195)
        ctx.draw(false)
        yanshi = setTimeout(function () {
          ctx.setFillStyle("#ff0000")
          ctx.setFontSize(100)
          ctx.fillText('2', 130, 195)
          ctx.draw(false)
          yanshi = setTimeout(function () {
            ctx.setFillStyle("#ff0000")
            ctx.setFontSize(100)
            ctx.fillText('1', 130, 195)
            ctx.draw(false)
            yanshi = setTimeout(function () {
              ctx.setFillStyle("#ff0000")
              ctx.setFontSize(100)
              ctx.fillText('GO', 80, 195)
              ctx.draw(false)
              yanshi = setTimeout(function () {
                ctx.clearRect(0, 0, canvasw, canvash);
                ctx.draw(true);
                dingshi = setInterval(function () {
                  //计时
                  var a = that.data.t
                  a++
                  that.setData({ t: a })
                }, 1000)
                that.redraw(res.data.step)
              }, 500)
            }, 1000)
          }, 1000)
        }, 1000)
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
    clearInterval(dingshi)
    clearTimeout(yanshi)
    clearTimeout(ys1)
    clearTimeout(ys2)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(dingshi)
    clearTimeout(yanshi)
    clearTimeout(ys1)
    clearTimeout(ys2)
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
    var img = this.data.img//分享时显示的图片
    console.log(img)
    var id = this.data.zid//分享作品ID
    var uid = wx.getStorageSync('uid') || '123'//分享者ID 
    uid = Dec.Decrypt(uid)
    var zq = this.data.zhengque//是否已经回答正确
    if (zq == 1) {
      var msg = "这幅画画的啥？我一眼就看出来，不服来战！"
    } else {
      var msg = "谁来帮我看看，这幅画画的啥？"
    }
    return {
      title: msg,
      path: '/pages/show/show?id=' + id,
      imageUrl: img,
      success: function (res) {
        wx.request({
          url: app.globalData.url + 'share.php',
          data: {
            uid: uid,
            id: id
          },
          success: function (res) {
            console.log(res.data)
          }
        })
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  outer: function (e) {
    //每一笔
    if (dijibi < e.length) {
      var a = e[dijibi++];
      this.inner(a);
    } else {
      console.log("over")
      this.setData({ over: true })
      //clearInterval(dingshi)
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
      ys2 = setTimeout(function () {
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
      ys1 = setTimeout(function () {
        that.outer(caozuo);
      }, 500);
    }
  },

  redraw: function (options) {
    //重画，复原画作
    var data = options
    keyizuoda = true//可以开始答题
    dijibi = 0
    dijidian = 0
    console.log(data)
    this.outer(data)
  },
  showtishi: function (e) {
    //显示提示
    wx.showLoading({
      title: 'loading',
      mask: true
    })
    var uid = wx.getStorageSync('uid') || ''//用户ID
    uid = Dec.Decrypt(uid)
    if (uid == zzid) {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '自己的作品，还用猜吗？',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return;
          }
        }
      })
    } else {
      if (keyizuoda) {//可以答题
        var that = this
        if (that.data.istishi) { return }//已经显示提示
        var zq = that.data.zhengque
        if (zq == 1) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '本题您已正确作答',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                return;
              }
            }
          })
        } else {
          var j = that.data.jifen//当前积分
          if (j < 5) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '积分不足。您可以提交新作品或分享给朋友赚取积分。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  return;
                }
              }
            })
          } else {
            var uid = wx.getStorageSync('uid') || ''
            uid = Dec.Decrypt(uid)
            wx.request({
              url: app.globalData.url + 'chengejifen.php',
              data: { uid: uid, jifen: -5 },
              success: function (res) {
                if (res.data == 'ok') {
                  var jf = that.data.jifen
                  jf = Number(jf) - 5
                  that.setData({ stishi: true, jifen: jf, istishi: true })
                }
              },
              complete: function (res) {
                wx.hideLoading()
              }
            })
          }
        }
      }
    }
  },
  changedaan: function (e) {
    this.setData({ daan: e.detail.value })
  },
  jubao: function (e) {
    this.setData({ showjb: true })
  },
  Tijiao: function (e) {
    //提交答案
    wx.showLoading({
      title: 'loading',
      mask: true
    })
    var uid = wx.getStorageSync('uid') || ''//用户ID
    uid = Dec.Decrypt(uid)
    if (uid == zzid) {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '自己的作品，还用猜吗？',
        showCancel: false,
        success: function (res) {
          if (res.confirm) {
            return;
          }
        }
      })
    } else {
      if (keyizuoda) {
        var that = this
        var zq = that.data.zhengque
        console.log(zq)
        if (zq == 1) {
          wx.hideLoading()
          wx.showModal({
            title: '提示',
            content: '本题您已正确作答',
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                return;
              }
            }
          })
        } else {
          var daan = that.data.daan//当前答案
          var id = that.data.zid //作品ID
          var ts = that.data.istishi//是否查看提示
          var sj = that.data.t//当前答题时间 
          var answer = that.data.title//正确答案
          var jieshu = that.data.over//是否绘图完毕，未完毕积分*2
          var j = that.data.jifen//当前积分
          if (j < 2) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: '积分不足。您可以提交新作品或分享给朋友赚取积分。',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  return;
                }
              }
            })
          } else {
            if (daan == '') {
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '请输入您的答案',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    return;
                  }
                }
              })
            } else {
              if (daan == answer) {
                //回答正确
                if (!jieshu) { var jf = 8; } else { var jf = 3; }
                var istrue = 1//是否回答正确
                var msg = "回答正确"
                var fx = "挑战好友"
                clearInterval(dingshi)
              } else {
                //回答错误,直接减去2分，后台记录回答数据
                var jf = -2;
                var istrue = 0//是否回答正确
                var msg = "回答错误"
                var fx = "请好友帮忙"
              }
              wx.request({
                url: app.globalData.url + 'huida.php',
                data: {
                  zid: id,
                  uid: uid,
                  ists: ts,
                  sj: sj,
                  istrue: istrue,
                  jf: jf,
                  da: daan
                },
                success: function (res) {
                  if (res.data == 'ok') {
                    wx.showToast({
                      title: msg,
                      icon: 'success'
                    })
                    j = Number(j) + Number(jf)
                    that.setData({ jifen: j, zhengque: istrue, fxinfo: fx })
                  }
                },
                complete: function (res) {
                  wx.hideLoading()
                }
              })
            }
          }
        }
      }
    }
  },
  qdjubao: function (e) {
    //举报
    var jb = this.data.jubao
    this.setData({
      showjb: false
    })
    var uid = wx.getStorageSync('uid') || ''
    uid = Dec.Decrypt(uid)
    var zid = this.data.zid
    wx.request({
      url: app.globalData.url + 'jubao.php',
      data: {
        zid: zid,
        uid: uid,
        jb: jb
      },
      success: function (res) {
        var msg
        if (res.data == 'ok') {
          msg = "举报成功"
        } else if (res.data == 'yjb') {
          msg = "已被举报"
        } else {
          msg = "举报失败"
        }
        wx.showToast({
          title: msg,
          icon: 'success'
        })
      }
    })

  },
  gotolist: function (e) {
    wx.switchTab({
      url: '../list/list'
    })
  }
})
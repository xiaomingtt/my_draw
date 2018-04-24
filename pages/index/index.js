var ctx = null
var isButtonDown = false;//是否在绘制中
var arrx = [];//动作横坐标
var arry = [];//动作纵坐标
var canvasw = 0;//画布宽度
var canvash = 0;//画布高度
var dijibi = 0;//复原画作的时候，记录复原的是第几笔（0开始）
var dijidian = 0;//复原画作时，记录当前画笔的第几个点（0开始）
var caozuo = [];//记录所有绘图操作，用于复原图像
var isclean = false;//是否为清除状态（橡皮）
var shengcheng = false;//是否正在生成图像、分享等操作，期间禁止绘画
const app = getApp()

Page({
  /**
 * 页面的初始数据
 */
  data: {
    showcolor: false,//显示调色板
    canvasimgsrc: "",//canvas生成的图片路径
    colors: ["#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#ff7f27", "#cccccc", "#666666", "#33ffff"],
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    shuzu: [],//绘画所有线路
    secai: "#000000",//画笔颜色
    r: 0,
    g: 0,
    b: 0,
    cuxi: 5,//画笔的粗细
    xuanzhongcolor: 0,//标记当前画笔颜色
    tit: '',//输入的物品名
    ti: '',//提示信息
    pid: 0,//图像上传后的ID，用于分享标识图片
    shareimage: '',//分享页面显示的图片
    jinshare: true,//禁用分享按钮，只有生成以后才能分享
    isdraw: true//正在绘画，显示生成按钮
  },

  //事件监听
  canvasIdErrorCallback: function (e) {
    //当发生错误时触发 error 事件
    console.error(e.detail.errMsg)
  },
  canvasStart: function (event) {

    arrx = []
    arry = []
    if (!shengcheng) { isButtonDown = true; }
    //手指触摸动作开始
    arrx.push(event.changedTouches[0].x);
    arry.push(event.changedTouches[0].y);
    this.setData({
      startX: event.touches[0].x,
      startY: event.touches[0].y,
      endX: event.touches[0].x,
      endY: event.touches[0].y
    })

  },
  canvasMove: function (event) {

    var x = event.changedTouches[0].x
    var y = event.changedTouches[0].y
    if (isButtonDown) {
      arrx.push(x);
      arry.push(y);
      if (isclean) {
        //橡皮
        ctx.globalCompositeOperation = "destination-out";
      } else {
        ctx.globalCompositeOperation = "source-over"
      }
      ctx.beginPath();
      ctx.setStrokeStyle(this.data.secai)
      ctx.setLineWidth(this.data.cuxi)
      ctx.setLineJoin("round");
      ctx.setLineCap("round");
      ctx.moveTo(this.data.endX, this.data.endY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
      ctx.draw(true);
      this.setData({
        endX: x,
        endY: y
      })
      /*
      //橡皮，清除
      //注释代码为清除圆形区域，由于手指移动过程取点较少，造成清除不连续，故不使用此方法，使用下面的清除“线”的方法
      ctx.globalCompositeOperation = "destination-out";//清除相交部分，保留其余部分
      //ctx.globalCompositeOperation = "destination-in";//只保留相交部分，清除其他部分
      var r = this.data.cuxi
      r = r / 2
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over"//使用完后务必将globalCompositeOperation还原为默认值source-over，该值表示正常绘制

      ctx.draw(true)
      */
    }
  },
  canvasEnd: function (event) {
    //手指触摸动作结束(手指触摸动作被打断，如来电提醒，弹窗)
    isButtonDown = false;
    if (arrx.length > 1 && arry.length > 1) {
      var a = this.data.shuzu
      if (isclean) {
        var ys = "clean"
      } else {
        var ys = this.data.secai
      }
      a.push({
        color: ys,
        width: this.data.cuxi,
        x: arrx,
        y: arry
      })
      console.log(a)
      this.setData({ shuzu: a })//操作记录添加到数组
    }
  },
  //清除画布
  cleardraw: function () {
    //清除画布
    arrx = [];
    arry = [];
    dijibi = 0;
    dijidian = 0;
    this.setData({
      shuzu: []
    })
    ctx.clearRect(0, 0, canvasw, canvash);
    ctx.draw(true);
  },
  //提交内容
  setSign: function () {
    var that = this;
    caozuo = that.data.shuzu//画图记录数组
    var title = that.data.tit
    var tishi = that.data.ti
    if (title == '' || tishi == '') {
      wx.showModal({
        title: '提示',
        content: '请输入名称和提示',
        showCancel: false
      });
      return false;
    }
    if (caozuo.length == 0) {
      wx.showModal({
        title: '提示',
        content: '再画几笔呗',
        showCancel: false
      });
      return false;
    };
    //生成图片
    shengcheng = true//禁止画图
    wx.showLoading({ title: "生成中，请稍后!" });
    wx.canvasToTempFilePath({
      //生成原始图像，用于上传和插入分享图片中
      canvasId: 'canvas',
      destWidth: canvasw / 2,
      destHeight: canvash / 2,
      quality: 0.6,
      fileType: "png",
      success: function (res) {
        var tempimgpath = res.tempFilePath
        console.log(tempimgpath, 'canvas图片地址');

        var uid = wx.getStorageSync('uid') || '123'//用户标识
        wx.uploadFile({
          //上传生成的图像
          url: app.globalData.url + 'upload.php',
          filePath: tempimgpath,
          name: 'image',
          formData: {
            uid: uid,//用户标识
            title: title,//图像名称
            tishi: tishi,//提示信息
            buzhou: JSON.stringify(caozuo)//操作步骤（Json对象转json字符串）
          },
          success: function (res) {
            if (res.data != 'no') {
              //上传成功，返回记录ID
              var photoid = res.data

              that.cleardraw();//清空画板
              //将底图和原始图片draw到canvas
              ctx.drawImage('../../images/bg.jpg', 0, 0, canvasw, canvash)
              ctx.drawImage(tempimgpath, canvasw * 0.220, canvash * 0.28, canvasw * 0.556, canvash * 0.52)
              ctx.draw(true)
              setTimeout(function () {
                console.log('绘制完成')
                wx.canvasToTempFilePath({
                  //保存分享图片到临时文件
                  canvasId: 'canvas',
                  destWidth: canvasw,
                  destHeight: canvash,
                  success: function (res) {
                    var shareimg = res.tempFilePath//分享页面图片
                    console.log(shareimg, '分享页面图片')
                    that.setData({
                      canvasimgsrc: tempimgpath,//原始图画生成的图片
                      pid: photoid,//画作ID
                      shareimage: shareimg,//分享页面显示的图片
                      jinshare: false,//启用分享按钮
                      isdraw: false//图像生成完毕，显示再来一局按钮就
                    })
                    that.cleardraw();//清空画板
                    wx.hideLoading();
                    that.redraw(caozuo);//还原绘画过程
                  },
                  fail: function (res) {
                    console.log(res)
                  }
                })
              }, 500)
            }
          }
        })
      },
      fail: function () {
        console.log("canvas不可以生成图片")
        wx.showModal({
          title: '提示',
          content: '微信当前版本不支持，请更新到最新版本！',
          showCancel: false
        });
      },
      complete: function () {

      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //画布初始化执行
    //获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        canvasw = res.windowWidth * 0.995;//设备宽度
        canvash = res.windowHeight * 0.6;
      }
    });
    ctx = wx.createCanvasContext('canvas')

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //移除画布内容
    //this.cleardraw();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var img = this.data.shareimage
    console.log(img)
    var id = this.data.pid
    return {
      title: '看看我的大作，谁知道我画的啥？',
      path: '/pages/user/user?id=123',
      imageUrl: img,
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },


  checkcolor: function (e) {
    //选择颜色
    var yanse = this.data.colors
    var id = e.currentTarget.dataset.id
    if (id == '999') {
      this.setData({
        showcolor: true,
        xuanzhongcolor: '999'
      })
    } else {
      var q = yanse[id]
      var hong = q.substr(1, 2)
      var lv = q.substr(3, 2)
      var lan = q.substr(-2)
      hong = parseInt(hong, 16)//十六进制转十进制
      lv = parseInt(lv, 16)
      lan = parseInt(lan, 16)
      this.setData({
        secai: q,
        r: hong,
        g: lv,
        b: lan,
        xuanzhongcolor: id
      })
    }
    isclean = false


  },
  slider4change: function (e) {
    //画笔粗细
    this.setData({
      cuxi: e.detail.value
    })
  },
  xiangpi: function (e) {
    //橡皮
    this.setData({ xuanzhongcolor: "888" })
    isclean = true
  },
  slider4co: function (e) {
    //拖动滑块设置颜色
    var ys = e.currentTarget.dataset.color
    var zhi = e.detail.value
    if (ys == "red") {
      this.setData({ r: zhi })
    }
    if (ys == "green") {
      this.setData({ g: zhi })
    }
    if (ys == "blue") {
      this.setData({ b: zhi })
    }
    var h = this.data.r
    var l = this.data.g
    var n = this.data.b
    h = "00" + h.toString(16)//十进制转十六进制
    l = "00" + l.toString(16)
    n = "00" + n.toString(16)
    var se = "#" + h.substr(-2) + l.substr(-2) + n.substr(-2)
    this.setData({ secai: se })
  },
  closecolor: function (e) {
    //关闭自定义颜色
    this.setData({ showcolor: false })
  },
  outer: function (e) {
    //每一笔
    if (dijibi < e.length) {
      var a = e[dijibi++];
      this.inner(a);
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
      setTimeout(function () {
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
      setTimeout(function () {
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
    /*
//通过绘图记录复原图像，无延时效果，直接完全复原
redraw: function (options) {
  var data = options
  for (var i = 0; i < data.length; i++) {
    var se = data[i].color//颜色
    var cu = data[i].width//线宽
    var x = data[i].x//X集合
    var y = data[i].y//Y集合
    var startx = x[0]//X起点
    var starty = y[0]//Y起点
    for (var j = 1; j < x.length; j++) {
      var endx = x[j]
      var endy = y[j]
      ctx.beginPath();
      ctx.setStrokeStyle(se)
      ctx.setLineWidth(cu)
      ctx.setLineJoin("round");
      ctx.setLineCap("round");
      ctx.moveTo(startx, starty);
      ctx.lineTo(endx, endy);
      ctx.closePath();
      ctx.stroke();
      ctx.draw(true);
      startx = endx
      starty = endy
    }
  }
}
*/
  },

  inputtitle: function (e) {
    //物品名
    this.setData({ tit: e.detail.value })
  },
  inputtishi: function (e) {
    //提示信息
    this.setData({ ti: e.detail.value })
  },
  newdraw: function (e) {
    //重新开始一副新作，初始化各种变量
    this.cleardraw();//清空画板
    isButtonDown = false;//是否在绘制中
    caozuo = [];//记录所有绘图操作，用于复原图像
    isclean = false;//是否为清除状态（橡皮）
    shengcheng = false;//是否正在生成图像、分享等操作，期间禁止绘画
    this.setData({

      showcolor: false,//显示调色板
      canvasimgsrc: "",//canvas生成的图片路径
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      shuzu: [],//绘画所有线路
      secai: "#000000",//画笔颜色
      r: 0,
      g: 0,
      b: 0,
      cuxi: 5,//画笔的粗细
      xuanzhongcolor: 0,//标记当前画笔颜色
      tit: '',//输入的物品名
      ti: '',//提示信息
      pid: 0,//图像上传后的ID，用于分享标识图片
      shareimage: '',//分享页面显示的图片
      jinshare: true,//禁用分享按钮，只有生成以后才能分享
      isdraw: true//正在绘画，显示生成按钮



    })

  }




})

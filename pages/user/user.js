var Dec = require('../../utils/aes-public.js');//引用封装好的加密解密js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    islogin: false,
    username: '',
    userface: '',
    jifen: 0,
    current: -1,
    myzuopin: [],
    myanswer: [],
    myshare: [],
    myjubao: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    var uid = wx.getStorageSync('uid') || ''
    uid = Dec.Decrypt(uid)
    wx.request({
      url: app.globalData.url + 'islogin.php',
      data: { uid: uid },
      success: function (res) {
        console.log(res.data)
        that.setData({
          islogin: res.data.status,
          username: res.data.name,
          userface: res.data.face,
          jifen: res.data.jifen
        })
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
    var that = this
    var uid = wx.getStorageSync('uid') || ''
    uid = Dec.Decrypt(uid)
    wx.request({
      url: app.globalData.url + 'showmyzuopin.php',
      data: { uid: uid },
      success: function (res) {
        that.setData({ myzuopin: res.data })
      }
    })
    wx.request({
      url: app.globalData.url + 'showmyhuida.php',
      data: { uid: uid },
      success: function (res) {
        console.log(res.data)
        that.setData({ myanswer: res.data })
      }
    })
    wx.request({
      url: app.globalData.url + 'showmyfenxiang.php',
      data: { uid: uid },
      success: function (res) {
        console.log(res.data)
        that.setData({ myshare: res.data })
      }
    })
    wx.request({
      url: app.globalData.url + 'showmyjubao.php',
      data: { uid: uid },
      success: function (res) {
        console.log(res.data)
        that.setData({ myjubao: res.data })
      }
    })
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

  getuserinfo: function (e) {
    var that = this
    console.log(e)
    if (e.detail.errMsg == 'getUserInfo:ok') {
      var face = e.detail.userInfo.avatarUrl
      var name = e.detail.userInfo.nickName
      var city = e.detail.userInfo.city + "_" + e.detail.userInfo.province + "_" + e.detail.userInfo.country
      var xing = e.detail.userInfo.gender
      var uid = wx.getStorageSync('uid') || ''
      uid = Dec.Decrypt(uid)
      wx.request({
        url: app.globalData.url + 'uploaduser.php',
        data: {
          uid: uid,
          name: name,
          face: face,
          city: city,
          xing: xing
        },
        success: function (res) {
          console.log(res.data)
          if (res.data != 'no') {
            that.setData({
              islogin: true,
              username: name,
              userface: face,
              jifen: res.data
            })
          }
        }
      })
    }
  },
  showuserinfo: function (e) {
    var id = e.currentTarget.dataset.id
    var current = this.data.current
    if (current == id) {
      id = -1
    }
    this.setData({
      current: id
    })
  },
  bindzp: function (e) {
    wx.navigateTo({
      url: '../myshow/myshow?id=' + e.currentTarget.dataset.id
    })
  },
  bindhd: function (e) {
    wx.navigateTo({
      url: '../show/show?id=' + e.currentTarget.dataset.id
    })
  },
  bindfx: function (e) {
    wx.navigateTo({
      url: '../show/show?id=' + e.currentTarget.dataset.id
    })
  }
})
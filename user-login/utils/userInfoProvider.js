const STATICMETHODS = {
  printF(something, type) {
    // 是否打印
    if (!this.showConsole) return;
    !type && (type = 'log')
    console[type](something)
  },
  initF(config) {
    Object.keys(config).map(key => {
      this[key] = config[key]
    })
  },
  getWxUserInfoF(e, cb) {
    // 返回用户授权状态以及用户信息
    const userInfo = e.detail
    const access = !!e.detail.rawData
    ;access && this.printF('getWxUserInfo->success')
    ;!access && this.printF('getWxUserInfo->fail->userPermissionDeny', 'error')
    return cb(access, userInfo)
  },
  wxLoginF(wxUser, cb) {
    wx.login({
      success: (res) => {
        this.printF('wx.login->success')
        this.requestSsoUserInfoF(wxUser, res.code, cb)
      },
      fail: (res) => {
        this.printF('wx.login->fail', 'error')
        this.wxLoginF(wxUser)
      }
    })
  },
  getSsoUserInfoF(wxUser, cb) {
    this.wxLoginF(wxUser, cb)
  },
  requestSsoUserInfoF(wxUser, code, cb) {
    // 不能在这里进行retry，因为请求所用到的encrypted和iv, 不能通过wx.getUserInfo获取了
    // 所以如果获取用户信息失败，必须得让用户再次点击授权按钮
    wx.request({
      url: this.getSsoUserInfoRequestUrl, // 这里填写后台登录url
      method: 'POST',
      header: {
        'encrypted': wxUser.encryptedData,
        'iv': wxUser.iv
      },
      dataType: 'json',
      data: {
        code,
        ghId: this.ghId
      },
      fail: (res) => {
        this.printF('getSsoUserInfo->fail->retry', 'error')
        // STATICMETHODS.getSsoUserInfoF(wxUser, cb)
      },
      success: (res) => {
        this.printF('getSsoUserInfo->success')
        cb(res.data.data)
      }
    })
  }
}

const userInfoProvider = Object.create(STATICMETHODS)
userInfoProvider.init = function (config) {
  this.initF(config)
}
userInfoProvider.getWxUserInfo = function (e, cb) {
  this.getWxUserInfoF(e, cb)
}
userInfoProvider.getSsoUserInfo = function (wxUser, cb) {
  this.getSsoUserInfoF(wxUser, cb)
}

// 初始化provider
userInfoProvider.init({
  showConsole: true,
  getSsoUserInfoRequestUrl: 'http://freegate.ingress.98.cn/api/wechat-ngkx/userInfo/commonLogin',
  ghId: 'gh_2cbf553cda71'
})



module.exports = userInfoProvider
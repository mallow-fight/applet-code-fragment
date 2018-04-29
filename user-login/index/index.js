const userInfoProvider = require('../utils/userInfoProvider')
const app = getApp()
Page({
  data: {
    authPage: false
  },
  getUserInfo(e) {
    userInfoProvider.getWxUserInfo(e, (access, wxUserInfo) => {
      // 如果已经获取到用户信息，不用再次获取
      if(app.globalData.wxUser && app.globalData.ssoUser) return;
      // 如果拿到用户信息，储存至globalData，请求sso，储存ssoUser至globalData
      ;access &&
        (app.globalData.wxUser = wxUserInfo) &&
          userInfoProvider.getSsoUserInfo(wxUserInfo, ssoUserInfo => {
            app.globalData.ssoUser = ssoUserInfo
            console.log('app.globalData->', app.globalData)
          })
      // 用户拒绝，显示授权界面
      ;!access &&
        !this.authPage && this.setData({authPage: true})
    })
  }
})

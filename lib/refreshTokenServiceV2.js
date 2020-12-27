const { postRequest } = require('./request');
require('dotenv').config();
global.atob = require('atob');

class RefreshTokenServiceV2 {
  constructor(lazyGogoroAuthRepository) {
    this.lazyGogoroAuthRepository = lazyGogoroAuthRepository;
  }

  parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(''),
    );
    return JSON.parse(jsonPayload);
  }

  checkTokenExpireNearly(token) {
    const tokenJson = this.parseJwt(token);
    const tokenExpTime = new Date(tokenJson.exp * 1000);
    const diffTimeNow = (new Date() - tokenExpTime) / 60000;
    console.log(`tokenExpTime: ${tokenExpTime}`);
    console.log(`diffTime: ${diffTimeNow}`);
    if (Math.abs(diffTimeNow) <= 15 || Math.abs(diffTimeNow) >= 59) {
      return true;
    } else {
      return false;
    }
  }

  async refreshToken() {
    console.log(`${new Date()} - Refreshing token...`);
    let auth = await this.lazyGogoroAuthRepository.getAuthorization();
    let refreshToken = await this.lazyGogoroAuthRepository.getRefreshToken();

    if (this.checkTokenExpireNearly(auth) === false) {
      console.log(`${new Date()} - Do not need to refresh token.`)
      return auth;
    }

    const formData = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      uuid: process.env.RefreshTokenUUID,
    };

    const resp = await postRequest({
      url: 'https://auth.ridegoshareapi.com/oauth/token',
      auth: {
        user: process.env.UserId,
        pass: process.env.Password,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        authority: 'auth.ridegoshareapi.com',
      },
      form: formData,
      json: true,
    });

    if (
      resp.statusCode === 200 &&
      resp.body.access_token &&
      resp.body.refresh_token
    ) {
      console.log(resp.body);
      auth = resp.body.access_token;
      refreshToken = resp.body.refresh_token;
      await this.lazyGogoroAuthRepository.updateAuthorization(auth);
      await this.lazyGogoroAuthRepository.updateRefreshToken(refreshToken);
      console.log(`${new Date()} - Refresh token Success.`);
      return auth;
    } else {
      console.log(resp.body);
      throw `${new Date()} - refreshToken fail.`;
    }
  }
}

module.exports = {
  RefreshTokenServiceV2,
};

const { postRequest } = require('./request');
require('dotenv').config();
global.atob = require('atob');

class RefreshTokenService {
  constructor(lazyGogoroRepository) {
    this.lazyGogoroRepository = lazyGogoroRepository;
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

  async refreshToken(refreshToken) {
    console.log(`${new Date()} - Refreshing token...`);
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

    if (resp.statusCode === 200) {
      console.log(resp.body);
      const authorization = resp.body.access_token;
      const refreshToken = resp.body.refresh_token;
      await this.lazyGogoroRepository.updateAuthorization(authorization);
      await this.lazyGogoroRepository.updateRefreshToken(refreshToken);
      console.log(`${new Date()} - Refresh token complete.`);
      const result = {
        Authorization: authorization,
        RefreshToken: refreshToken,
      };
      return result;
    } else {
      throw `${new Date} - refreshToken fail.`;
    }
  }
}

module.exports = {
  RefreshTokenService,
};

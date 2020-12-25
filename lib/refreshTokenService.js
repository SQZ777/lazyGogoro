const { postRequest } = require('./request');
require('dotenv').config();

class RefreshTokenService {
  constructor(lazyGogoroService) {
    this.lazyGogoroService = lazyGogoroService;
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

  async refreshToken(currentRefreshToken) {
    const formData = {
      grant_type: 'refresh_token',
      refresh_token: currentRefreshToken,
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
      const currentAuthorization = resp.body.access_token;
      const currentRefreshToken = resp.body.refresh_token;
      await lazyGogoroService.updateAuthorization(currentAuthorization);
      await lazyGogoroService.updateRefreshToken(currentRefreshToken);
      return {
        Authorization: currentAuthorization,
        RefreshToken: currentRefreshToken,
      };
    } else {
      console.log('refresh token fail.');
      console.log(`status code: ${resp.statusCode}`);
      console.log(resp.body);
      return null;
    }
  }
}

module.exports = {
  RefreshTokenService,
};

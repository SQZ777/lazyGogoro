class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService, lazyGogoroRepository) {
    this.orderScooterService = orderScooterService;
    this.refreshTokenService = refreshTokenService;
    this.lazyGogoroRepository = lazyGogoroRepository;
  }

  checkTokenExpireNearly(token) {
    const tokenJson = this.refreshTokenService.parseJwt(token);
    const tokenExpTime = new Date(tokenJson.exp * 1000);
    const diffTimeNow = (new Date() - tokenExpTime) / 60000;
    console.log(`tokenExpTime: ${tokenExpTime}`);
    console.log(`diffTime: ${diffTimeNow}`);
    if (Math.abs(diffTimeNow) <= 15) {
      return true;
    } else {
      return false;
    }
  }

  checkRefreshTokenResult(refreshTokenResult) {
    if (refreshTokenResult === null || refreshTokenResult === undefined) {
      throw 'refreshToken fail.';
    } else {
      return refreshTokenResult.Authorization;
    }
  }

  async run(scooterId) {
    let authorization = await this.lazyGogoroRepository.getAuthorization();
    if (this.checkTokenExpireNearly(authorization) === true) {
      console.log('refreshing token');
      let refreshToken = await this.lazyGogoroRepository.getRefreshToken();
      let refreshTokenResult = await this.refreshTokenService.refreshToken(
        refreshToken,
      );
      authorization = this.checkRefreshTokenResult(refreshTokenResult);
    }

    const orderId = await this.orderScooterService.orderScooter(authorization, scooterId);
    if (orderId !== 'no run') {
      console.log(`${new Date()} - Order complete, then waiting.`);
      await new Promise((resolve) => setTimeout(resolve, 474000));
      console.log(`${new Date()} - Wait complete, canceling order`);
      await this.orderScooterService.cancelScooter(orderId);
      console.log(`${new Date()} - Cancel complete.`);
    } else {
      const refreshTokenResult = await this.refreshTokenService.refreshToken(
        refreshToken,
        );
      authorization = this.checkRefreshTokenResult(refreshTokenResult);
      await this.orderScooterService.cancelScooter(authorization, orderId);
    }
  }
}

module.exports = {
  LazyGogoroService,
}
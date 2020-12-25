class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService, lazyGogoroRepository) {
    this.orderScooterService = orderScooterService;
    this.refreshTokenService = refreshTokenService;
    this.lazyGogoroRepository = lazyGogoroRepository;
  }

  checkTokenExpireNearly(token) {
    const tokenJson = parseJwt(token);
    const tokenExpTime = new Date(tokenJson.exp * 1000);
    const diffTimeNow = (new Date() - tokenExpTime) / 60000;
    if (Math.abs(diffTimeNow) >= 45) {
      return true;
    } else {
      return false;
    }
  }

  checkRefreshTokenResult(refreshTokenResult) {
    if (refreshTokenResult === null) {
      throw 'refreshToken fail.';
    } else {
      return refreshToken.Authorization;
    }
  }

  async run(scooterId) {
    const authorization = await this.lazyGogoroRepository.getAuthorization();
    if (this.checkTokenExpireNearly(authorization) === true) {
      console.log('refreshing token');
      const refreshToken = await this.lazyGogoroRepository.getRefreshToken();
      const refreshTokenResult = await this.refreshTokenService.refreshToken(
        refreshToken,
      );
      authorization = this.checkRefreshTokenResult(refreshTokenResult);
    }

    const orderId = await this.orderScooterService.orderScooter(scooterId);
    if (orderId !== 'no run') {
      console.log(`${new Date()} - Order complete, then waiting.`);
      await new Promise((resolve) => setTimeout(resolve, 560000));
      console.log(`${new Date()} - Wait complete, canceling order`);
      await this.orderScooterService.cancelScooter(orderId);
      console.log(`${new Date()} - Cancel complete.`);
    } else {
      const refreshTokenResult = await this.refreshTokenService.refreshToken(
        refreshToken,
        );
      authorization = this.checkRefreshTokenResult(refreshTokenResult);
      await this.orderScooterService.cancelScooter(orderId);
    }
  }
}

module.exports = {
  LazyGogoroService,
}
class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService, lazyGogoroAuthRepository) {
    this.orderScooterService = orderScooterService;
    this.refreshTokenService = refreshTokenService;
    this.lazyGogoroAuthRepository = lazyGogoroAuthRepository;
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

  async run(scooterId) {
    let authorization = await this.lazyGogoroAuthRepository.getAuthorization();
    if (this.checkTokenExpireNearly(authorization) === true) {
      console.log('refreshing token');
      let refreshToken = await this.lazyGogoroAuthRepository.getRefreshToken();
      await this.refreshTokenService.refreshToken(
        refreshToken,
      );
      authorization = await this.lazyGogoroAuthRepository.getAuthorization();
    }

    const orderId = await this.orderScooterService.orderScooter(authorization, scooterId);
    if (orderId !== 'no run') {
      console.log(`${new Date()} - Order complete, then waiting.`);
      await new Promise((resolve) => setTimeout(resolve, 474000));
      console.log(`${new Date()} - Wait complete, canceling order`);
      await this.orderScooterService.cancelScooter(authorization, orderId);
      console.log(`${new Date()} - Cancel complete.`);
    } else {
      let refreshToken = await this.lazyGogoroAuthRepository.getRefreshToken();
      await this.refreshTokenService.refreshToken(
        refreshToken,
        );
      authorization = await this.lazyGogoroAuthRepository.getAuthorization();
      await this.orderScooterService.cancelScooter(authorization, orderId);
    }
  }
}

module.exports = {
  LazyGogoroService,
}
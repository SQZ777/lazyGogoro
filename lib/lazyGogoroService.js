class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService, lazyGogoroAuthRepository, plateRepository) {
    this.orderScooterService = orderScooterService;
    this.refreshTokenService = refreshTokenService;
    this.lazyGogoroAuthRepository = lazyGogoroAuthRepository;
    this.plateRepository = plateRepository;
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

  async run(scooterPlate) {
    let authorization = await this.refreshTokenService.refreshToken();
    const scooterInfo = await this.plateRepository.getScooterInfo(scooterPlate);
    if (scooterInfo.ScooterId === null) {
      throw `Can not find ${scooterPlate} in mongoDB`;
    }
    const orderId = await this.orderScooterService.orderScooter(authorization, scooterInfo.ScooterId);
    if (orderId !== 'no run') {
      console.log(`${new Date()} - Order complete, then waiting.`);
      await new Promise((resolve) => setTimeout(resolve, 474000));
      console.log(`${new Date()} - Wait complete, canceling order`);
      await this.orderScooterService.cancelScooter(authorization, orderId);
      console.log(`${new Date()} - Cancel complete.`);
    } else {
      authorization = await this.refreshTokenService.refreshToken();
      await this.orderScooterService.cancelScooter(authorization, orderId);
    }
  }
}

module.exports = {
  LazyGogoroService,
}
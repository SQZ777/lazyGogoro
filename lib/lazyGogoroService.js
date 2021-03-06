class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService, plateRepository) {
    this.orderScooterService = orderScooterService;
    this.refreshTokenService = refreshTokenService;
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
    const orderId = await this.orderScooterService.orderScooter(
      authorization,
      scooterInfo.ScooterId,
    );

    console.log(`${new Date()} - Order complete, then waiting.`);
    await new Promise((resolve) => setTimeout(resolve, 490000));
    console.log(`${new Date()} - Wait complete, canceling order`);
    await this.orderScooterService.cancelScooter(authorization, orderId);
    console.log(`${new Date()} - Cancele order complete`);
  }
}

module.exports = {
  LazyGogoroService,
};

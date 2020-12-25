class LazyGogoroService {
  constructor(orderScooterService, refreshTokenService) {
      this.orderScooterService = orderScooterService;
      this.refreshTokenService = refreshTokenService;
  }

  async run(scooterId) {
    console.log('I am ordering');
    const orderId = await this.orderScooterService.orderScooter(scooterId);
    console.log(`orderId: ${orderId}`);
    if (orderId !== 'no run') {
      console.log('Order complete');
      console.log('I am waiting...');
      await new Promise((resolve) => setTimeout(resolve, 475000));
      console.log('Wait complete, canceling order');
      await this.orderScooterService.cancelScooter(orderId);
      console.log('Cancel complete.');
    } else {
      console.log('need to refresh token');
      await this.refreshTokenService.refreshToken();
    }
  }
}

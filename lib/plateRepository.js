class PlateRepository {
    constructor(gogoroPlatesCollection) {
      this.gogoroPlatesCollection = gogoroPlatesCollection;
    }

    async getScooterInfo(plate) {
      const queryData = await this.gogoroPlatesCollection.findOneData({
        Plate: plate,
      });
      return queryData;
    }

    async createPlate(scooterInfo) {
      const queryData = await this.gogoroPlatesCollection.insertData(scooterInfo);
      return queryData.insertedCount;
    }
  }
  
  module.exports = {
    PlateRepository,
  };

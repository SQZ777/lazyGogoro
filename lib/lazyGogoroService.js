class LazyGogoroService {
    constructor(mongoCollection) {
      this.mongoCollection = mongoCollection;
    }

    async getAuthorization() {
      const queryData = await this.mongoCollection.findOneData({
        Id: 1,
      });
      return queryData.Authorization;
    }

    async getRefreshToken() {
        const queryData = await this.mongoCollection.findOneData({
          Id: 1,
        });
        return queryData.RefreshToken;
      }
  
    async updateAuthorization(authorization) {
      const queryData = await this.mongoCollection.updateData(
        {
          Id: 1,
        },
        {
          $set: {
            Authorization: authorization,
          },
        },
      );
      return queryData;
    }

    async updateRefreshToken(refreshToken) {
        const queryData = await this.mongoCollection.updateData(
          {
            Id: 1,
          },
          {
            $set: {
              RefreshToken: refreshToken,
            },
          },
        );
        return queryData;
      }
  }
  
  module.exports = {
    LazyGogoroService,
  };
  
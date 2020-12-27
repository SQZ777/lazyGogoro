class LazyGogoroAuthRepository {
  constructor(mongoCollection) {
    this.mongoCollection = mongoCollection;
  }

  async getCursor() {
    const queryData = await this.mongoCollection.findOneData({
      Id: 1,
    });
    return queryData.Cursor;
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

  async updateCursor(cursor) {
    const queryData = await this.mongoCollection.updateData(
      {
        Id: 1,
      },
      {
        $set: {
          Cursor: cursor,
        },
      },
    );
    return queryData;
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
  LazyGogoroAuthRepository,
};

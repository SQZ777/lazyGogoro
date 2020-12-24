require('dotenv').config();

class MongoDbBase {
  constructor(mongodbClient, collectionName, dbName = 'discord') {
    this.collection = mongodbClient.db(dbName).collection(collectionName);
  }

  async closeDB() {
    await this.client.close();
    console.log('closeDB success');
  }

  async find(data) {
    const queryData = await this.collection.find(data).toArray();
    await console.log('qerry success');
    return queryData;
  }

  async findOneData(data) {
    const queryData = await this.collection.findOne(data);
    await console.log('qerry success');
    return queryData;
  }

  async insertData(data) {
    const result = await this.collection.insertOne(data);
    await console.log('Insert data sucess');
    return result;
  }

  async deleteData(data) {
    await this.collection.deleteOne(data);
    await console.log('Delete data sucess');
  }

  async updateData(query, data) {
    const result = await this.collection.updateOne(query, data);
    await console.log('Update data sucess');
    return result;
  }
}

module.exports = {
  MongoDbBase,
};

require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MongoDbBase } = require('./lib/mongodbBase');
const { OrderScooterService } = require('./lib/orderScooterService');
const { LazyGogoroRepository } = require('./lib/lazyGogoroRepository');
const { RefreshTokenService } = require('./lib/refreshTokenService');
const { LazyGogoroService } = require('./lib/lazyGogoroService');

async function connectToMongodb() {
  const client = await MongoClient.connect(process.env.mongoHost, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).catch((err) => {
    console.log(`something went wrong: ${err}`);
    throw err;
  });
  console.log('connect success.');
  return client;
}

const client = await connectToMongodb();
const lazyGogoroCollection = new MongoDbBase(client, 'lazyGogoro');
const orderScooterService = new OrderScooterService();
const refreshTokenService = new RefreshTokenService(lazyGogoroRepository);
const lazyGogoroRepository = new LazyGogoroRepository(lazyGogoroCollection);
const lazyGogoroService = new LazyGogoroService(
  orderScooterService,
  refreshTokenService,
  lazyGogoroRepository,
);

const orderScooterId = proccess.env.ScooterId

await lazyGogoroService.run(orderScooterId)

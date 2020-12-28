require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MongoDbBase } = require('./lib/mongodbBase');
const { OrderScooterService } = require('./lib/orderScooterService');
const { LazyGogoroAuthRepository } = require('./lib/lazyGogoroAuthRepository');
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

let client;


async function init() {
  client = await connectToMongodb();
  await run();
}

async function run() {
  const lazyGogoroCollection = new MongoDbBase(client, 'lazyGogoro');
  const orderScooterService = new OrderScooterService();
  const lazyGogoroAuthRepository = new LazyGogoroAuthRepository(lazyGogoroCollection);
  const refreshTokenService = new RefreshTokenService(lazyGogoroAuthRepository);
  const lazyGogoroService = new LazyGogoroService(
    orderScooterService,
    refreshTokenService,
    lazyGogoroAuthRepository,
  );

  const orderScooterId = process.env.ScooterId;

  await lazyGogoroService.run(orderScooterId);
}

init();
// TODO: let interval become timeout, then it can be control by "times".
// TODO2: timeout complete, then make a terminate machanism.
setInterval(async () => { 
  run();
}, 480000);

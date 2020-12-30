require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MongoDbBase } = require('./lib/mongodbBase');
const { OrderScooterService } = require('./lib/orderScooterService');
const { LazyGogoroRepository } = require('./lib/lazyGogoroRepository');
const { RefreshTokenServiceV2 } = require('./lib/refreshTokenServiceV2');
const { LazyGogoroService } = require('./lib/lazyGogoroService');
const { PlateRepository } = require('./lib/plateRepository');

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
const orderScooterPlate = process.env.ScooterPlate;


async function init() {
  client = await connectToMongodb();
  await run(orderScooterPlate);
}

async function run(orderScooterPlate) {
  const lazyGogoroCollection = new MongoDbBase(client, 'lazyGogoro');
  const gogoroScooterInfoCollection = new MongoDbBase(client, 'gogoroScooterInfo');
  const orderScooterService = new OrderScooterService();
  const lazyGogoroRepository = new LazyGogoroRepository(lazyGogoroCollection);
  const refreshTokenService = new RefreshTokenServiceV2(lazyGogoroRepository);
  const plateRepository = new PlateRepository(gogoroScooterInfoCollection);

  const lazyGogoroService = new LazyGogoroService(
    orderScooterService,
    refreshTokenService,
    plateRepository,
  );

  await lazyGogoroService.run(orderScooterPlate);
}

init();
// TODO: let interval become timeout, then it can be control by "times".
// TODO2: timeout complete, then make a terminate machanism.
// Make lazyGogoroOrders
const lazyGogoroInterval = setInterval(async () => { 
  run(orderScooterPlate);
}, 480000);

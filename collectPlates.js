require('dotenv').config();
const { MongoClient } = require('mongodb');

const { MongoDbBase } = require('./lib/mongodbBase');
const { LazyGogoroAuthRepository } = require('./lib/lazyGogoroAuthRepository');
const { RefreshTokenService } = require('./lib/refreshTokenService');
const { RefreshTokenServiceV2 } = require('./lib/refreshTokenServiceV2');
const { PlateRepository } = require('./lib/plateRepository');
const { PlateService } = require('./lib/plateService');

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

async function createPlate(scooterInfo, plateRepository) {
  const plate = scooterInfo.Plate;
  const queryResult = await plateRepository.getScooterInfo(plate);
  if (queryResult === null) {
    await plateRepository.createPlate(scooterInfo);
    console.log(`${new Date} - ${plate} is created.`);
  } else {
    console.log(`${new Date} - ${plate} is exist.`);
  }
}

let client;
async function init(){
  client = await connectToMongodb();
  await run();
}

async function run() {
  const lazyGogoroCollection = new MongoDbBase(client, 'lazyGogoro');
  const lazyGogoroAuthRepository = new LazyGogoroAuthRepository(
    lazyGogoroCollection,
  );
  const refreshTokenService = new RefreshTokenServiceV2(lazyGogoroAuthRepository);
  const gogoroPlatesCollection = new MongoDbBase(client, 'gogoroScooterInfo');
  const plateRepository = new PlateRepository(gogoroPlatesCollection);
  const plateService = new PlateService();

  const auth = await refreshTokenService.refreshToken();

  let cursor = await lazyGogoroAuthRepository.getCursor();
  const result = await plateService.collectPlates(auth, cursor);
  await lazyGogoroAuthRepository.updateCursor(result.cursor);
  result.scooters.map(async (scooter)=>{
    const info = {
      ScooterId: scooter.id,
      Plate: scooter.plate,
    };
    await createPlate(info, plateRepository);
  });
}

init();
setInterval(async () => {
  run();
}, 61000);

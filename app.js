const { patchRequest, postRequest } = require('./lib/request');
const { LazyGogoroAuthRepository } = require('./lib/lazyGogoroAuthRepository');
const { RefreshTokenService } = require('./lib/refreshTokenService');

require('dotenv').config();
global.atob = require('atob');

const { MongoClient } = require('mongodb');
const { MongoDbBase } = require('./lib/mongodbBase');

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

let runFlag = true;
let client;
let lazyGogoroCollection;
let lazyGogoroAuthRepository;
let currentAuthorization;
let currentRefreshToken;

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

function checkTokenExpireNearly(token) {
  const tokenJson = parseJwt(token);
  const tokenExpTime = new Date(tokenJson.exp * 1000);
  const diffTimeNow = (new Date() - tokenExpTime) / 60000;
  if (Math.abs(diffTimeNow) >= 56) {
    return true;
  } else {
    return false;
  }
}

async function refreshToken() {
  const refreshTokenService = new RefreshTokenService(lazyGogoroAuthRepository);
  const refreshTokenResult = await refreshTokenService.refreshToken(
    currentRefreshToken,
  );
  if (refreshTokenResult !== null) {
    currentAuthorization = refreshTokenResult.Authorization;
    currentRefreshToken = refreshTokenResult.RefreshToken;
    runFlag = true;
    return true;
  } else {
    runFlag = false;
    return false;
  }
}

async function init() {
  client = await connectToMongodb();
  lazyGogoroCollection = new MongoDbBase(client, 'lazyGogoro');
  lazyGogoroAuthRepository = new LazyGogoroAuthRepository(lazyGogoroCollection);

  currentRefreshToken = await LazyGogoroAuthRepository.getRefreshToken();
  currentAuthorization = await LazyGogoroAuthRepository.getAuthorization();
  console.log(currentRefreshToken);
  console.log(currentAuthorization);
  if (checkTokenExpireNearly(currentAuthorization) === true) {
    console.log('need to refresh');
    await refreshToken();
  } else {
    console.log('no need to refresh');
  }
  await run();
}

async function cancelScooter(orderId) {
  requestBody = {
    action: 0,
  };

  const resp = await patchRequest({
    url: `https://rental.ridegoshareapi.com/v2.1/rentals/${orderId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentAuthorization}`,
    },
    body: requestBody,
    json: true,
  });

  console.log(resp.body);
}

async function orderScooter(scooterId) {
  requestBody = {
    scooter_id: scooterId,
    corporate_type: 0,
    source: 0,
  };

  const resp = await postRequest({
    url: 'https://rental.ridegoshareapi.com/v2.1/rentals',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${currentAuthorization}`,
      'user-agent': 'GoShare/2.6.10 (iPhone; iOS 14.0; Scale/2.00)',
    },
    body: requestBody,
    json: true,
  });
  console.log(resp.body);
  if (resp.body.id) {
    return resp.body.id;
  }
  runFlag = false;
  return 'no run';
}

async function run() {
  console.log('I am ordering');
  const orderId = await orderScooter(process.env.ScooterId);
  console.log(`orderId: ${orderId}`);
  if (orderId !== 'no run') {
    console.log('Order complete');
    console.log('I am waiting...');
    await new Promise((resolve) => setTimeout(resolve, 475000));
    console.log('Wait complete, canceling order');
    await cancelScooter(orderId);
    console.log('Cancel complete.');
  } else {
    console.log('need to refresh token');
    await refreshToken();
  }
}

init();
setInterval(async () => {
  if (runFlag === true) {
    run();
  }
  console.log(`runFlag: ${runFlag}`);
}, 481000);

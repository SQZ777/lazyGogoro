const { patchRequest, postRequest } = require('./lib/request');
require('dotenv').config();

async function cancelScooter(orderId) {
  requestBody = {
    action: 0,
  };

  const resp = await patchRequest({
    url: `https://rental.ridegoshareapi.com/v2.1/rentals/${orderId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: process.env.Authorization,
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
      Authorization: process.env.Authorization,
    },
    body: requestBody,
    json: true,
  });
  console.log(resp.body);
  console.log(resp.body.id);
  return resp.body.id;
}

async function run() {
  console.log('I am ordering');
  const orderId = await orderScooter(process.env.ScooterId);
  console.log('Order complete');
  console.log('I am waiting...');
  await new Promise((resolve) => setTimeout(resolve, 549000));
  console.log('Wait complete, canceling order');
  await cancelScooter(orderId);
  console.log('Cancel complete.');
}

run();
setInterval(async () => {
  run();
}, 550000);
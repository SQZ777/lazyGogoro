const { patchRequest, postRequest } = require('./lib/request');
class OrderScooterService {
  async cancelScooter(orderId) {
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
    if (resp.body.id) {
      return resp.body.id;
    }
    return 'no run';
  }

  async orderScooter(scooterId) {
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
}

module.exports = {
  OrderScooterService
};

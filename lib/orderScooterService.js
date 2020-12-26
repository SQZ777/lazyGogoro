const { patchRequest, postRequest } = require('./request');
class OrderScooterService {
  async cancelScooter(token, orderId) {
    const requestBody = {
      action: 0,
    };

    const resp = await patchRequest({
      url: `https://rental.ridegoshareapi.com/v2.1/rentals/${orderId}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: requestBody,
      json: true,
    });
    console.log(`Bearer ${token}`);
    console.log(resp.body);
    if (resp.body.id) {
      return resp.body.id;
    }
    return 'no run';
  }

  async orderScooter(token, scooterId) {
    const requestBody = {
      scooter_id: scooterId,
      corporate_type: 0,
      source: 0,
    };

    const resp = await postRequest({
      url: 'https://rental.ridegoshareapi.com/v2.1/rentals',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'user-agent': 'GoShare/2.6.10 (iPhone; iOS 14.0; Scale/2.00)',
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
}

module.exports = {
  OrderScooterService
};

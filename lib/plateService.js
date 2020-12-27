const { getRequest } = require('./request');

class PlateService {
  async collectPlates(token, cursorContent) {
    console.log(cursorContent);
    const resp = await getRequest({
      url: `https://rental.ridegoshareapi.com/v2/cities/514f2d1d-9faf-490b-b9b2-fe8ce4dce584/scooters?cursor=${cursorContent}`,
      headers: {
        'user-agent': 'GoShare/2.6.10 (iPhone; iOS 14.0; Scale/2.00)',
        Authorization: `Bearer ${token}`,
      },
      json: true,
    });
    const result = {
      cursor: resp.body.cursor,
      scooters: resp.body.upsert_lst,
    };
    console.log(resp.body);
    return result;
  }
}

module.exports = {
  PlateService,
};
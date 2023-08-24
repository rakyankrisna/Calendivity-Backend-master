/* eslint-disable require-jsdoc */
const {db} = require('../../firestore');
const axios = require('axios');

const getAllPlacesByGroupMembersPositionHandler = async (request, h) => {
  try {
    const {groupId} = request.params;
    const userIds = request.query.userIds.split(',');

    // check should have at least two users
    if (userIds.length < 2) {
      const response = h.response({
        message: 'should have at least two users',
      });
      response.code(400);
      return response;
    }

    const membershipsRef = await db.collection('memberships');
    for (const userId of userIds) {
      const membershipsSnap = await membershipsRef
        .where('userId', '==', userId)
        .where('groupId', '==', groupId)
        .get();
      if (membershipsSnap.empty) {
        const response = h.response({
          message: 'all users must be a members of this group',
        });
        response.code(400);
        return response;
      }
    }

    const userLocations = [];
    const usersRef = db.collection('users');
    for (const userId of userIds) {
      const usersSnap = await usersRef.doc(userId).get();
      userLocations.push(usersSnap.data().position);
    }

    let sumLatRadians = 0;
    let sumLonRadians = 0;

    // Convert to radians and sum up the coordinates
    for (const location of userLocations) {
      const latRad = location._latitude * (Math.PI / 180);
      const lonRad = location._longitude * (Math.PI / 180);
      sumLatRadians += latRad;
      sumLonRadians += lonRad;
    }

    // Midpoint calculation
    const midLatRadians = sumLatRadians / userLocations.length;
    const midLonRadians = sumLonRadians / userLocations.length;

    // Conversion back to degrees
    const midpointLatitude = midLatRadians * (180 / Math.PI);
    const midpointLongitude = midLonRadians * (180 / Math.PI);

    // google place api query
    const {radius = 1000, keyword = 'meeting room'} = request.query;

    // Execute axios and return user events array
    const placeRes = await axios.get(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${midpointLatitude}%2C${midpointLongitude}&radius=${radius}&keyword=${keyword}&key=${process.env.MAPS_API_KEY}`,
    );

    const places = [];
    for (const place of placeRes.data.results) {
      places.push({
        name_plus_code: `${place.name}, ${place.plus_code.compound_code}`,
        ...place,
      });
    }

    const response = h.response({
      data: places,
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getPlace = async (request, h) => {
  try {
    const {placeId, placeNamePlusCode} = request.query;

    if (!placeId && !placeNamePlusCode) {
      const response = h.response({
        message: 'bad request',
      });
      response.code(400);
      return response;
    }

    if (placeId && placeNamePlusCode) {
      const response = h.response({
        message: 'use one of placeId or placeNamePlusCode',
      });
      response.code(400);
      return response;
    }

    let placeNamePlusCodeId = '';
    if (placeNamePlusCode) {
      const placeNamePlusCodeRes = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${placeNamePlusCode}&radius=1000&key=${process.env.MAPS_API_KEY}`,
      );
      placeNamePlusCodeId = placeNamePlusCodeRes.data.predictions[0].place_id;
    }

    // get place by place_id from google place api
    const placeRes = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${
        placeId || placeNamePlusCodeId
      }&key=${process.env.MAPS_API_KEY}`,
    );

    // check if place not found
    if (placeRes.data.status === 'INVALID_REQUEST') {
      const response = h.response({
        message: 'place not found',
      });
      response.code(404);
      return response;
    }

    const place = placeRes.data.result;
    const response = h.response({
      data: {
        name_plus_code: `${place.name}, ${place.plus_code.compound_code}`,
        ...place,
      },
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  getAllPlacesByGroupMembersPositionHandler,
  getPlace,
};

const {verifyGoogle, verifyGroup} = require('../middleware');
const {
  getAllPlacesByGroupMembersPositionHandler,
  getPlace,
} = require('../handlers/placeHandler');

const placeRoute = [
  {
    method: 'GET',
    path: '/groups/{groupId}/places',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getAllPlacesByGroupMembersPositionHandler,
    },
  },
  {
    method: 'GET',
    path: '/place',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getPlace,
    },
  },
];

module.exports = placeRoute;

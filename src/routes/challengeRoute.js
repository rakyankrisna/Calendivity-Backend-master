const {verifyGoogle} = require('../middleware');
const {
  createChallengeHandler,
  getAllChallengesHandler,
  getChallengeHandler,
  updateChallengeHandler,
  deleteChallengeHandler,
} = require('../handlers/challengeHandler');

const challengeRoute = [
  {
    method: 'POST',
    path: '/challenges',
    options: {
      pre: [{method: verifyGoogle}],
      handler: createChallengeHandler,
    },
  },
  {
    method: 'GET',
    path: '/challenges',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getAllChallengesHandler,
    },
  },
  {
    method: 'GET',
    path: '/challenges/{challengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getChallengeHandler,
    },
  },
  {
    method: 'PUT',
    path: '/challenges/{challengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: updateChallengeHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/challenges/{challengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: deleteChallengeHandler,
    },
  },
];

module.exports = challengeRoute;

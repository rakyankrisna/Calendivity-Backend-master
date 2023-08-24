const {verifyGoogle} = require('../middleware');
const {
  createUserChallenge,
  getAllUserChallengeHandler,
  getUserChallengeHandler,
  updateUserChallengeHandler,
  deleteUserChallengeHandler,
} = require('../handlers/userChallengeHandler');

const userChallengeRoute = [
  {
    method: 'POST',
    path: '/users/challenges',
    options: {
      pre: [{method: verifyGoogle}],
      handler: createUserChallenge,
    },
  },
  {
    method: 'GET',
    path: '/users/challenges',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getAllUserChallengeHandler,
    },
  },
  {
    method: 'GET',
    path: '/users/challenges/{userChallengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getUserChallengeHandler,
    },
  },
  {
    method: 'PUT',
    path: '/users/challenges/{userChallengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: updateUserChallengeHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/users/challenges/{userChallengeId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: deleteUserChallengeHandler,
    },
  },
];

module.exports = userChallengeRoute;

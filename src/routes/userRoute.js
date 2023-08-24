const {verifyGoogle} = require('../middleware');
const {
  userInfoHandler,
  updateUserInfoHandler,
  updateUserLevel,
  getUserGroupsHandler,
} = require('../handlers/userHandler');

const userRoute = [
  {
    method: 'GET',
    path: '/users',
    options: {
      pre: [{method: verifyGoogle}],
      handler: userInfoHandler,
    },
  },
  {
    method: 'PUT',
    path: '/users',
    options: {
      pre: [{method: verifyGoogle}],
      handler: updateUserInfoHandler,
    },
  },
  {
    method: 'PUT',
    path: '/users/level',
    options: {
      pre: [{method: verifyGoogle}],
      handler: updateUserLevel,
    },
  },
  {
    method: 'GET',
    path: '/users/groups',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getUserGroupsHandler,
    },
  },
];

module.exports = userRoute;

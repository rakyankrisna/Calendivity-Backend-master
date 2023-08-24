const {authHandler, tokenRefreshHandler} = require('../handlers/authHandler');

const authRoute = [
  {
    method: 'GET',
    path: '/auth',
    handler: authHandler,
  },
  {
    method: 'POST',
    path: '/tokenrefresh',
    handler: tokenRefreshHandler,
  },
];

module.exports = authRoute;

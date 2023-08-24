require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const userActivityRoute = require('./routes/userActivityRoute');
const userChallengeRoute = require('./routes/userChallengeRoute');
const groupRoute = require('./routes/groupRoute');
const groupActivityRoute = require('./routes/groupActivityRoute');
const challengeRoute = require('./routes/challengeRoute');
const eventRoute = require('./routes/eventRoute');
const placeRoute = require('./routes/placeRoute');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register(Inert);

  server.route([
    ...authRoute,
    ...userRoute,
    ...userActivityRoute,
    ...userChallengeRoute,
    ...groupRoute,
    ...groupActivityRoute,
    ...challengeRoute,
    ...eventRoute,
    ...placeRoute,
    {
      method: 'GET',
      path: '/openapi.json',
      handler: (request, h) => {
        return h.file('openapi.json');
      },
    },
    {
      method: 'GET',
      path: '/docs',
      handler: (request, h) => {
        return h.file('openapi.html');
      },
    },
  ]);

  await server.start();
  console.log(`Server listening on http://localhost:${server.info.port}`);
};

init();

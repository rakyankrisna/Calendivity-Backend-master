const {verifyGoogle, verifyGroup} = require('../middleware');
const {
  getAllPersonalEventsHandler,
  getAllPersonalEventActivitiesHandler,
  getAllGroupEventsHandler,
  getAllGroupEventActivitiesHandler,
  getEventById,
  getEventActivityById,
} = require('../handlers/eventHandler');

const calendarRoute = [
  {
    method: 'GET',
    path: '/users/events',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getAllPersonalEventsHandler,
    },
  },
  {
    method: 'GET',
    path: '/users/eventactivities',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getAllPersonalEventActivitiesHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/events',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getAllGroupEventsHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/eventactivities',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getAllGroupEventActivitiesHandler,
    },
  },
  {
    method: 'GET',
    path: '/events/{eventId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getEventById,
    },
  },
  {
    method: 'GET',
    path: '/eventactivities/{eventActivityId}',
    options: {
      pre: [{method: verifyGoogle}],
      handler: getEventActivityById,
    },
  },
];

module.exports = calendarRoute;

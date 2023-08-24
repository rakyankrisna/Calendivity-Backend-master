const {verifyGoogle, verifyGroup} = require('../middleware');
const {
  createGroupActivityHandler,
  getAllGroupActivitiesHandler,
  getGroupActivityHandler,
  updateGroupActivityHandler,
  deleteGroupActivityHandler,
} = require('../handlers/groupActivityHandler');

const groupActivityRoute = [
  {
    method: 'POST',
    path: '/groups/{groupId}/activities',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: createGroupActivityHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/activities',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getAllGroupActivitiesHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/activities/{activityId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getGroupActivityHandler,
    },
  },
  {
    method: 'PUT',
    path: '/groups/{groupId}/activities/{activityId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: updateGroupActivityHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/groups/{groupId}/activities/{activityId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: deleteGroupActivityHandler,
    },
  },
];

module.exports = groupActivityRoute;

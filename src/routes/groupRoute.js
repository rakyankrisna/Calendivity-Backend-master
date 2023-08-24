const {verifyGoogle, verifyGroup} = require('../middleware');
const {
  createGroupHandler,
  getGroupHandler,
  updateGroupHandler,
  deleteGroupHandler,
  getAllGroupUsersHandler,
  inviteToGroupHandler,
  removeFromGroupHandler,
} = require('../handlers/groupHandler');

const groupRoute = [
  {
    method: 'POST',
    path: '/groups',
    options: {
      pre: [{method: verifyGoogle}],
      handler: createGroupHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getGroupHandler,
    },
  },
  {
    method: 'PUT',
    path: '/groups/{groupId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: updateGroupHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/groups/{groupId}',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: deleteGroupHandler,
    },
  },
  {
    method: 'GET',
    path: '/groups/{groupId}/users',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: getAllGroupUsersHandler,
    },
  },
  {
    method: 'POST',
    path: '/groups/{groupId}/users',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: inviteToGroupHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/groups/{groupId}/users',
    options: {
      pre: [{method: verifyGoogle}, {method: verifyGroup}],
      handler: removeFromGroupHandler,
    },
  },
];

module.exports = groupRoute;

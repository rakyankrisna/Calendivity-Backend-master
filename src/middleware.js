const {db} = require('../firestore');
const axios = require('axios');
const Boom = require('@hapi/boom');

const verifyGoogle = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    const userInfoRes = await axios.get(
      'https://www.googleapis.com/userinfo/v2/me',
      config,
    );

    const userRes = await db
      .collection('users')
      .doc(userInfoRes.data.email)
      .get();
    const user = userRes.data();

    const userData = {
      email: user.email,
      name: user.name,
      picture: userInfoRes.data.picture,
      age: user.age,
      lastEducation: user.lastEducation,
      job: user.job,
      gender: user.gender,
      education: user.education,
      employmentType: user.employmentType,
      level: user.level,
      exp: user.exp,
    };

    request.authUser = userData;

    return h.continue;
  } catch (err) {
    if (err.response.status === 401) {
      throw Boom.unauthorized('unauthorized');
    }

    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const verifyGroup = async (request, h) => {
  try {
    const {groupId} = request.params;

    const groupRes = await db.collection('groups').doc(groupId).get();
    if (!groupRes.exists) {
      throw Boom.notFound('').output.payload;
    }

    return h.continue;
  } catch (err) {
    if (err.statusCode === 404) {
      throw Boom.notFound('group does not exists');
    }

    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

module.exports = {verifyGoogle, verifyGroup};

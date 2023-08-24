const {db} = require('../../firestore');
const axios = require('axios');

const createUserChallenge = async (request, h) => {
  try {
    const userId = request.authUser.email;
    const {challengeId} = request.payload;

    // check request body paylaod
    if (!challengeId) {
      const response = h.response({
        message: 'bad request',
      });
      response.code(400);
      return response;
    }

    const challengesRef = await db.collection('challenges');
    const challenge = await challengesRef.doc(challengeId).get();

    const dst = new Date(challenge.data().startTime.seconds * 1000);
    const st = dst.getUTCHours() * 60 + dst.getMinutes();
    const det = new Date(challenge.data().endTime.seconds * 1000);
    const et = det.getUTCHours() * 60 + det.getMinutes();
    const dur = et - st;
    const activityName = challenge.data().challengeName;

    const user = request.authUser;
    const difficultyRes = await axios.get(
      'http://34.173.91.244/difficulty?' +
        'age=' +
        user.age +
        '&lastEducation=' +
        user.lastEducation +
        '&job=' +
        user.job +
        '&gender=' +
        user.gender +
        '&education=' +
        user.education +
        '&employmentType=' +
        user.employmentType +
        '&activityName=' +
        activityName +
        '&startTime=' +
        st +
        '&duration=' +
        dur,
    );
    const difficulty = difficultyRes.data;

    // check if challenge exists
    if (!challenge.exists) {
      const response = h.response({
        message: 'challenge not found',
      });
      response.code(404);
      return response;
    }

    // add new user challenge to userChallenges collection
    const userChallengesRef = await db.collection('userChallenges');
    const userChallengeSnap = await userChallengesRef.add({
      userId,
      challengeId,
      points: 0,
      finish: false,
      difficulty: difficulty.difficulty,
      exp: difficulty.exp,
    });
    userChallengesRef.doc(userChallengeSnap.id).update({
      userChallengeId: userChallengeSnap.id,
    });

    const response = h.response({
      message: 'user challenge successfully created',
      data: {
        userChallengeId: userChallengeSnap.id,
      },
    });
    response.code(201);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getAllUserChallengeHandler = async (request, h) => {
  try {
    const userChallenges = [];
    const userChallengesRef = await db.collection('userChallenges');

    // get all user challenges
    const userChallengesSnap = await userChallengesRef.get();
    for (const doc of userChallengesSnap.docs) {
      const challengeSnap = await db
        .collection('challenges')
        .doc(doc.data().challengeId)
        .get();
      userChallenges.push({
        userChallengeId: doc.data().userChallengeId,
        challengeId: doc.data().challengeId,
        challengeName: challengeSnap.data().challengeName,
        description: challengeSnap.data().description,
        startTime: new Date(challengeSnap.data().startTime.seconds * 1000),
        endTime: new Date(challengeSnap.data().endTime.seconds * 1000),
        goals: challengeSnap.data().goals,
        points: doc.data().points,
        finish: doc.data().finish,
        difficulty: doc.data().difficulty,
        exp: doc.data().exp,
      });
    }

    const response = h.response({
      data: userChallenges,
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getUserChallengeHandler = async (request, h) => {
  try {
    const {userChallengeId} = request.params;

    // get a user challenge from userChellenges collection by userChallengeId
    const userChallengesRef = await db.collection('userChallenges');
    const userChallenge = await userChallengesRef.doc(userChallengeId).get();
    const challenge = await db
      .collection('challenges')
      .doc(userChallenge.data().challengeId)
      .get();

    // check if user challenge exists
    if (!userChallenge.exists) {
      const response = h.response({
        message: 'user challenge not found',
      });
      response.code(404);
      return response;
    }

    const response = h.response({
      data: {
        userChallengeId: userChallenge.data().userChallengeId,
        challengeId: userChallenge.data().challengeId,
        challengeName: challenge.data().challengeName,
        description: challenge.data().description,
        startTime: new Date(challenge.data().startTime.seconds * 1000),
        endTime: new Date(challenge.data().endTime.seconds * 1000),
        goals: challenge.data().goals,
        points: userChallenge.data().points,
        finish: userChallenge.data().finish,
        difficulty: userChallenge.data().difficulty,
        exp: userChallenge.data().exp,
      },
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const updateUserChallengeHandler = async (request, h) => {
  try {
    const {userChallengeId} = request.params;
    const {points} = request.payload;

    // check request body paylaod
    if (!points) {
      const response = h.response({
        message: 'no content',
      });
      response.code(204);
      return response;
    }

    // get a user challenge from userChellenges collection by userChallengeId
    const userChallengesRef = await db.collection('userChallenges');
    const userChallenge = await userChallengesRef.doc(userChallengeId).get();

    // check if user challenge exists
    if (!userChallenge.exists) {
      const response = h.response({
        message: 'user challenge not found',
      });
      response.code(404);
      return response;
    }

    const challenge = await db
      .collection('challenges')
      .doc(userChallenge.data().challengeId)
      .get();

    // check undefined properties
    const updatedUserChallenge = {};
    if (points) {
      const goals = challenge.data().goals;
      const userPoints = userChallenge.data().points;
      updatedUserChallenge.points = points >= goals ? goals : points;

      const config = {
        method: 'put',
        url: 'https://backend-6o3njyuh4q-et.a.run.app/users/level',
        headers: {
          // eslint-disable-next-line quote-props
          Authorization: request.headers.authorization,
          'Content-Type': 'application/json',
        },
      };
      let exp = 0;
      if (points > userPoints && points < goals) {
        exp = userChallenge.data().exp * (points - userPoints);
      }
      if (points < userPoints && points > 0) {
        exp = -(userChallenge.data().exp * (userPoints - points));
      }
      config.data = {
        exp: exp,
      };
      axios.request(config);

      if (updatedUserChallenge.points >= goals) {
        updatedUserChallenge.finish = true;
      } else {
        updatedUserChallenge.finish = false;
      }
    }

    // update user challenge
    userChallengesRef.doc(userChallengeId).update(updatedUserChallenge);

    const response = h.response({
      message: 'user challenge successfully updated',
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const deleteUserChallengeHandler = async (request, h) => {
  try {
    const {userChallengeId} = request.params;

    // get a user challenge from userChellenges collection by userChallengeId
    const userChallengesRef = await db.collection('userChallenges');
    const userChallenge = await userChallengesRef.doc(userChallengeId).get();

    // check if user challenge exists
    if (!userChallenge.exists) {
      const response = h.response({
        message: 'user challenge not found',
      });
      response.code(404);
      return response;
    }

    // delete user challenge
    userChallengesRef.doc(userChallengeId).delete();

    const response = h.response({
      message: 'user challenge successfully deleted',
    });
    response.code(200);
    return response;
  } catch (err) {
    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

module.exports = {
  createUserChallenge,
  getAllUserChallengeHandler,
  getUserChallengeHandler,
  updateUserChallengeHandler,
  deleteUserChallengeHandler,
};

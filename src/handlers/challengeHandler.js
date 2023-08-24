const {db} = require('../../firestore');
const {Timestamp} = require('@google-cloud/firestore');

const createChallengeHandler = async (request, h) => {
  try {
    const {challengeName, description, goals, startTime, endTime} =
      request.payload;

    // check request body paylaod
    if (!challengeName || !description || !goals || !startTime || !endTime) {
      const response = h.response({
        message: 'bad request',
      });
      response.code(400);
      return response;
    }

    // add new challenge to challenges collection
    const challengesRef = await db.collection('challenges');
    const challengeSnap = await challengesRef.add({
      challengeName,
      description,
      goals,
      startTime: Timestamp.fromDate(new Date(startTime)),
      endTime: Timestamp.fromDate(new Date(endTime)),
    });
    challengesRef.doc(challengeSnap.id).update({challengeId: challengeSnap.id});

    const response = h.response({
      message: 'challenge successfully created',
      data: {challengeId: challengeSnap.id},
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

const getAllChallengesHandler = async (request, h) => {
  try {
    const {name} = request.query;

    const challenges = [];
    const challengesRef = await db.collection('challenges');

    // get all challenge filtered by name
    if (name) {
      const challengesByName = await challengesRef
        .where('challengeName', '>=', name)
        .where('challengeName', '<=', name + '\uf8ff')
        .get();
      challengesByName.forEach((doc) => {
        challenges.push({
          challengeId: doc.data().challengeId,
          challengeName: doc.data().challengeName,
          description: doc.data().description,
          goals: doc.data().goals,
          startTime: new Date(doc.data().startTime.seconds * 1000),
          endTime: new Date(doc.data().endTime.seconds * 1000),
        });
      });

      const response = h.response({
        data: challenges,
      });
      response.code(200);
      return response;
    }

    // get all challenge
    const challengesSnap = await challengesRef.get();
    challengesSnap.forEach((doc) => {
      challenges.push({
        challengeId: doc.data().challengeId,
        challengeName: doc.data().challengeName,
        description: doc.data().description,
        goals: doc.data().goals,
        startTime: new Date(doc.data().startTime.seconds * 1000),
        endTime: new Date(doc.data().endTime.seconds * 1000),
      });
    });

    const response = h.response({
      data: challenges,
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

const getChallengeHandler = async (request, h) => {
  try {
    const {challengeId} = request.params;

    // get a challenge from chellenges collection by challengeId
    const challengesRef = await db.collection('challenges');
    const challenge = await challengesRef.doc(challengeId).get();

    // check if challenge exists
    if (!challenge.exists) {
      const response = h.response({
        message: 'challenge not found',
      });
      response.code(404);
      return response;
    }

    const response = h.response({
      data: {
        challengeId: challenge.data().challengeId,
        challengeName: challenge.data().challengeName,
        description: challenge.data().description,
        goals: challenge.data().goals,
        startTime: new Date(challenge.data().startTime.seconds * 1000),
        endTime: new Date(challenge.data().endTime.seconds * 1000),
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

const updateChallengeHandler = async (request, h) => {
  try {
    const {challengeId} = request.params;
    const {challengeName, description, goals, startTime, endTime} =
      request.payload;

    // check request body paylaod
    if (
      !challengeName &&
      !description &&
      !goals &&
      !startTime &&
      !endTime
    ) {
      const response = h.response({
        message: 'no content',
      });
      response.code(204);
      return response;
    }

    // get a challenge from chellenges collection by challengeId
    const challengesRef = await db.collection('challenges');
    const challenge = await challengesRef.doc(challengeId).get();

    // check if challenge exists
    if (!challenge.exists) {
      const response = h.response({
        message: 'challenge not found',
      });
      response.code(404);
      return response;
    }

    // check undefined properties
    const updatedChallenge = {};
    if (challengeName) {
      updatedChallenge.challengeName = challengeName;
    }
    if (description) {
      updatedChallenge.description = description;
    }
    if (goals) {
      updatedChallenge.goals = goals;
    }
    if (startTime) {
      updatedChallenge.startTime = Timestamp.fromDate(new Date(startTime));
    }
    if (endTime) {
      updatedChallenge.endTime = Timestamp.fromDate(new Date(endTime));
    }

    // update challenge
    challengesRef.doc(challengeId).update(updatedChallenge);

    const response = h.response({
      message: 'challenge successfully updated',
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

const deleteChallengeHandler = async (request, h) => {
  try {
    const {challengeId} = request.params;

    // get a challenge from chellenges collection by challengeId
    const challengesRef = await db.collection('challenges');
    const challenge = await challengesRef.doc(challengeId).get();

    // check if challenge exists
    if (!challenge.exists) {
      const response = h.response({
        message: 'challenge not found',
      });
      response.code(404);
      return response;
    }

    // delete challenge
    challengesRef.doc(challengeId).delete();

    const response = h.response({
      message: 'challenge successfully deleted',
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
  createChallengeHandler,
  getAllChallengesHandler,
  getChallengeHandler,
  updateChallengeHandler,
  deleteChallengeHandler,
};

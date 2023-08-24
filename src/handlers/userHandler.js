const {db} = require('../../firestore');

const userInfoHandler = async (request, h) => {
  try {
    const {authUser} = request;
    const userRes = await db.collection('users').doc(authUser.email).get();
    const user = await userRes.data();

    const response = h.response({
      data: {
        email: user.email,
        name: user.name,
        picture: authUser.picture,
        age: user.age,
        lastEducation: user.lastEducation,
        job: user.job,
        gender: user.gender,
        education: user.education,
        employmentType: user.employmentType,
        level: user.level,
        exp: user.exp,
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

const updateUserInfoHandler = async (request, h) => {
  try {
    const {authUser} = request;
    const {name, age, lastEducation, job, gender, education, employmentType} =
      request.payload;

    // check request body payload
    if (
      !name &&
      !age &&
      !lastEducation &&
      !job &&
      !gender &&
      !education &&
      !employmentType
    ) {
      const response = h.response({
        message: 'no content',
      });
      response.code(204);
      return response;
    }

    // check the undefined properties
    const updatedUserInfo = {};
    if (name) {
      updatedUserInfo.name = name;
    }
    if (age) {
      updatedUserInfo.age = age;
    }
    if (lastEducation) {
      updatedUserInfo.lastEducation = lastEducation;
    }
    if (job) {
      updatedUserInfo.job = job;
    }
    if (gender) {
      updatedUserInfo.gender = gender;
    }
    if (education) {
      updatedUserInfo.education = education;
    }
    if (employmentType) {
      updatedUserInfo.employmentType = employmentType;
    }

    const userRes = await db.collection('users').doc(authUser.email);
    userRes.update(updatedUserInfo);

    const response = h.response({
      message: 'user info successfully updated',
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

const updateUserLevel = async (request, h) => {
  try {
    const {exp} = request.payload;

    if (!exp) {
      const response = h.response({
        message: 'no content',
      });
      response.code(204);
      return response;
    }

    const {authUser} = request;
    const userRef = await db.collection('users').doc(authUser.email);
    const userRes = await userRef.get();
    const user = await userRes.data();

    const updatedUserLevel = {};

    const newExp = user.exp + exp < 0 ? 0 : user.exp + exp;
    updatedUserLevel.exp = newExp;

    const newLevel =
      updatedUserLevel.exp / 25 < 1 ? 1 : updatedUserLevel.exp / 25;
    updatedUserLevel.level = Math.ceil(newLevel);

    userRef.update(updatedUserLevel);

    const response = h.response({
      message: 'user level successfully updated',
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

const getUserGroupsHandler = async (request, h) => {
  try {
    const userId = request.authUser.email;

    // Get Groups that have User Id
    const userRef = await db.collection('memberships');
    const snapshotUser = await userRef.where('userId', '==', userId).get();

    const groupsId = [];
    snapshotUser.forEach((doc) => {
      groupsId.push(doc.data().groupId);
    });

    // Get data from database collection groups
    const getDataGroup = [];
    await Promise.all(
      groupsId.map(async (groupId) => {
        const userRes = await db.collection('groups').doc(groupId).get();
        getDataGroup.push({
          groupId: userRes.data().groupId,
          groupName: userRes.data().groupName,
          description: userRes.data().description,
        });
      }),
    );

    const response = h.response({
      data: getDataGroup,
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
  userInfoHandler,
  updateUserInfoHandler,
  updateUserLevel,
  getUserGroupsHandler,
};

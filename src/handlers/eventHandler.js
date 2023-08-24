const {db} = require('../../firestore');
const axios = require('axios');

const getAllPersonalEventsHandler = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    // make string query for axios
    const dateMin = new Date().toISOString();
    let query = `timeMin=${dateMin}&orderBy=startTime&singleEvents=true`;
    for (const q in request.query) {
      query += '&' + q + '=' + request.query[q];
    }
    const calendarId = request.authUser.email;

    // execute axios and return user events array
    const eventsRes = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?${query}`,
      config,
    );

    const response = h.response({
      data: eventsRes.data.items,
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

const getAllPersonalEventActivitiesHandler = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    // make string query for axios
    const dateMin = new Date().toISOString();
    let query = `timeMin=${dateMin}&orderBy=startTime&singleEvents=true`;
    for (const q in request.query) {
      query += '&' + q + '=' + request.query[q];
    }
    const userId = request.authUser.email;

    // get user calendar events
    const userEvents = [];
    const eventResponses = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${userId}/events?${query}`,
      config,
    );
    const userEventsRes = eventResponses.data.items;
    for (const event of userEventsRes) {
      userEvents.push({
        type: 'calendar_event',
        id: event.id,
        summary: event.summary,
        description: event.description,
        startTime: new Date(event.start.dateTime),
        endTime: new Date(event.end.dateTime),
        location: event.location,
      });
    }

    // get user activities
    const userActivities = [];
    const userActivitiesRef = await db.collection('userActivities');
    const userActivitiesRes = await userActivitiesRef
      .where('userId', '==', userId)
      .get();
    userActivitiesRes.forEach((doc) => {
      userActivities.push({
        type: 'user_activity',
        id: doc.data().activityId,
        summary: doc.data().activityName,
        description: doc.data().description,
        startTime: new Date(doc.data().startTime.seconds * 1000),
        endTime: new Date(doc.data().endTime.seconds * 1000),
        location: doc.data().location,
      });
    });

    // concat user events and user activities
    let userEventActivities = [];
    userEventActivities = userEventActivities.concat(userEvents);
    userEventActivities = userEventActivities.concat(userActivities);

    // sort user event activities by startTime
    userEventActivities.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );

    const response = h.response({
      data: userEventActivities,
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

const getAllGroupEventsHandler = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    // get users from membership firestore collection based on groupId
    const {groupId} = request.params;
    const groupsRef = await db.collection('memberships');
    const snapshot = await groupsRef.where('groupId', '==', groupId).get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push(doc.data().userId);
    });

    // make string query for axios
    const dateMin = new Date().toISOString();
    let query = `timeMin=${dateMin}&orderBy=startTime&singleEvents=true`;
    for (const q in request.query) {
      query += '&' + q + '=' + request.query[q];
    }

    // execute axios from users array and return the user events array from same group
    const groupEvents = [];
    const eventsRes = await axios.all(
      users.map(async (user) => {
        return await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${user}/events?${query}`,
          config,
        );
      }),
    );
    for (const userEvents of eventsRes) {
      for (const event of userEvents.data.items) {
        groupEvents.push({
          user: userEvents.data.summary,
          ...event,
        });
      }
    }

    const response = h.response({
      data: groupEvents,
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

const getAllGroupEventActivitiesHandler = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    // get users from membership firestore collection based on groupId
    const {groupId} = request.params;

    const users = [];
    const groupsRef = await db.collection('memberships');
    const groupSnap = await groupsRef.where('groupId', '==', groupId).get();
    groupSnap.forEach((doc) => {
      users.push(doc.data().userId);
    });

    // make string query for axios
    const dateMin = new Date().toISOString();
    let query = `timeMin=${dateMin}&orderBy=startTime&singleEvents=true`;
    for (const q in request.query) {
      query += '&' + q + '=' + request.query[q];
    }

    // get group user events from google calendar api
    const groupEvents = [];
    const eventsRes = await axios.all(
      users.map(async (user) => {
        return await axios.get(
          `https://www.googleapis.com/calendar/v3/calendars/${user}/events?${query}`,
          config,
        );
      }),
    );
    for (const userEvents of eventsRes) {
      for (const event of userEvents.data.items) {
        groupEvents.push({
          type: 'calendar_event',
          user: userEvents.data.summary,
          id: event.id,
          summary: event.summary,
          description: event.description,
          startTime: new Date(event.start.dateTime),
          endTime: new Date(event.end.dateTime),
          location: event.location,
        });
      }
    }

    // get user group activities from userActivities collection
    const groupActivities = [];
    for (const userId of users) {
      const userActivitiesRef = await db.collection('userActivities');
      const userActivitiesRes = await userActivitiesRef
        .where('userId', '==', userId)
        .get();
      userActivitiesRes.forEach((doc) => {
        groupActivities.push({
          type: 'user_activity',
          user: userId,
          id: doc.data().activityId,
          summary: doc.data().activityName,
          description: doc.data().description,
          startTime: new Date(doc.data().startTime.seconds * 1000),
          endTime: new Date(doc.data().endTime.seconds * 1000),
          location: doc.data().location,
        });
      });
    }

    // concat user events and user activities
    let groupEventActivities = [];
    groupEventActivities = groupEventActivities.concat(groupEvents);
    groupEventActivities = groupEventActivities.concat(groupActivities);

    // sort user event activities by startTime
    groupEventActivities.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime),
    );

    const response = h.response({
      data: groupEventActivities,
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

const getEventById = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    const {email} = request.authUser;
    const {eventId} = request.params;

    const eventRes = await axios.get(
      `https://www.googleapis.com/calendar/v3/calendars/${email}/events/${eventId}`,
      config,
    );

    const response = h.response({
      data: eventRes.data,
    });
    response.code(200);
    return response;
  } catch (err) {
    if (err.response.status === 404) {
      const response = h.response({
        message: 'event not found',
      });
      response.code(404);
      return response;
    }

    const response = h.response({
      message: err.message,
    });
    response.code(500);
    return response;
  }
};

const getEventActivityById = async (request, h) => {
  try {
    const config = {
      headers: {Authorization: request.headers.authorization},
    };

    const {email} = request.authUser;
    const {eventActivityId} = request.params;

    const eventRes = await axios
      .get(
        `https://www.googleapis.com/calendar/v3/calendars/${email}/events/${eventActivityId}`,
        config,
      )
      .then((response) => {
        response.data.type = 'calendar_event';
        return response;
      })
      .catch((err) => {
        return err.response;
      });

    const activitySnap = db
      .collection('userActivities')
      .doc(eventActivityId)
      .get();
    const activityRes = await activitySnap
      .then((doc) => {
        doc.data = doc.data();
        doc.data.type = 'user_activity';
        return doc;
      })
      .catch((err) => {
        return err;
      });

    if (eventRes.status !== 404) {
      const response = h.response({
        data: {
          type: 'calendar_event',
          id: eventRes.data.id,
          summary: eventRes.data.summary,
          description: eventRes.data.description,
          startTime: new Date(eventRes.data.start.dateTime),
          endTime: new Date(eventRes.data.end.dateTime),
          location: eventRes.data.location,
        },
      });
      response.code(200);
      return response;
    }

    if (activityRes.exists) {
      const response = h.response({
        data: {
          type: 'user_activity',
          id: activityRes.data.activityId,
          summary: activityRes.data.activityName,
          description: activityRes.data.description,
          startTime: new Date(activityRes.data.startTime.seconds * 1000),
          endTime: new Date(activityRes.data.endTime.seconds * 1000),
          location: activityRes.data.location,
        },
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      message: 'event activity not found',
    });
    response.code(404);
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
  getAllPersonalEventsHandler,
  getAllPersonalEventActivitiesHandler,
  getAllGroupEventsHandler,
  getAllGroupEventActivitiesHandler,
  getEventById,
  getEventActivityById,
};

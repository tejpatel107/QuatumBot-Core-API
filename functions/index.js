/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 * https://firebase.google.com/docs/web/setup#available-libraries
 */

// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
import * as v2 from "firebase-functions/v2";
import { v4 as uuidv4 } from "uuid";

admin.initializeApp();

export const getSession = v2.https.onCall({ cors: { origin: "http://localhost:3000" } }, async (req) => {
  try {
    const { sessionId } = req.data;
    const docSnapShot = await admin.firestore().collection("sessions").doc(sessionId).get();

    if (!docSnapShot.exists) {
      throw new v2.https.HttpsError(404, "Session not found!");
    } else {
      const messages = docSnapShot.data().Messages;

      // Return the messages
      return { sessionId, messages };
    }

  } catch (error) {
    console.error("Error getting the session:", error);
    return v2.https.HttpsError(500, "Failed to get session");
  }
});

export const getSessions = v2.https.onCall(
  { cors: { origin: "http://localhost:3000" } },
  async (req) => {
    try {
      var sessions = [];
      await admin.firestore().collection("sessions").listDocuments().then(async (docRefs) => {
        return await admin.firestore().getAll(...docRefs);
      }).then((docSnaps) => {
        docSnaps.forEach((docSnap) => {
          const session = { sessionId: docSnap.id, Messages: docSnap.data().Messages };
          sessions.push(session);
        });
      });

      return sessions;

    } catch (error) {
      return v2.https.HttpsError(error);
    }
  });

export const deleteSession = v2.https.onCall({ cors: { origin: "http://localhost:3000" } },
  (async (req) => {
    try {
      var { sessionId, date } = req.data;

      const statsDocRef = await admin.firestore().collection("statistics").doc("sessionStats");
      await statsDocRef.get().then(async (docSnap) => {
        if (docSnap.exists) {

          const totalSessions = docSnap.data().totalSessions;
          const matchingIndex = totalSessions.findIndex(session =>
            session.date === date);

          if (matchingIndex !== 1) {
            await statsDocRef.update({

              totalSessions: [
                ...totalSessions.slice(0, matchingIndex),
                { ...totalSessions[matchingIndex], deletedSessions: (totalSessions[matchingIndex].deletedSessions + 1) },
                ...totalSessions.slice(matchingIndex + 1)
              ]
            });
            console.log("Deleted sessions incremented successfully!");
          } else {
            console.log("No session found with matching date:", date);
          }
        }
      });

      // Delete the session in the Firestore 'sessions' collection
      const resolved = await admin.firestore().collection("sessions").doc(sessionId).delete();

      // Return the session ID in the response
      // res.set('Access-Control-Allow-Origin', '*');
      // res.status(200).json("Session deleted successfully");

      return "The " + sessionId + " session was deleted at " + resolved.writeTime;
    } catch (error) {
      console.error("Error deleting session:", error);
      // res.set('Access-Control-Allow-Origin', '*');
      // res.status(500).json({ error: "Failed to delete session" });
    }
  })
);

export const saveSession = v2.https.onCall({ cors: { origin: "http://localhost:3000" } }, async (req) => {
  try {

    var { sessionId, newMessages, date } = req.data;

    const statsDocRef = await admin.firestore().collection("statistics").doc("sessionStats");
    
    await statsDocRef.get().then(async (docSnap) => {
      if (docSnap.exists) {

        const totalSessions = docSnap.data().totalSessions;
        const matchingIndex = totalSessions.findIndex(session =>
          session.date === date);

        if (matchingIndex !== 1) {
          await statsDocRef.update({

            totalSessions: [
              ...totalSessions.slice(0, matchingIndex),
              { ...totalSessions[matchingIndex], savedSessions: (totalSessions[matchingIndex].savedSessions + 1) },
              ...totalSessions.slice(matchingIndex + 1)
            ]
          });
          console.log("Saved sessions incremented successfully!");
        } else {
          throw new Error("No session found with matching date:", date);
        }
      }
    });

    if (!sessionId) {
      var sessionId = uuidv4();

      const docRef = await admin.firestore().collection("sessions").doc(sessionId);

      await docRef.set({ Messages: newMessages });

      const messages = (await docRef.get()).data().Messages;

      return { sessionId, messages };
    } else {
      const docRef = await admin.firestore().collection("sessions").doc(sessionId);
      const docSnapShot = await docRef.get();

      if (docSnapShot.exists) {
        await docRef.update({ Messages: newMessages });

        const messages = docSnapShot.data().Messages;

        return { sessionId, messages };
      } else {
        throw new Error("Error saving the new messages in current session");
      }
    }

  } catch (error) {
    return v2.https.HttpsError(error, "Failed to create a new session!");
  }
});

export const getStatistics = v2.https.onCall({ cors: { origin: "http://localhost:3000" } },
  async (req) => {
    try {

      const docRef = await admin.firestore().collection("statistics").doc("sessionStats");

      const stats = (await docRef.get()).data().totalSessions;

      return { stats };
    } catch (error) {
      v2.https.HttpsError(error);
    }
  });
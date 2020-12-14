/*
Bring in env vars (run in /functions):
firebase functions:config:get > .runtimeconfig.json
Running emulator locally:
firebase emulators:start --only functions
Setting env keys via CLI:
firebase functions:config:set someservice.key="THE API KEY"
firebase functions:config:get
*/

const TEST_MODE = process.env.FUNCTIONS_EMULATOR

const functions = require("firebase-functions")
const admin = require("firebase-admin")

const serviceAccount = require("./service_key.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://recipia-app.firebaseio.com",
})

exports.shareWithUser = functions.https.onCall(async (data, context) => {
  //   functions.logger.info("Hello logs!", { structuredData: true })
  if (!context.auth)
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid Permission."
    )
  const uid = context.auth.uid
  const email = context.auth.token.email
  const user = await admin
  .auth()
  .getUserByEmail(email)
  .catch(err => console.log(err.message))
if (!user)
  throw new functions.https.HttpsError(
    "invalid-argument",
    "No user found"
  )

  const usersFriend = await admin
    .auth()
    .getUserByEmail(data)
    .catch(err => console.log(err.message))
  if (!usersFriend)
    throw new functions.https.HttpsError(
      "invalid-argument",
      "This person does not have an account."
    )
  if (usersFriend) {
    
    await admin
      .firestore()
      .doc(`users/${usersFriend.uid}`)
      .update({ [`sharedFrom.${uid}`]: user.displayName }, { merge: true })
    await admin
      .firestore()
      .doc(`users/${uid}`)
      .update(
        { [`sharedWith.${usersFriend.uid}`]: usersFriend.displayName },
        { merge: true }
      )

    return "Invitation Sent!"
  } else
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Couldn't invite that person :(."
    )
})

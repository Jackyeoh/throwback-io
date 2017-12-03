// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

//================================================================================
// keeps session playerCount up to date
exports.updateSession = functions.database.ref('/game/{sessionID}/{uid}')
    .onWrite(event => {
      //ignore if is session data
      if (event.data.key == 'sessionData'){ return null;  }


      // [inserting new user to session]
      if (!event.data.previous.exists()){
        console.log('inserting new');
        event.data.adminRef.parent.child('sessionData/playerCount').once('value').then((snapshot) => {
           var newPlayerCount = snapshot.val() + 1;
           return event.data.adminRef.parent.child('sessionData').child('playerCount').set(newPlayerCount);
        });
      }
      // [end of inserting new user to session]


      // [deleting user from session]
      if (!event.data.exists()){
        console.log('deleting');
        event.data.adminRef.parent.child('sessionData/playerCount').once('value').then((snapshot) => {
           var newPlayerCount = snapshot.val() - 1;
           //check if session is empty after deletion
           if (newPlayerCount == 0){
             //is empty after deletion
             //directly removes entire sessions
             return event.data.adminRef.parent.remove();
           }else{
             //not empty after deletion
             return event.data.adminRef.parent.child('sessionData').child('playerCount').set(newPlayerCount);
           }
        });
      }
      // [end of deleting user from session]


      return null;
    });


//================================================================================
// clean up empty sessions
/*exports.cleanUpSessions = functions.database.ref('/game/{sessionID}/sessionData')
    .onWrite(event => {
      console.log(JSON.stringify(event.data));
      console.log(JSON.stringify(event.data.current.val().playerCount == 0));
      //if empty
      if (event.data.current.val().playerCount == 0){
        return event.data.adminRef.parent.remove();
      }
      return null;
    });
    */

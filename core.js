//==========Global Section Start==========
  var maxPlayerPerSession = 2;
  var sessionID = -1;
  var user = -1;
  var othData = [];
  var gameLoop;
  initApp();
//==========Global Section End==========

//================================================================================
  function initialize(){
    //kick off game's main mainloop
    document.getElementById('play').style.visibility = 'hidden';
    getSession();
    gameLoop = setInterval(mainloop, 1000 / 60);
    //setup canvas here
    //end of canvas setup
  }

//================================================================================
  function stop(){
    //stops gameLoop
    clearInterval(gameLoop);
  }

//================================================================================
  function getSession(){
    alert("finding session");
    var foundSession = false;
    firebase.database().ref('game/').once('value').then(function(snapshot) {
      alert("finding session");
      snapshot.forEach(function(childSnapshot){
        //check availability
        var ref = childSnapshot.val();
        alert("checking session: " + childSnapshot.key);
        alert("playerCount: " + ref.sessionData.playerCount);
        if (!foundSession && ref.sessionData.playerCount < maxPlayerPerSession){
          //still has space - join
          foundSession = true;
          alert("entering " + childSnapshot.key);
          sessionID = childSnapshot.key;
          //update player count
          firebase.database().ref('game/' + sessionID + '/sessionData').transaction(function(sessionMetaData){
            sessionMetaData.playerCount++;
            return sessionMetaData;
          });
        }else{
          alert("skipping " + childSnapshot.key);
        }//otherwise skips
      });
      //create new session if no available session found
      if (sessionID === -1){
        createSession();
      }
    });
  }

//================================================================================
function createSession(){
    alert("creating new session");
    //no valid session found, create new session
    // Generate a new session id
    sessionID = firebase.database().ref().child('game/').push().key;

    //initialize a session object
    var session = new Session();

    //publish session to server
    firebase.database().ref('game/' + sessionID + '/sessionData/').set(session);

    alert(sessionID);
}
//================================================================================
  function mainloop(){
    //set user ref
    user = firebase.auth().currentUser;

    //check if user is logged in
    if (user && sessionID !== -1){
      //user is logged in
      //publish client state to server
      firebase.database().ref('game/' + sessionID + '/' + user.uid).set(generateClientState());

      //update game state by server
      firebase.database().ref('game/' + sessionID + '/').once('value').then(function(snapshot){
        document.getElementById('otherData').innerHTML = 'other players:';
        snapshot.forEach(function(childSnapshot){
          var item = childSnapshot.val();
          //ignore this client's data and metadata
          if (childSnapshot.key != user.uid){
            //update other object's state here
            var node = document.createElement('LI');
            var textnode = document.createTextNode(JSON.stringify(item));
            node.appendChild(textnode);
            document.getElementById('otherData').appendChild(node);
          }
        });
      });
    }
    //game logic
    document.getElementById('sessionData').innerHTML = 'session: ' + sessionID;
    //end of game logic
}


//================================================================================
function readGameState(snapshot){
  document.getElementById('otherData').innerHTML = 'other players:';
  snapshot.forEach(function(childSnapshot){
    var item = childSnapshot.val();
    //ignore this client's data and metadata
    if (childSnapshot.key != user.uid && childSnapshot.key == "sessionData"){
      //update other object's state here
      var node = document.createElement('LI');
      var textnode = document.createTextNode(JSON.stringify(item));
      node.appendChild(textnode);
      document.getElementById('otherData').appendChild(node);
    }
  });
}

//================================================================================
function generateClientState(){
  var data = new Object();
  data.x = document.getElementById('mytextx').value;
  data.y = document.getElementById('mytexty').value;

  document.getElementById('data').innerHTML = user.uid + '</br>' + data.x + ',' + data.y;
  return data;
}

//================================================================================
// Setup event listeners
function initApp() {
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
        // User is not signed in.
        document.getElementById('data').innerHTML = ' ';
      }else{
        refUser = firebase.auth().currentUser;
        document.getElementById('data').innerHTML = user.uid;
      }
    });
  // [END authstatelistener]

  // [WINDOW UNLOAD listerner]
  //window.onbeforeunload = cleanUp();
  // [END WINDOW UNLOAD listerner]
}
//================================================================================
function cleanUp(){

  //remove self from session
  firebase.database().ref('game/' + sessionID + '/' + user.uid).remove();
  //decrease player count
  firebase.database().ref('game/' + sessionID + '/sessionData').transaction(function(sessionMetaData){
    sessionMetaData.playerCount--;
    return sessionMetaData;
  });
}

//================================================================================
function signIn(){
  alert('signing in');
  var email = document.getElementById('email').value;
  var password = document.getElementById('pass').value;
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + ' : ' + errorMessage);
  });
}

//================================================================================
function signUp(){
  var email = document.getElementById('email').value;
  var password = document.getElementById('pass').value;
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    alert(errorCode + ' : ' + errorMessage);
  });
}

//================================================================================
function signOut(){
  firebase.auth().signOut().then(function() {
    alert('Signed Out');
  }, function(error) {
    alert('Sign Out Error');
  });
}

//================================================================================
function Session () {
  this.playerCount = 1;
  this.map = new Map();
}

//================================================================================
function Map (type){
  this.height = 10;
  this.width = 20;
}

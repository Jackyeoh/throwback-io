    var mainloop = function() {
        updateGame();
        drawGame();
    };
    while ( true ) {
        mainloop();
    }

    var udpateGame = function(){
       document.getElementByID("testbox").innerHTML="Running";
    }
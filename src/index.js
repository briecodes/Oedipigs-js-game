document.addEventListener('DOMContentLoaded', function() {

  let DODGER = document.createElement("div");
  DODGER.setAttribute("id", "dodger");
  DODGER.style.width = '85px';
  DODGER.style.height = '100px';
  DODGER.style.top = '280px';
  DODGER.style.left = '25px';

  const GAME = document.getElementById('game');
  const START = document.getElementById('start');
  const OVERLAY = document.getElementById("overlay");
  const PAUSE = document.getElementById("pause");
  const SCORE_DISPLAY = document.getElementById("score");
  const playAgain = document.getElementById("playAgain");
  const GAME_HEIGHT = window.innerHeight;
  const GAME_WIDTH = window.innerWidth;
  const UP_ARROW = 38;
  const DOWN_ARROW = 40;
  const RIGHT_ARROW = 39;
  const LEFT_ARROW = 37;
  //Submit score end of game

  const modal = document.getElementById('myModal')
  const scoreSubmit = document.getElementById('score-form')
  const submitText = document.getElementById('score-text')
  const modalContent = document.getElementById('modal-content')
  
  // audio
  var audio = document.createElement("audio")
  audio.src = 'assets/audio2.mp3'
  var loseAudio = document.createElement("audio")
  loseAudio.src = 'assets/guylose.mp3'
  
  //other
  let bg = document.createElement("div");
  let ROCKS = []
  let MECHA_SIZE=40
  let FIERI_SIZE= 30
  let ROCK_SPEED = 5
  let stopMotion = false;
  let rockGenerateTime = 1100
  let score = 0;
  var gameInterval = null;
  const impactLocation = GAME_WIDTH-FIERI_SIZE-MECHA_SIZE;
  let bees = [];

  const instructionsDisplay = document.getElementById("instructions");
  instructionsDisplay.style.visibility = "hidden";
  DODGER.style.left = "25px";
  const nomAudio =  new Audio('src/nom.mp3');

  instructionsDisplay.addEventListener("click", function(e){
    toggleInstructions();
  });

  document.getElementById("instructions_link").addEventListener("click", function(e){
    toggleInstructions();
  })

  ROCK_SPEED = setInterval(speedIncrease, 10000)

  function speedIncrease() {
    if (ROCK_SPEED<14) ++ROCK_SPEED
  }

  START.addEventListener("click", function(e){
    start();
  } );


  //Start Game

  function start() {
    GAME.appendChild(DODGER);
    window.addEventListener('keydown', moveDodger);
    bgLoop();
    OVERLAY.style.display = "none";
    PAUSE.style.display="block"
    SCORE_DISPLAY.style.visibility = "visible"
    gameInterval = setInterval(function() {
      createRock(Math.floor(Math.random() *  (GAME_HEIGHT - 20)))
    }, rockGenerateTime)
  }
  // End Start


//Game movement functions
  function checkCollision(rock) {
    let dodgerTopEdge = positionToInteger(DODGER.style.top);
    let dodgerBottomEdge = positionToInteger(DODGER.style.top) + 130;
    let dodgerLeftEdge = positionToInteger(DODGER.style.left);
    let dodgerRightEdge = positionToInteger(DODGER.style.left) + 85;

    let rockTopEdge = positionToInteger(rock.style.top);
    let rockBottomEdge = positionToInteger(rock.style.top) + 40;
    let rockLeftEdge = positionToInteger(rock.style.left);
    let rockRightEdge = positionToInteger(rock.style.left) + 40;

    if (rockTopEdge > dodgerTopEdge && rockBottomEdge < dodgerBottomEdge && rockLeftEdge > dodgerLeftEdge && rockRightEdge < dodgerRightEdge){
      return true
    };
  }

  function createRock(x) {
    
    const rock = document.createElement('div')
    rock.className = 'rock'
    rock.style.top = `${x}px`

    var left = GAME_WIDTH - 50;
    rock.style.left = left
    GAME.appendChild(rock)

    function moveRock() {
      if (stopMotion === false){
        rock.style.left = `${left -= ROCK_SPEED}px`;
        let rockLocation = rock.style.left.replace(/[^0-9.]/g, "");

        if (checkCollision(rock)){
          return endGame()
        }else if (rockLocation <= 25 ){
          console.log(`Goodbye, ${rock}.`);
          rock.remove();
          score += 10
          updateScore();
          ROCKS.shift();
        }else{
          window.requestAnimationFrame(moveRock)
        }
      }
    }
    moveRock();
    ROCKS.push(rock);
    return rock;
  }

//END of game movement


//BEGIN End Game functions
  function endGame() {
    stopMotion = true;
    ROCK_SPEED=0
    window.removeEventListener('keydown', moveDodger)
    for(let i = 0; i < ROCKS.length; i++){
      ROCKS[i].remove()
    }
    var closeButton = document.getElementsByClassName("close")[0]
    modal.style.display = "block";
    scoreSubmit.style.display="block"
    submitText.style.display="block"
    closeButton.onclick = function() {
      modal.style.display = "none";
    }

    scoreSubmit.addEventListener("submit", (e) => {
      e.preventDefault()
      let name = document.getElementById('score-input')

      fetch(USERS_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(
        {name: `${name.value}`,
        score: score})
      }).then(response => response.json()).then(json => console.log(json))
      scoreSubmit.style.display="none"
      submitText.style.display="none"
      playAgain.style.display="block"

      playAgain.addEventListener("click", (r) => {
        r.preventDefault()
        playAgain.style.display= "none"
        resetGame()
      })
    })
  }
  //END of game function

  //RESET game
  function resetGame() {
    OVERLAY.style.display = "block";
    PAUSE.style.display="none";
    SCORE_DISPLAY.style.visibility = "hidden";
    modal.style.display="none";
    stopMotion= false;
    DODGER.style.top = "280px";
    DODGER.style.left = "25px";
    score = 0;
    updateScore()
    ROCKS= []
    deleteAllRocks()
    // stopBackground()
    OVERLAY.addEventListener('click', function(e) {
      start()
    });
  }

  //Supporting functions

  function deleteAllRocks(){
    for (const rock of ROCKS){
      rock.remove();
    }
  }

  PAUSE.addEventListener('click', pauseGame)
  window.addEventListener('keydown', pauseGame);
  function pauseGame(e){
    let action = e.target.dataset.pause
    if (action === "pauseGame"){
      alert("Game has been Paused \n Click okay to resume")
    }
    if (e.keyCode ===13){
      alert("Game has been Paused \n Click okay to resume")
    }
  }
  //End of support functions


  //Dodger Movement functions

    function moveDodger(e) {
      let action = e.which
      if (action === UP_ARROW){
        moveDodgerUp()
        e.preventDefault()
        e.stopPropagation()
      }
      if (action === DOWN_ARROW){
        moveDodgerDown()
        e.preventDefault()
        e.stopPropagation()
      }
      if (action === RIGHT_ARROW){
        moveDodgerRight()
        e.preventDefault()
        e.stopPropagation()
      }
      if (action === LEFT_ARROW){
        moveDodgerLeft()
        e.preventDefault()
        e.stopPropagation()
      }
    }

    function moveDodgerUp() {
      window.requestAnimationFrame(function() {
        const top = positionToInteger(DODGER.style.top)
        // console.log(top)
        if (top > 10){
          DODGER.style.top = `${top-18}px`;
        }
      })
    }

    function moveDodgerDown() {
      window.requestAnimationFrame(function(){
        const down = positionToInteger(DODGER.style.top)
        if (down + 110 < GAME_HEIGHT){
          DODGER.style.top = `${down + 18}px`
        }
      })
    }

    function moveDodgerRight() {
      window.requestAnimationFrame(function() {
        const left = positionToInteger(DODGER.style.left)
        if (left){
          if (left < GAME_WIDTH){
            DODGER.style.left = `${left+8}px`;
          }
        }else{
          DODGER.style.left = `${25+8}px`;
        }
      })
    }

    function moveDodgerLeft() {
      window.requestAnimationFrame(function() {
        const left = positionToInteger(DODGER.style.left)
        if (left){
          if (left > 25){
            DODGER.style.left = `${left-8}px`;
          }
        }else{
          DODGER.style.left = `${25}px`;
        }
        if (left > 25){
          DODGER.style.left = `${left-8}px`;
        }
      })
    }

  //END Movement


  function updateScore(){
    let scoreNumber = document.getElementById("scorenumber");
    scoreNumber.innerText = score;
  }

  function positionToInteger(p) {
    return parseInt(p.split('px')[0]) || 0
  }




  // BACKGROUND functions

  function createBG(){
    bg.className = 'bg'
    bg.style.right = '-100px';
    GAME.appendChild(bg);
  }
  // ENDLESS BACKGROUND BEGIN

  function bgLoop(yOn) {
    let bg = document.createElement('div');
    bg.className = 'bg';
    GAME.appendChild(bg);
    if (yOn){
      bg.style.right = `-${4778}px`;
    }else{
      bg.style.right = `-${4778 - GAME_WIDTH}px`;
    }

    function movebg() {
      if (positionToInteger(bg.style.right) < GAME_WIDTH){
        let top = positionToInteger(bg.style.right) + 1
        bg.style.right = `${top}px`
        window.requestAnimationFrame(movebg);
        if (positionToInteger(bg.style.right) === 0) {
          bgLoop(true);
        }
      }else{
        bg.remove()
      }
    }
    movebg()
    return bg
  }

  // ENDLESS BACKGROUND END


  scoreSubmit.addEventListener("submit", (e) => {
    e.preventDefault()
    let name = document.getElementById('score-input')
    name.value
  });

  function toggleInstructions(){
    if (instructionsDisplay.style.visibility === "hidden"){
      instructionsDisplay.style.visibility = "visible";
    }else{
      instructionsDisplay.style.visibility = "hidden";
    }
  }

  DODGER.addEventListener("click", function(e){
    console.log(DODGER.style.top);
  });
});

let beeId = 0

class Bee {
  constructor(type="regular") {
    this.bee = `bee${++beeId}`;
    this.type = type;
    this.id = beeId;
    this.createSelf();
  }

  createSelf() {
    let newBeee = document.createElement("div");
    newBeee.className = "rock";
    newBeee.style.top = "25px";
    newBeee.id = this.id;
    newBeee.style.left = `${window.innerWidth - 40}px`;
    document.getElementById('game').appendChild(newBeee);
    this.addListener(newBeee);
    this.moveBee(newBeee);
  }

  destroySelf(elementInstance){
    elementInstance.remove();
  }

  addListener(elementInstance){
    elementInstance.addEventListener("click", function(e){
      this.remove();
    })
  }

  moveBee(elementInstance) {
    if (elementInstance.style.left.replace(/[^0-9.]/g, "") > 25){
      let left = elementInstance.replace(/[^0-9.]/g, "");
      console.log("inside inside moveBee");
      elementInstance.style.left = `${left -= 10}px`
      window.requestAnimationFrame(this.moveBee)
    }else{
      // this.destroySelf(elementInstance);
    }
  }

}

document.addEventListener('DOMContentLoaded', function() {

  // GRAB HTML ELEMENTS AND DECLARE VARAIBLES
  const game = document.getElementById("game");
  const startBtn = document.getElementById("start");
  const overlay = document.getElementById("overlay");
  const pause = document.getElementById("pause");
  const score_display = document.getElementById("score");
  const playAgain = document.getElementById("playAgain");
  const game_height = window.innerHeight;
  const game_width = window.innerWidth;
  const homeScreen = document.getElementById("start-screen");
  const finalScore = document.getElementById("final-score");
  const stages = document.getElementById("stages");
  const modal = document.getElementById('myModal');
  const scoreSubmit = document.getElementById('score-form');
  const instructionsDisplay = document.getElementById("instructions");
  const instructionsBtn = document.getElementById("instructions_link");

  //other
  const up_arrow = 38;
  const down_arrow = 40;
  const right_arrow = 39;
  const left_arrow = 37;
  let bg = document.createElement("div");
  let rockGenerateTime = 810;
  let gameInterval = null;
  let gameEnd = false;
  let beesArr = [];
  let beesObjs = {};
  let score = 0;
  let timerId

  // CREATE GIR
  let flyingGir = document.createElement("div");
  flyingGir.setAttribute("id", "gir");
  flyingGir.style.width = '91px';
  flyingGir.style.height = '100px';
  flyingGir.style.top = '280px';
  flyingGir.style.left = '25px';



  // EVENT LISTENERS
  instructionsDisplay.addEventListener("click", function(e){
    toggleInstructions();
  });

  instructionsBtn.addEventListener("click", function(e){
    toggleInstructions();
  });

  startBtn.addEventListener("click", function(e){
    startGame();
  });
  
  playAgain.addEventListener("click", resetGame);
  pause.addEventListener('click', pauseGame);
  window.addEventListener('keydown', pauseGame);
  window.addEventListener("keyup", shoot)


  // GAME START / STOP / RESET FUNCTIONS

  function startGame() {
    hide(overlay);
    show(score_display);
    show(pause);
    show(stages);
    blink(stages);
    bgLoop();
    game.appendChild(flyingGir);
    window.addEventListener('keydown', moveDodger);
    timerId = setTimeout(function request() {
      new Bee;
      rockGenerateTime -= 10;
      stageSet(rockGenerateTime);
      timerId = setTimeout(request, rockGenerateTime);
    }, rockGenerateTime);
  }

  function endGame() {
    gameEnd = true;
    clearTimeout(timerId);
    clearInterval(gameInterval);
    deleteAllRocks();
    flyingGir.remove();

    hide(pause);
    hide(score_display);
    hide(stages);
    hide(homeScreen);
    show(overlay, "table");
    show(modal, "table-cell");
    show(scoreSubmit);

    window.removeEventListener('keydown', moveDodger);
    var closeButton = document.getElementsByClassName("close")[0];
    finalScore.innerText = "Your Score: " + score;

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
    })
  }

  function resetGame() {
    rockGenerateTime = 810;
    score = 0;
    updateScore();
    deleteAllRocks();

    hide(modal);
    show(homeScreen, "table-cell");
    
    flyingGir.style.top = "280px";
    flyingGir.style.left = "25px";
    
    gameEnd = false;
  }


  //GIR MOVEMENT FUNCTIONS

  function moveDodger(e) {
    let action = e.which
    if (action === up_arrow){
      moveDodgerUp()
      e.preventDefault()
      e.stopPropagation()
    }
    if (action === down_arrow){
      moveDodgerDown()
      e.preventDefault()
      e.stopPropagation()
    }
    if (action === right_arrow){
      moveDodgerRight()
      e.preventDefault()
      e.stopPropagation()
    }
    if (action === left_arrow){
      moveDodgerLeft()
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function moveDodgerUp() {
    window.requestAnimationFrame(function() {
      const top = positionToInteger(flyingGir.style.top)
      // console.log(top)
      if (top > 10){
        flyingGir.style.top = `${top-18}px`;
      }
    })
  }

  function moveDodgerDown() {
    window.requestAnimationFrame(function(){
      const down = positionToInteger(flyingGir.style.top)
      if (down + 110 < game_height){
        flyingGir.style.top = `${down + 18}px`
      }
    })
  }

  function moveDodgerRight() {
    window.requestAnimationFrame(function() {
      const left = positionToInteger(flyingGir.style.left)
      if (left){
        if (left < game_width){
          flyingGir.style.left = `${left+8}px`;
        }
      }else{
        flyingGir.style.left = `${25+8}px`;
      }
    })
  }

  function moveDodgerLeft() {
    window.requestAnimationFrame(function() {
      const left = positionToInteger(flyingGir.style.left)
      if (left){
        if (left > 25){
          flyingGir.style.left = `${left-8}px`;
        }
      }else{
        flyingGir.style.left = `${25}px`;
      }
      if (left > 25){
        flyingGir.style.left = `${left-8}px`;
      }
    })
  }


  // BACKGROUND functions

  function createBG(){
    bg.className = 'bg'
    bg.style.right = '-100px';
    game.appendChild(bg);
  }

  function bgLoop(yOn) {
    let bg = document.createElement('div');
    bg.className = 'bg';
    game.appendChild(bg);
    if (yOn){
      bg.style.right = `-${4778}px`;
    }else{
      bg.style.right = `-${4778 - game_width}px`;
    }

    function movebg() {
      if (positionToInteger(bg.style.right) < game_width){
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





  
  // BEE CLASS
  let beeId = 0;

  class Bee {
    constructor(type="regular") {
      this.bee = `bee${++beeId}`;
      this.type = type;
      this.id = beeId;
      this.dead = false;
      beesObjs[beeId] = this;
      this.createSelf();
    }

    createSelf() {
      let newBeee = document.createElement("div");
      let beeObject = this;
      let speed = beeObject.generateSpeed();
      let vLocation = beeObject.generateVertialLocation();
      beesArr.push(newBeee);

      newBeee.className = "rock";
      newBeee.style.top = vLocation + "px";
      newBeee.id = this.id;
      newBeee.style.left = `${window.innerWidth - 40}px`;
      game.appendChild(newBeee);
      this.addListener(newBeee);

      function moveBee() {
        if (gameEnd || beeObject.dead){
        }else{
          let left = newBeee.style.left.replace(/[^0-9.]/g, "");
          if (beeObject.checkCollision(newBeee)) {
            beeObject.destroySelf(newBeee);
            return endGame();
          } else if (left > 25) {
            newBeee.style.left = `${left -= speed}px`;
            window.requestAnimationFrame(moveBee)
          } else {
            score += 10;
            updateScore();
            beesArr.shift();
            delete beesObjs[beeObject.id];
            beeObject.destroySelf(newBeee);
          } 
        }
      }

      moveBee();
    }

    destroySelf(elementInstance){
      elementInstance.remove();
    }

    addListener(elementInstance){
      elementInstance.addEventListener("click", function(e){
        console.log(this);
        debugger;
        // this.remove();
      })
    }

    generateSpeed(){
      // return Math.floor(Math.random() * (20 - 5)) + 5;
      return 1;
    }

    generateVertialLocation(){
      return Math.floor(Math.random() * (window.innerHeight - 40)) + 25;
    }

    checkCollision(bee) {
      let girTopEdge = parseInt(flyingGir.style.top.replace(/[^0-9.]/g, "")) - 30;
      let girBottomEdge = parseInt(flyingGir.style.top.replace(/[^0-9.]/g, "")) + 170;
      let girLeftEdge = parseInt(flyingGir.style.left.replace(/[^0-9.]/g, ""));
      let girRightEdge = parseInt(flyingGir.style.left.replace(/[^0-9.]/g, "")) + parseInt(flyingGir.style.width.replace(/[^0-9.]/g, "")) + 85;

      let beeTopEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) - 10;
      let beeBottomEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) + 80;
      let beeLeftEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, "")); 
      let beeRightEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, "")) + 80;

      if (beeTopEdge > girTopEdge && beeBottomEdge < girBottomEdge && beeLeftEdge > girLeftEdge && beeRightEdge < girRightEdge) {
        return true
      };

    }

  }

  let laserId = 0;

  class Laser {
    constructor(type = "regular") {
      this.id = ++laserId;
      this.createSelf();
    }

    createSelf() {
      let laserObject = this;
      let pew = document.createElement("div");
      pew.setAttribute("class", "laser");
      pew.id = this.id;
      pew.style.top = (parseInt(flyingGir.style.top.replace(/[^0-9.]/g, "")) + 45) + "px";
      pew.style.left = (parseInt(flyingGir.style.left.replace(/[^0-9.]/g, "")) + 80) + "px";
      game.appendChild(pew);

      function shootLaser() {
        if (gameEnd) {
        } else {
          let left = parseInt(pew.style.left.replace(/[^0-9.]/g, ""));
          if (laserObject.checkCollision(pew)) {
            score += 30;
            updateScore();
            laserObject.destroySelf(pew);
          } else if (left < game_width - 20) {
            pew.style.left = `${left += 15}px`;
            window.requestAnimationFrame(shootLaser)
          } else {
            laserObject.destroySelf(pew);
          }
        }
      }

      shootLaser();
    }

    destroySelf(elementInstance) {
      elementInstance.remove();
    }

    checkCollision(laser) {
      for (const bee of beesArr){
        let laserTopEdge = parseInt(laser.style.top.replace(/[^0-9.]/g, "")) - 10;
        let laserBottomEdge = parseInt(laser.style.top.replace(/[^0-9.]/g, "")) + 10;
        let laserLeftEdge = parseInt(laser.style.left.replace(/[^0-9.]/g, ""));
        let laserRightEdge = parseInt(laser.style.left.replace(/[^0-9.]/g, "")) + 30;

        let beeTopEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) - 10;
        let beeBottomEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) + 80;
        let beeLeftEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, ""));
        let beeRightEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, "")) + 80;

        if (laserTopEdge > beeTopEdge && laserBottomEdge < beeBottomEdge && laserLeftEdge > beeLeftEdge && laserRightEdge < beeRightEdge) {
          let beeOb = beesObjs[bee.id];
          beeOb["dead"] = true;
          delete beesObjs[bee.id];
          beesArr.splice(bee);
          bee.remove();
          return true;
        };
      }

    }
  }







  //Supporting functions

  function updateScore() {
    let scoreNumber = document.getElementById("scorenumber");
    scoreNumber.innerText = score;
  }

  function positionToInteger(p) {
    return parseInt(p.split('px')[0]) || 0
  }

  function pTi(num) {
    return parseInt(num.replace(/[^0-9.]/g, ""));
  }

  function deleteAllRocks() {
    for (const rock of beesArr) {
      rock.remove();
    }
  }

  function pauseGame(e) {
    let action = e.target.dataset.pause
    if (action === "pauseGame") {
      alert("Game paused. Click OK to resume")
    }
    if (e.keyCode === 13) {
      alert("Game paused. Click OK to resume")
    }
  }

  function shoot(e){
    if (e.keyCode === 32){
      new Laser;
    }
  }

  scoreSubmit.addEventListener("submit", (e) => {
    e.preventDefault()
    let name = document.getElementById('score-input')
    name.value
  });

  function toggleInstructions() {
    if (instructionsDisplay.style.visibility === "hidden" || instructionsDisplay.style.display === "none") {
      show(instructionsDisplay);
    } else {
      hide(instructionsDisplay);
    }
  }

  function blink(element) {
    setTimeout(function () {
      element.style.visibility = "hidden";
      setTimeout(function () {
        element.style.visibility = "visible";
        setTimeout(function () {
          element.style.visibility = "hidden";
          setTimeout(function () {
            element.style.visibility = "visible";
          }, 200);
        }, 200);
      }, 200);
    }, 200);
  }

  function stageSet(time) {
    if (time <= 800 && time >= 600) {
      stages.innerText = "Stage 1";
    } else if (time <= 599 && time >= 400) {
      stages.innerText = "Stage 2";
    } else if (time <= 399 && time > 120) {
      stages.innerText = "Stage 3";
    } else {
      stages.innerText = "SUDDEN DEATH";
      stages.style.color = "red";
      blink(stages);
    }
  }

  function show(elem, stat = "block") {
    elem.style.visibility = "visible";
    elem.style.display = stat;
  }

  function hide(elem) {
    elem.style.visibility = "hidden";
    elem.style.display = "none";
  }

});
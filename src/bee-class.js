
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
            let beeObject = this;
            let speed = beeObject.generateSpeed();
            let vLocation = beeObject.generateVertialLocation();

            newBeee.className = "rock";
            newBeee.style.top = vLocation + "px";
            newBeee.id = this.id;
            newBeee.style.left = `${window.innerWidth - 40}px`;
            document.getElementById('game').appendChild(newBeee);
            this.addListener(newBeee);

            function moveBee() {
            let left = newBeee.style.left.replace(/[^0-9.]/g, "");
            if (beeObject.checkCollision(newBeee)){
                beeObject.destroySelf(newBeee);
                console.log(dude);
                // return endGame();
            }else if (left > 25) {
                newBeee.style.left = `${left -= speed}px`;
                window.requestAnimationFrame(moveBee)
            } else {
                beeObject.destroySelf(newBeee);
            }
            }

            moveBee();
        }

        destroySelf(elementInstance){
            elementInstance.remove();
        }

        addListener(elementInstance){
            elementInstance.addEventListener("click", function(e){
            this.remove();
            })
        }

        generateSpeed(){
            return Math.floor(Math.random() * (20 - 5)) + 5;
        }

        generateVertialLocation(){
            return Math.floor(Math.random() * (window.innerHeight - 25)) + 25;
        }

        checkCollision(bee) {
            let gir = document.getElementById("dodger");
            let girTopEdge = parseInt(gir.style.top.replace(/[^0-9.]/g, "")) - 30;
            let girBottomEdge = parseInt(gir.style.top.replace(/[^0-9.]/g, "")) + 170;
            let girLeftEdge = parseInt(gir.style.left.replace(/[^0-9.]/g, ""));
            let girRightEdge = parseInt(gir.style.left.replace(/[^0-9.]/g, "")) + parseInt(gir.style.width.replace(/[^0-9.]/g, "")) + 85;

            let beeTopEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) - 10;
            let beeBottomEdge = parseInt(bee.style.top.replace(/[^0-9.]/g, "")) + 80;
            let beeLeftEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, "")); 
            let beeRightEdge = parseInt(bee.style.left.replace(/[^0-9.]/g, "")) + 80;

            if (beeTopEdge > girTopEdge && beeBottomEdge < girBottomEdge && beeLeftEdge > girLeftEdge && beeRightEdge < girRightEdge) {
            return true
            };

        }

        }
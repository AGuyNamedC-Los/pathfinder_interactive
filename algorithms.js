// creates the grid that allows alogirithms to interact with
class Grid {
    constructor() {
        this.rowSize;
        this.columnSize;
        this.gridArray = [];
        this.startSquare;
        this.goalSquare;
        this.wallPositions = [];

        // vars to be able to affect the DOM
        this.gridDOM = document.getElementById("grid-container");
        this.isMovingStart = false;
        this.isMovingGoal = false;
        this.isPainting = false;
        this.isShowingCost = false;
    }

    // deletes the grid array and then repopulates it with blank squares
    createGridArray() {
        this.rowSize = Math.trunc(window.innerWidth / 65);
        this.columnSize = Math.trunc(window.innerHeight / 90);
        this.gridArray.length = 0;
        // creating an array of squares
        for(let i = 0; i < this.columnSize; i++) {
            for(let j = 0; j < this.rowSize; j++) {
                this.gridArray.push({"index": (i*this.rowSize)+j,
                                "position": {"row": j, "col": i},
                                "directionalCost": "",
                                "direction": "",
                                "state": "blank", 
                                "parent": "",
                                "startDistance": 0,
                                "goalDistance": 0,
                                "total": 0});
            }
        }
    }

    // takes input from the grid array to color the grid's HTML
    colorGrid() {
        for(let i = 0; i < this.columnSize * this.rowSize; i++) {
            if(this.gridArray[i].state == blank) {
                this.gridDOM.children[i].style.backgroundColor = "#f2f2f2";
                this.gridDOM.children[i].style.borderColor = "#959595";
            } else if(this.gridArray[i].state == unvisited) {
                this.gridDOM.children[i].style.backgroundColor = "#88FFD1";
                this.gridDOM.children[i].style.borderColor = "#3FE1B0";
            } else if(this.gridArray[i].state == visited) { 
                this.gridDOM.children[i].style.backgroundColor = "#FF848C";
                this.gridDOM.children[i].style.borderColor = "#FF505F";
            } else if(this.gridArray[i].state == start) {
                this.gridDOM.children[i].style.backgroundColor = "#00DDFF";
                this.gridDOM.children[i].style.borderColor = "#0290EE";
            } else if(this.gridArray[i].state == goal) {
                this.gridDOM.children[i].style.backgroundColor = "#C588FF";
                this.gridDOM.children[i].style.borderColor = "#9059FF";
            } else if (this.gridArray[i].state == wall) {
                this.gridDOM.children[i].style.backgroundColor = "black";
            } else;
        }
    }

    setUpGrid() {
        this.createGridArray();
        this.startSquare = this.getSquareByIndex(startSquareIndex);
        this.startSquare.state = start;
        this.goalSquare = this.getSquareByIndex(goalSquareIndex);
        this.goalSquare.state = goal;
        this.createGridHTML();
        
        // dont show values when setting up the grid
        this.isShowingCost = false;
        this.toggleCosts();
        this.colorGrid();
    }

    // resets the entire grid except the placement of the walls, start, and goal squares
    async clearPath() {
        for(let i = 0; i < this.gridArray.length; i++) {
            if(this.gridArray[i].state == unvisited || this.gridArray[i].state == visited) {
                // reset the square's values except values relted to position
                this.gridArray[i].directionalCost = 0;
                this.gridArray[i].state = blank;
                this.gridArray[i].parent = "";
                this.gridArray[i].startDistance = 0;
                this.gridArray[i].goalDistance = 0;
                this.gridArray[i].total = 0;

                // css to recolor the square to a blank square
                this.gridDOM.children[i].style.backgroundColor = "#f2f2f2";
                this.gridDOM.children[i].style.borderColor = "#959595";

                // reset the square's HTML values
                this.gridDOM.children[i].getElementsByTagName("p")[0].innerHTML = this.gridArray[i].startDistance;
                this.gridDOM.children[i].getElementsByTagName("p")[1].innerHTML = this.gridArray[i].goalDistance;
                this.gridDOM.children[i].getElementsByTagName("p")[2].innerHTML = this.gridArray[i].total;
            }
        }

        this.colorGrid();   // recolor the grid
        visible = false;
        this.toggleCosts();
    }

    // completely resets the grid and repositions that start and goal squares to their initial positions
    resetGrid() {
        this.createGridArray();

        // reinitializing the saved start and goal squares
        startSquareIndex = 0;
        goalSquareIndex = this.gridArray.length - 1;
        this.startSquare = this.getSquareByIndex(startSquareIndex);
        this.startSquare.state = start;
        this.goalSquare = this.getSquareByIndex(goalSquareIndex);
        this.goalSquare.state = goal;

        this.colorGrid();   // recolor the grid
        this.updateSquareCosts();   // update the costs for HTML
        this.isShowingCost = false;
        this.toggleCosts();
    }

    // delete the gridArray as well as the HTML for it
    deleteGrid() {
        this.gridArray.length = 0;  // deleting the grid array
        let child = this.gridDOM.lastElementChild;

        // deleting all the squares from the grid
        while(child) {
            this.gridDOM.removeChild(child);
            child = this.gridDOM.lastElementChild;
        }
    }

    // returns the indices of all the walls that are currently on the grid
    getWallPositions() {
        this.wallPositions.length = 0;

        for (i = 0; i < this.rowSize * this.columnSize; i++) {
            if (this.gridArray[i].state == "wall") { this.wallPositions.push(i); }
        }
        return this.wallPositions;
    }

    // takes an array of the indices of all the walls there were on the old grid and apply them to the new grid
    // check for out of bounds! (currently not implemented)
    transferWalls(oldWalls) {
        for (i = 0; i < oldWalls.length; i++) {
            this.gridArray[oldWalls[i]].state = wall;
            this.changeSquareColor(this.gridArray[oldWalls[i]], wall);
        }
    }

    // applies a new state and resets the squares values except its positons
    resetSquare(square, newState) {
        square.directionalCost = "";
        square.direction = "";
        square.state = newState;
        square.parent = "";
        square.startDistance = 0;
        square.goalDistance = 0;
        square.total = 0;
    }

    // changes the color of a specific square
    changeSquareColor(square, newState) {
        if(newState == blank) {
                this.gridDOM.children[square.index].style.backgroundColor = "#f2f2f2";
                this.gridDOM.children[square.index].style.borderColor = "#959595";
            } else if(newState == unvisited) {
                this.gridDOM.children[square.index].style.backgroundColor = "#88FFD1";
                this.gridDOM.children[square.index].style.borderColor = "#3FE1B0";
            } else if(newState == visited) { 
                this.gridDOM.children[square.index].style.backgroundColor = "#FF848C";
                this.gridDOM.children[square.index].style.borderColor = "#FF505F";
            } else if(newState == start) {
                this.gridDOM.children[square.index].style.backgroundColor = "#00DDFF";
                this.gridDOM.children[square.index].style.borderColor = "#0290EE";
            } else if(newState == goal) {
                this.gridDOM.children[square.index].style.backgroundColor = "#C588FF";
                this.gridDOM.children[square.index].style.borderColor = "#9059FF";
            } else if (newState == wall) {
                this.gridDOM.children[square.index].style.backgroundColor = "black";
            } else if(newState == optimal){
                this.gridDOM.children[square.index].style.backgroundColor = "#FFEA7F";
                this.gridDOM.children[square.index].style.borderColor = "#FFD567";
            };
    }

    getSurroundingSquares(square) {
        let currSquare = JSON.parse(JSON.stringify(square));
        let neighborSquare = [];
        let potentialSquares = [];

        // up
        if(currSquare.position.col-1 >= 0) {
            neighborSquare = this.getSquareByIndex(square.index - this.rowSize);
            neighborSquare.directionalCost = nonDiagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // down
        if(currSquare.position.col+1 < this.columnSize) {
            neighborSquare = this.getSquareByIndex(square.index + this.rowSize);
            neighborSquare.directionalCost = nonDiagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // left
        if(currSquare.position.row-1 >= 0) {
            neighborSquare = this.getSquareByIndex(square.index-1);
            neighborSquare.directionalCost = nonDiagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // right
        if(currSquare.position.row+1 < this.rowSize)  {
            neighborSquare = this.getSquareByIndex(square.index + 1);
            neighborSquare.directionalCost = nonDiagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // up left
        if(currSquare.position.col-1 >= 0 && currSquare.position.row-1 >= 0){
            neighborSquare = this.getSquareByIndex(square.index - (this.rowSize + 1));
            neighborSquare.directionalCost = diagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // up right
        if(currSquare.position.col-1 >= 0 && currSquare.position.row+1 < this.rowSize){
            neighborSquare = this.getSquareByIndex(square.index - (this.rowSize - 1));
            neighborSquare.directionalCost = diagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // down left
        if(currSquare.position.col+1 < this.columnSize && currSquare.position.row-1 >= 0) {
            neighborSquare = this.getSquareByIndex(square.index + (this.rowSize - 1));
            neighborSquare.directionalCost = diagonalCost;
            potentialSquares.push(neighborSquare);
        }

        // down right
        if(currSquare.position.col+1 < this.columnSize && currSquare.position.row+1 < this.rowSize) {
            neighborSquare = this.getSquareByIndex(square.index + (this.rowSize + 1));
            neighborSquare.directionalCost = diagonalCost;
            potentialSquares.push(neighborSquare);
        }
        
        return potentialSquares;
    }

    // returns a square from the grid from a given set of coordinates
    getSquareByCoord(row, col) {
        for (let i = 0; i < this.rowSize * this.columnSize; i++)
            if(this.gridArray[i].position.row == row && this.gridArray[i].position.col == col)
                return this.gridArray[i];
    }

    getSquareByIndex(index) {
        return this.gridArray[index];
    }

    // updates a specific square's HTML values
    updateSquareCost(square) {
        this.gridDOM.children[square.index].getElementsByTagName("p")[0].innerHTML = square.startDistance;
        this.gridDOM.children[square.index].getElementsByTagName("p")[1].innerHTML = square.goalDistance;
        this.gridDOM.children[square.index].getElementsByTagName("p")[2].innerHTML = square.total;
    }

    // displays the costs for distance from the start and goal for each square, as well as the total cost
    updateSquareCosts() {
        for(let i = 0; i < this.columnSize * this.rowSize; i++) {
            if(this.gridArray[i].state != wall || this.gridArray[i].state != blank) {
                this.gridDOM.children[i].getElementsByTagName("p")[0].innerHTML = this.gridArray[i].startDistance;
                this.gridDOM.children[i].getElementsByTagName("p")[1].innerHTML = this.gridArray[i].goalDistance;
                this.gridDOM.children[i].getElementsByTagName("p")[2].innerHTML = this.gridArray[i].total;
            }
        }
    }

    // color will change on click for a square
    changeSquare(i) {
        if(!this.isShowingCost) { this.toggleCosts(); }

        if(this.gridArray[i].state == start) {       // ensure only the start square can be moved
            this.isMovingStart = true;
            return;
        } else if(this.gridArray[i].state == goal) {     // ensure only the goal square can be moved
            this.isMovingGoal = true;
            return;
        }

        this.isPainting = true;
        if(this.gridArray[i].state == blank) {
            this.changeSquareColor(this.getSquareByIndex(i), wall);
            this.resetSquare(this.getSquareByIndex(i), wall);
        } else if(this.gridArray[i].state == wall) {
            this.changeSquareColor(this.getSquareByIndex(i), blank);
            this.resetSquare(this.getSquareByIndex(i), blank);
        }
    }

    toggleCosts() {      // maybe pass in the the algorithms dom in the future since i will be adding more
        let costs = this.gridDOM.children;
        if(this.isShowingCost) {
            for(let i = 0; i < this.columnSize * this.rowSize; i++) {
                if(this.gridArray[i].state != wall && this.gridArray[i].state != blank) {
                    console.log(this.gridArray[i].state);
                    costs[i].getElementsByTagName("p")[0].style.display = "";
                    costs[i].getElementsByTagName("p")[1].style.display = "";
                    costs[i].getElementsByTagName("p")[2].style.display = "";
                }

            }
            this.isShowingCost = false;
        } else {
            this.isShowingCost = true;
            for(let i = 0; i < this.columnSize * this.rowSize; i++) {
                costs[i].getElementsByTagName("p")[0].style.display = "none";
                costs[i].getElementsByTagName("p")[1].style.display = "none";
                costs[i].getElementsByTagName("p")[2].style.display = "none";
            }
        }
    }

    // allows the ability to click and drag squares causing the "paint" effect
    painting(i) {
        if(this.isMovingStart) {     // allows the ability to click and drag the start square
            startSquareIndex = i;       // update the global start square's index
            if(startSquareIndex == goalSquareIndex) { return; } // so we dont overwrite the goalSquare's position

            // logic to properly change the color of the dragged startSquare over blank squares
            let temp = JSON.parse(JSON.stringify(this.startSquare));
            this.startSquare = this.gridArray[i];
            this.startSquare.state = start;
            this.startSquare.parent = ""

            // change the current positon to the start square's color
            this.changeSquareColor(this.getSquareByIndex(this.startSquare.index), start);

            // change the previous position to a blank square
            this.changeSquareColor(this.getSquareByIndex(temp.index), blank);
            this.resetSquare(this.getSquareByIndex(temp.index), blank);
            return;
        } else if (this.isMovingGoal) {      // allows the ability to click and drag the goal square
            goalSquareIndex = i;    // update the global goal square's index
            if(goalSquareIndex == startSquareIndex) { return; }     // so we dont overwrite the startSquare's position
            
            // logic to properly change the color of the dragged goalSquare over blank squares
            let temp = JSON.parse(JSON.stringify(this.goalSquare));
            this.goalSquare = this.gridArray[i];
            this.goalSquare.state = goal;
            this.goalSquare.parent = "";

            // change the current position to the goal square's color
            this.changeSquareColor(this.getSquareByIndex(this.goalSquare.index), goal);

            // change the previous position to a blank square
            this.changeSquareColor(this.getSquareByIndex(temp.index), blank);
            this.resetSquare(this.getSquareByIndex(temp.index), blank);
            return;
        }

        if(this.isPainting) {        // allows the ability to click and drag to create walls or delete walls
            if(this.gridArray[i].state == blank) {
                this.changeSquareColor(this.getSquareByIndex(i), wall);
                this.resetSquare(this.getSquareByIndex(i), wall);
            } else if(this.gridArray[i].state == wall) {
                this.changeSquareColor(this.getSquareByIndex(i), blank);
                this.resetSquare(this.getSquareByIndex(i), blank);
            }
        }
    }

    // stops the ability to click and drag a square after a onmouseup event
    stopPainting() {
        if(this.isMovingStart) { this.isMovingStart = false; } 
        else if (this.isMovingGoal) { this.isMovingGoal = false; } 
        else if(this.isPainting) { this.isPainting = false; }
    }

                    // appends squares to the grid div
                    createGridHTML() {
        for(let i = 0; i < this.rowSize * this.columnSize; i++) {
            if (this.gridArray[i].state != start && this.gridArray[i].state != goal) {
                $("#grid-container").append(`<div class=square onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">
                                            <p class="start" onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">${this.gridArray[i]['startDistance']}</p>
                                            <p class="goal" onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">${this.gridArray[i]['goalDistance']}</p>
                                            <p class="total" onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">${this.gridArray[i]['total']}</p>
                                        </div>`);
            } else if (this.gridArray[i].state == start) {
                this.startSquare = this.gridArray[i];
                $("#grid-container").append(`<div class=square onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">
                                            <p class="start">${this.gridArray[i]['startDistance']}</p>
                                            <p class="goal">${this.gridArray[i]['goalDistance']}</p>
                                            <p class="total">${this.gridArray[i]['total']}</p>
                                        </div>`);
            } else {
                this.goalSquare = this.gridArray[i];
                $("#grid-container").append(`<div class=square onmousedown="${algorithmObject}.changeSquare('${this.gridArray[i].index}')" onmouseover="${algorithmObject}.painting('${this.gridArray[i].index}')" onmouseup="${algorithmObject}.stopPainting()">
                                            <p class="start">${this.gridArray[i]['startDistance']}</p>
                                            <p class="goal">${this.gridArray[i]['goalDistance']}</p>
                                            <p class="total">${this.gridArray[i]['total']}</p>
                                        </div>`);
            }

            // css to create the grid dimensions
            this.gridDOM.style.gridTemplateColumns = `repeat(${this.rowSize}, ${squareSize})`;
            this.gridDOM.style.gridTemplateRows = `repeat(${this.columnSize}, ${squareSize})`;
        }
    }
}

class A_Star extends Grid {
    constructor() {
        super();
        this.openSquares = [];
        this.closedSquares = [];
        this.visitedSquares = [];
        this.timeout;
    }

    setGoalDistance(square) {
        let currSquare = JSON.parse(JSON.stringify(square));        // creating a deep copy as to not affect the original square just yet
        currSquare.startDistance = 0;       // resetting the value so the main copy doesn't have its value added to it
        let startSquare = this.startSquare;
        let goalSquare = this.goalSquare;

        // // find the start distance of the current square
        // while (currSquare.position.col != this.startSquare.position.col || currSquare.position.row != this.startSquare.position.row) {
        //     if(currSquare.position.col == this.startSquare.position.col) {      // check if square is in the same COLUMN of starting square
        //         if (currSquare.position.row < this.startSquare.position.row) {
        //             currSquare.position.row += 1;
        //             currSquare.startDistance += nonDiagonalCost;
        //         } else if (currSquare.position.row > this.startSquare.position.row) { 
        //             currSquare.position.row -= 1;
        //             currSquare.startDistance += nonDiagonalCost;
        //         } else;
        //     } else if (currSquare.position.row == this.startSquare.position.row) {      // check if square is in the same ROW of starting square
        //         if (currSquare.position.col < this.startSquare.position.col) {
        //             currSquare.position.col += 1;
        //             currSquare.startDistance += nonDiagonalCost;
        //         } else if (currSquare.position.col > this.startSquare.position.col) {
        //             currSquare.position.col -= 1;
        //             currSquare.startDistance += nonDiagonalCost;
        //         } else;
        //     } else {        // square is diagonally away from the start square
        //         if (currSquare.position.col < this.startSquare.position.col) { currSquare.position.col += 1; }
        //         else if (currSquare.position.col > this.startSquare.position.col) {currSquare.position.col -= 1;}
        //         else;

        //         if(currSquare.position.row < this.startSquare.position.row) { currSquare.position.row += 1; }
        //         else if (currSquare.position.row > this.startSquare.position.row) { currSquare.position.row -= 1; }
        //         else;

        //         currSquare.startDistance += diagonalCost;
        //     }
        // }

        // square.startDistance = currSquare.startDistance;        // new startDistance

        currSquare = JSON.parse(JSON.stringify(square));        // creating a deep copy as to not affect the original square just yet
        currSquare.goalDistance = 0;        // resetting the value so the main copy doesn't have its value added to
        
        // find the goal distance of a square
        while (currSquare.position.col != this.goalSquare.position.col || currSquare.position.row != this.goalSquare.position.row) {
            if(currSquare.position.col == this.goalSquare.position.col) {      // check if node is in the same COLUMN of start square
                if (currSquare.position.row < this.goalSquare.position.row) {
                    currSquare.position.row += 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else if (currSquare.position.row > this.goalSquare.position.row) { 
                    currSquare.position.row -= 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else;
            } else if (currSquare.position.row == this.goalSquare.position.row) {      // check if node is in the same ROW of start square
                if (currSquare.position.col < this.goalSquare.position.col) {
                    currSquare.position.col += 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else if (currSquare.position.col > this.goalSquare.position.col) {
                    currSquare.position.col -= 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else;
            } else {        // check if the square is in the same DIAGONAL of start square
                if (currSquare.position.col < this.goalSquare.position.col) { currSquare.position.col += 1; } 
                else if (currSquare.position.col > this.goalSquare.position.col) { currSquare.position.col -= 1; }
                else;

                if(currSquare.position.row < this.goalSquare.position.row) { currSquare.position.row += 1; } 
                else if (currSquare.position.row > this.goalSquare.position.row) { currSquare.position.row -= 1; } 
                else;

                currSquare.goalDistance += diagonalCost;
            }
        }

        square.goalDistance = currSquare.goalDistance;      // new goalDistance
        if(square.state != this.startSquare.state && square.state != this.goalSquare.state) 
            square.total = square.startDistance + square.goalDistancel;       // new total distance
        else 
            square.total = 0;      
    }

    setSurroundingSquares(square) {
        let currSquare = JSON.parse(JSON.stringify(square));
        let neighborSquare = [];
        let potentialSquares = this.getSurroundingSquares(square);

        // only keep unvisited, blank, and goal squares
        for(let i = 0; i < potentialSquares.length; i++) {
            if(potentialSquares[i].state != unvisited && potentialSquares[i].state != blank && potentialSquares[i].state != goal ) {
                potentialSquares.splice(i, 1);  // remove the node since its either the wall, visited, or start square
                i--;
            } else {
                if(potentialSquares[i].state == goal) { // if goal is found then just return and add it to the unexplored squares
                    potentialSquares[i].parent = square;
                    let newSquare = JSON.parse(JSON.stringify(potentialSquares[i]))
                    this.openSquares.push(newSquare);
                    return;
                }

                if(potentialSquares[i].total == 0) {        // if the square is blank then just update it based on the square that is discovering it
                    // update the neighbor square's state, start distance, and total values
                    this.setGoalDistance(potentialSquares[i]);    // to get the goal cost
                    potentialSquares[i].startDistance = square.startDistance + potentialSquares[i].directionalCost;
                    potentialSquares[i].total = potentialSquares[i].startDistance + potentialSquares[i].goalDistance;
                    potentialSquares[i].parent = square;
                    potentialSquares[i].state = unvisited;
                    this.changeSquareColor(potentialSquares[i], unvisited);
                    this.updateSquareCost(potentialSquares[i]);
                } else {
                    // ensure that the neighbor has the smallest total cost possible
                    if(potentialSquares[i].total > square.startDistance + potentialSquares[i].goalDistance + potentialSquares[i].directionalCost) {
                        potentialSquares[i].startDistance = square.startDistance + potentialSquares[i].directionalCost;
                        potentialSquares[i].total = potentialSquares[i].startDistance + potentialSquares[i].goalDistance;
                        this.updateSquareCost(potentialSquares[i]);
                    }
                }
            }
        }

        // add squares to the openSquares array if any
        if(this.openSquares.length > 0 && potentialSquares.length > 0) {  // case of both arrays having items in them
            for(let i = 0; i < this.openSquares.length; i++) {
                for(let j = 0; j < potentialSquares.length; j++) {
                    // ensure duplicates are rewritten and assigned to the unexplored array, not added to
                    if(this.openSquares[i].index == potentialSquares[j].index) {
                        this.openSquares[i] = JSON.parse(JSON.stringify(potentialSquares[j]));    // reassign updated square
                        potentialSquares.splice(j,1);   // delete that square
                        j--;
                    }
                }
            }

            this.openSquares = this.openSquares.concat(potentialSquares);   // squares being added are now completely new
        } else if (potentialSquares.length > 0) {   // case of the unexplored array being empty but not the potentialSquares array
            for(let i = 0; i < potentialSquares.length; i++) {
                let newSquare = JSON.parse(JSON.stringify(potentialSquares[i]));
                this.openSquares.push(newSquare);
            }
        }
    }

    // sorts the total costs from the unexplored array in ascending order
    sortTotalCostsAscend() {
        this.openSquares.sort(function(a,b) {
            return a.total - b.total;
        });
    }

    // sorts the total costs from the unexplored array in descending order
    sortTotalCostsDescend() {
        this.visitedSquares.sort(function(a,b) {
            return b.total - a.total;
        });
    }

    markOptimalPath(goalSquare) {
        let currSqaure = goalSquare;

        while(currSqaure.state != start) {
            let i = 0;
            let potentialSquares = this.getSurroundingSquares(this.getSquareByIndex(currSqaure.index));
            for (let k = 0; k < potentialSquares.length; k++) {
                if(potentialSquares[k].state != visited && potentialSquares[k].state != unvisited && potentialSquares[k].state != start) {
                    potentialSquares.splice(k,1);
                    k--;
                }
            }
            potentialSquares.sort(function(a,b) {return a.startDistance - b.startDistance});
            let bestSquare = potentialSquares[0];
            while (i+1 < potentialSquares.length && bestSquare.total == potentialSquares[i+1].total) {
                if(bestSquare.startDistance > potentialSquares[i+1].startDistance) {
                    bestSquare = potentialSquares[i+1];
                }
                i++;
            }
            this.changeSquareColor(bestSquare, optimal);
            currSqaure = bestSquare;
        }

        this.changeSquareColor(this.startSquare, start);
    }

    // A* algorithm
    async execute() {
        // reset everything
        this.clearPath();
        let currSquare = this.startSquare;
        let nextSquare = [];
        let lowestTotalSquare = [];
        this.openSquares.length = 0;
        this.closedSquares.length = 0;
        this.visitedSquares.length = 0;

        this.setGoalDistance(this.startSquare);   // to get the goal distance
        this.setGoalDistance(this.goalSquare);    // to get teh goal distance
        this.setSurroundingSquares(currSquare);

        // find the next square to explore
        while(this.openSquares.length != 0) {
            let j = 0;
            this.sortTotalCostsAscend();       // lowest total cost will be the first element
            lowestTotalSquare = this.openSquares[0];

            // get the next lowest total cost
            while(j+1 < this.openSquares.length && lowestTotalSquare.total == this.openSquares[j+1].total) {
                // if the total costs are the same get the next lowest start distance
                if(lowestTotalSquare.startDistance < this.openSquares[j+1].startDistance) {
                    lowestTotalSquare = this.openSquares[j+1];
                }
                j++;
            }
            currSquare = this.getSquareByIndex(lowestTotalSquare.index);
            this.visitedSquares.push(currSquare);

            if(currSquare.state == goal)  {
                this.markOptimalPath(currSquare);
                return;
            }

            currSquare.state = visited;
            this.closedSquares.push(currSquare);
            this.changeSquareColor(currSquare, visited);

            // remove the current square from the unexplored array
            for(let i = 0; i < this.openSquares.length; i++) {
                if(this.openSquares[i].position.row == currSquare.position.row && this.openSquares[i].position.col == currSquare.position.col) {
                    this.openSquares.splice(i, 1);
                    break;
                }
            }

            this.setSurroundingSquares(this.getSquareByIndex(currSquare.index));
        }
    }
}

class GreedyBestFirstSearch extends Grid {
    constructor() {
        super();    // to create the Grid object
        this.openSquares = [];
        this.closedSquares = [];
        this.visitedSquares = [];
    }

    setGoalDistance(square) {
        let currSquare = JSON.parse(JSON.stringify(square));        // creating a deep copy as to not affect the original square just yet
        currSquare.startDistance = 0;       // resetting the value so the main copy doesn't have its value added to it
        let startSquare = this.startSquare;
        let goalSquare = this.goalSquare;

        currSquare = JSON.parse(JSON.stringify(square));        // creating a deep copy as to not affect the original square just yet
        currSquare.goalDistance = 0;        // resetting the value so the main copy doesn't have its value added to
        
        // find the goal distance of a square
        while (currSquare.position.col != this.goalSquare.position.col || currSquare.position.row != this.goalSquare.position.row) {
            if(currSquare.position.col == this.goalSquare.position.col) {      // check if node is in the same COLUMN of start square
                if (currSquare.position.row < this.goalSquare.position.row) {
                    currSquare.position.row += 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else if (currSquare.position.row > this.goalSquare.position.row) { 
                    currSquare.position.row -= 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else;
            } else if (currSquare.position.row == this.goalSquare.position.row) {      // check if node is in the same ROW of start square
                if (currSquare.position.col < this.goalSquare.position.col) {
                    currSquare.position.col += 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else if (currSquare.position.col > this.goalSquare.position.col) {
                    currSquare.position.col -= 1;
                    currSquare.goalDistance += nonDiagonalCost;
                } else;
            } else {        // check if the square is in the same DIAGONAL of start square
                if (currSquare.position.col < this.goalSquare.position.col) { currSquare.position.col += 1; } 
                else if (currSquare.position.col > this.goalSquare.position.col) { currSquare.position.col -= 1; }
                else;

                if(currSquare.position.row < this.goalSquare.position.row) { currSquare.position.row += 1; } 
                else if (currSquare.position.row > this.goalSquare.position.row) { currSquare.position.row -= 1; } 
                else;

                currSquare.goalDistance += diagonalCost;
            }
        }

        square.goalDistance = currSquare.goalDistance;      // new goalDistance
        if(square.state != start && square.state != goal) 
            square.total = 0;       // new total distance
        else 
            square.total = 0;      
    }

    setSurroundingSquares(square) {
        let currSquare = JSON.parse(JSON.stringify(square));
        let neighborSquare = [];
        let potentialSquares = this.getSurroundingSquares(square);

        // only keep -, blank, and goal squares
        for(let i = 0; i < potentialSquares.length; i++) {
            if(potentialSquares[i].state != blank && potentialSquares[i].state != goal ) {
                potentialSquares.splice(i, 1);  // remove the node since its either the wall, visited, or start square
                i--;
            } else {
                if(potentialSquares[i].state == goal) { // if goal is found then just return and add it to the openSquare (maybe add it to closed squares...)
                    potentialSquares[i].parent = square;
                    let newSquare = JSON.parse(JSON.stringify(potentialSquares[i]))
                    this.openSquares.push(newSquare);
                    return;
                }

                if(potentialSquares[i].goalDistance == 0) {        // if the square is blank then just update it based on the square that is discovering it
                    // update the neighbor square's state, start distance, and total values
                    this.setGoalDistance(potentialSquares[i]);    // to get the goal cost
                    potentialSquares[i].parent = square;
                    potentialSquares[i].state = unvisited;
                    this.changeSquareColor(potentialSquares[i], unvisited);
                    this.updateSquareCost(potentialSquares[i]);
                }
            }
        }

        // add squares to the openSquares array if any
        if(this.openSquares.length > 0 && potentialSquares.length > 0) {  // case of both arrays having items in them
            for(let i = 0; i < this.openSquares.length; i++) {
                for(let j = 0; j < potentialSquares.length; j++) {
                    // ensure duplicates are rewritten and assigned to the unexplored array, not added to
                    if(this.openSquares[i].index == potentialSquares[j].index) {
                        this.openSquares[i] = JSON.parse(JSON.stringify(potentialSquares[j]));    // reassign updated square
                        potentialSquares.splice(j,1);   // delete that square
                        j--;
                    }
                }
            }

            this.openSquares = this.openSquares.concat(potentialSquares);   // squares being added are now completely new
        } else if (potentialSquares.length > 0) {   // case of the unexplored array being empty but not the potentialSquares array
            for(let i = 0; i < potentialSquares.length; i++) {
                let newSquare = JSON.parse(JSON.stringify(potentialSquares[i]));
                this.openSquares.push(newSquare);
            }
        }
    }

    sortGoalDistances() {
        this.openSquares.sort(function(a,b) {
            return a.goalDistance - b.goalDistance;
        });
    }

    execute() {
        // reset everything
        this.clearPath();
        let currSquare = this.startSquare;
        let nextSquare = [];
        let lowestTotalSquare = [];
        this.openSquares.length = 0;
        this.closedSquares.length = 0;
        this.visitedSquares.length = 0;

        this.setGoalDistance(this.startSquare);   // to get the goal distance
        this.setGoalDistance(this.goalSquare);    // to get teh goal distance
        this.setSurroundingSquares(currSquare);

        // find the next square to explore
        while(this.openSquares.length != 0) {
            let j = 0;
            this.sortGoalDistances();       // lowest total cost will be the first element
            lowestTotalSquare = this.openSquares[0];

            // get the next lowest total cost
            while(j+1 < this.openSquares.length && lowestTotalSquare.goalDistance == this.openSquares[j+1].goalDistance) {
                // if the total costs are the same get the next lowest start distance
                if(lowestTotalSquare.goalDistance < this.openSquares[j+1].goalDistance) {
                    lowestTotalSquare = this.openSquares[j+1];
                }
                j++;
            }

            // // get the next lowest total cost
            // while(j+1 < this.openSquares.length && lowestTotalSquare.total == this.openSquares[j+1].total) {
            //     // if the total costs are the same get the next lowest start distance
            //     if(lowestTotalSquare.goalDistance < this.openSquares[j+1].goalDistance) {
            //         lowestTotalSquare = this.openSquares[j+1];
            //     }
            //     j++;
            // }
            currSquare = this.getSquareByIndex(lowestTotalSquare.index);
            this.visitedSquares.push(currSquare);


            if(currSquare.state == goal) {
                while(currSquare.state != start) {  // color the most optimal path yellow
                    currSquare = currSquare.parent;
                    if(currSquare.state == start) break;    // so we dont overwrite the start square's color
                    this.gridDOM.children[currSquare.index].style.backgroundColor = "#FFEA7F";
                    this.gridDOM.children[currSquare.index].style.borderColor = "#FFD567";
                }
                return;
            }

            currSquare.state = visited;
            this.closedSquares.push(currSquare);
            this.changeSquareColor(currSquare, visited);

            // remove the current square from the unexplored array
            for(let i = 0; i < this.openSquares.length; i++) {
                if(this.openSquares[i].position.row == currSquare.position.row && this.openSquares[i].position.col == currSquare.position.col) {
                    this.openSquares.splice(i, 1);
                    break;
                }
            }

            this.setSurroundingSquares(this.getSquareByIndex(currSquare.index));
        }
    }
}
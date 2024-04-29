//This is a change I've made

// Creating game board
const gameBoard = document.querySelector(".game-board");
for (let i = 0; i < 20 * 10; i++) {
    const gameCell = document.createElement("div");
    gameCell.textContent = i;
    gameCell.className = "game-cell";
    gameCell.setAttribute("data-cell-number", `${i}`);
    gameCell.setAttribute("data-piece", "");
    gameBoard.appendChild(gameCell);
}

const boardCells = document.querySelectorAll(".game-board .game-cell");
const heldPieceCells = document.querySelectorAll(".held-piece .preview-cell");

var score = 0;
var level = 1;
var lines = 0;
var boardCols = [];
var boardRows = [];
var ghostPiece;
var heldCounter = 0;
var curTetronimo;
var heldTetronimo;
var cell = 0;

document.getElementById("lines").textContent = lines;

var rotations = {
    "i-shape": [
        [-8, 1, 10, 19],
        [21, 10, -1, -12],
        [8, -1, -10, -19],
        [-21, -10, 1, 12]
    ],
    "j-shape": [
        [2, -9, 0, 9],
        [20, 11, 0, -11],
        [-2, 9, 0, -9],
        [-20, -11, 0, 11]
    ],
    "l-shape": [
        [20, -9, 0, 9],
        [-2, 11, 0, -11],
        [-20, 9, 0, -9],
        [2, -11, 0, 11]
    ],
    "o-shape": [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    "s-shape": [
        [11, 20, -9, 0],
        [9, -2, 11, 0],
        [-11, -20, 9, 0],
        [-9, 2, -11, 0]
    ],
    "t-shape": [
        [11, -9, 0, 9],
        [9, 11, 0, -11],
        [-11, 9, 0, -9],
        [-9, -11, 0, 11]
    ],
    "z-shape": [
        [2, 11, 0, 9],
        [20, 9, 0, -11],
        [-2, -11, 0, -9],
        [-20, -9, 0, 11]
    ]
};

// Makes an array for each row
for (let i = 0; i < 20; i++) {
    var addRow = [];
    for (let k = 0; k < 10; k++) {
        addRow[k] = boardCells[cell];
        cell++;
    }
    boardRows[i] = addRow;
}

// Makes an array for each column
for (let i = 0; i < 10; i++) {
    var addCol = [];
    for (let k = 0; k < 20; k++) {
        addCol[k] = boardRows[k][i];
    }
    boardCols[i] = addCol;
}

// Generates a random Tetronimo
function generateTetronimo() {
    var pieces = [
        {
            position: [10, 11, 12, 13],
            original_position: [10, 11, 12, 13],
            shape_type: "i-shape",
            shape_color: "cyan",
            shape_rotation: 0
        },
        {
            position: [0, 10, 11, 12],
            original_position: [0, 10, 11, 12],
            shape_type: "j-shape",
            shape_color: "blue",
            shape_rotation: 0
        },
        {
            position: [2, 10, 11, 12],
            original_position: [2, 10, 11, 12],
            shape_type: "l-shape",
            shape_color: "orange",
            shape_rotation: 0
        },
        {
            position: [1, 2, 11, 12],
            original_position: [1, 2, 11, 12],
            shape_type: "o-shape",
            shape_color: "yellow",
            shape_rotation: 0
        },
        {
            position: [1, 2, 10, 11],
            original_position: [1, 2, 10, 11],
            shape_type: "s-shape",
            shape_color: "green",
            shape_rotation: 0
        },
        {
            position: [1, 10, 11, 12],
            original_position: [1, 10, 11, 12],
            shape_type: "t-shape",
            shape_color: "purple",
            shape_rotation: 0
        },
        {
            position: [0, 1, 11, 12],
            original_position: [0, 1, 11, 12],
            shape_type: "z-shape",
            shape_color: "red",
            shape_rotation: 0
        }
    ];

    var variation = Math.floor(Math.random() * (6 - 0 + 1)) + 0;
    return pieces[variation];
}

// Swaps held piece with current piece
function swapHeldPiece() {
    // If no tetronimo being held, puts the current one in held
    if (typeof heldTetronimo === "undefined") {
        removeGhostPosition(ghostPiece.position);

        heldTetronimo = structuredClone(curTetronimo);
        heldTetronimo.position = heldTetronimo.original_position;
        heldTetronimo.shape_rotation = 0;
        removePosition(curTetronimo);
        setNewTetronimo();

        heldCounter = 1;
        document.querySelector(".held-piece").classList.add("grayed-out");
    }
    // If piece is held, swaps them
    else if (heldCounter === 0) {
        removePosition(curTetronimo);

        let tempHold = structuredClone(curTetronimo);
        tempHold.position = tempHold.original_position;
        tempHold.shape_rotation = 0;
        curTetronimo = heldTetronimo;
        heldTetronimo = tempHold;
        updatePosition(curTetronimo, 3);

        heldCounter = 1;
        document.querySelector(".held-piece").classList.add("grayed-out");

        updateGhostPiece();
    }
    // If already swapped a piece, does nothing
    else {
        return;
    }

    heldPieceCells.forEach((el) => {
        el.style.backgroundColor = "";
    });

    heldTetronimo.original_position.forEach((el) => {
        document.querySelector(`[data-preview-cell-number="${el + 10}"]`).style.backgroundColor = heldTetronimo.shape_color;
    });
}

// Removes current piece location
function removePosition(arr) {
    arr.position.forEach((el, index) => {
        document.querySelector(`[data-cell-number="${el}"]`).setAttribute("data-piece", "");
        document.querySelector(`[data-cell-number="${el}"]`).style.backgroundColor = "";
    });
}

// Moves piece to a new location
function updatePosition(arr, dir = 0) {
    arr.position.forEach((el, index) => {
        el += dir;
        document.querySelector(`[data-cell-number="${el}"]`).setAttribute("data-piece", "true");
        document.querySelector(`[data-cell-number="${el}"]`).style.backgroundColor = arr.shape_color;
        arr.position[index] = el;
    });

    document.getElementById("score").textContent = score;
}

// Removes current GHOST piece location
function removeGhostPosition(arr) {
    arr.forEach((el, index) => {
        document.querySelector(`[data-cell-number="${el}"]`).classList.remove("ghost-piece-active");
    });
}

// Moves GHOST piece to a new location
function updateGhostPosition(arr, dir = 0) {
    arr.position.forEach((el, index) => {
        el += dir;
        document.querySelector(`[data-cell-number="${el}"]`).classList.add("ghost-piece-active");
        arr.position[index] = el;
    });
}

// Updates GHOST position to match the normal one
function updateGhostPiece() {
    if(JSON.stringify(ghostPiece.position) === JSON.stringify(curTetronimo.position) && JSON.stringify(curTetronimo.position) !== JSON.stringify(curTetronimo.original_position.map((el)=>{return el + 3}))){
        return;
    }
    removeGhostPosition(ghostPiece.position);
    ghostPiece = structuredClone(curTetronimo);
    updateGhostPosition(ghostPiece, hardDrop());
}

//checks if piece is going to rotate outside wall/into other piece
function checkCollision (curPiece, newPieceLocation){
    oldPieceLocation = curPiece.position;

    var colliding = false;

    //if at the top left returns true
    if((newPieceLocation.some(element => element < 0))){
        colliding = true;
        return colliding;
    }

    removePosition(curPiece);

    newPieceLocation.forEach((el, index)=>{
        //checks if new location is outside of board or has a piece already
        
        if((document.querySelector(`[data-cell-number="${el}"]`).getAttribute("data-piece") === "true" || ((oldPieceLocation[index] % 10 < 3 && el % 10 > 6) ||
        (oldPieceLocation[index] % 10 > 6 && el % 10 < 3)))){
            colliding = true;
        }
    });

    updatePosition(curPiece);

    return colliding;
}

// Rotates pieces
function rotatePiece(piece, rotationDirection) {
    var newLocation = [];
    var illegalRotation = false;
    var previousRotation = piece.shape_rotation === 0 ? 3 : piece.shape_rotation - 1;

    // Rotate to the LEFT
    if (rotationDirection === "z") {
        // Checks which rotation to use

        piece.position.forEach((el, index) => {
            let newCellLocation = el - rotations[piece.shape_type][previousRotation][index];
            newLocation[index] = newCellLocation;
        });

        // if at the bottom, doesn't rotate
        if (newLocation.some(value => value > 199)) {
            return;
        }

        debugger;

        //checks if colliding
        if(checkCollision(piece, newLocation)){
            //kicks tetronimo off wall/piece to see if its possible to rotate

            //kicks right
            var newLocation = newLocation.map((el) => el+1)

            //if i piece at a rotation 3, kicks off an aditional 1 space
            //if rotation 3 on certain pieces, adjusts kickoff by -1
            if(piece.shape_type == "i-shape" && (piece.shape_rotation == 1)){
                var newLocation = newLocation.map((el) => el+1);
            }else if(["t-shape","j-shape","l-shape","z-shape","s-shape"].includes(piece.shape_type) && (piece.shape_rotation == 3)){
                var newLocation = newLocation.map((el) => el-2);
            }else{
                var newLocation = newLocation.map((el) => el);
            }
        }

        //checks if colliding, if not updates to new location
        if(!checkCollision(piece, newLocation)){
            removePosition(piece)

            curTetronimo.position = newLocation;
            piece.shape_rotation === 0
                ? (piece.shape_rotation = 3)
                : (piece.shape_rotation -= 1);


            updatePosition(piece);

            updateGhostPiece();
            return;
        }else{
            //kicks left
            var newLocation = newLocation.map((el) => el-3);
            
            if(!checkCollision(piece, newLocation)){
                removePosition(piece)
    
                curTetronimo.position = newLocation;
                piece.shape_rotation === 0
                    ? (piece.shape_rotation = 3)
                    : (piece.shape_rotation -= 1);
    
    
                updatePosition(piece);
    
                updateGhostPiece();
                return;
            }
        }
    } else {
        // Rotate to the RIGHT
        piece.position.forEach((el, index) => {
            // Updates to new position
            let newCellLocation = el + rotations[piece.shape_type][piece.shape_rotation][index];
            newLocation[index] = newCellLocation;
        });

        // if at the bottom, doesn't rotate
        if (newLocation.some(value => value > 199)) {
            return;
        }

        //checks if colliding
        if(checkCollision(piece, newLocation)){
            //kicks tetronimo off wall/piece to see if its possible to rotate
            //if i piece at a rotation 3, kicks off an aditional 1 space
            if(piece.shape_type == "i-shape" && piece.shape_rotation == 3){
                var newLocation = newLocation.map((el) => el-2);
            }else{
                var newLocation = newLocation.map((el) => el-1);
            }
        }

        //checks if colliding, if not updates to new location
        if(!checkCollision(piece, newLocation)){
            removePosition(piece)

            curTetronimo.position = newLocation;
            piece.shape_rotation === 3
                ? (piece.shape_rotation = 0)
                : (piece.shape_rotation += 1);


            updatePosition(piece);

            updateGhostPiece();
            return;
        }else{
            //kicks right

            //if i piece at a rotation 3, kicks off an aditional 1 space
            if(piece.shape_type == "i-shape" && (piece.shape_rotation == 1 || piece.shape_rotation == 3)){
                var newLocation = newLocation.map((el) => el+3);
            }else{
                var newLocation = newLocation.map((el) => el+2);
            }

            if(!checkCollision(piece, newLocation)){
                removePosition(piece)
    
                curTetronimo.position = newLocation;
                piece.shape_rotation === 3
                    ? (piece.shape_rotation = 0)
                    : (piece.shape_rotation += 1);
    
    
                updatePosition(piece);
    
                updateGhostPiece();
                return;
            }    
        }
    }
}

// Used for calculating if touching LEFT wall
function filterNumbersLeftMost(arr) {
    const copiedArr = [...arr];

    // Returns leftmost tiles of a tetronimo
    return copiedArr
        .sort((a, b) => a - b)
        .filter((num, index, array) => index === 0 || num - array[index - 1] >= 5);
}

// Used for calculating if touching RIGHT wall
function filterNumbersRightMost(arr) {
    const sortedArr = [...arr].sort((a, b) => b - a); // Create a copy and sort in descending order

    for (let i = 0; i < sortedArr.length - 1; ) {
        const currentNum = sortedArr[i];
        const nextNum = sortedArr[i + 1];

        if (currentNum - nextNum < 5) {
            // Remove the lower element from the copy
            sortedArr.splice(i + 1, 1);
        } else {
            // Move to the next pair of elements
            i++;
        }
    }

    return sortedArr; // Return the sorted and filtered copy
}

// Checks if piece is touching LEFT wall
function touchingLeftWall() {
    var leftPieces = filterNumbersLeftMost(curTetronimo.position);
    for (let el of leftPieces) {
        if (el % 10 === 0 || boardCells[el - 1].getAttribute("data-piece") === "true") {
            return true; // Part of the piece is at the leftmost part
        }
    }
    return false; // Not on the most left part
}

// Checks if piece is touching RIGHT wall
function touchingRightWall() {
    var rightPieces = filterNumbersRightMost(curTetronimo.position);

    for (let el of rightPieces) {
        if (el % 10 === 9 || boardCells[el + 1].getAttribute("data-piece") === "true") {
            return true; // Part of the piece is at the rightmost part
        }
    }
    return false; // Not on the most right part
}

// Checks if piece touches the bottom
function touchingBottom(arr) {
    for (let el of arr) {
        if (
            Math.floor(el / 10) === 19 ||
            boardCells[el + 10].getAttribute("data-piece") === "true"
        ) {
            return true; // Other piece/bottom below
        }
    }
    return false;
}

// For calculating purposes CHATGPT
// Bottom tiles of tetronimo
function currTetronimoBottomPieces(arr) {
    const lastDigitMap = {}; // Object to store elements based on their last digit

    for (const num of arr) {
        const lastDigit = num % 10; // Get the last digit
        if (!lastDigitMap[lastDigit] || num > lastDigitMap[lastDigit]) {
            // If the last digit is not in the map or the current number has a higher second digit
            lastDigitMap[lastDigit] = num;
        }
    }

    // Convert the values of the lastDigitMap object into an array
    const filteredArray = Object.values(lastDigitMap);

    return filteredArray;
}

// Used for hard dropping a piece
function hardDrop() {
    var bottomPieces = currTetronimoBottomPieces(curTetronimo.position);
    var distance = [];

    // if at the bottom, returns 0
    if(bottomPieces.some(value => value > 190)){
        return 0;
    }

    bottomPieces.forEach((el, index) => {
        // Gets bottom pieces for hard drop calculation
        var originalPosition = Math.floor(el / 10);
        var pieceColumn = el % 10;
        for (let i = originalPosition + 1; i < 20; i++) {
            if (
                boardCols[pieceColumn][i].getAttribute("data-piece") === "true"
            ) {
                distance[index] = i - originalPosition - 1;
                return;
            }
            distance[index] = 19 - originalPosition;
        }
    });

    return Math.min(...distance) * 10;
}

function setNewTetronimo() {
    curTetronimo = generateTetronimo();
    updatePosition(curTetronimo, 3);

    var bottomPieces = currTetronimoBottomPieces(curTetronimo.position);

    if (touchingBottom(bottomPieces)) {
        alert("YOU LOSE");
        return;
    }

    heldCounter = 0;
    document.querySelector(".held-piece").classList.remove("grayed-out");
    ghostPiece = structuredClone(curTetronimo);

    updateGhostPiece();
}

setNewTetronimo();

// Checks if any rows are completed
function checkForLines() {
    let numLines = 0;

    boardRows.forEach((el, index) => {
        if (
            Array.from(el).filter((cell) => cell.getAttribute("data-piece") === "true")
                .length === 10
        ) {
            numLines += 1;
            for (let k = index; k > 0; k--) {
                for (let j = 0; j < 10; j++) {
                    boardRows[k][j].setAttribute(
                        "data-piece",
                        boardRows[k - 1][j].getAttribute("data-piece")
                    );
                    boardRows[k][j].style.backgroundColor = boardRows[k - 1][j].style.backgroundColor;
                }
            }
        }
    });

    if (numLines > 0) {
        score += numLines * 200 - (numLines === 4 ? 0 : 100);
        lines += numLines;
        document.getElementById("lines").textContent = lines;
    }
}

// setInterval(() => {
//     var bottomPieces = currTetronimoBottomPieces(curTetronimo.position);
//     if(touchingBottom(bottomPieces)){
//         setNewTetronimo()
//     }else{
//         removePosition(curTetronimo)

//         // moves position one down on the grid
//         direction = 10
//         updatePosition(curTetronimo,direction)
//     }
// }, 750);

document.addEventListener("keydown", function (event) {
    var bottomPieces = currTetronimoBottomPieces(curTetronimo.position);

    var pressedKey = event.key;
    var direction; // +10 for down, -1 for left, +1 for right

    if (pressedKey === "x" || pressedKey === "z") {
        rotatePiece(curTetronimo, pressedKey);
    }

    if (pressedKey === "a") {
        swapHeldPiece();
    }

    if (pressedKey === "ArrowDown") {
        score += 1;
        // Removes current position
        if (touchingBottom(bottomPieces) && pressedKey === "ArrowDown") {
            removeGhostPosition(ghostPiece.position);
            checkForLines();
            setNewTetronimo();
        } else {
            removePosition(curTetronimo);
            // Moves position one down on the grid
            direction = 10;
            updatePosition(curTetronimo, direction);

            updateGhostPiece();
        }
    } // Moves position one left on the grid
    else if (pressedKey === "ArrowLeft") {
        // Checks if piece can go left
        // If NOT touching left wall
        if (!touchingLeftWall(curTetronimo.position)) {
            removePosition(curTetronimo);
            direction = -1;
            updatePosition(curTetronimo, direction);

            updateGhostPiece();
        }
    } // Moves position one left on the grid
    else if (pressedKey === "ArrowRight") {
        // Checks if piece can go right
        // If NOT touching right wall
        if (!touchingRightWall(curTetronimo.position)) {
            removePosition(curTetronimo);
            direction = 1;
            updatePosition(curTetronimo, direction);

            updateGhostPiece();
        }
    } // Hard drop to lowers possible position
    else if (pressedKey === "ArrowUp") {
        direction = hardDrop();

        score += direction / 10 * 2;

        removePosition(curTetronimo);
        updatePosition(curTetronimo, direction);

        removeGhostPosition(ghostPiece.position);
        checkForLines();
        setNewTetronimo();
    }
});

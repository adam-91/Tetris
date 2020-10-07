document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    let squares = Array.from(document.querySelectorAll('.grid div'));
    let displaySquares = Array.from(document.querySelectorAll('.mini-grid div'));
    const scoreDisplay = document.querySelector('#score');
    const startBtn = document.querySelector('#start-button');
    const refreshBtn = document.querySelector('#refresh-buttom')
    const width = 10;
    const miniWidth = 4;
    let nextRandom = 0;
    let nextRotation = 0;
    let timerId;
    let timeInterval = 200;
    let score = 0;
    let currentPosition = 4;
    let currentRotation = 0;
    let displayIndex = 0;

    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ]
    
    const zTetromino = [
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1],
        [0,width,width+1,width*2+1],
        [width+1, width+2,width*2,width*2+1]
    ]
    
    const tTetromino = [
        [1,width,width+1,width+2],
        [1,width+1,width+2,width*2+1],
        [width,width+1,width+2,width*2+1],
        [1,width,width+1,width*2+1]
    ]
    
    const oTetromino = [
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1],
        [0,1,width,width+1]
    ]
    
    const iTetromino = [
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3],
        [1,width+1,width*2+1,width*3+1],
        [width,width+1,width+2,width+3]
    ]

    function convertToMiniMap(position) {
        if(position<miniWidth) {
            return position;
        } else if(position>=3*width) {
            return position-3*width+3*miniWidth;
        } else if(position>=2*width) {
            return position-2*width+2*miniWidth;
        } else {
            return position-width+miniWidth;
        };
    };

    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
    let tempUpNextTetraminoes = [];
    let i = 0;

    let temp = [...theTetrominoes].forEach(index => {
        let j = 0;
        let tempArray = [];

        index.forEach(position => {
           tempArray[j] = position.map(convertToMiniMap);
            j ++;
        });
        tempUpNextTetraminoes[i] = tempArray;
        i+=1;
    });

    const upNextTetraminoes = tempUpNextTetraminoes;
    let random = Math.floor(Math.random()*theTetrominoes.length);
    let current = theTetrominoes[random][0];

    function draw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.add('tetromino');
        });
    };

    function undraw() {
        current.forEach(index => {
            squares[currentPosition + index].classList.remove('tetromino');
        });
    };

    function control(e) {
        if(e.keyCode === 37) {
            moveLeft();
        } else if(e.keyCode === 38) {
            moveRotate();
        } else if(e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 40) {
            moveDown();
        };
    };

    document.addEventListener('keyup',control);

    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freez();
    };

    function freez() {
        if(current.some(index => squares[currentPosition + index + width].classList.contains('taken'))) {
            current.forEach(index => squares[currentPosition + index].classList.add('taken'));
            random = nextRandom;
            currentRotation = nextRotation;
            nextRotation = Math.floor(Math.random()*4);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            current = theTetrominoes[random][currentRotation];
            currentPosition = 4;
            draw();
            displayShape();
            addScore();
            gameOver();
        };
    };

    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if(!isAtLeftEdge) currentPosition -=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition +=1;
        };
        draw();
    };

    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1);
        if(!isAtRightEdge) currentPosition +=1;
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            currentPosition -=1;
        };
            draw();
    };

    function moveRotate() {
        undraw();
        currentRotation ++;
        if(currentRotation === current.length) {
            currentRotation = 0;
        };
        current = theTetrominoes[random][currentRotation];
        draw();
    };

    function displayShape() {
        displaySquares.forEach(mini_squares => {
            mini_squares.classList.remove('tetromino');
        });
        upNextTetraminoes[nextRandom][nextRotation].forEach(index => {
            displaySquares[displayIndex + index].classList.add('tetromino');
        });
    };

    startBtn.addEventListener('click',() => {
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        } else {
            
            timerId = setInterval(moveDown, timeInterval);
            nextRandom = Math.floor(Math.random()*theTetrominoes.length);
            nextRotation = Math.floor(Math.random()*4);
            draw();
            displayShape();
        };
    });

    refreshBtn.addEventListener('click',() => {
        score = 0;
        undraw();
        for(let i = 0; i < 199; i++) {
            squares[i].classList.remove('tetromino');
            squares[i].classList.remove('taken');
        };
        for(let i = 0; i < 16; i++) {
            displaySquares[i].classList.remove('tetromino');
        };
        
        currentPosition = 4;
        random = Math.floor(Math.random()*theTetrominoes.length);
        nextRandom = Math.floor(Math.random()*theTetrominoes.length);
        currentRotation = Math.floor(Math.random()*4);
        nextRotation = Math.floor(Math.random()*4);
        current = theTetrominoes[random][currentRotation];
        scoreDisplay.innerHTML = score;
        displayShape();
        draw();
    });

    function buildRow(initI) {
        let singleRow = [];
        let j = 0;
        for (let i = initI; i<(width+initI); i++) {
            singleRow[j] = i;
            j++;
        };
        return singleRow;
    };

    function addScore() {
        for(let i = 0; i < 199; i+=width) {
            let row = buildRow(i);
 
            if(row.every(index => squares[index].classList.contains('taken'))) {
                score +=10; 
                scoreDisplay.innerHTML = score;
                row.forEach(index => {
                    squares[index].classList.remove('taken');
                    squares[index].classList.remove('tetromino');
                });
                const squaresRemoved = squares.splice(i,width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));               
            };
        };
    };

    function gameOver() {
        if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
            scoreDisplay.innerHTML = 'end';
            clearInterval(timerId);
            console.log('game over');
        };
    };
})
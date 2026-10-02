// Canvasin alustus
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// HTML-elementtien haku
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const menu = document.getElementById("menu");
const gameOverScreen = document.getElementById("gameOverScreen");
const scoreDiv = document.getElementById("score");
const scoreValueSpan = document.getElementById("scoreValue");
const gameOverText = document.getElementById("gameOverText");

let width = canvas.width;
let height = canvas.height;

// Madon ja hedelmän koko
const cellSize = 15;

// Pelin muuttujat
let snake = {
    xPos: 6,
    yPos: 8,
    fruits: 0,
    length: 3,
    score: 0,
    speed: 250,
    direction: null,
    body: null
};

let fruit = {
    xPos: 8,
    yPos: 8
};

let score = 0;
let gameLoopInterval;
let gameRunning = false;
let boardSize = 16;
let difficulty = "hard"; // "easy", "normal", "hard", "impossible"
let music = new Audio("/sound/gameBG_music.mp3")
music.loop = true;

// Kontrollit
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (!gameRunning) {
            startGame(boardSize, difficulty);
        }
        return;
    }

    if (!gameRunning) return;

    // Estetään sivun vieriminen nuolinäppäimillä
    if (e.key.startsWith("Arrow")) {
        e.preventDefault();
    }

    if (e.key === "Escape") {
        endGame("Game Over");
        return;
    }

    // Et voi enää kääntyä oman kehon sisälle suoraan
    switch (e.key) {
        case "ArrowUp":
            if (snake.direction == "down") { break; }
            else {
                snake.direction = "up";
                break;
            };
        case "ArrowDown":
            if (snake.direction == "up") { break; }
            else {
                snake.direction = "down";
                break;
            };
        case "ArrowLeft":
            if (snake.direction == "right") { break; }
            else { 
                snake.direction = "left";
                break;
            };
        case "ArrowRight":
            if (snake.direction == "left") { break; }
            else {
                snake.direction = "right";
                break;
            };
    }
});

// Pelin aloitus
function startGame(size, diff) {
    if (gameRunning) return;
    boardSize = size;
    difficulty = diff;

    // Nollataan madon tiedot
    snake.xPos = 5;
    snake.yPos = 8;
    snake.fruits = 0;
    snake.length = 3;
    snake.direction = null;
    snake.body = null;

    // Nollataan myös hedelmän positio!
    fruit.xPos = 10;
    fruit.yPos = 8;

    setDifficulty(difficulty)
    width = boardSize * cellSize;
    height = boardSize * cellSize;
    canvas.width = width;
    canvas.height = height;

    score = 0;
    scoreValueSpan.textContent = score;

    menu.style.display = "none";
    gameOverScreen.style.display = "none";
    scoreDiv.style.display = "block";

    gameRunning = true;

    // Piirretään alkutilanne
    ctx.clearRect(0, 0, width, height);
    drawFruit();
    drawSnake();

    resetTimer();
    let gameStartAudio = new Audio("/sound/gameStart_SFX.mp3");
    gameStartAudio.play();
    
    music.currentTime = 0;
    setTimeout(function musicStart() { music.play(); }, 500);
};

function setDifficulty(difficulty) {
    switch (difficulty) {
        case "easy":
            snake.speed = 500;
            break;
        case "normal":
            break;
        case "hard":
            boardSize = 32;
            snake.yPos = 16;
            snake.xPos = 12;
            fruit.yPos = 16;
            fruit.xPos = 22;
            snake.speed = 150;
            break;
        case "impossible":
            boardSize = 36;
            snake.yPos = 18;
            snake.xPos = 13;
            fruit.yPos = 18;
            fruit.xPos = 23;
            snake.speed = 30;
            break;
    }
}

function resetTimer() {
    if (gameLoopInterval == null) { gameLoopInterval = setInterval(movement, snake.speed); }
    else {
        clearInterval(gameLoopInterval)
        gameLoopInterval = setInterval(movement, snake.speed);
    }
};

// Madon liikkuminen
function movement() {
    if (!gameRunning) return;

    switch (snake.direction) {
        case "up":
            snake.yPos -= 1;
            break;
        case "down":
            snake.yPos += 1;
            break;
        case "right":
            snake.xPos += 1;
            break;
        case "left":
            snake.xPos -= 1;
            break;
    }

    let dedCheck = collision();
    if (dedCheck == "ded") { return; }
    else {
        // Tyhjennetään edellinen kuva ja piirretään uusi
        ctx.clearRect(0, 0, width, height);
        drawFruit();
        drawSnake();
        scoreValueSpan.textContent = score;
    };
    console.log(snake.speed);
}

function collision() {
    if (snake.yPos == fruit.yPos && snake.xPos == fruit.xPos) { eatFruit() }
    if (snake.yPos < 0 || snake.xPos < 0 || snake.yPos > (boardSize - 1) || snake.xPos > (boardSize - 1)) { 
        endGame("Osuit seinään");
        return "ded";
    }
    else { return "notDed"; }
}

function eatFruit() {
    let eatSFX = new Audio("/sound/eat_SFX.mp3")
    eatSFX.play();
    fruit.yPos = Math.floor(Math.random() * boardSize);
    fruit.xPos = Math.floor(Math.random() * boardSize);
    score += 10;
    snake.score += 10;
    snake.fruits += 1;
    checkStatChange();
}

function checkStatChange() {
    if (snake.fruits == 10) { 
        snake.length += 1; 
        snake.fruits = 0;
    };
    if ( snake.score == 50 ) {
        if (snake.speed > 5) {
            snake.speed -= 10; 
            snake.score = 0;
            resetTimer();
        }
        if (snake.speed < 5) { snake.speed = 5; };
    };
}

// Madon piirtäminen: vihreä häntä ja oranssi pää
function drawSnake() {
    // Luodaan vartalo ensimmäisellä kutsulla
    if (!snake.body) {
        snake.body = [];

        for (let i = 0; i < snake.length; i++) {
            snake.body.push({
                xPos: snake.xPos - i,
                yPos: snake.yPos
            });
        }
    }

    const head = snake.body[0];

    // Lisätään uusi pää vain, jos mato on liikkunut
    if (head.xPos !== snake.xPos || head.yPos !== snake.yPos) {
        snake.body.unshift({
            xPos: snake.xPos,
            yPos: snake.yPos
        });
    }

    // Rajataan vartalo madon nykyiseen pituuteen
    while (snake.body.length > snake.length) {
        snake.body.pop();
    }

    // Piirretään häntä ensin ja pää viimeisenä
    for (let i = snake.body.length - 1; i >= 0; i--) {
        const part = snake.body[i];

        ctx.fillStyle = i === 0 ? "orange" : "green";

        ctx.fillRect(
            part.xPos * cellSize,
            part.yPos * cellSize,
            cellSize - 1,
            cellSize - 1
        );
    }
}

// Punaisen hedelmän piirtäminen
function drawFruit() {
    ctx.fillStyle = "red";
    ctx.beginPath();

    ctx.arc(
        fruit.xPos * cellSize + cellSize / 2,
        fruit.yPos * cellSize + cellSize / 2,
        cellSize / 2 - 1,
        0,
        Math.PI * 2
    );

    ctx.fill();
}

// Pelin lopettaminen
function endGame(message) {
    clearInterval(gameLoopInterval);
    gameRunning = false;

    gameOverText.textContent = message;
    gameOverScreen.style.display = "block";

    music.pause();
    let gameOverSFX = new Audio("/sound/gameOver_SFX.mp3");
    gameOverSFX.play();
    let gameOverVoice = new Audio ("/sound/gameOverVoice_SFX.mp3");
    setTimeout(function playVoice() { 
        gameOverVoice.play(); 
    }, 1500);
};

// Painikkeet
startButton.addEventListener("click", () => {
    startGame(boardSize, difficulty);
});

restartButton.addEventListener("click", () => {
    startGame(boardSize, difficulty);
});
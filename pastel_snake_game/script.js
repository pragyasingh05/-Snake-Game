const board = document.getElementById('game-board');
const scoreElement = document.getElementById('current-score');
const highScoreElement = document.getElementById('high-score');

// Modals
const startModal = document.getElementById('start-modal');
const gameOverModal = document.getElementById('game-over-modal');
const pauseModal = document.getElementById('pause-modal');
const finalScoreElement = document.getElementById('final-score');

// Buttons
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseToggle = document.getElementById('btn-pause');

// Controls
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

// Game State
const GRID_SIZE = 20; // 20x20 grid
let snake = [];
let food = null;
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let score = 0;
let highScore = localStorage.getItem('pastelSnakeHighScore') || 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;
let gameSpeed = 160; // Initial speed in ms

// Initialize High Score
highScoreElement.textContent = highScore;

// Color cycling for snake body
const bodyColors = ['snake-body-0', 'snake-body-1', 'snake-body-2'];

function initGame() {
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    gameSpeed = 160;
    isGameOver = false;
    isPaused = false;

    scoreElement.textContent = score;
    board.innerHTML = '';

    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    pauseModal.classList.add('hidden');

    spawnFood();
    render();

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

function spawnFood() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        // Ensure food doesn't spawn on the snake
        if (!snake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
            break;
        }
    }
    food = newFood;
}

function handleInput(newDir) {
    if (isPaused || isGameOver) return;

    if (newDir === 'UP' && direction !== 'DOWN') nextDirection = 'UP';
    if (newDir === 'DOWN' && direction !== 'UP') nextDirection = 'DOWN';
    if (newDir === 'LEFT' && direction !== 'RIGHT') nextDirection = 'LEFT';
    if (newDir === 'RIGHT' && direction !== 'LEFT') nextDirection = 'RIGHT';
}

function gameLoop() {
    if (isPaused || isGameOver) return;

    direction = nextDirection;

    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
    }

    // Check collisions
    if (
        head.x < 0 || head.x >= GRID_SIZE ||
        head.y < 0 || head.y >= GRID_SIZE ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        return gameOver();
    }

    snake.unshift(head); // Add new head

    // Check food consumption
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('pastelSnakeHighScore', highScore);
        }

        spawnFood();

        // Increase speed slightly
        if (gameSpeed > 70) {
            gameSpeed -= 2;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    } else {
        snake.pop(); // Remove tail
    }

    render();
}

function render() {
    board.innerHTML = '';

    // Render food
    if (food) {
        const foodElement = document.createElement('div');
        foodElement.className = 'food';
        foodElement.style.left = `${food.x * (100 / GRID_SIZE)}%`;
        foodElement.style.top = `${food.y * (100 / GRID_SIZE)}%`;
        board.appendChild(foodElement);
    }

    // Render snake
    snake.forEach((segment, index) => {
        const partElement = document.createElement('div');
        partElement.className = 'snake-part';
        if (index === 0) {
            partElement.classList.add('snake-head');
            // Rotate head based on direction? (Optional, adds charm)
        } else {
            // Cycle through pastel colors
            partElement.classList.add(bodyColors[(index - 1) % bodyColors.length]);
        }

        // CSS transitions handle the smooth sliding
        partElement.style.left = `${segment.x * (100 / GRID_SIZE)}%`;
        partElement.style.top = `${segment.y * (100 / GRID_SIZE)}%`;

        board.appendChild(partElement);
    });
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    finalScoreElement.textContent = score;
    gameOverModal.classList.remove('hidden');
}

function togglePause() {
    if (isGameOver || startModal.classList.contains('hidden') === false) return;

    isPaused = !isPaused;
    if (isPaused) {
        pauseModal.classList.remove('hidden');
        pauseToggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    } else {
        pauseModal.classList.add('hidden');
        pauseToggle.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            handleInput('UP');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            handleInput('DOWN');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            handleInput('LEFT');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            handleInput('RIGHT');
            break;
        case ' ': // Spacebar
            e.preventDefault(); // Prevent scrolling
            if (isGameOver) {
                initGame();
            } else if (startModal.classList.contains('hidden') === false) {
                initGame();
            } else {
                togglePause();
            }
            break;
    }
});

// Mobile button listeners
btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('UP'); });
btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('DOWN'); });
btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('LEFT'); });
btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput('RIGHT'); });

btnUp.addEventListener('mousedown', () => handleInput('UP'));
btnDown.addEventListener('mousedown', () => handleInput('DOWN'));
btnLeft.addEventListener('mousedown', () => handleInput('LEFT'));
btnRight.addEventListener('mousedown', () => handleInput('RIGHT'));

startBtn.addEventListener('click', initGame);
restartBtn.addEventListener('click', initGame);
resumeBtn.addEventListener('click', togglePause);
pauseToggle.addEventListener('click', togglePause);

// Render initial empty board
render();

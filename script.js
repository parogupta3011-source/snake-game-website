const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");

const overlay = document.getElementById("gameOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayMessage = document.getElementById("overlayMessage");
const startButton = document.getElementById("startButton");

const GRID_SIZE = 25;
const CELL_SIZE = canvas.width / GRID_SIZE;

let snake = [];
let food = {};
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

let score = 0;
let highScore = Number(localStorage.getItem("snakeHighScore")) || 0;

let gameRunning = false;
let gameLoop = null;

highScoreElement.textContent = highScore;

function initializeGame() {
  snake = [
    { x: 12, y: 12 },
    { x: 11, y: 12 },
    { x: 10, y: 12 }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  scoreElement.textContent = score;

  createFood();
  draw();
}

function createFood() {
  let newFood;

  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
  } while (
    snake.some(
      segment => segment.x === newFood.x && segment.y === newFood.y
    )
  );

  food = newFood;
}

function startGame() {
  initializeGame();

  gameRunning = true;
  overlay.classList.add("hidden");

  clearInterval(gameLoop);

  gameLoop = setInterval(update, 100);
}

function endGame() {
  gameRunning = false;
  clearInterval(gameLoop);

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("snakeHighScore", highScore);
    highScoreElement.textContent = highScore;
  }

  overlayTitle.textContent = "Game Over";
  overlayMessage.textContent = `Your score: ${score}`;
  startButton.textContent = "Play Again";
  overlay.classList.remove("hidden");
}

function update() {
  if (!gameRunning) return;

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Wall collision
  if (
    head.x < 0 ||
    head.x >= GRID_SIZE ||
    head.y < 0 ||
    head.y >= GRID_SIZE
  ) {
    endGame();
    return;
  }

  // Self collision
  if (
    snake.some(
      segment => segment.x === head.x && segment.y === head.y
    )
  ) {
    endGame();
    return;
  }

  snake.unshift(head);

  // Food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    scoreElement.textContent = score;

    if (score > highScore) {
      highScore = score;
      highScoreElement.textContent = highScore;
      localStorage.setItem("snakeHighScore", highScore);
    }

    createFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawFood();
  drawSnake();
}

function drawSnake() {
  snake.forEach((segment, index) => {
    const x = segment.x * CELL_SIZE;
    const y = segment.y * CELL_SIZE;

    const padding = 2;

    ctx.fillStyle = index === 0 ? "#86efac" : "#4ade80";

    roundRect(
      x + padding,
      y + padding,
      CELL_SIZE - padding * 2,
      CELL_SIZE - padding * 2,
      5
    );

    ctx.fill();

    // Snake eyes
    if (index === 0) {
      drawEyes(x, y);
    }
  });
}

function drawEyes(x, y) {
  ctx.fillStyle = "#052e16";

  let eye1;
  let eye2;

  if (direction.x === 1) {
    eye1 = { x: x + CELL_SIZE - 7, y: y + 7 };
    eye2 = { x: x + CELL_SIZE - 7, y: y + CELL_SIZE - 7 };
  } else if (direction.x === -1) {
    eye1 = { x: x + 7, y: y + 7 };
    eye2 = { x: x + 7, y: y + CELL_SIZE - 7 };
  } else if (direction.y === -1) {
    eye1 = { x: x + 7, y: y + 7 };
    eye2 = { x: x + CELL_SIZE - 7, y: y + 7 };
  } else {
    eye1 = { x: x + 7, y: y + CELL_SIZE - 7 };
    eye2 = { x: x + CELL_SIZE - 7, y: y + CELL_SIZE - 7 };
  }

  ctx.beginPath();
  ctx.arc(eye1.x, eye1.y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(eye2.x, eye2.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawFood() {
  const centerX = food.x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = food.y * CELL_SIZE + CELL_SIZE / 2;

  ctx.fillStyle = "#fb7185";

  ctx.beginPath();
  ctx.arc(
    centerX,
    centerY,
    CELL_SIZE * 0.32,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = "#fecdd3";

  ctx.beginPath();
  ctx.arc(
    centerX - 3,
    centerY - 4,
    3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function roundRect(x, y, width, height, radius) {
  ctx.beginPath();

  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(
    x + width,
    y,
    x + width,
    y + radius
  );

  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height
  );

  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(
    x,
    y + height,
    x,
    y + height - radius
  );

  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(
    x,
    y,
    x + radius,
    y
  );

  ctx.closePath();
}

function changeDirection(newDirection) {
  if (!gameRunning) return;

  // Prevent the snake from reversing into itself
  if (
    newDirection.x === -direction.x &&
    newDirection.y === -direction.y
  ) {
    return;
  }

  nextDirection = newDirection;
}

document.addEventListener("keydown", event => {
  const key = event.key.toLowerCase();

  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },

    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },

    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },

    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  if (directions[key]) {
    event.preventDefault();
    changeDirection(directions[key]);
  }
});

document.querySelectorAll(".control-btn").forEach(button => {
  button.addEventListener("click", () => {
    const directionName = button.dataset.direction;

    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    changeDirection(directions[directionName]);
  });
});

startButton.addEventListener("click", startGame);

// Draw initial game
initializeGame();

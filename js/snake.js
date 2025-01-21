const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

class SnakePart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

let speed = 7;
let tileCountX = 20; // Horizontal tiles
let tileCountY = 20; // Vertical tiles
let tileSizeX = canvas.width / tileCountX;
let tileSizeY = canvas.height / tileCountY;

let headX = 10;
let headY = 10;
const snakeParts = [];
let tailLength = 2;

let appleX = 5;
let appleY = 5;

let inputsXVelocity = 0;
let inputsYVelocity = 0;

let xVelocity = 0;
let yVelocity = 0;

let score = 0;
let playerName = '';
let topScores = JSON.parse(localStorage.getItem("leaderboard")) || [];
let gameLoop;

const canvasBackground = new Image();
canvasBackground.src = "images/canvas_background.webp"; // Make sure this path is correct
const gulpSound = new Audio("sound/gulp.wav");
const GameOverSound = new Audio("sound/gameOverSound.wav");

canvasBackground.onload = function() {
  // Start the game once the background image is fully loaded
  drawGame();
};

function drawGame() {
  clearTimeout(gameLoop);

  xVelocity = inputsXVelocity;
  yVelocity = inputsYVelocity;

  changeSnakePosition();
  let result = isGameOver();
  if (result) {
    updateLeaderboard();
    return;
  }

  clearScreen();
  checkAppleCollision();
  drawApple();
  drawSnake();
  drawScore();

  if (score > 5) speed = 9;
  if (score > 10) speed = 11;

  gameLoop = setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
  let gameOver = false;

  if (yVelocity === 0 && xVelocity === 0) return false;

  if (headX < 0 || headX >= tileCountX || headY < 0 || headY >= tileCountY) {
    gameOver = true;
  }

  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    if (part.x === headX && part.y === headY) {
      gameOver = true;
      break;
    }
  }

  if (gameOver) {
    ctx.font = "50px Verdana";
    ctx.textAlign = "center";

    let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop("0", "magenta");
    gradient.addColorStop("0.5", "blue");
    gradient.addColorStop("1.0", "red");

    ctx.fillStyle = gradient;

    const textYPosition = canvas.height / 2 - 20;
    ctx.fillText("Game Over!", canvas.width / 2, textYPosition);

    GameOverSound.play();
  }

  return gameOver;
}

function restartGame() {
  clearTimeout(gameLoop);
  headX = 10;
  headY = 10;
  snakeParts.length = 0;
  tailLength = 2;
  inputsXVelocity = 0;
  inputsYVelocity = 0;
  xVelocity = 0;
  yVelocity = 0;
  score = 0;
  speed = 7;
  drawGame();
}

function drawScore() {
  ctx.fillStyle = "rgba(68, 84, 88, 0.79)";
  ctx.fillRect(canvas.width - 110, 5, 100, 30);

  ctx.fillStyle = "rgba(220, 230, 233, 0.9)";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";

  ctx.fillText("Score: " + score, canvas.width - 60, 25);
}

function clearScreen() {
  ctx.drawImage(canvasBackground, 0, 0, canvas.width, canvas.height);
}

function drawSnake() {
  for (let i = 0; i < snakeParts.length; i++) {
    let part = snakeParts[i];
    ctx.beginPath();
    let gradient = ctx.createLinearGradient(
      part.x * tileSizeX,
      part.y * tileSizeY,
      (part.x + 1) * tileSizeX,
      (part.y + 1) * tileSizeY
    );
    gradient.addColorStop(0, "green");
    gradient.addColorStop(1, "lightgreen");
    ctx.fillStyle = gradient;
    ctx.arc(
      part.x * tileSizeX + tileSizeX / 2,
      part.y * tileSizeY + tileSizeY / 2,
      Math.min(tileSizeX, tileSizeY) / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }

  snakeParts.push(new SnakePart(headX, headY));
  while (snakeParts.length > tailLength) {
    snakeParts.shift();
  }

  ctx.beginPath();
  let headGradient = ctx.createLinearGradient(
    headX * tileSizeX,
    headY * tileSizeY,
    (headX + 1) * tileSizeX,
    (headY + 1) * tileSizeY
  );
  headGradient.addColorStop(0, "yellow");
  headGradient.addColorStop(1, "orange");
  ctx.fillStyle = headGradient;
  ctx.arc(
    headX * tileSizeX + tileSizeX / 2,
    headY * tileSizeY + tileSizeY / 2,
    Math.min(tileSizeX, tileSizeY) / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.closePath();
}

function changeSnakePosition() {
  headX += xVelocity;
  headY += yVelocity;
}

function drawApple() {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(
    appleX * tileSizeX + tileSizeX / 2,
    appleY * tileSizeY + tileSizeY / 2,
    Math.min(tileSizeX, tileSizeY) / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.closePath();
}

function checkAppleCollision() {
  if (appleX === headX && appleY === headY) {
    appleX = Math.floor(Math.random() * tileCountX);
    appleY = Math.floor(Math.random() * tileCountY);
    tailLength++;
    score++;
    gulpSound.play();
  }
}

document.body.addEventListener("keydown", keyDown);

function keyDown(event) {
  if (event.keyCode == 38 || event.keyCode == 87) {
    if (inputsYVelocity == 1) return;
    inputsYVelocity = -1;
    inputsXVelocity = 0;
  }
  if (event.keyCode == 40 || event.keyCode == 83) {
    if (inputsYVelocity == -1) return;
    inputsYVelocity = 1;
    inputsXVelocity = 0;
  }
  if (event.keyCode == 37 || event.keyCode == 65) {
    if (inputsXVelocity == 1) return;
    inputsYVelocity = 0;
    inputsXVelocity = -1;
  }
  if (event.keyCode == 39 || event.keyCode == 68) {
    if (inputsXVelocity == -1) return;
    inputsYVelocity = 0;
    inputsXVelocity = 1;
  }
}

function updateLeaderboard() {
  const leaderboardEntry = { name: playerName, score: score };
  topScores.push(leaderboardEntry);
  topScores = topScores.sort((a, b) => b.score - a.score).slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(topScores));

  const scoresList = document.getElementById("scores");
  scoresList.innerHTML = topScores.map((entry) => `<li>${entry.name}: ${entry.score}</li>`).join("");
}

document.addEventListener("DOMContentLoaded", function () {
  if (!playerName) {
    playerName = prompt("Enter your name to start the game:");
  }

  const scoresList = document.getElementById("scores");
  scoresList.innerHTML = topScores.map((entry) => `<li>${entry.name}: ${entry.score}</li>`).join("");
});

document.getElementById("reset-btn").addEventListener("click", restartGame);

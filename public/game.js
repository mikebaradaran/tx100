const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Paddle properties
const paddleWidth = 10, paddleHeight = 80;
let player = { x: 10, y: canvas.height / 2 - paddleHeight / 2, speed: 5 };
let ai = { x: canvas.width - 20, y: canvas.height / 2 - paddleHeight / 2, speed: 3 };

// Ball properties
let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 7,
    speedX: 4,
    speedY: 4
};

// Score
let playerScore = 0, aiScore = 0;

// Controls
let keys = {};
window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// Update game logic
function update() {
    // Move player paddle
    if (keys["ArrowUp"] && player.y > 0) player.y -= player.speed;
    if (keys["ArrowDown"] && player.y + -paddleHeight< canvas.height ) player.y += player.speed;

    // Move AI paddle (basic tracking)
    if (ai.y + paddleHeight / 2 < ball.y) ai.y += ai.speed;
    if (ai.y + paddleHeight / 2 > ball.y) ai.y -= ai.speed;

    // Move ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top/bottom walls
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= canvas.height) {
        ball.speedY *= -1;
    }

    // Ball collision with paddles
    if (
        (ball.x - ball.radius <= player.x + paddleWidth && ball.y >= player.y && ball.y <= player.y + paddleHeight) ||
        (ball.x + ball.radius >= ai.x && ball.y >= ai.y && ball.y <= ai.y + paddleHeight)
    ) {
        ball.speedX *= -1; // Reverse ball direction
    }

    // Scoring
    if (ball.x < 0) { aiScore++; resetBall(); }
    if (ball.x > canvas.width) { playerScore++; resetBall(); }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX *= -1; // Change direction
}

// Draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.fillRect(ai.x, ai.y, paddleWidth, paddleHeight);

    // Draw ball
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw score
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Player: ${playerScore} - AI: ${aiScore}`, canvas.width / 2 - 50, 30);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

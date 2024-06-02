const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const playerImg = new Image();
playerImg.src = 'assets/skateboarder.png';

const newspaperImg = new Image();
newspaperImg.src = 'assets/newspaper.png';

const trashCanImg = new Image();
trashCanImg.src = 'assets/trash_can.png';

const dogImg = new Image();
dogImg.src = 'assets/dog.png';

const pedestrianImg = new Image();
pedestrianImg.src = 'assets/pedestrian.png';

const mailboxImg = new Image();
mailboxImg.src = 'assets/mailbox.png';

const backgroundImg = new Image();
backgroundImg.src = 'assets/background.png';

const player = {
    x: 50,
    y: canvas.height - 70,
    width: 50,
    height: 50,
    speed: 5,
    dx: 0,
    dy: 0
};

const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

const newspapers = [];
const obstacles = [];
const mailboxes = [];
let score = 0;
let lives = 3;
let touchXStart = null;
let touchYStart = null;

function drawPlayer() {
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawNewspapers() {
    newspapers.forEach(paper => {
        context.drawImage(newspaperImg, paper.x, paper.y, paper.width, paper.height);
    });
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        if (obstacle.type === 'trash_can') {
            context.drawImage(trashCanImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'dog') {
            context.drawImage(dogImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else if (obstacle.type === 'pedestrian') {
            context.drawImage(pedestrianImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        }
    });
}

function drawMailboxes() {
    mailboxes.forEach(mailbox => {
        context.drawImage(mailboxImg, mailbox.x, mailbox.y, mailbox.width, mailbox.height);
    });
}

function drawBackground() {
    context.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
}

function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function newPos() {
    player.x += player.dx;
    player.y += player.dy;

    detectWalls();
}

function detectWalls() {
    // Left wall
    if (player.x < 0) {
        player.x = 0;
    }

    // Right Wall
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // Top wall
    if (player.y < 0) {
        player.y = 0;
    }

    // Bottom wall
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }
}

function updateNewspapers() {
    newspapers.forEach((paper, index) => {
        paper.x += paper.dx;
        if (paper.x > canvas.width) {
            newspapers.splice(index, 1);
        }
    });
}

function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.y += obstacle.dy;
        if (obstacle.y > canvas.height) {
            obstacle.y = -obstacle.height;
            obstacle.x = Math.random() * canvas.width;
        }
    });
}

function updateMailboxes() {
    mailboxes.forEach(mailbox => {
        mailbox.y += mailbox.dy;
        if (mailbox.y > canvas.height) {
            mailbox.y = -mailbox.height;
            mailbox.x = Math.random() * canvas.width;
        }
    });
}

function detectCollisions() {
    obstacles.forEach(obstacle => {
        if (
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.height + player.y > obstacle.y
        ) {
            lives--;
            obstacle.y = -obstacle.height;
            obstacle.x = Math.random() * canvas.width;
            if (lives <= 0) {
                alert("Game Over");
                document.location.reload();
            }
        }
    });

    newspapers.forEach((paper, pIndex) => {
        mailboxes.forEach((mailbox, mIndex) => {
            if (
                paper.x < mailbox.x + mailbox.width &&
                paper.x + paper.width > mailbox.x &&
                paper.y < mailbox.y + mailbox.height &&
                paper.height + paper.y > mailbox.y
            ) {
                score++;
                newspapers.splice(pIndex, 1);
                mailboxes.splice(mIndex, 1);
                mailboxes.push(createMailbox());
            }
        });
    });
}

function update() {
    clear();
    drawBackground();
    drawPlayer();
    drawNewspapers();
    drawObstacles();
    drawMailboxes();

    newPos();
    updateNewspapers();
    updateObstacles();
    updateMailboxes();
    detectCollisions();

    requestAnimationFrame(update);
}

function moveUp() {
    player.dy = -player.speed;
}

function moveDown() {
    player.dy = player.speed;
}

function moveLeft() {
    player.dx = -player.speed;
}

function moveRight() {
    player.dx = player.speed;
}

function throwNewspaper() {
    newspapers.push({
        x: player.x + player.width,
        y: player.y + player.height / 2,
        width: 20,
        height: 10,
        dx: 10
    });
}

function keyDown(e) {
    if (e.key === 'ArrowUp') {
        moveUp();
    } else if (e.key === 'ArrowDown') {
        moveDown();
    } else if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        moveRight();
    } else if (e.key === ' ') {
        throwNewspaper();
    }
}

function keyUp(e) {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        player.dy = 0;
    }

    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
}

function handleTouchStart(e) {
    const touch = e.touches[0];
    touchXStart = touch.clientX;
    touchYStart = touch.clientY;
}

function handleTouchMove(e) {
    if (!touchXStart || !touchYStart) {
        return;
    }

    const touch = e.touches[0];
    const touchXEnd = touch.clientX;
    const touchYEnd = touch.clientY;

    const diffX = touchXStart - touchXEnd;
    const diffY = touchYStart - touchYEnd;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
            moveLeft();
        } else {
            moveRight();
        }
    } else {
        // Vertical swipe
        if (diffY > 0) {
            moveUp();
        } else {
            moveDown();
        }
    }

    touchXStart = touchXEnd;
    touchYStart = touchYEnd;
}

function handleTouchEnd(e) {
    player.dx = 0;
    player.dy = 0;
}

function handleTouchTap(e) {
    throwNewspaper();
}

function createObstacle() {
    const types = ['trash_can', 'dog', 'pedestrian'];
    const type = types[Math.floor(Math.random() * types.length)];
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 50,
        height: 50,
        dy: Math.random() * 2 + 1,
        type: type
    };
}

function createMailbox() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        width: 30,
        height: 50,
        dy: Math.random() * 2 + 1
    };
}

for (let i = 0; i < 5; i++) {
    obstacles.push(createObstacle());
    mailboxes.push(createMailbox());
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);
canvas.addEventListener('click', handleTouchTap, false);

update();

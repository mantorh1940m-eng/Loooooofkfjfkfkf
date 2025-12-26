const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const msg = document.getElementById('msg');

// إعدادات الشاشة
canvas.width = 800;
canvas.height = 400;

// متغيرات اللعبة
let score = 0;
let gameSpeed = 5;
let isGameOver = false;
let gameStarted = false;

// كائن لوفي (اللاعب)
const luffy = {
    x: 50,
    y: 300,
    width: 60,
    height: 60,
    color: '#FFD700', // لون مؤقت (سيظهر مكانه الصورة)
    dy: 0,
    jumpForce: 15,
    gravity: 0.8,
    grounded: false,
    
    draw() {
        ctx.fillStyle = '#e74c3c'; // قبعة لوفي
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // هنا يمكنك إضافة ctx.drawImage لتحميل صورة لوفي لاحقاً
    },
    
    jump() {
        if (this.grounded) {
            this.dy = -this.jumpForce;
            this.grounded = false;
        }
    },
    
    update() {
        if (this.y + this.height < canvas.height - 20) {
            this.dy += this.gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - 20 - this.height;
        }
        this.y += this.dy;
        this.draw();
    }
};

// نظام العوائق (الأعداء)
const obstacles = [];
class Obstacle {
    constructor() {
        this.width = 30 + Math.random() * 40;
        this.height = 40 + Math.random() * 50;
        this.x = canvas.width;
        this.y = canvas.height - 20 - this.height;
        this.color = '#2d3436';
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    update() {
        this.x -= gameSpeed;
        this.draw();
    }
}

function spawnObstacle() {
    if (Math.random() < 0.02) { // احتمالية ظهور العائق
        if (obstacles.length === 0 || (canvas.width - obstacles[obstacles.length-1].x) > 300) {
            obstacles.push(new Obstacle());
        }
    }
}

function handleCollisions(player, obs) {
    if (player.x < obs.x + obs.width &&
        player.x + player.width > obs.x &&
        player.y < obs.y + obs.height &&
        player.y + player.height > obs.y) {
        gameOver();
    }
}

function gameOver() {
    isGameOver = true;
    msg.innerHTML = "انتهت اللعبة! <br> اضغط Space لإعادة المحاولة";
    msg.parentElement.style.display = "block";
}

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles.length = 0;
    isGameOver = false;
    gameStarted = true;
    msg.parentElement.style.display = "none";
    animate();
}

function animate() {
    if (isGameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // رسم الأرضية
    ctx.fillStyle = '#2ecc71';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    
    luffy.update();
    spawnObstacle();
    
    obstacles.forEach((obs, index) => {
        obs.update();
        handleCollisions(luffy, obs);
        
        // حذف العوائق خارج الشاشة وزيادة النقاط
        if (obs.x + obs.width < 0) {
            obstacles.splice(index, 1);
            score++;
            gameSpeed += 0.1; // زيادة الصعوبة تدريجياً
        }
    });
    
    // عرض النتيجة
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 20, 30);
    
    requestAnimationFrame(animate);
}

// التحكم
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted || isGameOver) {
            resetGame();
        } else {
            luffy.jump();
        }
    }
});

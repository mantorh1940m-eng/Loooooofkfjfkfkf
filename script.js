const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const mainMsg = document.getElementById('main-msg');
const scoreDisplay = document.getElementById('scoreDisplay');

// ضبط أبعاد الشاشة تلقائياً
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// إعدادات اللعبة المتطورة
let gameState = 'START'; // START, PLAYING, GAMEOVER
let score = 0;
let gameSpeed = 4;
let gravity = 0.6;
let obstacles = [];

const luffy = {
    x: 50,
    y: 0,
    width: 50,
    height: 60,
    dy: 0,
    jumpForce: -15,
    grounded: false,
    color: '#FF4500',
    
    update() {
        let groundLevel = canvas.height - 50;
        if (this.y + this.height < groundLevel) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = groundLevel - this.height;
        }
        this.y += this.dy;
    },
    
    draw() {
        ctx.fillStyle = this.color; // هنا تضع صورة لوفي
        ctx.shadowBlur = 15;
        ctx.shadowColor = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    },
    
    jump() {
        if (this.grounded) this.dy = this.jumpForce;
    }
};

class Obstacle {
    constructor() {
        this.width = 40 + Math.random() * 30;
        this.height = 50 + Math.random() * 40;
        this.x = canvas.width;
        this.y = canvas.height - 50 - this.height;
        this.color = `hsl(${Math.random() * 360}, 70%, 50%)`;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.roundRect(this.x, this.y, this.width, this.height, 10);
        ctx.fill();
    }
    update() {
        this.x -= gameSpeed;
    }
}

function handleInput() {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
        resetGame();
    } else {
        luffy.jump();
    }
}

// التحكم للجوال والكمبيوتر
window.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(); }, {passive: false});
window.addEventListener('mousedown', handleInput);
window.addEventListener('keydown', (e) => { if(e.code === 'Space') handleInput(); });

function resetGame() {
    score = 0;
    gameSpeed = 5;
    obstacles = [];
    luffy.y = 0;
    gameState = 'PLAYING';
    document.getElementById('ui').style.display = 'none';
    animate();
}

function animate() {
    if (gameState !== 'PLAYING') return;
    
    // خلفية ملونة متغيرة
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // رسم الأرضية
    ctx.fillStyle = '#222';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    luffy.update();
    luffy.draw();

    // إدارة العوائق
    if (Math.random() < 0.015) {
        if (obstacles.length === 0 || (canvas.width - obstacles[obstacles.length-1].x) > 300) {
            obstacles.push(new Obstacle());
        }
    }

    obstacles.forEach((obs, i) => {
        obs.update();
        obs.draw();

        // كشف التصادم
        if (luffy.x < obs.x + obs.width &&
            luffy.x + luffy.width > obs.x &&
            luffy.y < obs.y + obs.height &&
            luffy.y + luffy.height > obs.y) {
            
            if (navigator.vibrate) navigator.vibrate(200); // اهتزاز الجوال
            gameState = 'GAMEOVER';
            document.getElementById('ui').style.display = 'block';
            mainMsg.innerText = "خسرت! اضغط للبدء مجدداً";
        }

        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.1;
            scoreDisplay.innerText = `Score: ${score}`;
        }
    });

    requestAnimationFrame(animate);
}

// البدء الأولي
ctx.fillStyle = "#1a1a2e";
ctx.fillRect(0, 0, canvas.width, canvas.height);


const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const msg = document.getElementById('msg');
const scoreEl = document.getElementById('score');

// إعدادات الشاشة
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// متغيرات اللعبة
let score = 0;
let gameSpeed = 5;
let isPlaying = false;
let obstacles = [];
const gravity = 0.8;

// كائن لوفي - رسم بكسلي
const luffy = {
    x: 50,
    y: 0,
    w: 60,
    h: 70,
    dy: 0,
    jumpForce: -16,
    grounded: false,
    
    // خريطة بكسلات لوفي (1:أحمر، 2:بشرة، 3:أسود، 4:أزرق، 5:أصفر للقبعة)
    pixelMap: [
        [0,0,5,5,5,5,5,0,0],
        [0,5,5,5,5,5,5,5,0],
        [0,3,3,3,3,3,3,3,0],
        [0,3,2,2,3,2,2,3,0],
        [0,2,2,2,2,2,2,2,0],
        [0,0,1,1,1,1,1,0,0],
        [0,0,1,1,1,1,1,0,0],
        [0,0,4,4,0,4,4,0,0],
        [0,0,2,2,0,2,2,0,0]
    ],

    draw() {
        const pSize = this.w / this.pixelMap[0].length;
        this.pixelMap.forEach((row, ri) => {
            row.forEach((p, ci) => {
                if (p === 0) return;
                ctx.fillStyle = ["", "#e74c3c", "#ffdbac", "#2d3436", "#2980b9", "#f1c40f"][p];
                ctx.fillRect(this.x + ci * pSize, this.y + ri * pSize, pSize + 0.5, pSize + 0.5);
            });
        });
    },

    update() {
        let ground = canvas.height - 60;
        if (this.y + this.h < ground) {
            this.dy += gravity;
            this.grounded = false;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = ground - this.h;
        }
        this.y += this.dy;
        this.draw();
    },

    jump() {
        if (this.grounded) this.dy = this.jumpForce;
    }
};

// كلاس العوائق البكسلية (صخور)
class Rock {
    constructor() {
        this.w = 40 + Math.random() * 30;
        this.h = 40;
        this.x = canvas.width;
        this.y = canvas.height - 60 - this.h;
    }
    draw() {
        ctx.fillStyle = "#95a5a6";
        ctx.fillRect(this.x, this.y, this.w, this.h); // صخرة بسيطة
        ctx.fillStyle = "#7f8c8d";
        ctx.fillRect(this.x + 5, this.y + 5, this.w - 10, 10);
    }
    update() {
        this.x -= gameSpeed;
        this.draw();
    }
}

// التحكم باللمس والضغط
function action() {
    if (!isPlaying) {
        start();
    } else {
        luffy.jump();
    }
}

window.addEventListener('touchstart', (e) => { e.preventDefault(); action(); }, {passive: false});
window.addEventListener('mousedown', action);

function start() {
    score = 0;
    gameSpeed = 6;
    obstacles = [];
    isPlaying = true;
    document.getElementById('ui').style.display = 'none';
    loop();
}

function loop() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // رسم الخلفية (سماء وبحر)
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#2980b9");
    gradient.addColorStop(1, "#6dd5fa");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // رسم الأرضية
    ctx.fillStyle = "#f39c12";
    ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

    luffy.update();

    // ظهور العوائق
    if (Math.random() < 0.02 && (obstacles.length === 0 || canvas.width - obstacles[obstacles.length-1].x > 350)) {
        obstacles.push(new Rock());
    }

    obstacles.forEach((obs, i) => {
        obs.update();
        // تصادم
        if (luffy.x < obs.x + obs.w && luffy.x + luffy.w > obs.x && luffy.y < obs.y + obs.h && luffy.y + luffy.h > obs.y) {
            gameOver();
        }
        // مسح العائق وزيادة النتيجة
        if (obs.x + obs.w < 0) {
            obstacles.splice(i, 1);
            score++;
            gameSpeed += 0.1;
            scoreEl.innerText = score;
        }
    });

    requestAnimationFrame(loop);
}

function gameOver() {
    isPlaying = false;
    document.getElementById('ui').style.display = 'block';
    msg.innerText = "لقد خسرت! النتيجة: " + score;
    if (navigator.vibrate) navigator.vibrate(100);
}


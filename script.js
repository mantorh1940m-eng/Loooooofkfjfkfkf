const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let isPlaying = false;
let score = 0;
let obstacles = [];
let gameSpeed = 6;

const luffy = {
    x: 50, y: 0, w: 50, h: 60, dy: 0, jump: -15, g: 0.7, grounded: false,
    // رسم لوفي بكسل
    draw() {
        const pSize = 6;
        const map = [
            [0,0,5,5,5,0,0], [0,5,5,5,5,5,0], [0,3,3,3,3,3,0], [0,3,2,3,2,3,0],
            [0,2,2,2,2,2,0], [0,0,1,1,1,0,0], [0,0,1,1,1,0,0], [0,0,4,0,4,0,0]
        ];
        map.forEach((row, ri) => {
            row.forEach((p, ci) => {
                if (p === 0) return;
                ctx.fillStyle = ["","#FF0000","#FFDBAC","#000","#00F","#FFD700"][p];
                ctx.fillRect(this.x + ci*pSize, this.y + ri*pSize, pSize, pSize);
            });
        });
    },
    update() {
        let ground = canvas.height - 50;
        if (this.y + this.h < ground) { this.dy += this.g; this.grounded = false; }
        else { this.dy = 0; this.grounded = true; this.y = ground - this.h; }
        this.y += this.dy;
        this.draw();
    }
};

// --- أهم جزء: التحكم بالجوال ---
function handleAction(e) {
    if (e) e.preventDefault(); // يمنع أي حركة للمتصفح عند اللمس
    if (!isPlaying) {
        start();
    } else if (luffy.grounded) {
        luffy.dy = luffy.jump;
    }
}

// تشغيل اللعبة عند اللمس (لجوال) أو النقر (للكمبيوتر)
window.addEventListener('pointerdown', handleAction);

function start() {
    isPlaying = true; score = 0; obstacles = []; gameSpeed = 6;
    document.getElementById('msg').style.display = 'none';
    loop();
}

function loop() {
    if (!isPlaying) return;
    ctx.fillStyle = "#87CEEB"; ctx.fillRect(0,0,canvas.width,canvas.height); // سماء
    ctx.fillStyle = "#E67E22"; ctx.fillRect(0,canvas.height-50,canvas.width,50); // رمال
    
    luffy.update();

    if (Math.random() < 0.02) {
        obstacles.push({x: canvas.width, w: 30, h: 40});
    }

    obstacles.forEach((obs, i) => {
        obs.x -= gameSpeed;
        ctx.fillStyle = "#2C3E50"; ctx.fillRect(obs.x, canvas.height-90, obs.w, obs.h);
        
        // تصادم
        if (luffy.x < obs.x + obs.w && luffy.x + luffy.w > obs.x && luffy.y + luffy.h > canvas.height-90) {
            isPlaying = false;
            document.getElementById('msg').style.display = 'block';
            document.getElementById('msg').innerText = "خسرت! المس الشاشة للإعادة";
            if(navigator.vibrate) navigator.vibrate(100);
        }
        if (obs.x + obs.w < 0) { obstacles.splice(i,1); score++; gameSpeed += 0.1; scoreEl.innerText = score; }
    });
    requestAnimationFrame(loop);
}


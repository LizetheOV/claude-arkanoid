const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const state = {
  mode: 'ready',               // 'ready' | 'playing' | 'gameover' | 'won'
  score: 0,
  lives: LIVES,
};

const paddle = createPaddle();
const ball = createBall(paddle);
const blocks = createBlocks();
const explosions = [];

// --- Sonido ----------------------------------------------------------------

const sounds = {
  bounce: new Audio('assets/sounds/ball-bounce.mp3'),
  brk: new Audio('assets/sounds/break-sound.mp3'),
};

// Se clona el elemento para que sonidos seguidos no se corten entre sí.
// Los navegadores bloquean el audio hasta la primera interacción; como el
// primer sonido llega tras lanzar la pelota, ya hay interacción previa.
function playSound(name) {
  const node = sounds[name].cloneNode();
  const p = node.play();
  if (p && p.catch) p.catch(() => {});
}

function launchBall() {
  if (!ball.stuck) return;
  // Ángulo inicial hacia arriba, entre -30° y +30° respecto de la vertical.
  const angle = (Math.random() * 60 - 30) * Math.PI / 180;
  ball.vx = BALL_SPEED * Math.sin(angle);
  ball.vy = -BALL_SPEED * Math.cos(angle);
  ball.stuck = false;
  state.mode = 'playing';
}

function restartGame() {
  state.score = 0;
  state.lives = LIVES;
  blocks.length = 0;
  blocks.push(...createBlocks());
  explosions.length = 0;
  ball.stuck = true;
  ball.vx = 0;
  ball.vy = 0;
  stickBallToPaddle(ball, paddle);
  state.mode = 'ready';
}

// Espacio o clic: reinicia en Game Over / victoria; si no, lanza la pelota.
function handleAction() {
  if (state.mode === 'gameover' || state.mode === 'won') {
    restartGame();
  } else {
    launchBall();
  }
}

// --- Entrada ---------------------------------------------------------------

const keys = { left: false, right: false };

function setKey(e, pressed) {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
    keys.left = pressed;
    e.preventDefault();
  } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
    keys.right = pressed;
    e.preventDefault();
  } else if (e.code === 'Space') {
    if (pressed && !e.repeat) handleAction();
    e.preventDefault();
  }
}

window.addEventListener('keydown', (e) => setKey(e, true));
window.addEventListener('keyup', (e) => setKey(e, false));

// El mouse centra la pala en su posición (convertida a coordenadas del canvas).
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = (e.clientX - rect.left) * (CANVAS_W / rect.width);
  paddle.x = mouseX - paddle.w / 2;
  clampPaddle(paddle);
});

canvas.addEventListener('mousedown', handleAction);

// --- Bucle -----------------------------------------------------------------

function updateBall() {
  if (ball.stuck) {
    stickBallToPaddle(ball, paddle);
    return;
  }

  ball.x += ball.vx;
  ball.y += ball.vy;

  // Paredes izquierda y derecha.
  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx = Math.abs(ball.vx);
    playSound('bounce');
  } else if (ball.x + ball.r > CANVAS_W) {
    ball.x = CANVAS_W - ball.r;
    ball.vx = -Math.abs(ball.vx);
    playSound('bounce');
  }

  // Techo.
  if (ball.y - ball.r < 0) {
    ball.y = ball.r;
    ball.vy = Math.abs(ball.vy);
    playSound('bounce');
  }

  bounceOnPaddle();
  bounceOnBlocks();

  // La pelota cae por debajo del canvas: se pierde una vida y vuelve a la pala.
  if (ball.y - ball.r > CANVAS_H) {
    state.lives = Math.max(0, state.lives - 1);
    ball.stuck = true;
    ball.vx = 0;
    ball.vy = 0;
    state.mode = state.lives === 0 ? 'gameover' : 'ready';
    stickBallToPaddle(ball, paddle);
  }
}

// Colisión con bloques: la pelota rebota por el eje de menor penetración y
// se rompe como máximo un bloque por frame.
function bounceOnBlocks() {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const overlapL = ball.x + ball.r - b.x;
    const overlapR = b.x + b.w - (ball.x - ball.r);
    const overlapT = ball.y + ball.r - b.y;
    const overlapB = b.y + b.h - (ball.y - ball.r);
    if (overlapL <= 0 || overlapR <= 0 || overlapT <= 0 || overlapB <= 0) continue;

    const minX = Math.min(overlapL, overlapR);
    const minY = Math.min(overlapT, overlapB);
    if (minX < minY) {
      ball.vx = overlapL < overlapR ? -Math.abs(ball.vx) : Math.abs(ball.vx);
    } else {
      ball.vy = overlapT < overlapB ? -Math.abs(ball.vy) : Math.abs(ball.vy);
    }

    b.hits--;
    if (b.hits <= 0) {
      blocks.splice(i, 1);
      explosions.push({ x: b.x, y: b.y, color: b.color, t: 0 });
      state.score += b.color === 'gray' ? POINTS.gray : POINTS.normal;
      playSound('brk');
      if (blocks.length === 0) {
        state.mode = 'won';
        ball.stuck = true;
        ball.vx = 0;
        ball.vy = 0;
      }
    } else {
      playSound('bounce');   // el bloque resiste: solo rebota
    }
    return;
  }
}

// Rebote en la pala: el ángulo depende del punto de impacto y la velocidad
// se mantiene constante en BALL_SPEED.
const MAX_BOUNCE_ANGLE = 60 * Math.PI / 180;   // respecto de la vertical

function bounceOnPaddle() {
  if (ball.vy <= 0) return;   // solo cuando la pelota baja

  const touching =
    ball.y + ball.r >= paddle.y &&
    ball.y - ball.r <= paddle.y + paddle.h &&
    ball.x + ball.r >= paddle.x &&
    ball.x - ball.r <= paddle.x + paddle.w;
  if (!touching) return;

  // -1 en el borde izquierdo, 0 en el centro, 1 en el borde derecho.
  const offset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
  const angle = Math.max(-1, Math.min(1, offset)) * MAX_BOUNCE_ANGLE;

  ball.vx = BALL_SPEED * Math.sin(angle);
  ball.vy = -BALL_SPEED * Math.cos(angle);
  ball.y = paddle.y - ball.r;
  playSound('bounce');
}

// Avanza las explosiones (t en ms) y descarta las que ya terminaron.
function updateExplosions(dt) {
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].t += dt;
    if (explosions[i].t >= EXPLOSION_DURATION) explosions.splice(i, 1);
  }
}

function update(dt) {
  if (keys.left) paddle.x -= PADDLE_SPEED;
  if (keys.right) paddle.x += PADDLE_SPEED;
  clampPaddle(paddle);

  updateBall();
  updateExplosions(dt);
}

// Pantalla superpuesta de Game Over o victoria.
function drawEndScreen() {
  if (state.mode !== 'gameover' && state.mode !== 'won') return;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 48px monospace';
  ctx.fillText(state.mode === 'won' ? '¡Victoria!' : 'Game Over', CANVAS_W / 2, CANVAS_H / 2 - 40);
  ctx.font = '24px monospace';
  ctx.fillText('Puntaje: ' + state.score, CANVAS_W / 2, CANVAS_H / 2 + 10);
  ctx.font = '18px monospace';
  ctx.fillText('Espacio o clic para reiniciar', CANVAS_W / 2, CANVAS_H / 2 + 50);
}

function draw() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  for (const b of blocks) {
    // Un bloque gray ya golpeado una vez (le queda 1 golpe) se dibuja atenuado.
    const damaged = b.color === 'gray' && b.hits === 1;
    ctx.globalAlpha = damaged ? 0.5 : 1;
    drawSprite(ctx, 'block_' + b.color, b.x, b.y, b.w, b.h);
  }
  ctx.globalAlpha = 1;

  // Explosiones: el frame depende del tiempo transcurrido sobre EXPLOSION_DURATION.
  for (const ex of explosions) {
    const frames = EXPLOSION_FRAMES[ex.color];
    const index = Math.min(frames.length - 1, Math.floor(ex.t / EXPLOSION_DURATION * frames.length));
    drawFrame(ctx, frames[index], ex.x, ex.y, 32, 16);
  }

  // Puntaje (izquierda) y vidas (derecha).
  ctx.fillStyle = '#fff';
  ctx.font = '20px monospace';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillText('Puntaje: ' + state.score, 16, 36);
  ctx.textAlign = 'right';
  ctx.fillText('Vidas: ' + state.lives, CANVAS_W - 16, 36);

  drawSprite(ctx, 'paddle', paddle.x, paddle.y, paddle.w, paddle.h);
  drawSprite(ctx, 'ball', ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);

  drawEndScreen();
}

let lastTime = 0;

function loop(now) {
  const dt = Math.min(now - lastTime, 100);   // ms; tope por si la pestaña estuvo en segundo plano
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// El bucle arranca solo cuando el atlas ya está cargado.
loadSpritesheet(function () {
  requestAnimationFrame(function (now) {
    lastTime = now;
    requestAnimationFrame(loop);
  });
});

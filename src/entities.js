// Entidades del juego (se completan en los pasos siguientes del spec 01):
// block: { x, y, w: 32, h: 16, color, hits }   // hits: 2 si gray, 1 si no
// explosion: { x, y, color, t }                  // t = ms transcurridos

const PADDLE_SPEED = 8;        // px/frame con teclado

function createPaddle() {
  const w = 162;
  const h = 14;
  return { x: (CANVAS_W - w) / 2, y: CANVAS_H - 40, w, h };
}

// ball: { x, y, r: 8, vx, vy, stuck } — x, y es el centro de la pelota.
function createBall(paddle) {
  const ball = { x: 0, y: 0, r: 8, vx: 0, vy: 0, stuck: true };
  stickBallToPaddle(ball, paddle);
  return ball;
}

function stickBallToPaddle(ball, paddle) {
  ball.x = paddle.x + paddle.w / 2;
  ball.y = paddle.y - ball.r;
}

// Cuadrícula de GRID.cols x GRID.rows bloques; cada fila usa un color de ROW_COLORS.
function createBlocks() {
  const w = 32;
  const h = 16;
  const blocks = [];
  for (let row = 0; row < GRID.rows; row++) {
    const color = ROW_COLORS[row];
    for (let col = 0; col < GRID.cols; col++) {
      blocks.push({
        x: col * w,
        y: GRID.top + row * h,
        w,
        h,
        color,
        hits: color === 'gray' ? 2 : 1,
      });
    }
  }
  return blocks;
}

function clampPaddle(paddle) {
  paddle.x = Math.max(0, Math.min(CANVAS_W - paddle.w, paddle.x));
}

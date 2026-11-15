# SPEC 01 — MVP de Arkanoid

> **Status:** Approved
> **Depends on:** —
> **Date:** 2026-11-15
> **Objective:** Un Arkanoid jugable en el navegador con pala, pelota, bloques, vidas, puntaje y pantallas de Game Over y victoria.

---

## Por qué existe este spec

El proyecto solo tiene assets y un helper de sprites (`assets/spritesheet.js`). El README mencionaba Python/Pygame, pero se decidió JavaScript + Canvas 2D para reutilizar el helper existente. Este spec define el primer juego completo y funcional; el README y `CLAUDE.md` se actualizan en el último paso para reflejar el stack.

---

## Scope

**In:**

- Canvas de 640x720 a escala 1:1, bucle de juego a 60 FPS, ejecutable abriendo `index.html` con doble clic.
- Pala controlada con teclado (flechas / A-D) y mouse.
- Pelota pegada a la pala hasta lanzarla con espacio o clic; rebotes en paredes, techo y pala.
- El rebote en la pala cambia el ángulo según el punto de impacto, con velocidad constante.
- Un solo nivel: cuadrícula de 20 columnas por 7 filas de bloques; la fila `gray` necesita 2 golpes y el resto 1.
- Puntaje (10 por bloque normal, 20 por `gray`) y 3 vidas, mostrados en pantalla.
- Animación de explosión al romper un bloque.
- Sonidos: `ball-bounce.mp3` en rebotes, `break-sound.mp3` al romper un bloque.
- Pantallas de Game Over y de victoria, con reinicio por espacio o clic.
- Actualizar `README.md` y `CLAUDE.md`.

**Out of scope (for future specs):**

- Varios niveles o progresión.
- Power-ups.
- Puntajes máximos persistentes.
- Menú principal y pausa.
- Controles táctiles y versión móvil.
- Ajuste a otros tamaños de pantalla.
- Tests automáticos.

---

## Data model

```js
// src/settings.js
const CANVAS_W = 640;
const CANVAS_H = 720;
const LIVES = 3;
const POINTS = { normal: 10, gray: 20 };
const BALL_SPEED = 6;          // px/frame, constante
const GRID = { cols: 20, rows: 7, top: 80 };
const ROW_COLORS = ['gray', 'red', 'yellow', 'cyan', 'magenta', 'hotpink', 'green'];

// src/game.js
const state = {
  mode: 'ready',               // 'ready' | 'playing' | 'gameover' | 'won'
  score: 0,
  lives: LIVES,
};

// src/entities.js
// paddle: { x, y, w: 162, h: 14 }
// ball:   { x, y, r: 8, vx, vy, stuck }
// block:  { x, y, w: 32, h: 16, color, hits }   // hits: 2 si gray, 1 si no
// explosion: { x, y, color, t }                  // t = ms transcurridos
```

Convenciones:

- Origen en la esquina superior izquierda; la pelota usa su centro como posición.
- Velocidades en píxeles por frame.
- Los sprites y explosiones salen de `SPRITES` y `EXPLOSION_FRAMES` en `assets/spritesheet.js`; la explosión `gray` reutiliza los frames de `red`.

---

## Implementation plan

1. Crear `index.html` con un canvas de 640x720, fondo negro y carga ordenada de scripts (`assets/spritesheet.js`, `src/settings.js`, `src/entities.js`, `src/game.js`). Arrancar el bucle dentro del callback de `loadSpritesheet`. Prueba manual: abrir el archivo, ver el canvas negro sin errores en consola.
2. Dibujar la pala con `drawSprite(ctx, 'paddle', ...)` y moverla con teclado y mouse, limitada a los bordes. Prueba manual: la pala se mueve y no sale del canvas.
3. Agregar la pelota pegada a la pala; espacio o clic la lanza; rebota en paredes y techo. Prueba manual: la pelota sigue a la pala y, al lanzarla, rebota arriba y a los lados.
4. Rebote en la pala con ángulo según el punto de impacto y velocidad constante. Prueba manual: tocar el borde izquierdo o derecho de la pala la desvía en ese sentido.
5. Crear la cuadrícula de bloques con colisión y eliminación, con `ball-bounce.mp3` en rebotes y `break-sound.mp3` al romper. Prueba manual: los bloques desaparecen al golpearlos y se oyen los sonidos.
6. Bloques `gray` de 2 golpes; tras el primero se dibujan atenuados. Prueba manual: la fila gris resiste un golpe.
7. Agregar puntaje y vidas en pantalla; al caer la pelota se pierde una vida y vuelve a quedar pegada a la pala. Prueba manual: el puntaje sube y las vidas bajan.
8. Animación de explosión con `EXPLOSION_FRAMES` y `EXPLOSION_DURATION` al romper un bloque. Prueba manual: se ve la animación en cada bloque roto.
9. Estados Game Over y victoria con reinicio por espacio o clic. Prueba manual: perder las 3 vidas y romper todos los bloques muestran su pantalla y permiten reiniciar.
10. Actualizar `README.md` (cómo jugar y controles) y `CLAUDE.md` (stack JavaScript, estructura y cómo ejecutar).

---

## Acceptance criteria

- [ ] Abrir `index.html` con doble clic carga el juego sin errores en la consola.
- [ ] La pala se mueve con flechas, A-D y mouse, y nunca sale del canvas.
- [ ] La pelota permanece pegada a la pala hasta pulsar espacio o hacer clic.
- [ ] La pelota rebota en paredes, techo y pala.
- [ ] Un golpe en el borde izquierdo de la pala desvía la pelota a la izquierda y en el borde derecho a la derecha.
- [ ] Un bloque normal desaparece al primer golpe y suma 10 puntos.
- [ ] Un bloque `gray` desaparece al segundo golpe y suma 20 puntos.
- [ ] Al romper un bloque se ve la animación de explosión y suena `break-sound.mp3`.
- [ ] Los rebotes reproducen `ball-bounce.mp3`.
- [ ] Cuando la pelota cae, las vidas bajan en 1 y la pelota vuelve pegada a la pala.
- [ ] Perder la tercera vida muestra Game Over.
- [ ] Romper todos los bloques muestra la pantalla de victoria.
- [ ] Espacio o clic en Game Over o victoria reinicia puntaje, vidas y bloques.
- [ ] El puntaje y las vidas están visibles durante la partida.
- [ ] `README.md` y `CLAUDE.md` describen el stack JavaScript y no mencionan Pygame.

---

## Decisions

- **Yes:** JavaScript + Canvas 2D. Reutiliza `assets/spritesheet.js` y se ejecuta sin instalar nada.
- **No:** Python + Pygame. Era lo que decía el README, pero obligaba a reescribir el helper de sprites.
- **Yes:** scripts planos sin build. Los módulos ES no cargan al abrir `index.html` con `file://`.
- **Yes:** ángulo de rebote según el punto de impacto. Con rebote especular simple el juego es repetitivo.
- **Yes:** bloques `gray` de 2 golpes, para tener un tipo de bloque distinto sin abrir el alcance a varios niveles.
- **No:** tests automáticos. La verificación es un checklist manual.
- **No:** varios niveles. Va en otro spec.

---

## Risks

| Risk                                                         | Mitigation                                                                                          |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| El navegador bloquea el audio hasta la primera interacción   | Los sonidos se disparan después del primer clic o tecla (lanzar la pelota).                        |
| La pelota atraviesa bloques a alta velocidad                 | Mantener `BALL_SPEED` por debajo de 8 px/frame, menos que la altura del bloque (16 px).             |
| El atlas no está cargado en el primer frame                  | Arrancar el bucle dentro del callback de `loadSpritesheet`; `drawSprite` ya no dibuja sin atlas.    |
| El sprite `gray` no tiene frames de explosión propios        | Reutilizar los de `red` (ya así en `EXPLOSION_FRAMES.gray`).                                        |

---

## What is **not** in this spec

- Varios niveles.
- Power-ups.
- Puntajes máximos persistentes.
- Menú principal y pausa.
- Versión móvil o táctil.
- Tests automáticos.

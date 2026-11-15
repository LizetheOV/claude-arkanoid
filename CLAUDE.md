# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Idioma

Responde siempre en español en este proyecto (instrucción explícita del usuario). El código, los identificadores y los nombres de archivo mantienen sus convenciones existentes.

## Estado del proyecto

Juego de Arkanoid/Breakout jugable (MVP del spec `01-mvp-arkanoid`). Stack: **JavaScript + Canvas 2D** con scripts planos, sin módulos ES, sin build, sin manifiesto de paquetes, sin linter y sin tests automáticos (la verificación es un checklist manual). Los módulos ES no cargan al abrir `index.html` con `file://`, por eso todo son scripts clásicos que comparten el ámbito global.

## Estructura del proyecto

```
.claude/skills/      Skills del proyecto (spec, spec-impl) + README.md con su descripción
assets/              Recursos del juego (spritesheet, sprites en JS, sonidos)
specs/               Specs NN-slug.md y .spec-config.yml (los genera /spec)
src/                 Código del juego (scripts planos)
  settings.js          Constantes: canvas 640x720, vidas, puntos, BALL_SPEED, GRID, ROW_COLORS
  entities.js          Fábricas y utilidades: createPaddle, createBall, createBlocks, clampPaddle
  game.js              Estado, entrada, colisiones, sonido, dibujo y bucle principal
index.html           Página del juego: canvas y carga ordenada de scripts
CLAUDE.md            Esta guía
README.md            Cómo jugar y controles (en español)
```

## Cómo ejecutar

Abre `index.html` con doble clic; no hay servidor ni instalación. El orden de los `<script>` importa: `assets/spritesheet.js`, `src/settings.js`, `src/entities.js`, `src/game.js`. El bucle de juego arranca dentro del callback de `loadSpritesheet`, cuando el atlas ya está cargado. No hay comando de pruebas: se verifica a mano con los criterios de aceptación del spec.

## Código del juego (`src/`)

- `game.js` mantiene `state` (`mode`: `'ready' | 'playing' | 'gameover' | 'won'`, `score`, `lives`) y las entidades `paddle`, `ball`, `blocks` y `explosions`. Las velocidades están en px/frame y la pelota usa su centro como posición; las explosiones avanzan con `dt` en ms.
- Espacio o clic (`handleAction`) lanza la pelota o, en Game Over y victoria, reinicia la partida.
- Los sonidos se reproducen clonando el elemento `Audio`, y solo después de la primera interacción (lanzar la pelota) por la política de autoplay de los navegadores.

## Assets (`assets/`)

- `spritesheet-breakout.png`: atlas único de sprites para todo el juego.
- `spritesheet.js`: helper de script plano (sin módulos) que define las coordenadas del atlas y se encarga de cargarlo y dibujarlo:
  - `SPRITES` asocia `paddle`, `ball` y `blocks.<color>` con rectángulos fuente `{sx, sy, sw, sh}`. `EXPLOSION_FRAMES.<color>` guarda 4 frames de animación por color (`EXPLOSION_DURATION = 150`). La explosión `gray` reutiliza los frames de `red`.
  - `loadSpritesheet(cb)` carga el PNG una sola vez, lo copia a un canvas fuera de pantalla y encola los callbacks. La ruta de la imagen está fija y es relativa a la página: `assets/spritesheet-breakout.png`.
  - `drawSprite(ctx, name, x, y, w, h)` acepta `'paddle'`, `'ball'` o `'block_<color>'`; `drawFrame(ctx, frame, x, y, w, h)` dibuja un frame de explosión. Ambas no hacen nada, sin error, hasta que el atlas termina de cargar.
- `sounds/ball-bounce.mp3`, `sounds/break-sound.mp3`: efectos de sonido para rebotes (pala/paredes) y rotura de bloques.

## Flujo de trabajo basado en specs (`.claude/skills/`)

Dos skills invocadas por el usuario (`disable-model-invocation: true`) definen el proceso de desarrollo; el detalle completo está en sus `SKILL.md`:

- `/spec <descripción>`: entrevista al usuario y luego escribe `specs/NN-slug.md` (estado `Draft`) a partir de `.claude/skills/spec/template.md`, y crea `specs/.spec-config.yml`. Nunca escribe código.
- `/spec-impl <NN-slug>`: solo funciona con un spec cuyo estado signifique "Aprobado" (lo cambia la persona, en cualquier idioma). Trabaja en la rama `spec-NN-slug`, implementa el plan paso a paso y se detiene para revisar el diff. Solo hace commits si `AutoCommitSteps: true` en `specs/.spec-config.yml` (un commit `spec-NN-step-MM` por paso) y nunca hace push.

Reglas a respetar: implementa exactamente lo que dice el spec (los cambios van en el spec, no en el código) y respeta el idioma y la redacción de los specs existentes.

# Juego de Arkanoid

Juego de Arkanoid desarrollado en JavaScript con Canvas 2D, sin dependencias ni paso de build. El objetivo es destruir todos los bloques con una pelota que rebota en una pala controlada por el jugador.

## Cómo jugar

Abre `index.html` con doble clic en cualquier navegador moderno. No hace falta instalar nada.

1. La pelota empieza pegada a la pala. Lánzala con **espacio** o **clic**.
2. Mueve la pala para que la pelota no caiga. El ángulo del rebote depende de dónde toque la pala: en los bordes se desvía más.
3. Rompe todos los bloques para ganar. Los bloques grises necesitan 2 golpes.
4. Tienes 3 vidas. Si pierdes la última aparece Game Over.
5. En Game Over o en la pantalla de victoria, pulsa **espacio** o haz **clic** para reiniciar.

## Controles

| Acción            | Control                         |
| ----------------- | ------------------------------- |
| Mover la pala     | Flechas izquierda/derecha o A/D |
| Mover la pala     | Mouse                           |
| Lanzar la pelota  | Espacio o clic                  |
| Reiniciar         | Espacio o clic (en Game Over o victoria) |

## Puntaje

- Bloque normal: 10 puntos.
- Bloque gris: 20 puntos.

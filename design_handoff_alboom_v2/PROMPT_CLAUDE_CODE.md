# Mensajes para Claude Code (V2)

Guardá cada mensaje que le mandes: la consigna pide ejemplos de las instrucciones que le diste a la IA.

## Mensaje inicial (una sola vez, al abrir el proyecto)

---

Vamos a construir ALBOOM, mi trabajo práctico de Desarrollo Frontend II (React + Vite + Firebase + Vercel).

Leé completos `design_handoff_alboom_v2/README_V1.md` y `design_handoff_alboom_v2/README.md`. El primero es la base; el segundo agrega y cambia cosas, y si se contradicen gana el segundo. Los archivos de `design/` son referencias visuales en HTML: abrilos para sacar medidas y textos, no los copies como código.

Cómo quiero que trabajes:
- Vamos por las fases de la sección 2 del README V2, de a una. Hoy hacemos solo la **fase 1** (V1 completo).
- Antes de escribir código, resumime el plan en pasos cortos y la lista de archivos. Esperá mi OK.
- Respetá las reglas de código de la sección 5 del README V1. Me evalúan React y JavaScript y tengo que poder explicar cada parte.
- No reescribas los archivos de `starter/`. Si encontrás un error, explicámelo y hacé el cambio mínimo.
- Yo completo el `.env`. Si falta una clave, avisame; no inventes valores ni me pidas que te las pegue en el chat.
- Al terminar cada pantalla, decime cómo probarla.
- Al cerrar la fase: `npm run lint`, `npm run build`, recorremos las pruebas, me mostrás `git status` (verificá que `.env` NO aparezca) y esperás mi OK para el commit.

---

## Al empezar cada fase nueva

---

Fase N del README V2: [nombre de la fase]. Releé la sección correspondiente y las pantallas que menciona en `design/ALBOOM Final v3.dc.html`. Pasame el plan y los archivos que vas a tocar antes de empezar. Al terminar, corré lint y build, probamos juntos y hacemos commit con el tag que indica la tabla.

---

## Para pedir arreglos

- "En la pantalla X, Y no se ve como en el diseño (pantalla N de `ALBOOM Final v3`). Compará los dos y corregilo. Explicame qué estaba mal."
- "Aparece este error en la consola: [pegá el error]. Encontrá la causa, explicámela y arreglalo con el cambio mínimo."
- "Explicame cómo funciona [archivo o función] como si lo tuviera que defender en la demo."

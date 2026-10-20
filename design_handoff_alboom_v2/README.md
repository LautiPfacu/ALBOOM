# ALBOOM · Paquete de traspaso V2

> Documento para **Claude Code**. Leelo completo antes de escribir código.
> **Este README se suma a `README_V1.md`, no lo reemplaza.** V1 define la base: reglas de código (sección 5), arquitectura, rutas, contextos, hooks y las pantallas originales. Lo que está acá agrega pantallas y cambia algunas. **Si hay contradicción, gana este archivo.**

---

## 1. Qué hay en este paquete

```
design_handoff_alboom_v2/
├─ README.md                 ← este archivo (V2)
├─ README_V1.md              ← especificación base (V1)
├─ PROMPT_CLAUDE_CODE.md     ← mensajes para pegarle a Claude Code, fase por fase
├─ design/                   ← referencias visuales en HTML (abrir en el navegador)
│  ├─ ALBOOM Final v3.dc.html       ← TODAS las pantallas en tema Historieta (fuente principal)
│  ├─ ALBOOM Tema Garage.dc.html    ← mismas pantallas con el tema Garage + paleta y reglas
│  ├─ ALBOOM Tema Psicodelia.dc.html
│  ├─ ALBOOM Tema Medianoche.dc.html
│  ├─ ALBOOM Logo.dc.html           ← logo (opción 3a)
│  ├─ ALBOOM V1.dc.html             ← estados de carga/éxito/error de V1
│  ├─ ALBOOM 1b Fanzine.dc.html     ← dirección visual original (referenciada en V1)
│  └─ alboom-loader.js              ← logo animado (lo usan los HTML de diseño)
└─ starter/                  ← archivos listos para copiar al proyecto
   ├─ (todo lo de V1)
   ├─ src/styles/themes.css         ← NUEVO: los 4 temas como variables CSS
   ├─ src/components/alboom-loader.js ← NUEVO: logo animado (web component)
   └─ src/data/generos.json         ← NUEVO: 393 géneros en 20 familias
```

Los HTML de `design/` **no son código para copiar**: abrilos para sacar medidas, textos y comportamiento. Cada pantalla tiene un número (por ejemplo "7b · Explorar · todos los géneros") que se usa en este documento.

---

## 2. Implementación por fases

Cada fase termina con la app funcionando, `npm run lint` y `npm run build` sin errores, un commit y un push (Vercel publica solo). No empezar una fase sin cerrar la anterior.

| Fase | Contenido | Pantallas de `ALBOOM Final v3` | Tag |
|---|---|---|---|
| 1 | V1 completo según `README_V1.md` | (las de V1) | `v1.0` |
| 2 | Identidad: logo, explosión del login, logo animado | 1, Estados nuevos | `v1.1` |
| 3 | Primera vez (géneros, discos, tema) | 2, 3, 4 | `v1.2` |
| 4 | Temas | archivos `ALBOOM Tema *` | `v1.3` |
| 5 | Biblioteca: vistas y fecha de escucha; búsqueda con "Escuchado" | 6, 8, 8b, 8c | `v1.4` |
| 6 | Comunidad: reseñas públicas, página de disco nueva, Tendencias, Explorar | 5, 7, 7b, 9 | `v2.0` |
| 7 | Perfil y ajustes, ayuda, seguridad | 10, Perfil móvil, Menú de tu cuenta | `v2.1` |

---

## 3. Fase 2 · Identidad

### Logo
- **Barras de navegación (todas las pantallas con sesión)**: logotipo integrado, "ALBO" + estallido como O + "M" (Barriecito 40 px, `text-shadow: 3px 2px 0 var(--pink)`, estallido de 46 px). En celular: 30 px y estallido de 34 px.
- **Login**: el nombre va **solo con tipografía** ("ALBOOM", Barriecito 64 px, sombra rosa), porque el estallido ya está en la ilustración.
- El estallido es un SVG: copiá el `<polygon id="burst">` y el `<g id="logo">` del bloque `<defs>` de `ALBOOM Final v3.dc.html` a `src/assets/logo.svg` o a un componente `Logo.jsx` con colores `var(--ink)`, `var(--pink)` y `var(--paper)`.

### Ilustración del login
- Reemplaza el collage de tapas de V1. Es el `<g id="explosion">` de `ALBOOM Final v3.dc.html` (viewBox 760×800): rayos rosa, estallidos encimados azul/rosa/amarillo/blanco, líneas de acción, anillos de puntos, fragmentos y destellos, con el estallido del logo en el centro.
- Extraelo **tal cual** a `src/assets/login-explosion.svg` (es un dibujo fijo, no se genera en tiempo de ejecución) y usalo como `<img alt="">` decorativa con `object-fit: cover`.
- Encima: el cartel "Escuchá. / Puntuá. / Descubrí." de V1 y una trama de puntos en la esquina inferior izquierda.
- Celular: la misma explosión recortada en una franja de 250 px.
- Sin tapas de discos en login ni en la primera vez: la marca no tiene que sugerir gustos musicales.

### Logo animado (`alboom-loader.js`)
- Es un web component ya resuelto: `<alboom-loader size="72"></alboom-loader>`. Importalo una vez en `main.jsx` (`import './components/alboom-loader.js'`). **No lo reescribas.**
- Sin atributos de color toma `--ink`, `--pink` y `--paper`, así que sigue al tema. Ya trae `role="status"` y `aria-label="Cargando"` y respeta `prefers-reduced-motion`.
- Envolvelo en `components/Loader.jsx` → `<Loader size={72} label="Buscando discos…" />` (loader + texto debajo).
- **Se usa en toda espera**: `FullPageLoader` (120 px + "Abriendo tu ALBOOM…"), secciones que cargan (64 px), y botones mientras guardan (18–24 px a la izquierda de "Guardando…"). Los skeletons de V1 se mantienen para grillas.

---

## 4. Fase 3 · Primera vez (onboarding)

Ruta `/bienvenida`, protegida. Después del primer login, si `users/{uid}.onboardingDone` no es `true`, `ProtectedRoute` redirige acá. Tres pasos con barra de progreso ("Paso N de 3"); siempre en tema Historieta.

1. **Tus géneros** (pantalla 2): grilla de 12 géneros populares (sin tapas). Elegido = fondo `--pink`, sombra y estallido; no elegido = card con un círculo punteado. Mínimo 3: si faltan, el botón "Siguiente" queda deshabilitado y se muestra "Elegí N género(s) más para seguir." (Estados nuevos). Arriba, un buscador "¿No está tu género? Buscalo entre los 393" que filtra `generos.json` por nombre sin tildes.
2. **Tus últimos discos** (pantalla 3): buscador de Spotify + "Sugerencias por tus géneros" (ver sección 8). Hasta 5 discos; van a la biblioteca como `escuchado` con `listenedAt = now`. Se puede saltear.
3. **Tu tema** (pantalla 4): 4 tarjetas con vista previa. Sugerido según los géneros elegidos (tabla de la sección 5). "Entrar a ALBOOM" guarda `genres`, `theme` y `onboardingDone: true` en una sola escritura.

---

## 5. Fase 4 · Temas

- Importá `starter/src/styles/themes.css` en `main.jsx` **después** de `tokens.css`. Define el tema Historieta como base y `[data-theme='garage' | 'psicodelia' | 'medianoche']`.
- `ThemeContext` lee `users/{uid}.theme` y pone `document.documentElement.dataset.theme` (sin atributo para Historieta). En `/login` y `/bienvenida` se fuerza Historieta.
- **Regla de oro**: ningún componente usa colores fijos. Todo sale de variables. Reemplazá en el CSS de V1:
  - texto sobre `--pink` → `color: var(--on-accent)`
  - bordes → `var(--border)`; sombras → `var(--shadow*)`
  - marcador amarillo → `background: var(--highlight)`
  - etiquetas chicas en mayúsculas → `font-family: var(--font-label)`
  - cuerpo del vinilo → `var(--vinyl-body)`; barras del gráfico → `var(--chart)`
- Cada archivo `design/ALBOOM Tema *.dc.html` tiene arriba la paleta y las reglas del tema. Compará pantalla por pantalla.

| Tema | Sugerido si elige… |
|---|---|
| Historieta | pop, urbano latino, indie, tropical, brasil, reggae y ska, o nada de lo de abajo |
| Garage | rock, punk y hardcore, metal, blues |
| Psicodelia | electrónica, experimental, rock psicodélico, psicodelia |
| Medianoche | R&B/soul/funk, jazz, folk, clásica, tango y folklore |

Contar cuántos de los géneros elegidos caen en cada familia (`generos.json` → `familias[].id`) y sugerir el tema con más coincidencias.

---

## 6. Fase 5 · Biblioteca y búsqueda

- **Fecha de escucha**: nuevo campo `listenedAt` en cada disco (sección 9). Se pone en `serverTimestamp()` la primera vez que el estado pasa a `escuchado` y no se borra si vuelve a `pendiente`.
- **Vistas** (pantallas 8, 8b, 8c): segmentado "Grande / Chica / Lista" con íconos, al lado de "Ordenar por". Se guarda en `localStorage` (`alboom:libraryView`), igual que filtros y orden en V1.
  - Grande: 4 columnas (la de V1). Chica: 8 columnas, tapa + nombre + puntaje corto. Lista: tabla con tapa 64 px, disco/artista/año, tu puntaje en vinilos, estado y "Lo escuchaste" (fecha `d MMM yyyy` en español o "Todavía no").
  - Celular: solo íconos; Grande = 2 columnas, Chica = 3, Lista = filas.
- **Búsqueda** (pantalla 6): el botón de cada resultado tiene 3 estados según la biblioteca: **"✓ Escuchado"** (`--listened`, verde) si está escuchado; "En tu biblioteca" (`--yellow`) si está pendiente; "Guardar" (`--pink`) si no está. Arriba de los resultados, la leyenda de colores. En Explorar, la marca ✓ de las tapas también es verde y solo para escuchados.

---

## 7. Fase 6 · Comunidad, disco, Tendencias y Explorar

### Página de disco (pantalla 9) — cambia el orden de V1
- **Columna izquierda**: tapa 400 px → "Abrir en Spotify ↗" → **Canciones** en una sola columna (debajo de la tapa, 14 px).
- **Columna derecha**: encabezado (tipo · año · género, título 96 px, artista, duración) y **al lado del título el puntaje de la comunidad**: cartel amarillo inclinado 2°, "4,3 / 5" en Barriecito 88 px, vinilos y "128 reseñas". Es lo primero que se ve, como en Letterboxd o IMDb. Si no hay reseñas: "Sin puntaje todavía".
- Debajo: "Tu escucha" (igual que V1, con "Mostrar en la comunidad") → "Lo que dice la comunidad": gráfico de distribución (10 barras, de ½ a 5) a la izquierda y reseñas a la derecha (orden "Recientes" / "Mejor puntaje", 3 + "Ver las N reseñas") → "Sobre el artista" con más discos.
- Celular: tapa → título → cartel de puntaje → tu escucha → comunidad → canciones → más del artista.

### Reseñas públicas
- Cuando "Mostrar en la comunidad" está activo y el disco está escuchado con puntaje, se escribe `reviews/{albumId}_{uid}` además del documento de la biblioteca (en un `writeBatch`). Si se desactiva o se quita el disco, se borra.
- El puntaje y la distribución de un disco se calculan leyendo `reviews` donde `albumId == id` (alcanza para el tamaño del TP; dejar un comentario sobre pasarlo a una Cloud Function más adelante).

### Inicio (pantalla 5)
- "Para vos": discos de los géneros del usuario (sección 8), con el promedio de la comunidad si existe.
- **"Tendencias"** (reemplaza "Qué se está reseñando"): los 5 discos con más reseñas en los últimos 7 días (`reviews` donde `createdAt >= hace 7 días`, agrupado en el cliente). Número grande con contorno (`--rank` + `--outline`) sobre la tapa; debajo "+N esta semana".
- Sin datos suficientes: ocultar la sección.

### Explorar (pantallas 7 y 7b) — ruta `/explorar`
- Fila de chips: "Tus géneros" (los del perfil) | "Populares" (Tango, Cumbia, Cuarteto, Salsa, Folklore argentino, Trap latino, Jazz, Electrónica) | botón **"Todos los géneros · 393"**.
- Ese botón abre un diálogo (pantalla 7b): buscador, familias a la izquierda con su cantidad, géneros de la familia como chips a la derecha, y abajo "Ver discos de X". Accesible: `role="dialog"`, foco atrapado, `Esc` cierra.
- Décadas: segmentado "Todas, 60, 70, 80, 90, 2000, 2010, 2020". Orden: "Más reseñados" o "Mejor puntaje" (con datos de `reviews`) o "Recientes".
- Sin resultados: estado "Nada por acá" (Estados nuevos).

---

## 8. Spotify: géneros y recomendaciones

- **Los discos de Spotify no traen género.** El filtro `genre:` de la búsqueda solo funciona con `type=artist` o `type=track`.
- Para "discos de un género" (Explorar, Para vos, sugerencias del onboarding): `/search?type=track&q=genre:"<spotify>" year:<desde>-<hasta>` y quedarse con los `album` únicos (descartar `album_type: single` y `compilation`). Paginar con `offset` (máx. 10 por pedido en modo desarrollo).
- El valor `<spotify>` está en `generos.json` → `familias[].generos[].spotify`. Algunos géneros chicos pueden devolver pocos resultados: mostrar el estado vacío, no un error.
- Agregar al proxy `api/spotify.js` solo los endpoints que se usen (search, albums, artists/{id}/albums). Cachear respuestas 10 min en memoria del cliente.

---

## 9. Datos (cambios en Firestore)

```
users/{uid}
  displayName, email, createdAt          (V1)
  username: string                       3–20, [a-z0-9._], único
  photoURL: string | null
  genres: string[]                       ids de generos.json, mín. 3
  theme: 'historieta' | 'garage' | 'psicodelia' | 'medianoche'
  onboardingDone: boolean
  settings: { publicReviewsDefault: boolean, publicProfile: boolean }

usernames/{username}  → { uid }          reserva del nombre (transacción al crear o cambiar)

users/{uid}/library/{albumId}            (V1) +
  listenedAt: timestamp | null
  isPublic: boolean                      espejo de "Mostrar en la comunidad"

reviews/{albumId}_{uid}                  pública para usuarios con sesión
  albumId, uid, username, displayName, photoURL
  rating: number                         0,5 a 5
  text: string                           máx. 500
  album: { name, artist, cover, year }
  createdAt, updatedAt
```

**Reglas** (actualizar `firestore.rules`): `users` y `library` siguen siendo solo del dueño. `reviews`: lectura para cualquier usuario con sesión; crear/editar/borrar solo si `request.auth.uid == uid` y el id del documento es `albumId + '_' + uid`; validar tipos, puntaje y largo. `usernames`: crear solo si no existe y `uid == request.auth.uid`; borrar solo el propio. Pedir índices compuestos si Firestore los sugiere en la consola.

---

## 10. Fase 7 · Perfil y ajustes (pantalla 10)

Ruta `/perfil`. En escritorio: columna izquierda con avatar, nombre, @usuario, "desde" y 3 números (discos, reseñas, promedio), y un menú de secciones con ancla; a la derecha, las secciones. En celular: lista agrupada (Cuenta / La app / Ayuda) que abre cada sección en su propia ruta (`/perfil/cuenta`, `/perfil/tema`, etc.).

1. **Tu cuenta**: foto (subir a Firebase Storage es opcional; si no, solo inicial), nombre, nombre de usuario (con chequeo de disponibilidad), email. Cambiar email usa `verifyBeforeUpdateEmail` y muestra "Te mandamos un mail para confirmarlo".
2. **Tema de la app**: las 4 tarjetas; el cambio se aplica al instante y se guarda en `users/{uid}.theme`.
3. **Tus géneros**: chips actuales + "Editar géneros" (reusa el paso 1 del onboarding en un diálogo).
4. **Privacidad y seguridad**:
   - Interruptores (`role="switch"`): "Mostrar mis reseñas nuevas en la comunidad" y "Perfil público".
   - Cambiar contraseña: `reauthenticateWithCredential` + `updatePassword`. Solo para cuentas con email.
   - Google conectado / desconectar (`unlink`, no permitir si es el único método).
   - "Cerrar sesión en todos": requiere el Admin SDK (`revokeRefreshTokens`) en una función de Vercel. **Opcional**: si no se hace, mostrar solo "Cerrar sesión".
   - Descargar mis datos: genera un `.json` en el navegador con perfil, biblioteca y reseñas.
   - Eliminar cuenta: diálogo con confirmación escribiendo "ELIMINAR", reautenticación, borrado de `library`, `reviews`, `usernames` y `users/{uid}` en lotes, y después `deleteUser`.
5. **Ayuda**: buscador que filtra las preguntas; acordeón accesible (`<details>/<summary>` o botones con `aria-expanded`). Preguntas: cómo protejo mi cuenta (abierta en el diseño, texto final), quién ve mis reseñas, cómo puntúo, por qué no encuentro un disco, cómo cambio el tema, cómo elimino mi cuenta. Escribí las respuestas que faltan en el mismo tono, cortas. "Reportar un problema" abre un formulario que guarda en `reports/{id}` (solo crear). Links a Términos y Privacidad (páginas simples).

El **menú de tu cuenta** (avatar en la barra) queda: Perfil y ajustes · Tema (nombre actual) · Ayuda · Cerrar sesión.

---

## 11. Pruebas de aceptación nuevas

Además de las 15 de V1:
1. Cuenta nueva → va a `/bienvenida`; con 2 géneros no se puede seguir; con 3 sí. Al terminar, `users/{uid}` tiene `genres`, `theme` y `onboardingDone: true`.
2. Cambiar el tema en el perfil cambia toda la app sin recargar, y persiste al recargar. En `/login` siempre se ve Historieta.
3. Las 4 combinaciones de tema pasan contraste 4,5:1 en texto común (revisar con DevTools → Accessibility).
4. El logo animado aparece en toda carga y, con "reducir movimiento" activado, solo gira.
5. Buscar un artista: los discos escuchados dicen "✓ Escuchado" en verde.
6. Biblioteca: las 3 vistas funcionan y la elegida sobrevive a la recarga. La lista muestra la fecha de escucha.
7. Reseña con "Mostrar en la comunidad": aparece en `reviews` y en la página del disco para otra cuenta. Al apagarlo, desaparece.
8. Explorar → "Todos los géneros" → buscar "chamamé" → "Ver discos" muestra resultados o el estado vacío, nunca un error.
9. Cambiar la contraseña pide la actual; eliminar la cuenta borra todos sus documentos.
10. Sin conexión, cualquier guardado nuevo muestra el toast de error en ≤ 10 s.

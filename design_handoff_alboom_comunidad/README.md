# ALBOOM · Comunidad, perfiles y Spotify

> Para **Claude Code**. Agrega la parte social a la app que ya funciona.
> Siguen vigentes `README_V1.md` y `README.md` (V2). Si algo se contradice, gana este archivo.

## Archivos

```
design_handoff_alboom_comunidad/
├─ README.md                       ← este archivo
└─ design/
   ├─ ALBOOM Comunidad.dc.html     ← todas las pantallas y pop-ups (abrir en el navegador)
   ├─ alboom-motion.js             ← lo usa el HTML de diseño para el logo animado
   └─ support.js
```

El HTML es una referencia visual, no código para copiar. Usa los mismos tokens, componentes y temas que la app (`tokens.css` + `themes.css`): nada de colores fijos.

## Qué es pantalla y qué es pop-up

| Nombre | Tipo | Ruta o cómo se abre |
|---|---|---|
| Comunidad | Pantalla | `/comunidad` (pestaña nueva en la barra y en la TabBar de celular, entre Explorar y Biblioteca) |
| Tu perfil | Pantalla | `/perfil` (avatar de la barra → "Tu perfil"). "Perfil y ajustes" sigue existiendo para la cuenta y la seguridad |
| Perfil de otra persona | Pantalla | `/u/:username` (tocando un nombre o un avatar en cualquier lado) |
| Editar Top 5 | Pop-up | Tu perfil → "Editar Top 5" |
| Seguidores y seguidos | Pop-up | Tocando "128 seguidores" / "96 seguidos" en cualquier perfil |
| Conectar Spotify / Tu Spotify | Pop-up | Tarjeta "Desde tu Spotify" de **tu perfil** (dos estados: sin conectar y conectado). No aparece en Comunidad |
| Sugerencias desde Spotify | Pop-up | Botón "Revisar y sumar" de la tarjeta de Spotify |
| Buscar personas | Pop-up | Comunidad → "Buscar personas" |
| Compartir | Menú | "Compartir" en cada posteo |

Todos los pop-ups usan un `Modal` accesible: `role="dialog"`, `aria-modal`, foco atrapado, `Esc` y clic afuera cierran, y el foco vuelve al botón que lo abrió. En celular se abren como hoja desde abajo, a pantalla completa.

## Pantallas

### Comunidad (1 y 2)
- Título, bajada y segmentado **Siguiendo / Para vos** (se recuerda en `localStorage`).
- Barra "¿Qué escuchaste? Reseñá un disco…" con "Escribir reseña": abre la búsqueda de discos y lleva a la página del disco con el foco en la reseña.
- **Tipos de posteo**:
  - **Reseña**: se crea al guardar una reseña con "Mostrar en la comunidad" activado. Muestra disco, puntaje en vinilos y texto.
  - **Escuchó**: se crea solo al marcar un disco como escuchado, si la persona tiene activado "Publicar cuando marco un disco como escuchado" (nuevo interruptor en Privacidad, apagado por defecto).
  - **Actualizó su Top 5**: se crea al guardar el Top 5 con "Avisar a mis seguidores" activado.
  - **Compartido**: el posteo original con "⟲ Juli compartió" arriba.
- **Acciones**: Me gusta (cambia al instante y se revierte si Firestore falla), Responder (despliega el hilo debajo: 2 respuestas + "Ver N más" + campo para responder), Compartir (menú), botón de biblioteca con los tres estados de siempre (+ Guardar / En tu biblioteca / ✓ Escuchado) y "Spotify ↗".
- **Para vos**: posteos públicos de gente que no seguís, con el motivo arriba ("Porque te gusta el rock nacional", "Lo siguen Tomás y Juli") y un botón "Seguir" en la cabecera.
- Columna derecha en escritorio: solo "Gente con tus gustos" (3 personas + "Buscar personas"). La tarjeta de Spotify vive únicamente en tu perfil. En celular no hay columna derecha.
- Paginación: 20 posteos y carga infinita con un sentinel (`IntersectionObserver`), con el logo animado de 64 px mientras carga.
- Vacío en "Siguiendo": "Todavía no seguís a nadie" + 3 sugerencias.

### Tu perfil (3 y 5)
- Cabecera: avatar 150 px, nombre, @usuario, bio (máx. 160), géneros, números (seguidores y seguidos son botones que abren el pop-up), "Editar perfil" (lleva a Perfil y ajustes → Tu cuenta), "Compartir perfil" (copia el link).
- **Mi Top 5**: estante de 5 tapas iguales, numeradas del 1 al 5 con un círculo amarillo. Si faltan, se ven lugares punteados con "Elegí un disco".
- **Escuchado recientemente** con chip "desde Spotify": últimos 6 discos únicos. Solo si Spotify está conectado y el interruptor está activo.
- Segmentado **Actividad / Reseñas / Biblioteca**: Actividad = sus posteos; Reseñas = solo reseñas; Biblioteca = grilla chica de la biblioteca.

### Perfil de otra persona (4 y 6)
- Igual que el tuyo, pero con "Siguiendo ✓" / "Seguir", chip "Te sigue" si corresponde, y un cartel amarillo de coincidencia: "2 de 5 discos de su Top 5 también están en el tuyo" (solo si hay al menos 1).
- Columna derecha: seguidores en común (avatares apilados) y su promedio.
- **Todos los perfiles son públicos** por ahora: no hay cuentas privadas ni solicitudes. Seguir es inmediato.
- Tus discos dentro de sus listas usan la marca verde de siempre si ya los escuchaste.

## Pop-ups
- **Editar Top 5**: 5 lugares en fila, arrastrables (Pointer Events + teclado: flechas para mover el elegido), con "×" para quitar. Abajo, buscador con "De tu biblioteca" o "Buscar en Spotify". Lo que ya está en el Top 5 muestra "En tu Top 5", deshabilitado. Pie: interruptor "Avisar a mis seguidores" y "Guardar Top 5".
- **Seguidores y seguidos**: dos pestañas, buscador local y filas con "Seguir" o "Siguiendo ✓".
- **Conectar Spotify**: qué se lee, qué nunca se hace, "Conectar con Spotify" y "Ahora no".
- **Tu Spotify** (conectado): cuenta conectada, 3 interruptores (recomendaciones, escuchado recientemente, sugerencias) y "Desconectar Spotify".
- **Sugerencias desde Spotify**: discos de la última semana que no están en la biblioteca, con "Escuchado" (lo suma con `listenedAt` de hoy), "Pendiente" o descartar (no se vuelve a sugerir).
- **Buscar personas**: búsqueda por nombre o @usuario (prefijo, sobre `usernames`), "Con tus mismos gustos" (con las 5 tapas de su Top 5) y "Referentes" (las cuentas con más seguidores).

## Datos (Firestore)

```
users/{uid}                         (V2) +
  bio: string                       máx. 160
  postListened: boolean             publicar "escuchó"
  followersCount, followingCount: number
  top5: [{ albumId, name, artist, cover, year }]     0 a 5, en orden
  spotify: { connected: boolean, displayName: string | null }
  recent: [{ albumId, name, artist, cover, playedAt }]  máx. 6, lo escribe el dueño

users/{uid}/private/spotify         solo el dueño: refreshToken, scope, updatedAt
users/{uid}/dismissed/{albumId}     sugerencias descartadas

follows/{followerUid}_{followedUid}
  follower, followed: string
  createdAt

posts/{postId}
  uid, username, displayName, photoURL       (copia del autor)
  type: 'review' | 'listened' | 'top5' | 'repost'
  album?: { albumId, name, artist, cover, year }
  rating?: number, text?: string
  top5?: [...]
  repostOf?: postId
  likeCount, replyCount, repostCount: number
  createdAt

posts/{postId}/likes/{uid}          { createdAt }
posts/{postId}/replies/{replyId}    { uid, username, displayName, text (máx. 300), createdAt }
```

- Seguir/dejar de seguir, likes, respuestas y reposts actualizan los contadores en el mismo `writeBatch` con `increment()`.
- Las reseñas de V2 (`reviews/`) se mantienen para el puntaje de cada disco. Al publicar una reseña se escribe además su `post` en el mismo lote.
- **Reglas**: los `posts` los lee cualquier usuario con sesión; solo el autor los crea, edita y borra. `likes/{uid}` y `replies` solo con el propio `uid`. Una `follows` la crea y la borra solo el que sigue (`follower == request.auth.uid`). `private/` solo la lee y escribe el dueño.
- El interruptor "Perfil público" de Perfil y ajustes (V2) queda oculto por ahora: todos los perfiles son públicos.
- **Siguiendo**: `posts where uid in [seguidos]` (de a 30 ids), `orderBy createdAt desc`, mezclado en el cliente.
- **Para vos**: últimos 100 posteos públicos de gente que no seguís, ordenados en el cliente por coincidencia de géneros y de Top 5. Mostrar el motivo.

## Spotify con la cuenta de la persona

- Flujo **Authorization Code con PKCE** desde el navegador (no hace falta el secret). Scopes: `user-read-recently-played user-top-read`. Redirect URI: `/spotify/callback`, registrado en el dashboard de Spotify para localhost y para Vercel.
- El refresh token se guarda en `users/{uid}/private/spotify`. Al entrar a la app, si pasaron más de 30 min, se lee `/me/player/recently-played?limit=50`, se agrupa por disco y se actualiza `users/{uid}.recent` (para que otros lo vean sin acceder a Spotify) y las sugerencias.
- **Recomendaciones mezcladas**: Spotify ya no ofrece su endpoint de recomendaciones para apps nuevas. Se arman así: artistas de `/me/top/artists` y de lo escuchado + géneros de ALBOOM → búsqueda de discos como en Explorar → se sacan los que ya están en la biblioteca. En Inicio el título de "Para vos" dice el motivo ("Porque escuchaste Currents y te gusta el rock nacional").
- **Límite de Spotify**: en modo desarrollo solo pueden conectar sus cuentas los usuarios que se agregan a mano en Dashboard → User Management. Mostrar un error claro si Spotify rechaza la conexión ("Tu cuenta todavía no está habilitada para conectar Spotify") y no romper el resto de la app.

## Fases sugeridas

| Fase | Contenido | Tag |
|---|---|---|
| 8 | Tu perfil y perfil de otra persona (sin seguir todavía) + Editar Top 5 | `v2.2` |
| 9 | Seguir, seguidores y seguidos, buscar personas | `v2.3` |
| 10 | Comunidad: posteos, me gusta, respuestas, compartir, Siguiendo / Para vos | `v2.4` |
| 11 | Spotify: conectar, escuchado recientemente, sugerencias, recomendaciones mezcladas | `v2.5` |

## Pruebas

1. Con dos cuentas: A sigue a B (pública) y ve sus posteos en "Siguiendo" sin recargar.
2. A deja de seguir a B: sus posteos salen de "Siguiendo" y los contadores bajan en los dos perfiles.
3. Las reglas impiden borrar o editar un posteo ajeno y crear un `follows` a nombre de otra persona.
4. Me gusta, responder y compartir actualizan los contadores. Sin conexión, el me gusta vuelve atrás y aparece el error.
5. Editar Top 5: reordenar con mouse y con teclado, guardar y ver el posteo "actualizó su Top 5".
6. Conectar Spotify con una cuenta habilitada: aparece "Escuchado recientemente" y las sugerencias. Con una no habilitada: se ve el error y la app sigue funcionando.
7. Todos los pop-ups cierran con `Esc` y devuelven el foco.
8. Lint y build sin errores en cada fase.

## Mensaje para Claude Code

---

Copié la carpeta `design_handoff_alboom_comunidad` al lado del proyecto. Leé su README.md completo y abrí `design/ALBOOM Comunidad.dc.html` en el navegador. Vamos a hacer solo la **fase 8**. Antes de tocar código, pasame el plan, los cambios en Firestore y en las reglas, y la lista de archivos. Esperá mi OK. Al terminar, lint y build, probamos juntos y me mostrás git status antes del commit.

---

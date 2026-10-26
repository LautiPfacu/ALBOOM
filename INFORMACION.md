# ALBOOM · Cómo está organizado el proyecto

Guía rápida para ubicarse en el código y poder explicar el proyecto: dónde está cada cosa, cómo se conectan las partes y con qué servicios externos habla la app.

---

## 1. Qué es y con qué está hecho

**ALBOOM** es un diario de discos (como Letterboxd, pero para música): buscás discos, los guardás en tu biblioteca, los puntuás con vinilos, escribís reseñas, seguís a otras personas y descubrís música nueva.

| Parte | Tecnología | Para qué |
|---|---|---|
| Interfaz | **React + Vite** (JavaScript) | Pantallas y componentes |
| Navegación | **React Router** | Rutas (`/`, `/biblioteca`, `/disco/:id`…) |
| Cuentas | **Firebase Authentication** | Registro e inicio de sesión (email o Google) |
| Base de datos | **Cloud Firestore** | Perfiles, biblioteca, reseñas, posteos, seguidores |
| Música | **Spotify Web API** | Buscar discos, tapas, canciones; y (opcional) lo que escucha cada persona |
| Código | **GitHub** | Repositorio y versiones |
| Publicación | **Vercel** | Hosting de la app y de la función que habla con Spotify (todavía sin publicar) |

---

## 2. Las carpetas del repositorio

```
ALBOOM/                                ← raíz del repositorio de GitHub
├─ alboom/                             ← LA APP (todo el código está acá)
├─ design_handoff_alboom_v2/           ← diseño y especificaciones (README_V1, README V2, maquetas HTML)
├─ design_handoff_alboom_animaciones/  ← diseño de las animaciones de marca
├─ design_handoff_alboom_comunidad/    ← diseño de Comunidad, perfiles y Spotify
├─ INFORMACION.md                      ← este documento
└─ .gitignore                          ← archivos que git no sube (.env, .DS_Store)
```

Las carpetas `design_handoff_*` son **referencias** (cómo tiene que verse y funcionar). No se ejecutan.

### Dentro de `alboom/`

```
alboom/
├─ index.html            ← la única página HTML; React se "monta" adentro de <div id="root">
├─ src/                  ← código de la app (React)
├─ api/spotify.js        ← función de servidor que habla con Spotify (guarda el secret)
├─ public/               ← archivos que se sirven tal cual (ícono)
├─ firestore.rules       ← reglas de seguridad de Firestore (se pegan en la consola de Firebase)
├─ firestore.indexes.json← índice compuesto de Firestore (documentación)
├─ vite.config.js        ← configuración de Vite (y sirve /api/spotify en desarrollo)
├─ vercel.json           ← configuración para publicar en Vercel
├─ eslint.config.js      ← reglas de estilo de código (npm run lint)
├─ package.json          ← dependencias y comandos (npm run dev, build, lint, dev:spotify)
├─ .env                  ← claves (NO se sube a GitHub)
└─ .env.example          ← plantilla de .env (sí se sube, sin valores)
```

---

## 3. Cómo arranca la app

```
index.html
   └─ src/main.jsx          → carga estilos, animaciones y "envuelve" la app con:
        BrowserRouter         (navegación)
        AuthProvider          (¿quién está conectado?)
        ThemeProvider         (tema de colores)
        ToastProvider         (avisos de éxito / error)
           └─ src/App.jsx   → define las RUTAS: qué página se muestra en cada dirección
                ├─ /login                → LoginPage (solo sin sesión)
                ├─ /bienvenida           → OnboardingPage (primera vez)
                └─ resto (con sesión)    → LibraryProvider + FollowProvider + Layout
                                              Layout = barra + página + TabBar + avisos
```

- `ProtectedRoute` deja pasar solo con sesión (si no, manda a `/login`) y manda a `/bienvenida` si la persona no terminó la primera vez.
- `PublicOnlyRoute` hace lo contrario: con sesión, `/login` te lleva al inicio.

---

## 4. Las capas del código (cómo se conecta todo)

El código está separado en capas. Cada capa solo habla con la de abajo:

```
pages/        Pantallas completas (una por ruta)
   ↓ usan
components/   Piezas de interfaz reutilizables (botones, tarjetas, pop-ups…)
   ↓ usan
hooks/        Lógica de React reutilizable (cargar datos, estados de carga/error)
context/      Datos globales compartidos (sesión, biblioteca, a quién seguís…)
   ↓ usan
services/     ÚNICO lugar que habla con Firebase y con Spotify
   ↓
Firebase (Auth + Firestore)   ·   /api/spotify → Spotify
```

**Regla clave del proyecto:** ningún componente ni página importa Firebase ni hace `fetch` directo. Todo pasa por `src/services/`. Así, si hay que cambiar cómo se guarda algo, se cambia en un solo lugar.

### `src/` carpeta por carpeta

| Carpeta | Qué hay | Ejemplos |
|---|---|---|
| `pages/` | Una pantalla por ruta | `HomePage`, `LibraryPage`, `AlbumPage` |
| `components/` | Piezas visuales, cada una con su `.css` | `Button`, `AlbumCover`, `PostCard`, `Dialog` |
| `context/` | Estado global (ver sección 7) | `AuthContext`, `LibraryContext` |
| `hooks/` | Lógica reutilizable (`useAlgo`) | `useAlbumSearch`, `useAsyncAction`, `useRecommendations` |
| `services/` | Conexión con Firebase y Spotify | `library.js`, `auth.js`, `spotify.js` |
| `utils/` | Funciones auxiliares sin React | `text.js` (fechas, tildes), `image.js` (foto) |
| `data/` | Datos fijos | `generos.json` (393 géneros), `themes.js`, `faq.js` |
| `styles/` | Estilos globales | `tokens.css` (colores, tamaños), `themes.css` (4 temas), `global.css` |
| `firebase.js` | **Conexión con Firebase** | ver sección 5 |

---

## 5. Conexiones con servicios externos

### Firebase (cuentas y base de datos)

| Qué | Dónde |
|---|---|
| **Se conecta Firebase** | `alboom/src/firebase.js` — lee las claves de `.env` e inicializa Authentication y Firestore |
| Claves | `alboom/.env` (variables `VITE_FIREBASE_…`). No se suben a GitHub |
| Registro / login / Google / cerrar sesión | `src/services/auth.js` |
| **CRUD de la biblioteca** (agregar, consultar, modificar, eliminar) | `src/services/library.js` |
| Perfil privado, ajustes, foto, eliminar cuenta | `src/services/profile.js` y `users.js` |
| Perfil público, Top 5, buscar personas | `src/services/publicProfile.js` |
| Seguir / seguidores | `src/services/follows.js` |
| Posteos, me gusta, respuestas, compartir | `src/services/posts.js` |
| Reseñas públicas y puntaje de la comunidad | `src/services/reviews.js` |
| Reglas de seguridad | `alboom/firestore.rules` → se pegan en Firebase Console → Firestore → Reglas |

**Colecciones de Firestore** (cómo están guardados los datos):

| Colección | Qué guarda | ¿Quién la ve? |
|---|---|---|
| `users/{uid}` | Perfil privado: email, ajustes, tema, géneros, Spotify | Solo su dueño |
| `users/{uid}/library/{albumId}` | Biblioteca: estado, puntaje, reseña, fecha de escucha | Cualquiera con sesión (solo el dueño la cambia) |
| `users/{uid}/dismissed/{albumId}` | Recomendaciones descartadas ("No me interesa") | Solo su dueño |
| `users/{uid}/private/spotify` | Token de Spotify y sugerencias | Solo su dueño |
| `profiles/{uid}` | Perfil público: nombre, @usuario, foto, bio, Top 5, contadores | Cualquiera con sesión |
| `usernames/{usuario}` | Reserva de nombres de usuario (para que sean únicos) | Cualquiera con sesión |
| `reviews/{albumId}_{uid}` | Reseñas públicas (para el puntaje de cada disco) | Cualquiera con sesión |
| `posts/{id}` (+ `likes`, `replies`) | Posteos de la comunidad | Cualquiera con sesión |
| `follows/{seguidor}_{seguido}` | Quién sigue a quién | Cualquiera con sesión |
| `reports/{id}` | Reportes de problemas | Nadie desde la app |

### Spotify (música)

| Qué | Dónde |
|---|---|
| **Función de servidor** con la clave secreta (busca discos, géneros, artistas) | `alboom/api/spotify.js` |
| Claves | `alboom/.env` (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, sin `VITE_` para que nunca lleguen al navegador) |
| En desarrollo, `npm run dev` sirve esa misma función | `alboom/vite.config.js` |
| Cómo la app le pide datos a esa función | `src/services/spotify.js` |
| Recomendaciones de "Para vos" | `src/services/recommendations.js` |
| Conectar la cuenta de Spotify de cada persona (opcional) | `src/services/spotifyUser.js` + `pages/SpotifyCallbackPage.jsx` |

¿Por qué hay una función de servidor? Spotify pide una clave secreta, y lo que está en el navegador lo puede ver cualquiera. Por eso el secreto vive en `api/spotify.js`, que corre en el servidor (Vercel en producción, Vite en tu compu).

### GitHub (código y versiones)

- Repositorio: **github.com/LautiPfacu/ALBOOM**.
- El repo es la carpeta `ALBOOM/` (la de arriba de `alboom/`).
- Cada versión es un commit: `PRIMERA VERSION`, `VERSION 2` (animaciones), `VERSION 3` (foto y recomendaciones), `VERSION 4` (comunidad, perfiles y Spotify). En GitHub → **Commits** se ve qué cambió en cada una.
- `.gitignore` evita subir `.env`, `node_modules`, `dist` y archivos del sistema.

### Vercel (publicación, pendiente)

- `alboom/vercel.json` hace que las rutas (`/biblioteca`, `/disco/…`) funcionen al recargar.
- Al publicar: Root Directory = `alboom`, y cargar las variables del `.env` en Vercel.
- `api/spotify.js` se publica sola como función de servidor.

---

## 6. Dónde está cada sección de la app

| Sección | Ruta | Página | Piezas principales | Datos |
|---|---|---|---|---|
| Entrar / crear cuenta | `/login` | `LoginPage` | `LoginIllustration`, `TextField` | `services/auth.js` |
| Primera vez | `/bienvenida` | `OnboardingPage` | `GenreStep`, `AlbumsStep`, `ThemeStep` | `services/profile.js` |
| Inicio | `/` | `HomePage` | `SearchBar`, `SearchResultCard`, `AlbumTile`, `PendingCard`, `RecentAlbumCard` | `useAlbumSearch`, `useRecommendations`, `useTrends` |
| Explorar | `/explorar` | `ExplorePage` | `GenreDialog`, `AlbumTile` | `useGenreAlbums`, `useAlbumStats` |
| Comunidad | `/comunidad` | `CommunityPage` | `PostFeed`, `PostCard`, `PeopleSuggestionsCard` | `usePostsBy`, `useForYouFeed` |
| Biblioteca | `/biblioteca` | `LibraryPage` | `LibraryCard`, `LibraryCardSmall`, `LibraryRow`, `ViewSwitcher` | `LibraryContext` |
| Página de disco | `/disco/:albumId` | `AlbumPage` | `ListeningCard`, `ReviewForm`, `CommunitySection`, `TrackList` | `useSpotifyAlbum`, `useLibraryItem`, `useAlbumReviews` |
| Tu perfil | `/perfil` | `MyProfilePage` | `ProfileHeader`, `TopFiveShelf`, `TopFiveDialog`, `SpotifyCard`, `ProfileTabs` | `usePublicProfile`, `useUserReviews` |
| Perfil de otra persona | `/u/:usuario` | `UserProfilePage` | `ProfileHeader`, `MatchBanner`, `CommonFollowersCard` | `useUidByUsername`, `useUserLibrary` |
| Un posteo | `/post/:id` | `PostPage` | `FeedItem` | `services/posts.js` |
| Perfil y ajustes | `/ajustes` | `SettingsPage` (+ `SettingsSectionPage` en celular) | `AccountSection`, `ThemeSection`, `GenresSection`, `PrivacySection`, `HelpSection` | `services/profile.js` |
| Vuelta de Spotify | `/spotify/callback` | `SpotifyCallbackPage` | — | `services/spotifyUser.js` |
| Términos / Privacidad | `/terminos`, `/privacidad` | `LegalPage` | — | — |
| Página inexistente | cualquier otra | `NotFoundPage` | — | — |

Partes que están en todas las pantallas con sesión: `Layout` (estructura), `Navbar` (barra de arriba), `UserMenu` (menú del avatar), `TabBar` (barra de abajo en celular), `ToastViewport` (avisos).

---

## 7. Estado global (contextos)

Datos que muchas pantallas necesitan a la vez. Están en `src/context/`:

| Contexto | Qué comparte |
|---|---|
| `AuthContext` | Quién está conectado y su perfil privado |
| `LibraryContext` | Tu biblioteca, con **una sola** conexión en tiempo real para toda la sesión |
| `FollowContext` | A quién seguís, y la acción de seguir / dejar de seguir |
| `ThemeContext` | El tema elegido (Historieta, Garage, Psicodelia, Medianoche) |
| `ToastContext` | Los avisos de éxito y error que aparecen abajo a la derecha |

---

## 8. Estilos y temas

- `src/styles/tokens.css`: colores, tamaños, bordes y sombras base.
- `src/styles/themes.css`: los 4 temas; cada uno cambia las variables de color.
- `src/styles/global.css`: estilos generales (botones de pastilla, interruptores, foco visible…).
- Cada componente tiene su propio `.css` al lado (por ejemplo `PostCard.jsx` + `PostCard.css`).
- Ningún componente usa colores fijos: todo sale de variables, por eso el tema cambia toda la app.
- Animaciones de marca: `components/alboom-loader.js` (logo de carga) y `alboom-motion.js` (explosión del login y logo de la barra).

---

## 9. Comandos útiles

Desde la carpeta `alboom/`:

| Comando | Para qué |
|---|---|
| `npm run dev` | Abre la app en `http://localhost:5173` |
| `npm run dev:spotify` | Igual, en `http://127.0.0.1:5173` (necesario para conectar Spotify) |
| `npm run lint` | Revisa el estilo del código |
| `npm run build` | Arma la versión para publicar (carpeta `dist/`) |

---

## 10. Preguntas típicas y dónde mostrar la respuesta

| Pregunta | Archivo |
|---|---|
| ¿Dónde se conecta Firebase? | `alboom/src/firebase.js` |
| ¿Dónde está el CRUD? | `alboom/src/services/library.js` (comentado como CONSULTAR / AGREGAR / MODIFICAR / ELIMINAR) |
| ¿Cómo se protegen los datos? | `alboom/firestore.rules` |
| ¿Dónde están las rutas? | `alboom/src/App.jsx` |
| ¿Cómo se esconden las claves de Spotify? | `alboom/api/spotify.js` + `.env` sin `VITE_` |
| ¿Cómo se sabe si hay sesión? | `alboom/src/context/AuthContext.jsx` + `components/ProtectedRoute.jsx` |
| ¿Dónde se ve la biblioteca en tiempo real? | `alboom/src/context/LibraryContext.jsx` (`onSnapshot`) |
| ¿Cómo se muestran los errores? | `useAsyncAction` (carga), `ToastContext` (avisos), `ErrorState` (pantallas) |

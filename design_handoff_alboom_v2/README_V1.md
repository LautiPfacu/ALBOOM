# Handoff: ALBOOM · Versión 1

> Documento para **Claude Code**. Leelo completo antes de escribir código.
> Proyecto: TP2 de Desarrollo Frontend II (UADE). Lo corrige un profesor que evalúa **React + Vite, Cloud Firestore, GitHub y Vercel**. El código tiene que ser claro, idiomático y fácil de explicar en una demo.

---

## 1. Resumen

ALBOOM es un diario de discos, como Letterboxd pero para música. En V1 una persona:

1. Crea una cuenta (email y contraseña, o Google) o inicia sesión.
2. Busca discos en Spotify desde la home.
3. Guarda discos en su biblioteca personal (Firestore).
4. Puntúa cada disco con 5 vinilos, de a medio punto.
5. Marca cada disco como **escuchado** o **pendiente** y escribe una reseña corta.
6. Quita discos de la biblioteca.

Todo se guarda en Cloud Firestore y persiste al recargar. La app está pensada **primero para escritorio**, y tiene que funcionar bien en celular.

Fuera de V1 (no implementar todavía): onboarding de gustos, recomendaciones, página Explorar, reseñas públicas de otros usuarios y tema según género.

## 2. Sobre los archivos de diseño

Los archivos de `design/` son **referencias de diseño hechas en HTML**: muestran el aspecto y el comportamiento buscados. **No son código de producción para copiar.** Abrilos como fuente para sacar medidas, colores y textos, y recreá las pantallas en React + Vite con componentes, estado y CSS propios.

- `design/ALBOOM V1.dc.html`: pantallas de V1 en escritorio (login, home con resultados, biblioteca y página de disco), versiones de celular (home y biblioteca) y estados (carga, éxito, error, vacío y confirmación).
- `design/ALBOOM 1b Fanzine.dc.html`: dirección visual original; contiene el **login en celular**.

## 3. Fidelidad

**Alta.** Colores, tipografía, bordes, sombras y textos son finales. Recrealos con precisión usando los tokens de `starter/src/styles/tokens.css`. Las portadas de los mocks son placeholders: en la app son las imágenes reales que devuelve Spotify.

---

## 4. Cómo trabajar (paso a paso)

1. **Crear el proyecto** (JavaScript, sin TypeScript):
   ```bash
   npm create vite@latest alboom -- --template react
   cd alboom
   npm install
   npm install firebase react-router-dom
   ```
2. **Copiar `starter/`** a la raíz del proyecto, respetando las carpetas. Sobrescribe `vite.config.js` y `.gitignore`. Los archivos del starter ya están revisados: **no los reescribas**. Si encontrás un error real en alguno, corregilo con el cambio mínimo y explicá por qué.
3. **Fuentes** en `index.html`, dentro de `<head>`. Además, poné `<html lang="es">` y `<title>ALBOOM</title>`:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com" />
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
   <link href="https://fonts.googleapis.com/css2?family=Barriecito&family=DM+Sans:opsz,wght@9..40,400..700&display=swap" rel="stylesheet" />
   ```
4. **Variables de entorno**: copiar `.env.example` como `.env`. Los valores los completa la persona usuaria; **nunca los inventes ni los subas**.
5. Borrar lo que trae la plantilla de Vite que no se use (`App.css`, `assets/react.svg`, el contador de ejemplo).
6. Implementar en este orden: estilos globales → contextos → rutas y layout → login → home → biblioteca → página de disco → estados → responsive.
7. Verificar: `npm run lint` sin errores, `npm run build` sin errores, y la lista de pruebas de la sección 14 con `npm run dev`.
8. Escribir el `README.md` del repo (sección 15).
9. Git: mostrar `git status` y esperar confirmación antes del commit. Commit `v1.0: primera versión funcional` y tag `v1.0`.

---

## 5. Reglas de código (obligatorias)

La materia evalúa el uso de JavaScript y React. Todo el código tiene que cumplir esto:

**Componentes**
- Solo componentes de función con hooks. Un componente por archivo, con nombre en PascalCase igual al archivo.
- Props desestructuradas en la firma. Componentes chicos y con una responsabilidad.
- Listas con `key` estable (el `id` del disco), nunca el índice.
- Nada de manipular el DOM a mano (`document.querySelector` y similares). Única excepción: `dialog.showModal()` mediante `useRef`.

**Estado**
- `useState` para estado de UI local. Contexto solo para lo que es global: sesión (`AuthContext`), biblioteca (`LibraryContext`) y avisos (`ToastContext`).
- No duplicar estado derivable: contadores, filtros, orden y "¿ya está guardado?" se calculan con `useMemo` a partir de los datos.
- Formularios **controlados** (`value` + `onChange`), con validación propia antes de llamar a Firebase.

**Efectos y datos**
- **Ningún componente importa `firebase/*` ni llama a `fetch`.** Todo pasa por `src/services/` y por hooks propios en `src/hooks/`.
- Cada `useEffect` que se suscribe (`onSnapshot`, `onAuthStateChanged`) devuelve la función de cleanup.
- Cada fetch cancelable usa `AbortController` y se aborta en el cleanup o cuando arranca una búsqueda nueva, para evitar respuestas viejas que pisen a las nuevas.
- Toda operación asíncrona tiene estado de **carga**, **éxito** y **error** visibles. Los botones se deshabilitan mientras esperan (sin doble envío).
- El éxito se muestra **cuando la promesa de Firestore se resuelve**, no antes. La consigna exige que la interfaz informe si una operación falla.

**Estilo de código**
- ES modules, `const` por defecto, `async/await` con `try/catch/finally`.
- CSS plano: `src/styles/tokens.css` + `src/styles/global.css` + un `.css` por componente o página, importado desde su `.jsx`. Clases en kebab-case con estilo BEM (`album-card__title`). Sin librerías de UI ni Tailwind; tiene que poder explicarse línea por línea.
- Comentarios breves en español solo donde ayudan a la demo, sobre todo en las operaciones de Firestore.
- Cero errores o advertencias en la consola del navegador.

**Accesibilidad básica**
- Acciones con `<button type="button">`, navegación con `<Link>`/`<NavLink>`. Inputs con `<label>`. Portadas con `alt="Portada de {disco} de {artista}"`.
- Foco visible: `outline: 3px solid var(--blue); outline-offset: 2px`.
- Toasts de éxito con `role="status"` y de error con `role="alert"`. Errores de campo enlazados con `aria-describedby` y `aria-invalid`.

---

## 6. Arquitectura y archivos

```
alboom/
├─ api/
│  └─ spotify.js                ✅ starter · función serverless (Client Credentials)
├─ src/
│  ├─ main.jsx                  BrowserRouter + providers + import de estilos
│  ├─ App.jsx                   <Routes>
│  ├─ firebase.js               ✅ starter · ★ acá se conecta Firebase
│  ├─ services/
│  │  ├─ auth.js                ✅ starter · registro, login, Google, logout, mensajes de error
│  │  ├─ users.js               ✅ starter · perfil users/{uid}
│  │  ├─ library.js             ✅ starter · ★ CRUD de la biblioteca
│  │  └─ spotify.js             ✅ starter · cliente de /api/spotify + formatos de duración
│  ├─ context/
│  │  ├─ AuthContext.jsx        ✅ starter
│  │  ├─ LibraryContext.jsx     suscripción única a la biblioteca
│  │  └─ ToastContext.jsx       cola de avisos
│  ├─ hooks/
│  │  ├─ useAlbumSearch.js
│  │  ├─ useSpotifyAlbum.js
│  │  ├─ useLibraryItem.js
│  │  └─ useAsyncAction.js
│  ├─ components/
│  │  ├─ Layout.jsx             Navbar + <Outlet/> + TabBar + ToastViewport
│  │  ├─ Navbar.jsx · UserMenu.jsx · TabBar.jsx
│  │  ├─ ProtectedRoute.jsx · PublicOnlyRoute.jsx · FullPageLoader.jsx
│  │  ├─ Button.jsx
│  │  ├─ AlbumCover.jsx
│  │  ├─ SearchBar.jsx
│  │  ├─ SearchResultCard.jsx
│  │  ├─ RecentAlbumCard.jsx
│  │  ├─ LibraryCard.jsx
│  │  ├─ VinylRating.jsx/.css   ✅ starter
│  │  ├─ StatusToggle.jsx
│  │  ├─ ReviewForm.jsx
│  │  ├─ ConfirmDialog.jsx
│  │  ├─ ToastViewport.jsx
│  │  ├─ SkeletonCard.jsx
│  │  ├─ EmptyState.jsx
│  │  └─ ErrorState.jsx
│  ├─ pages/
│  │  ├─ LoginPage.jsx
│  │  ├─ HomePage.jsx
│  │  ├─ LibraryPage.jsx
│  │  ├─ AlbumPage.jsx
│  │  └─ NotFoundPage.jsx
│  └─ styles/
│     ├─ tokens.css             ✅ starter
│     └─ global.css
├─ firestore.rules              ✅ starter
├─ vercel.json                  ✅ starter · rutas del SPA al recargar
├─ vite.config.js               ✅ starter · sirve /api/spotify en desarrollo
├─ .env.example                 ✅ starter
├─ .gitignore                   ✅ starter
└─ README.md
```

### Por qué existe `api/spotify.js`
Spotify exige un **Client Secret** para pedir tokens. La consigna prohíbe poner credenciales privadas en variables `VITE_`, porque esas terminan en el código del navegador. Por eso el secret vive en una función serverless de Vercel. En desarrollo, el plugin de `vite.config.js` ejecuta ese mismo archivo, así que `npm run dev` alcanza (no hace falta `vercel dev`).

Límites del modo desarrollo de Spotify (desde febrero de 2026): la búsqueda devuelve **máximo 10 resultados por pedido** (por eso se pagina con `offset`), y no existen `popularity` ni `label` en los discos. No los uses.

---

## 7. Rutas

| Ruta | Página | Acceso |
|---|---|---|
| `/login` | `LoginPage` | Solo sin sesión (`PublicOnlyRoute`: con sesión redirige a `/`) |
| `/` | `HomePage` | Con sesión |
| `/biblioteca` | `LibraryPage` | Con sesión |
| `/disco/:albumId` | `AlbumPage` | Con sesión |
| `*` | `NotFoundPage` | Cualquiera |

- `ProtectedRoute`: mientras `useAuth().loading` es `true` muestra `FullPageLoader` (logo ALBOOM + "Cargando…"). Sin sesión redirige a `/login` con `state={{ from: location }}`. Después del login se vuelve a `from` o a `/`.
- Las rutas con sesión van anidadas dentro de `<Layout />`, y `LibraryProvider` envuelve al `Layout` para que la suscripción a la biblioteca sea **una sola** para toda la sesión.
- `vercel.json` hace que `/biblioteca` y `/disco/:id` funcionen al recargar en producción.

```jsx
// App.jsx (forma esperada)
<Routes>
  <Route element={<PublicOnlyRoute />}>
    <Route path="/login" element={<LoginPage />} />
  </Route>
  <Route element={<ProtectedRoute />}>
    <Route element={<LibraryProvider><Layout /></LibraryProvider>}>
      <Route index element={<HomePage />} />
      <Route path="biblioteca" element={<LibraryPage />} />
      <Route path="disco/:albumId" element={<AlbumPage />} />
    </Route>
  </Route>
  <Route path="*" element={<NotFoundPage />} />
</Routes>
```

`main.jsx`: `StrictMode` → `BrowserRouter` → `AuthProvider` → `ToastProvider` → `App`. Importar `tokens.css` y `global.css` acá.

---

## 8. Datos y estado

### Firestore
```
users/{uid}
  displayName: string
  email: string | null
  createdAt: timestamp

users/{uid}/library/{albumId}          albumId = id de Spotify
  name: string
  artist: string
  cover: string | null
  year: number | null
  spotifyUrl: string | null
  status: 'escuchado' | 'pendiente'
  rating: number                        0 = sin puntaje; 0,5 a 5 de a 0,5
  review: string                        máx. 500
  addedAt: timestamp
  updatedAt: timestamp
```
Las reglas (`firestore.rules`) solo dejan leer y escribir lo propio, y validan tipos, rango del puntaje, estado y largo de la reseña.

### Contextos
**`LibraryContext`** (nuevo). Usa `useAuth().user.uid` y `subscribeToLibrary`. Expone:
```js
{
  items,          // array ordenado por addedAt desc
  loading,        // true hasta el primer snapshot
  error,          // mensaje (string) o null
  savedIds,       // Set de albumId, con useMemo
  getItem(id),    // item o undefined
}
```
**`ToastContext`** (nuevo). Expone `showToast({ type: 'success' | 'error', message, action?: { label, onClick } | { label, to } })`. Hay como máximo 3 avisos a la vez. Los de éxito se cierran solos a los 4 s; los de error, a los 7 s. Todos tienen botón ×. Los timers se limpian al desmontar.

### Hooks
- **`useAsyncAction(fn)`** → `{ run, pending }`. `run(...args)` pone `pending=true`, espera `fn`, y en `finally` vuelve a `false`. Ignora llamadas mientras `pending` sea true y no actualiza estado si el componente se desmontó. Devuelve el resultado o relanza el error para que lo maneje quien llama.
- **`useAlbumSearch()`** → `{ query, results, total, status, error, search(q), loadMore(), reset() }`. Valores de `status`: `'idle' | 'loading' | 'loadingMore' | 'success' | 'error'`. Cada `search` aborta la anterior con `AbortController`. `loadMore` usa `offset = results.length`, agrega sin duplicar ids y se ofrece mientras `results.length < Math.min(total, 50)`.
- **`useSpotifyAlbum(albumId)`** → `{ album, loading, error, retry }`. Hace fetch con `AbortController` y lo cancela en el cleanup.
- **`useLibraryItem(albumId)`** → `{ item, loading, error }` con `subscribeToLibraryItem`. `item === null` significa que no está guardado.

---

## 9. Pantallas

Medidas de escritorio con un viewport de 1280 px. El contenido va centrado con `max-width: var(--page-max)` y `padding-inline: var(--page-pad)` (48 px en escritorio, 20 px en celular).

### 9.1 Navbar (escritorio)
- Alto 84 px, fondo `--paper`, `border-bottom: var(--border)`. Usa `display:flex; justify-content:space-between; align-items:center`.
- Izquierda: logo "ALBOOM" (`<Link to="/">`) en Barriecito 40 px, `line-height:1`, `text-shadow: 3px 2px 0 var(--pink)`.
- Centro: `NavLink`s "Inicio" y "Biblioteca", DM Sans 16 px 700, con 32 px de separación. El link activo lleva subrayado tipo resaltador: `background: linear-gradient(transparent 50%, var(--yellow) 50%)`, `padding: 0 2px`.
- Derecha: `UserMenu`, que muestra el primer nombre (15 px 600) y un avatar de 44 px (círculo, `--blue`, borde ink, inicial blanca 17 px 700). Al hacer clic abre un menú (card con borde y `--shadow`) con nombre, email y el botón "Cerrar sesión". Se cierra con Escape o con un clic afuera.

### 9.2 Login / registro — `LoginPage`
**Escritorio** (ver "1 · Login / registro"): grid `minmax(0,1fr) 520px` a pantalla completa (`min-height: 100dvh`).
- **Panel izquierdo (collage)**: fondo `--blue-light` con trama `radial-gradient(rgba(47,95,208,.3) 1.4px, transparent 1.7px) 0 0/12px 12px` y `border-right: var(--border)`. Elementos absolutos:
  - Círculo azul de 320 px con trama `--halftone-paper` y borde ink.
  - Polaroid de 360×330 px, `rotate(-4deg)`, card con borde, `--shadow-lg` y 16 px de padding. Adentro, un slot punteado (`2px dashed --line-strong`) con el texto "Ilustración" (13 px 700 uppercase, `letter-spacing .06em`). Es un espacio reservado para una ilustración futura.
  - Cinta amarilla de 120×32 px (`--tape`, `rotate(4deg)`) sobre la polaroid.
  - Sticker rosa de 124 px, círculo con borde, `rotate(12deg)` y el texto "Lado A" en Barriecito 34 px.
  - Abajo a la izquierda, tres renglones en Barriecito 68 px: "Escuchá." (fondo paper), "Puntuá." (fondo yellow) y "Descubrí." (fondo paper). Cada uno con borde ink y sin borde superior entre renglones.
  - El panel es decorativo: `aria-hidden="true"`.
- **Panel derecho**: columna centrada verticalmente, padding 48/64, gap 20.
  - Logo "ALBOOM" en Barriecito 64 px con `text-shadow: 4px 3px 0 var(--pink)`. Debajo, "Tu diario de discos." (16 px, `--ink-soft`).
  - Selector de modo: grid de 2 columnas, borde ink, radio 12 y padding 4. Opciones "Entrar" y "Crear cuenta". La activa tiene fondo `--ink` y texto paper. Implementarlo como dos `<button>` con `aria-pressed`.
  - Botón "Continuar con Google": 52 px de alto, card con borde, `--shadow-sm` y una "G" en un círculo ink de 22 px.
  - Separador "o con tu email" con líneas punteadas a los lados.
  - Campos (label 14 px 700 arriba; input de 50 px de alto, borde ink, radio 12, fondo card, padding 0 16, 16 px):
    - Solo en "Crear cuenta": **Nombre** (placeholder "¿Cómo te llamamos?").
    - **Email** (`type="email"`, `autoComplete="email"`).
    - **Contraseña** (`autoComplete` `current-password` o `new-password`) con el botón de texto "Mostrar"/"Ocultar" dentro del campo.
  - Botón principal: 54 px de alto, ancho completo, `--pink`, borde, `--shadow`. El texto es "Entrar" o "Crear cuenta"; mientras espera, "Entrando…" o "Creando cuenta…".
  - Error general (de Firebase) arriba del botón: caja `--error-bg` con borde ink, radio 12, `role="alert"` y el texto de `authErrorMessage()`.
- **Validación** (al enviar y al salir de cada campo ya tocado):
  - Nombre: obligatorio, de 2 a 30 caracteres → "Escribí tu nombre (2 a 30 caracteres)."
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/` → "Ingresá un email válido, por ejemplo nombre@mail.com."
  - Contraseña: obligatoria; en registro, mínimo 6 caracteres → "Tiene que tener al menos 6 caracteres."
  - Un campo con error lleva borde `2.5px solid var(--error)` y mensaje debajo (14 px 600, `--error`). El foco va al primer campo con error.
- Al cambiar de modo se limpian el error general y los errores de campo.

**Celular** (ver `ALBOOM 1b Fanzine.dc.html` → Login · móvil): una columna. Arriba, un collage reducido de 270 px de alto (círculo azul, polaroid, cinta y sticker); abajo, logo de 76 px, bajada y formulario con el selector Entrar / Crear cuenta.

### 9.3 Home — `HomePage`
**Escritorio** (ver "2 · Home con resultados"):
- **Encabezado** (max 820 px, padding-top 40, gap 22):
  - h1 "Hola, {primerNombre}." en Barriecito 68 px, `line-height .95`. El nombre lleva resaltador: `linear-gradient(transparent 58%, var(--yellow) 58%)`.
  - Bajada "¿Qué disco sonó hoy? Buscalo, guardalo y contá qué te pareció." (19 px, `--ink-soft`).
- **`SearchBar`** (`<form role="search">`, se envía con Enter o con el botón): 64 px de alto, card, `--border-thick`, radio 14, `--shadow-md`, padding 0 8 0 20.
  - Contiene la lupa SVG de 22 px, un input (18 px; placeholder "Buscá un disco o un artista"; `aria-label="Buscar discos"`), un botón × para limpiar (visible solo con texto) y el botón "Buscar" (46 px de alto, `--pink`, borde, radio 10, 16 px 700).
  - Valida un mínimo de 2 caracteres sin contar espacios; si no, muestra "Escribí al menos 2 letras." debajo.
  - La búsqueda se lanza **al enviar**, no con cada tecla (cuida el límite de Spotify).
- **Estado inicial** (`idle`): debajo de la barra, "Probá con" y tres chips con "Gustavo Cerati", "Rosalía" y "Tame Impala". Los chips llevan borde ink, radio pill, fondos card / yellow / card y rotaciones -2°, 1,5° y -1°. Al hacer clic, completan la búsqueda y la ejecutan.
- **Resultados**:
  - Encabezado: h2 "Resultados para «{q}»" (Barriecito 38 px) y, a la derecha, "{n} discos" (15 px, `--ink-soft`; n = cantidad cargada).
  - Grid de 5 columnas, gap 24.
  - **`SearchResultCard`**: columna con gap 12.
    - `AlbumCover` cuadrado (borde ink, radio 8, `--shadow`) y título (16 px 700). Los dos son `<Link to="/disco/:id">`.
    - "Artista · Año" (14 px, `--ink-soft`).
    - Botón de 40 px de ancho completo, con radio 10 y borde. Tiene tres estados:
      - "Guardar": `--pink`, `--shadow-sm`.
      - "Guardando…": `--pink-pressed`, texto `--ink-soft`, sin sombra, `translate(2px,2px)` y deshabilitado.
      - "✓ En tu biblioteca": `--yellow`, sin sombra. Es un Link a `/disco/:id`.
    - "Guardar" llama a `addToLibrary(uid, album, 'escuchado')`. Si sale bien, muestra el toast "**{disco}** se guardó en tu biblioteca." con la acción "Puntuar" (→ `/disco/:id`). Si falla, el toast de error dice `libraryErrorMessage(e)`.
  - Botón "Ver más resultados" centrado (card con borde y `--shadow-sm`; mientras carga, "Cargando…").
  - Carga: 5 `SkeletonCard` (fondo `--skeleton` con trama `--skeleton-dot` y dos barras `--skeleton-bar`) y el texto "Buscando discos…" con `aria-live="polite"`.
  - Sin resultados: caja punteada (`2px dashed --line-strong`, radio 14, padding 24, centrada) con el título "Nada por acá" (Barriecito 28) y el texto "No encontramos discos para «{q}». Revisá cómo lo escribiste o probá con el nombre del artista."
  - Error: `ErrorState` (fondo `--error-bg`, borde, radio 14) con el título "Se cortó la música", el mensaje del error y el botón "Reintentar".
- **"Lo último en tu biblioteca"** (solo si hay discos): h2 de 38 px, con el link "Ir a la biblioteca" a la derecha (15 px 700, subrayado de 2 px).
  - Grid de 3 columnas con los 3 discos más recientes, como `RecentAlbumCard`. Cada uno es un Link a `/disco/:id` con estilo de card: borde, radio 12, `--shadow` y padding 14.
  - Adentro: portada de 76 px, título (16 px 700) y artista (14 px). Abajo, un mini puntaje (vinilo de 18 px + "4,5") o, si el puntaje es 0, el chip "Sin puntaje" (`--blue-light`).
  - Mientras la biblioteca carga, 3 skeletons horizontales.
- **Toasts** abajo a la derecha (`position: fixed; right: 32px; bottom: 28px; width: 420px`).

**Celular** (ver "Celular · Home con resultados"):
- Barra superior de 72 px: logo de 32 px (`text-shadow 2px 2px`) y avatar de 40 px.
- h1 de 48 px. SearchBar de 56 px de alto con el botón "Buscar" de 40 px.
- Los resultados pasan a **filas**: portada de 64 px, título (16 px 700), "Artista · Año" (13 px) y, a la derecha, el botón "Guardar" de 44 px de alto (o un cuadrado amarillo de 44 px con "✓" y `aria-label="En tu biblioteca"`). Entre filas, `2px dashed --line`.
- "Lo último en tu biblioteca" va en una sola columna.

### 9.4 Biblioteca — `LibraryPage`
**Escritorio** (ver "3 · Biblioteca"):
- Encabezado en flex, alineado abajo:
  - Izquierda: h1 "Tu biblioteca" (Barriecito 68) y "{n} discos guardados" (17 px, `--ink-soft`; singular: "1 disco guardado").
  - Derecha: "Ordenar por" + `<select>` estilizado (44 px de alto, borde ink, radio 10, card, 15 px 700). Opciones: **Recientes** (addedAt desc), **Mejor puntaje** (rating desc y después nombre) y **A–Z** (`localeCompare('es')`).
- Filtros (28 px de margen arriba, 32 abajo, gap 10): "Todos · n", "Escuchados · n" y "Pendientes · n". Son botones pill con borde ink y 15 px 700; el activo es `--pink` con `--shadow-sm`. Usan `aria-pressed`.
  - Filtro y orden se guardan en la URL con `useSearchParams` (`?estado=pendiente&orden=puntaje`), así sobreviven a una recarga.
- Grid de 4 columnas, gap 36 px (filas) y 28 px (columnas).
- **`LibraryCard`**:
  - Portada cuadrada (Link) con borde, radio 8 y `--shadow`. En hover o foco de la card: `--shadow-lg`, `translate(-2px,-2px)`, título subrayado y botón "Quitar" visible arriba a la derecha (pill card con borde, 13 px 700, `aria-label="Quitar {disco} de tu biblioteca"`).
  - Título (17 px 700, Link) y "Artista · Año" (14 px, `--ink-soft`).
  - Fila inferior: a la izquierda, `VinylRating readOnly size={16}`, o "Sin puntaje" si es 0 y está escuchado, o "Para escuchar" si está pendiente (14 px, `--ink-soft`). A la derecha, el chip de estado (pill, borde de 1,5 px, 12 px 700): "Escuchado" sobre `--blue-light` o "Pendiente" sobre `--yellow`.
- **Quitar** abre `ConfirmDialog` con el título "¿Quitar {disco} de tu biblioteca?" (Barriecito 28), el texto "Se borran tu puntaje y tu reseña. No se puede deshacer." y los botones "Cancelar" (card) y "Quitar" (`--error`, texto blanco, `--shadow-sm`; mientras espera, "Quitando…"). Si sale bien, cierra y muestra el toast "Quitaste {disco} de tu biblioteca."; si falla, muestra un toast de error y deja el diálogo abierto.
- Carga: 8 SkeletonCard.
- Vacío total: `EmptyState` (card con borde, centrado) con un slot "Ilustración" de 110×90 px punteado y rotado -3°, el título "Tu biblioteca está vacía", el texto "Buscá un disco y tocá Guardar." y el botón "Buscar discos" (→ `/`).
- Vacío de un filtro: "Todavía no tenés discos escuchados." o "No tenés discos pendientes.", con el botón "Ver todos".
- Error de suscripción: `ErrorState`.

**Celular** (ver "Celular · Biblioteca"):
- h1 de 48 px. Los filtros en una fila con scroll horizontal si no entran (14 px). "Ordenar por" en su propia fila (38 px de alto).
- Grid de 2 columnas (gap 22/16). El botón quitar es **siempre visible**: círculo de 32 px con "×" arriba a la derecha de la portada (área táctil de 44 px con padding transparente).
- La fila inferior usa un mini puntaje: un vinilo de 16 px + número.

### 9.5 Página de disco — `AlbumPage`
Datos: `useSpotifyAlbum(albumId)` (Spotify) y `useLibraryItem(albumId)` (Firestore).

**Escritorio** (ver "4 · Página de disco"):
- Link "← Volver" (15 px 700). Usa `navigate(-1)` si hay historial; si no, va a `/`.
- Grid `400px minmax(0,1fr)`, gap 56, `align-items:start`.
- **Columna izquierda** (`position: sticky; top: 24px`):
  - Portada de 400×400 px con borde, radio 8 y `--shadow-xl`, más una cinta amarilla decorativa (110×30, `rotate(-8deg)`, saliendo por el borde izquierdo).
  - Debajo, "Abrir en Spotify ↗": `<a href={spotifyUrl} target="_blank" rel="noopener noreferrer">` con estilo de botón card, 50 px de alto y `--shadow-sm`. Es obligatorio por las normas de atribución de Spotify.
- **Columna derecha** (gap 28):
  - "Disco · {año}" (13 px 700 uppercase, `letter-spacing .08em`, `--ink-soft`).
  - h1 con el nombre del disco en Barriecito 96 px, `line-height .9`, `text-shadow 4px 3px 0 var(--pink)`. Para títulos de más de 24 caracteres, 64 px.
  - Artista (24 px 700) y "{n} canciones · {X} min" (16 px, `--ink-soft`).
  - **Card "Tu escucha"** (card, borde, radio 14, `--shadow-md`, padding 24, gap 22):
    - **Si el disco no está guardado**: título "Tu escucha", el texto "Guardalo para puntuarlo y escribir tu reseña." y dos botones: "Ya lo escuché" (`--pink`, guarda con `'escuchado'`) y "Para escuchar después" (card, guarda con `'pendiente'`).
    - **Si está guardado**:
      - Fila superior: h2 "Tu escucha" (Barriecito 32) y `StatusToggle` a la derecha. Es un segmentado de 2 opciones ("Escuchado" / "Pendiente", min. 280 px, borde, radio 12, padding 4, fondo paper); la opción activa es `--pink` con borde ink. Llama a `updateStatus`.
      - **"Tu puntaje"** (15 px 700) con un indicador al lado: "Guardando…" (`--ink-soft`) mientras la promesa está pendiente y "Guardado ✓" con resaltador amarillo durante 2 s cuando se resuelve. Debajo, `VinylRating size={44}` y el número en Barriecito 32 ("4,5"; con 0, "—"). Ayuda: "Tocá la mitad izquierda de un vinilo para medio punto. Tocá el mismo puntaje para borrarlo." (13 px). El componente se deshabilita mientras guarda; si hay error, toast de error (el valor vuelve solo, porque se muestra lo que dice Firestore).
      - Si el estado es **pendiente**: en lugar de puntaje y reseña, mostrar "Marcalo como escuchado para puntuarlo y reseñarlo." Los datos ya guardados no se borran.
      - **`ReviewForm`**: label "Tu reseña", `<textarea>` controlado (min. 108 px de alto, borde, radio 12, fondo paper, 16 px, `line-height 1.5`, `maxLength` 500, placeholder "¿Qué te pareció?") y contador "{n} / 500" (13 px).
        - Botón "Guardar reseña" (`--pink`, 46 px de alto). Se deshabilita si el texto no cambió respecto de Firestore o mientras guarda ("Guardando…"). Si sale bien, toast "Reseña guardada."
        - El borrador se inicializa desde `item.review` y se resincroniza solo si el valor de Firestore cambia y no hay cambios sin guardar.
      - Link-botón "Quitar de la biblioteca" (15 px 700, subrayado de 2 px), a la izquierda del botón de guardar. Abre el `ConfirmDialog` de 9.4; al confirmar, el usuario se queda en la página y la card vuelve al estado "no guardado".
  - **"Canciones"** (h2 Barriecito 36): grid de 2 columnas (column-gap 36) en orden de **columna** (`grid-auto-flow: column` con `grid-template-rows: repeat(ceil(n/2), auto)`), para que 1–7 queden a la izquierda y 8–13 a la derecha.
    - Cada fila: número (22 px de ancho, 700), nombre (600, con elipsis) y duración `formatTrackDuration` (`--ink-soft`). Padding 11 px 0 y `border-bottom: 2px dashed var(--line)`.
    - Si el disco tiene más de un CD, agregar el subtítulo "Disco 1" / "Disco 2".
- Carga: skeleton de portada y de líneas de texto. Error de Spotify: `ErrorState` con "Reintentar" y "Volver al inicio". Un 404 muestra "No encontramos este disco."

**Celular**: una columna, sin sticky.
- Portada de 280 px centrada y título de 56 px centrado; "Abrir en Spotify" va como pill chica arriba a la derecha.
- La card "Tu escucha" ocupa el ancho completo y las canciones van en una sola columna.
- Referencia visual: "Página de disco · móvil" de `ALBOOM 1b Fanzine.dc.html`, sin la sección de comentarios (llega en V3).

### 9.6 TabBar (solo celular, < 768 px)
- `position: fixed; left:16px; right:16px; bottom:16px` (respetando `env(safe-area-inset-bottom)`).
- Card con borde, radio 14, `--shadow` y padding 6. Grid de 2 columnas con los `NavLink` "Inicio" y "Biblioteca" (15 px 700, 44 px de alto mínimo). El activo tiene fondo `--pink` y radio 9.
- El contenido de la página lleva `padding-bottom` para no quedar tapado. En celular, la Navbar oculta los links centrales y el nombre, y deja logo + avatar.

### 9.7 NotFoundPage
Título "Este lado del disco está vacío" (Barriecito), el texto "La página que buscás no existe." y el botón "Volver al inicio".

---

## 10. Interacciones y comportamiento

- **Botones**: `transition: transform 80ms ease, box-shadow 80ms ease`. En hover (solo con `@media (hover: hover)`) la sombra crece 1 px y el botón sube con `translate(-1px,-1px)`. En `:active`, `translate(2px,2px)` y `box-shadow: none` (efecto de "sello"). Deshabilitado: `cursor: not-allowed` y `opacity .7` (salvo el estado "Guardando…", que tiene su propio estilo).
- **Cards de biblioteca**: hover/foco con `transition 120ms ease`.
- **ConfirmDialog**: `<dialog>` nativo con `showModal()` (trae foco atrapado y Escape). Fondo `::backdrop` `rgba(31,30,43,.45)`. El foco inicial va a "Cancelar". Un clic afuera cierra.
- **Toasts**: entran con `translateY(8px)` → 0 y opacity 0 → 1 en 160 ms. Respetan `prefers-reduced-motion` (sin animación).
- **Sesión**: "Cerrar sesión" llama a `logout()` y redirige a `/login`. Al recargar la página, la sesión se mantiene (Firebase la persiste).
- **Persistencia**: todo cambio va a Firestore, y la UI muestra lo que llega por `onSnapshot`. No hay copias en `localStorage`.

---

## 11. Responsive

Desktop-first, con breakpoints por `max-width`:

| Ancho | Cambios |
|---|---|
| ≥ 1200 px | Diseño de referencia: resultados en 5 columnas y biblioteca en 4 |
| 1024–1199 px | Resultados en 4 columnas; biblioteca en 4 |
| 768–1023 px | Resultados y biblioteca en 3 columnas; disco con portada de 300 px; login con el panel izquierdo a 40 % |
| < 768 px | Diseño móvil: TabBar, resultados en filas, biblioteca en 2 columnas, disco en una columna y login en una columna |

Las grillas usan `repeat(N, minmax(0, 1fr))`. Nada de anchos fijos en contenedores con texto, y las áreas táctiles miden al menos 44 px en celular. Probar con 1440, 1280, 1024, 768, 390 y 360 px.

---

## 12. Tokens de diseño

Están todos en `starter/src/styles/tokens.css`. Resumen:

- **Color**:
  - Base: paper `#F5F1E6`, card `#FFFDF7`, ink `#1F1E2B`, ink-soft `#55536A`, placeholder `#6A6880`.
  - Acentos: pink `#FF5C8A`, pink-pressed `#FFC7D6`, blue `#2F5FD0`, blue-dark `#24489E`, blue-light `#DCE5FA`, yellow `#F3E35A`.
  - Error: `#C21F3A` sobre `#FFE3E8`.
  - Líneas: `#C9C5D2`, más fuertes `#A9A6B5`. Vinilo vacío: `#8A879A`.
- **Tipografía**:
  - Barriecito (logo y títulos): logo 40/64/76; h1 68 (escritorio) y 48 (celular); h1 de disco 96; h2 38/36/32/28.
  - DM Sans (todo lo demás): 13 (labels uppercase 700, `letter-spacing .06em`), 14, 15, 16, 17, 19, 24; pesos 400, 600 y 700.
  - En `global.css`: `body { font: 400 16px/1.5 var(--font-body); color: var(--ink); background: var(--paper); -webkit-font-smoothing: antialiased; }`, `h1, h2 { font-family: var(--font-display); font-weight: 400; margin: 0; }` y `text-wrap: pretty` en párrafos.
- **Bordes**: 2 px ink (2,5 px en la barra de búsqueda y en campos con error); 1,5 px en chips.
- **Radios**: 8 (portadas), 10 (botones chicos), 12 (inputs y botones), 14 (cards), 20 (contenedores), pill.
- **Sombras duras**: 3, 4, 5, 6 y 8 px, `0` de blur, color ink.
- **Espaciado**: múltiplos de 4 (4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64).
- **Tramas**: puntos de 1,2–1,6 px cada 8–12 px, con `radial-gradient`.
- **Vinilo**: `radial-gradient(circle, paper 0 10%, pink 11% 34%, ink 36%)`; vacío con aro punteado `--vinyl-empty`; medio vinilo con `clip-path: inset(0 50% 0 0)`. Ya está implementado en `VinylRating.css`.

## 13. Recursos

- Fuentes: Google Fonts (Barriecito y DM Sans).
- Portadas: las da Spotify (`album.cover`). `AlbumCover` muestra un placeholder con trama si no hay imagen o si falla la carga (`onError`). Además usa `loading="lazy"`, `decoding="async"` y `aspect-ratio: 1`.
- Ilustraciones: todavía no hay. Dejar los slots punteados "Ilustración" tal como están en el diseño.
- Iconos: solo la lupa (SVG inline del diseño), ×, ✓, ← y ↗ como texto.

---

## 14. Pruebas de aceptación (hacer todas antes del commit)

1. `npm run dev` levanta sin errores en la consola ni en la terminal.
2. Crear una cuenta con email: aparece en Firebase → Authentication → Users y existe el documento `users/{uid}` en Firestore.
3. Con datos inválidos aparecen los mensajes de validación, y Firebase no se llama.
4. Cerrar sesión y entrar con Google funciona.
5. Al buscar "cerati" aparecen discos con portada; "Ver más resultados" agrega otros sin duplicar.
6. Guardar un disco: el botón pasa a "Guardando…", después a "✓ En tu biblioteca", y aparece el toast. El documento aparece en `users/{uid}/library/{albumId}`.
7. Recargar la página (F5): el disco sigue en la biblioteca y la sesión sigue abierta.
8. Puntuar 3,5 en la página del disco: se ve "Guardado ✓" y `rating: 3.5` en Firestore.
9. Cambiar a Pendiente y escribir y guardar una reseña: los cambios se reflejan en Firestore.
10. Filtros y orden de la biblioteca funcionan y sobreviven a la recarga.
11. Quitar un disco con confirmación: desaparece de la UI y de Firestore.
12. Con DevTools → Network → Offline, intentar guardar o puntuar: aparece el toast de error (en ≤ 10 s) y no queda "Guardando…" para siempre.
13. Probar `/disco/123`: muestra el error de ID inválido, no se rompe la app.
14. Recargar estando en `/biblioteca`: carga bien (en Vercel lo resuelve `vercel.json`).
15. Celular (DevTools, 390 px): TabBar visible, nada se desborda horizontalmente y todo se puede tocar.
16. `npm run lint` y `npm run build` terminan sin errores.

---

## 15. README.md del repositorio

La consigna lo exige. Tiene que incluir:

- Qué es ALBOOM, para quién es y qué hace en esta versión.
- Stack: React + Vite, Firebase Authentication, Cloud Firestore, Spotify Web API mediante una función serverless de Vercel.
- Link a la app publicada (dejar `https://…vercel.app` para completar).
- **Cómo correrlo**:
  1. `npm install`
  2. Copiar `.env.example` a `.env` y completar los valores.
  3. `npm run dev`
- **Cómo configurar Firebase**:
  - Proyecto y app web.
  - Authentication con Email/contraseña y Google.
  - Firestore Standard (default) en southamerica-east1, modo producción.
  - Pegar y publicar `firestore.rules`.
  - Agregar el dominio de Vercel a los dominios autorizados.
- **Cómo configurar Spotify**: app en el dashboard, Web API, copiar el Client ID y el Secret. Mencionar que requiere Premium.
- **Despliegue en Vercel**:
  - Preset Vite, `npm run build` y `dist`.
  - Variables de entorno (VITE_* como Config; SPOTIFY_* como Secret).
  - Redeploy si cambian.
- Estructura de carpetas, con dónde se conecta Firebase (`src/firebase.js`) y dónde están las operaciones CRUD (`src/services/library.js`).
- Modelo de datos de Firestore.
- Versiones: V1 (`v1.0`) con lo que incluye.

---

## 16. Archivos de este paquete

```
design_handoff_alboom_v1/
├─ README.md                    este documento
├─ PROMPT_CLAUDE_CODE.md        mensaje para arrancar la sesión de Claude Code
├─ design/
│  ├─ ALBOOM V1.dc.html          diseño de V1: escritorio, celular y estados
│  └─ ALBOOM 1b Fanzine.dc.html  dirección visual y login en celular
└─ starter/                     archivos listos para copiar a la raíz del proyecto
   ├─ api/spotify.js
   ├─ src/firebase.js
   ├─ src/services/{auth,users,library,spotify}.js
   ├─ src/context/AuthContext.jsx
   ├─ src/components/VinylRating.{jsx,css}
   ├─ src/styles/tokens.css
   ├─ firestore.rules
   ├─ vercel.json
   ├─ vite.config.js
   ├─ .env.example
   └─ .gitignore
```

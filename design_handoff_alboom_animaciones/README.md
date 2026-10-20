# ALBOOM · Animaciones de marca

> Para **Claude Code**. Agrega dos animaciones a la app que ya funciona (fase 1 terminada).
> Las reglas de `README_V1.md` y `README.md` (V2) siguen vigentes.

## Archivos

```
design_handoff_alboom_animaciones/
├─ README.md                    ← este archivo
├─ alboom-motion.js             ← las dos animaciones (web components). Copiar, NO reescribir
└─ design/
   ├─ ALBOOM Animaciones.dc.html  ← referencia visual: abrila en el navegador
   ├─ alboom-motion.js
   └─ support.js
```

`design/ALBOOM Animaciones.dc.html` muestra las dos animaciones funcionando, con botones para verlas en cámara lenta. No es código para copiar.

## Qué hay en `alboom-motion.js`

Define dos etiquetas nuevas. Dibujan adentro de un *shadow root*, así que React nunca toca su contenido.

| Etiqueta | Dónde va | Qué hace |
|---|---|---|
| `<alboom-explosion>` | Panel izquierdo del login (escritorio) y franja de arriba (celular) | Explosión de historieta que se mueve todo el tiempo y estalla cada 1,8 a 2,6 s, con destello y sacudón |
| `<alboom-burst size="46">` | El estallido del logotipo "ALBO✳M" en la barra de todas las pantallas con sesión | Se carga, explota y se acomoda en un loop de 2,6 s. Al pasar el mouse explota en el momento |

Ya resuelven por su cuenta:
- `prefers-reduced-motion`: quedan quietas.
- Se pausan fuera de pantalla y con la pestaña oculta.
- Colores desde variables CSS: `--ink`, `--pink`, `--paper` (las dos) y `--blue`, `--yellow`, `--card` (la explosión). El logo sigue al tema activo; el login siempre está en Historieta.
- Atributo opcional `speed` (multiplicador). No hace falta usarlo en la app.

## Cómo integrarlo

1. Copiá `alboom-motion.js` a `src/components/alboom-motion.js`, al lado de `alboom-loader.js`. No lo modifiques; si encontrás un error, explicalo y hacé el cambio mínimo.
2. En `main.jsx`, importalo una vez, junto al loader:
   ```js
   import './components/alboom-loader.js'
   import './components/alboom-motion.js'
   ```
3. **Login** (`LoginPage`): reemplazá la ilustración fija de la explosión (`login-explosion.svg`) por la animada. Dejá igual la trama de puntos y el cartel "Escuchá. Puntuá. Descubrí.", que van encima.
   ```jsx
   {/* Escritorio: llena el panel izquierdo */}
   <div className="login-hero__art" aria-hidden="true">
     <alboom-explosion></alboom-explosion>
   </div>

   {/* Celular: la misma explosión, encuadrada en la franja de 250 px */}
   <div className="login-hero__art" aria-hidden="true">
     <alboom-explosion viewbox="68 140 624 400"></alboom-explosion>
   </div>
   ```
   `.login-hero__art` va con `position: absolute; inset: 0;`. La etiqueta ya ocupa el 100 % de su contenedor, con un recorte tipo cover. Si usás un solo componente, elegí el `viewbox` según el ancho (por ejemplo con `matchMedia('(max-width: 767px)')`).
4. **Logo** (`Logo.jsx`, variante integrada de la barra): reemplazá el SVG fijo del estallido por `<alboom-burst size={46} />` en escritorio y `size={34}` en celular. Mantené "ALBO" y "M" como texto y el `<Link>` con su `aria-label`. El logo solo tipográfico del login no cambia.
5. ESLint: si `react/no-unknown-property` marca `viewbox` o `size`, agregá una excepción solo para esas dos etiquetas.

## Pruebas

1. El login muestra la explosión en movimiento, sin errores en la consola.
2. En macOS: Configuración del Sistema → Accesibilidad → Pantalla → **Reducir movimiento**. La explosión y el logo quedan quietos. Al desactivarlo, vuelven a moverse sin recargar.
3. El logo de la barra late y explota cada 2,6 s, y explota al pasar el mouse.
4. Al cambiar de tema (fase 4), el logo cambia de colores.
5. DevTools → Performance, 10 s en el login: no hay tareas largas en rojo y la página responde normal.
6. `npm run lint` y `npm run build` sin errores. Commit: `feat: animaciones de marca en login y logo`.

## Mensaje para pegarle a Claude Code

---

Copié la carpeta `design_handoff_alboom_animaciones` al lado del proyecto. Leé su `README.md` completo y abrí `design/ALBOOM Animaciones.dc.html` en el navegador para ver cómo se mueven las dos animaciones. Integralas como indica la sección "Cómo integrarlo", sin reescribir `alboom-motion.js`. Antes de tocar código, pasame el plan y los archivos que vas a cambiar. Al terminar, corré lint y build, hacemos juntos las pruebas del README y me mostrás `git status` antes del commit.

---

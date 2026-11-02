// Diccionario español → inglés.
// La clave es el texto exacto en español (como aparece en el código); el valor, su traducción.
// {n}, {name}, etc. son lugares que se completan al usarlo: t('{n} elegidos', { n: 3 }).

import partA from './en-parts/a';
import partB from './en-parts/b';
import partC from './en-parts/c';
import partD from './en-parts/d';

// Las partes están separadas por grupos de pantallas para que el archivo no sea enorme.
const en = {
  ...partA,
  ...partB,
  ...partC,
  ...partD,
  // ---------- Primera vez: géneros ----------
  'Elegí al menos': 'Pick at least',
  '1 género': '1 genre',
  'Buscalo o mirá la lista completa. Con esto armamos tus recomendaciones y el color de tu ALBOOM.':
    'Search for it or browse the full list. We use it to build your recommendations and the color of your ALBOOM.',
  'Buscar un género': 'Search for a genre',
  'Buscá un género: rock, cumbia, jazz…': 'Search for a genre: rock, cumbia, jazz…',
  'Ver todos ({n})': 'See all ({n})',
  'No encontramos ese género. Probá con «Ver todos».': "We couldn't find that genre. Try “See all”.",
  'Tus géneros': 'Your genres',
  'Todavía no elegiste ninguno. Los que elijas aparecen acá.': "You haven't picked any yet. The ones you pick show up here.",
  'Elegí al menos 1 género para seguir.': 'Pick at least 1 genre to continue.',
  '{n} elegidos': '{n} picked',
  'podés sumar más': 'you can add more',
  Siguiente: 'Next',
  // ---------- Pop-up de primera tarea, menú de invitado, utilidades ----------
  'Tu primera tarea': 'Your first task',
  'Cuatro pasos para arrancar tu ALBOOM. Es opcional.': 'Four steps to kick off your ALBOOM. It’s optional.',
  'Buscá un disco': 'Search for an album',
  'Uno que hayas escuchado hace poco.': 'One you listened to recently.',
  Guardalo: 'Save it',
  'Como «Escuchado» o «Para escuchar».': 'As “Listened” or “To listen”.',
  Puntualo: 'Rate it',
  'De 1 a 5 estrellas.': 'From 1 to 5 stars.',
  'Escribí tu reseña': 'Write your review',
  'Unas líneas sobre qué te pareció.': 'A few lines about what you thought.',
  Omitir: 'Skip',
  Empezar: 'Start',
  '¡Primera tarea hecha! Ya arrancó tu ALBOOM.': 'First task done! Your ALBOOM is up and running.',
  Invitado: 'Guest',
  invitado: 'guest',
  'Crear cuenta / Iniciar sesión': 'Sign up / Log in',
  Salir: 'Leave',
  Idioma: 'Language',
  disco: 'album',
  discos: 'albums',
  'Porque escuchás {name}': 'Because you listen to {name}',
  'Por tu gusto por el {genre}': 'Because you like {genre}',
  'Porque te gustó {name}': 'Because you liked {name}',
  'Joya escondida · {genre}': 'Hidden gem · {genre}',
  'Tiene 1 disco de tu Top 5': 'Has 1 album from your Top 5',
  'Tiene {n} discos de tu Top 5': 'Has {n} albums from your Top 5',
  'Le gusta {list}': 'Likes {list}',
  'Le gustan {list}': 'Likes {list}',
  'Lo siguen {names} y {n} más': 'Followed by {names} and {n} more',
  'Lo sigue {names}': 'Followed by {names}',
  'Lo siguen {names}': 'Followed by {names}',
  'Nuevo en ALBOOM': 'New on ALBOOM',
  'Nuevo en la comunidad': 'New in the community',
  '¿Seguro que querés continuar como invitado?': 'Are you sure you want to continue as a guest?',
  'No vas a poder hacer reseñas, modificar tu perfil ni guardar tus discos.':
    "You won't be able to write reviews, edit your profile or save your albums.",
  'Continuar como invitado': 'Continue as guest',
  'Para guardar y reseñar discos tenés que iniciar sesión.': 'To save and review albums you need to log in.',
  'Para hacer esto tenés que iniciar sesión.': 'You need to log in to do this.',
  '¿Querés iniciar sesión?': 'Do you want to log in?',
  'Ahora no': 'Not now',
  'Ir a iniciar sesión': 'Go to log in',
  'Sumá los discos que quieras. Van a tu biblioteca como escuchados y nos ayudan a recomendarte.':
    'Add as many albums as you like. They go to your library as listened and help us recommend you music.',
  '1 elegido': '1 picked',
  'Los discos que sumes aparecen acá.': 'The albums you add show up here.',
  Perfil: 'Profile',
  Quitar: 'Remove',
  'Los cinco discos que más te representan. Arrastrá para cambiar el orden y tocá «Quitar» para sacar uno.':
    'The five albums that represent you best. Drag to reorder and tap “Remove” to take one out.',
  'Primera tarea': 'First task',
  'Mostrar pasos': 'Show steps',
  'Ocultar pasos': 'Hide steps',
  'Cerrar la primera tarea': 'Close the first task',
  hecho: 'done',
};

export default en;

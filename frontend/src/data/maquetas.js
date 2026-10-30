// src/data/maquetas.js
// Datos de ejemplo para las secciones que aún no tienen back
// (Mercado, Músicos y Bandas). Solo sirven para enseñar el prototipo.

export const CATEGORIAS_MERCADO = [
  { value: 'guitarras', label: 'Guitarras', icono: 'guitar', tono: 'purple' },
  { value: 'bajos', label: 'Bajos', icono: 'guitar', tono: 'yellow' },
  { value: 'teclados', label: 'Teclados', icono: 'piano', tono: 'purple' },
  { value: 'bateria', label: 'Batería y percusión', icono: 'drum', tono: 'blue' },
  { value: 'viento', label: 'Viento y cuerda', icono: 'music', tono: 'coral' },
  { value: 'amplificacion', label: 'Amplificación', icono: 'speaker', tono: 'coral' },
  { value: 'estudio', label: 'Estudio y directo', icono: 'sliders', tono: 'green' },
];

export const ARTICULOS_MERCADO = [
  { id: 1, titulo: 'Guitarra eléctrica tipo Strat, sunburst', precio: 280, categoria: 'guitarras', estado: 'Buen estado', ciudad: 'Barcelona', vendedor: 'Nuria P.', dias: 0 },
  { id: 2, titulo: 'Amplificador de válvulas 30 W', precio: 420, categoria: 'amplificacion', estado: 'Como nuevo', ciudad: 'Sabadell', vendedor: 'Òscar M.', dias: 1 },
  { id: 3, titulo: 'Bajo de 4 cuerdas con electrónica activa', precio: 240, categoria: 'bajos', estado: 'Buen estado', ciudad: 'Terrassa', vendedor: 'Marc T.', dias: 1 },
  { id: 4, titulo: 'Batería acústica de 5 piezas con platos', precio: 390, categoria: 'bateria', estado: 'Usado', ciudad: 'Girona', vendedor: 'Aina R.', dias: 2 },
  { id: 5, titulo: 'Interfaz de audio 2 entradas USB-C', precio: 65, categoria: 'estudio', estado: 'Como nuevo', ciudad: 'Mataró', vendedor: 'Pol G.', dias: 2 },
  { id: 6, titulo: 'Teclado de 61 teclas sensibles', precio: 150, categoria: 'teclados', estado: 'Buen estado', ciudad: 'Lleida', vendedor: 'Clara V.', dias: 3 },
  { id: 7, titulo: 'Saxo alto lacado con estuche', precio: 620, categoria: 'viento', estado: 'Buen estado', ciudad: 'Tarragona', vendedor: 'Jordi F.', dias: 3 },
  { id: 8, titulo: 'Caja de batería 14" de abedul', precio: 55, categoria: 'bateria', estado: 'Usado', ciudad: 'Reus', vendedor: 'Laia S.', dias: 4 },
  { id: 9, titulo: 'Guitarra acústica con pastilla', precio: 190, categoria: 'guitarras', estado: 'Como nuevo', ciudad: 'Vic', vendedor: 'Biel S.', dias: 5 },
  { id: 10, titulo: 'Pedalera multiefectos con expresión', precio: 130, categoria: 'estudio', estado: 'Buen estado', ciudad: 'Manresa', vendedor: 'Elena V.', dias: 6 },
  { id: 11, titulo: 'Violín 4/4 con arco y estuche', precio: 210, categoria: 'viento', estado: 'Usado', ciudad: 'Granollers', vendedor: 'Javier P.', dias: 7 },
  { id: 12, titulo: 'Cabezal de bajo 300 W', precio: 260, categoria: 'amplificacion', estado: 'Buen estado', ciudad: 'Badalona', vendedor: 'Carlos R.', dias: 8 },
  { id: 13, titulo: 'Sintetizador analógico monofónico', precio: 340, categoria: 'teclados', estado: 'Como nuevo', ciudad: 'Sitges', vendedor: 'Maite S.', dias: 9 },
];

export const MUSICOS = [
  { id: 1, nombre: 'Maite Soler', zona: 'Vallès Oriental', instrumentos: ['Saxofón', 'Bajo'], estilos: ['Indie', 'Funk', 'Jazz'], disponible: true, bio: 'Saxo en directo y bajo para grabar. Me apunto a jams.' },
  { id: 2, nombre: 'Javier Prat', zona: 'Gironès', instrumentos: ['Violín', 'Trompeta'], estilos: ['Indie', 'Folk'], disponible: true, bio: 'Formación clásica, alma de folk. Busco proyecto con directo.' },
  { id: 3, nombre: 'Biel Serra', zona: 'Vallès Oriental', instrumentos: ['Piano'], estilos: ['Rock', 'Indie', 'Soul'], disponible: false, bio: 'Teclista de versiones los fines de semana.' },
  { id: 4, nombre: 'Laura Mas', zona: 'Bages', instrumentos: ['Bajo', 'Voz'], estilos: ['Pop', 'Rock'], disponible: true, bio: 'Bajista disponible para versiones y bodas.' },
  { id: 5, nombre: 'Pau Garcia', zona: 'Tarragonès', instrumentos: ['Batería'], estilos: ['Metal', 'Rock'], disponible: true, bio: 'Doble bombo y mucha paciencia. Local propio en Tarragona.' },
  { id: 6, nombre: 'Òscar Martí', zona: 'Maresme', instrumentos: ['Electrónica', 'Piano'], estilos: ['Electrónica', 'Ambient'], disponible: false, bio: 'Produzco en casa y busco gente para llevarlo al directo.' },
  { id: 7, nombre: 'Elena Vila', zona: 'Barcelonès', instrumentos: ['Voz', 'Guitarra'], estilos: ['Soul', 'Funk'], disponible: true, bio: 'Cantante con ganas de banda estable de soul.' },
  { id: 8, nombre: 'Carlos Rovira', zona: 'Maresme', instrumentos: ['Guitarra'], estilos: ['Blues', 'Rock'], disponible: true, bio: 'Guitarra rítmica y algún solo. Llevo mi ampli.' },
];

export const BANDAS = [
  { id: 1, nombre: 'Los Bemoles del Raval', zona: 'Barcelonès', estilos: ['Rock', 'Funk'], miembros: 3, buscan: ['Batería'], tono: 'coral', bio: 'Trío de funk-rock con tres temas propios y ganas de directo.' },
  { id: 2, nombre: 'Marea Baixa', zona: 'Maresme', estilos: ['Indie', 'Pop'], miembros: 4, buscan: [], tono: 'blue', bio: 'Indie en catalán. Ensayamos los martes en Mataró.' },
  { id: 3, nombre: 'Ruta 66 Blues Band', zona: 'Vallès Occidental', estilos: ['Blues'], miembros: 5, buscan: ['Armónica'], tono: 'yellow', bio: 'Blues clásico de Chicago. Tocamos en bares cada mes.' },
  { id: 4, nombre: 'Folk de Muntanya', zona: 'Osona', estilos: ['Folk'], miembros: 4, buscan: ['Violín'], tono: 'green', bio: 'Música tradicional con un toque moderno.' },
  { id: 5, nombre: 'Neón Sur', zona: 'Tarragonès', estilos: ['Electrónica', 'Pop'], miembros: 2, buscan: ['Voz', 'Bajo'], tono: 'purple', bio: 'Dúo de synth-pop buscando completar formación.' },
  { id: 6, nombre: 'Big Band Garraf', zona: 'Garraf', estilos: ['Jazz', 'Swing'], miembros: 14, buscan: ['Trombón'], tono: 'coral', bio: 'Big band amateur con repertorio de swing y latin.' },
];

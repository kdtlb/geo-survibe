/* ============================================================
   SURVIBE · Configuración del geoportal
   Definición de capas, estilos, paletas y basemaps
   ============================================================ */

const GEO = {
  // Vista inicial: todo Bolivia
  center: [-16.6, -64.6],
  zoom: 6,
  bounds: [[-9.5, -70.0], [-23.1, -57.2]],
  // Región de caminatas (Tarija)
  caminatasView: { center: [-21.55, -64.9], zoom: 10 }
};

/* Dificultad de caminatas */
const DIFFICULTY = {
  1: { label: 'Fácil',          color: '#1a9c48', stars: 1 },
  2: { label: 'Moderada',       color: '#d99200', stars: 2 },
  3: { label: 'Difícil',        color: '#c0271a', stars: 3 },
  0: { label: 'Sin clasificar', color: '#8a94a0', stars: 0 }
};
function diffOf(v) { return DIFFICULTY[v] || DIFFICULTY[0]; }

/* Color único para las caminatas (marcadores redondos) */
const CAMINATA_COLOR = '#d1332a';

/* Paleta categórica sólida para ecorregiones (13) */
const ECO_PALETTE = [
  '#4f9d5b', '#7cbf5a', '#b0cf5a', '#e0b552', '#c9863f',
  '#5aa9c9', '#4f9a8f', '#6f86b0', '#b97f8c', '#c9a838',
  '#8aab63', '#4bb28f', '#9c8290'
];

/* Escala de azules sólidos para subcuencas (18) — varía el tono */
const SUB_BLUES = [
  '#08306b', '#0d3d80', '#124a95', '#1857a8', '#1f66b8',
  '#2874c4', '#3282cd', '#3f90d4', '#4e9dda', '#5faae0',
  '#0b4a86', '#15589a', '#1e63ac', '#2a72bd', '#3781c9',
  '#4791d3', '#59a0da', '#6bafe0'
];

/* Definición de capas.
   Orden = orden de dibujado (las primeras quedan por debajo). */
const LAYERS = [
  {
    id: 'ecorregiones', data: 'ecorregiones', name: 'Ecorregiones',
    group: 'ambiente', kind: 'polygon', on: false,
    meta: '13 ecorregiones', swatch: '#7cbf5a',
    style: (f, i) => ({
      color: '#ffffff', weight: 0.8, opacity: 1,
      fillColor: ECO_PALETTE[i % ECO_PALETTE.length], fillOpacity: 1
    }),
    fields: [['nombre', 'Ecorregión'], ['Pais', 'País']],
    kicker: 'Ecorregión', titleField: 'nombre'
  },
  {
    id: 'subcuencas', data: 'subcuencas', name: 'Subcuencas hidrográficas',
    group: 'ambiente', kind: 'polygon', on: false,
    meta: '18 subcuencas · nivel 2', swatch: '#1f66b8',
    style: (f, i) => ({ color: '#ffffff', weight: 0.8, opacity: 1,
      fillColor: SUB_BLUES[i % SUB_BLUES.length], fillOpacity: 1 }),
    fields: [['nombre', 'Subcuenca'], ['nivel1', 'Cuenca principal'], ['Pais', 'País']],
    kicker: 'Subcuenca hidrográfica', titleField: 'nombre'
  },
  {
    id: 'departamentos', data: 'departamentos', name: 'Departamentos',
    group: 'divisiones', kind: 'polygon', on: true,
    meta: '9 departamentos · solo borde', swatch: '#3b4450', swatchKind: 'line',
    interactive: false,
    style: () => ({ color: '#3b4450', weight: 1.6, opacity: 1, fill: false })
  },
  {
    id: 'municipios', data: 'municipios', name: 'Municipios',
    group: 'divisiones', kind: 'polygon', on: false,
    meta: '339 municipios · clic para ver nombre', swatch: '#8a95a1', swatchKind: 'line',
    style: () => ({ color: '#8a95a1', weight: 0.7, opacity: 1, fill: true, fillColor: '#8a95a1', fillOpacity: 0 }),
    hoverFill: 0.12,
    fields: [['Nombre', 'Municipio'], ['Departamen', 'Departamento'], ['Pais', 'País']],
    kicker: 'Municipio', titleField: 'Nombre'
  },
  {
    id: 'ap_nacional', data: 'ap_nacional', name: 'Áreas protegidas nacionales',
    group: 'conservacion', kind: 'polygon', on: true,
    meta: '68 áreas · nivel nacional', swatch: '#1a9c48',
    style: () => ({ color: '#127a37', weight: 1, opacity: 0.9, fillColor: '#2bb35a', fillOpacity: 0.3 }),
    hoverFill: 0.5,
    fields: [['Nombre', 'Área protegida'], ['Categoria', 'Categoría'], ['Pais', 'País']],
    kicker: 'Área protegida nacional', titleField: 'Nombre'
  },
  {
    id: 'ap_subnacional', data: 'ap_subnacional', name: 'Áreas protegidas subnacionales',
    group: 'conservacion', kind: 'polygon', on: false,
    meta: '168 áreas · dptal./municipal', swatch: '#2b8f84',
    style: () => ({ color: '#1f7268', weight: 0.9, opacity: 0.85, fillColor: '#3aa79b', fillOpacity: 0.26 }),
    hoverFill: 0.45,
    fields: [['nombre', 'Área protegida'], ['categoria', 'Categoría'], ['ambito', 'Ámbito'], ['Pais', 'País']],
    kicker: 'Área protegida subnacional', titleField: 'nombre'
  },
  {
    id: 'ramsar', data: 'ramsar', name: 'Sitios Ramsar (humedales)',
    group: 'conservacion', kind: 'polygon', on: true,
    meta: '11 humedales de importancia', swatch: '#2f7fc0',
    style: () => ({ color: '#1f6aa8', weight: 1.2, opacity: 0.9, fillColor: '#3f93d1', fillOpacity: 0.35 }),
    hoverFill: 0.55,
    fields: [['nombre', 'Sitio Ramsar'], ['pais', 'País']],
    kicker: 'Humedal Ramsar', titleField: 'nombre'
  },
  {
    id: 'caminatas', data: 'caminatas', name: 'Caminatas / Trekkings',
    group: 'turismo', kind: 'point', on: true,
    meta: '13 rutas · Tarija', swatch: '#1a9c48', swatchKind: 'point',
    fields: [['Caminata', 'Caminata'], ['Dificultad', 'Dificultad']],
    kicker: 'Ruta de caminata', titleField: 'Caminata'
  }
];

/* Agrupación en la barra lateral */
const GROUPS = [
  { id: 'turismo',      name: 'Turismo & Aventura',  icon: 'hike' },
  { id: 'conservacion', name: 'Conservación',        icon: 'leaf' },
  { id: 'divisiones',   name: 'División política',    icon: 'map' },
  { id: 'ambiente',     name: 'Medio ambiente',       icon: 'water' }
];

/* Basemaps — servicios gratuitos, sin API key */
const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services';
const BASEMAPS = {
  claro: {
    label: 'Claro',
    url: ESRI + '/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    labels: ESRI + '/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, maxNativeZoom: 16, attribution: 'Tiles &copy; Esri &mdash; &copy; OpenStreetMap contributors' }
  },
  satelite: {
    label: 'Satélite',
    url: ESRI + '/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics' }
  },
  terreno: {
    label: 'Terreno',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: { maxZoom: 17, subdomains: 'abc', attribution: '&copy; OpenTopoMap (CC-BY-SA) &copy; OpenStreetMap' }
  },
  oscuro: {
    label: 'Oscuro',
    url: ESRI + '/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    labels: ESRI + '/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    options: { maxZoom: 19, maxNativeZoom: 16, attribution: 'Tiles &copy; Esri &mdash; &copy; OpenStreetMap contributors' }
  }
};
const BASEMAP_ORDER = ['claro', 'satelite', 'terreno', 'oscuro'];

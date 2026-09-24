# Sur Vibe Bolivia · Geoportal Turístico

Geoportal interactivo que muestra caminatas, áreas protegidas, municipios,
ecorregiones, subcuencas y humedales (Ramsar) de Bolivia.

## Cómo abrirlo

**Opción 1 — Doble clic (más simple)**
Abre `index.html` con doble clic. Funciona sin servidor porque los datos y la
librería del mapa (Leaflet) están incluidos localmente.
> Se necesita conexión a internet solo para los *mapas base* (satélite, terreno, etc.)
> y las tipografías; es normal en cualquier mapa web.

**Opción 2 — Servidor local (recomendado)**
```bash
cd geoportal
node server.js
```
Luego abre <http://localhost:8842> en el navegador.

## Qué incluye

- **8 capas** activables desde la barra lateral, agrupadas por tema:
  - Turismo: **Caminatas** (13 rutas de Tarija), coloreadas por dificultad.
  - Conservación: Áreas protegidas **nacionales** (68) y **subnacionales** (168), **Ramsar** (11).
  - División política: **Departamentos** (9), **Municipios** (339).
  - Medio ambiente: **Ecorregiones** (13), **Subcuencas** hidrográficas (18).
- **Buscador** de caminatas, **filtro por dificultad**, **panel de detalles**.
- **4 mapas base**: Oscuro, Satélite, Terreno, Claro.
- Lectura de coordenadas, escala, y botones para encuadrar Bolivia / las caminatas.

## Estructura

```
geoportal/
├── index.html            # Página principal
├── css/style.css         # Diseño (tema oscuro + acentos de Bolivia)
├── js/config.js          # Definición de capas, estilos y mapas base
├── js/app.js             # Lógica del geoportal
├── data/                 # Datos geográficos
│   ├── *.geojson         # GeoJSON (convertidos desde los shapefiles)
│   └── *.js              # Los mismos datos como variables JS (para abrir con file://)
├── assets/               # Logo Survibe (marca, favicon)
├── vendor/leaflet/       # Librería Leaflet (local, sin CDN)
└── server.js             # Servidor estático opcional
```

## Datos

Los shapefiles originales (formato `.zip`) fueron convertidos a **GeoJSON** con
[mapshaper](https://mapshaper.org): reproyectados a WGS84 (EPSG:4326), simplificados
para la web y con coordenadas redondeadas. Fuentes: capas oficiales de Bolivia
(departamentos, municipios, áreas protegidas SERNAP, ecorregiones, subcuencas) y
Sitios Ramsar RAISG 2024.

Para actualizar un dato, reemplaza el `.geojson` correspondiente en `data/` y
vuelve a generar su `.js` (envolviendo el GeoJSON en
`window.SURVIBE_DATA["clave"] = { ... };`).

# Dashboard Educativo - UNESUM

Dashboard interactivo para análisis de encuestas de evaluación curricular de la Universidad Estatal del Sur de Manabí (UNESUM).

## Tecnologías Utilizadas

- **Frontend**: Astro + Svelte + TypeScript
- **Gráficos**: Chart.js
- **Backend**: Google Apps Script
- **Despliegue**: GitHub Pages
- **Fuente de datos**: Google Sheets

## Características

- Visualización de datos mediante gráficos de barras apiladas
- Filtros interactivos por semestre (Sexto, Séptimo, Octavo)
- Filtros interactivos por dimensiones educativas
- Diseño responsive (desktop, tablet, móvil)
- Actualización automática desde Google Sheets
- Deploy automático con GitHub Actions

## Estructura del Proyecto

```
LINEAMIENTOS/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions para deploy automático
├── src/
│   ├── components/
│   │   └── GraficoDashboard.svelte  # Componente principal con Chart.js
│   ├── layouts/
│   │   └── Layout.astro        # Layout base
│   ├── pages/
│   │   └── index.astro         # Página principal
│   ├── config.ts               # Configuración (URL de Apps Script)
│   └── env.d.ts                # Tipos TypeScript
├── public/                     # Archivos estáticos
├── Code.gs                     # Backend Google Apps Script
├── astro.config.mjs            # Configuración de Astro
├── tsconfig.json               # Configuración de TypeScript
├── package.json
└── README.md
```

## Instalación Local

### Prerrequisitos

- Node.js 18+ y npm
- Git

### Pasos

1. **Clonar el repositorio**

```bash
git clone https://github.com/TU_USUARIO/LINEAMIENTOS.git
cd LINEAMIENTOS
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar la URL del Backend** (ver sección siguiente)

4. **Iniciar servidor de desarrollo**

```bash
npm run dev
```

El dashboard estará disponible en `http://localhost:4321`

## Configuración del Backend (Google Apps Script)

### Paso 1: Crear el proyecto de Apps Script

1. Abre [Google Apps Script](https://script.google.com/)
2. Haz clic en "Nuevo proyecto"
3. Copia todo el contenido del archivo `Code.gs` de este repositorio
4. Pégalo en el editor de Apps Script
5. Guarda el proyecto (Ctrl+S) con un nombre descriptivo, ej: "Backend Dashboard UNESUM"

### Paso 2: Verificar el ID del Sheet

En la línea 23 de `Code.gs`, verifica que el `SHEET_ID` sea correcto:

```javascript
const SHEET_ID = '1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek';
```

### Paso 3: Verificar el nombre de la hoja

En la línea 24, ajusta el nombre si tu hoja tiene un nombre diferente:

```javascript
const SHEET_NAME = 'Respuestas de formulario 1';
```

Puedes verificar el nombre abriendo tu Google Sheet y mirando las pestañas inferiores.

### Paso 4: Probar el script (opcional pero recomendado)

1. En el editor de Apps Script, selecciona la función `testProcesarDatos` del menú desplegable
2. Haz clic en "Ejecutar"
3. La primera vez te pedirá autorización:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado" → "Ir a [nombre del proyecto] (no seguro)"
   - Haz clic en "Permitir"
4. Revisa los logs (Ver → Registros) para verificar que el JSON se generó correctamente

### Paso 5: Desplegar como Web App

1. En el editor de Apps Script, haz clic en "Implementar" → "Nueva implementación"
2. Haz clic en el icono de engranaje junto a "Tipo" y selecciona "Aplicación web"
3. Configura:
   - **Descripción**: "API del Dashboard Educativo"
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: "Cualquier persona"
4. Haz clic en "Implementar"
5. **IMPORTANTE**: Copia la URL que aparece (algo como `https://script.google.com/macros/s/AKfycby.../exec`)

### Paso 6: Configurar la URL en el proyecto frontend

1. Abre el archivo `src/config.ts`
2. Reemplaza `'TU_URL_DE_APPS_SCRIPT_AQUI'` con la URL que copiaste:

```typescript
export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```

3. Guarda el archivo

## Despliegue en GitHub Pages

### Opción A: Deploy Automático (Recomendado)

El repositorio ya incluye configuración de GitHub Actions. Simplemente:

1. **Actualiza el archivo `astro.config.mjs`**

   Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub:

   ```javascript
   export default defineConfig({
     site: 'https://TU_USUARIO.github.io',
     base: '/LINEAMIENTOS',
     // ...
   });
   ```

2. **Crea el repositorio en GitHub**

   ```bash
   # Desde la carpeta del proyecto
   git add .
   git commit -m "Initial commit: Dashboard Educativo UNESUM"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/LINEAMIENTOS.git
   git push -u origin main
   ```

3. **Habilita GitHub Pages**

   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - En "Source", selecciona "GitHub Actions"

4. **Espera el deploy**

   - Ve a la pestaña "Actions" para ver el progreso
   - Una vez completado, tu dashboard estará en `https://TU_USUARIO.github.io/LINEAMIENTOS/`

### Opción B: Deploy Manual

```bash
npm run build
# Luego sube manualmente la carpeta dist/ a tu hosting
```

## Actualizar Datos

Los datos se actualizan automáticamente desde Google Sheets. Cada vez que alguien accede al dashboard:

1. El frontend hace una petición al Apps Script
2. El script lee los datos actuales del Sheet
3. Procesa y devuelve el JSON actualizado
4. El gráfico se renderiza con los datos más recientes

**No necesitas redesplegar el proyecto** para actualizar los datos, solo modificar el Google Sheet.

## Estructura de Datos Esperada

El Google Sheet debe tener estas columnas (con estos nombres exactos o similares):

- `Marca temporal` (se excluye del análisis)
- `Elija su carrera` (se excluye del análisis)
- `Nivel/Semestre que cursa:` (valores: Sexto, Séptimo, Octavo)
- Múltiples columnas de preguntas numéricas (escala 1-5) con formato:
  - "Categoría - Pregunta específica"
  - Por ejemplo: "Alineación con la Misión de la UNESUM - ¿Considera que..."

### Categorías procesadas

El script detecta automáticamente categorías que incluyan estos prefijos:

- Alineación con la Misión de la UNESUM
- Alineación con la Visión de la UNESUM
- Coherencia interna de la Carrera
- Claridad y concisión
- Pertinencia y relevancia
- Incorporación de principios
- Coherencia con pertinencia social
- Metodologías activas
- Desarrollo del pensamiento crítico
- Coherencia unidades temáticas
- Articulación docencia-investigación-vinculación
- Prácticas preprofesionales
- Competencias profesionales específicas
- Competencias investigativas
- Competencias digitales e informacionales
- Integración de tecnologías emergentes

## Scripts Disponibles

```bash
npm run dev       # Servidor de desarrollo (http://localhost:4321)
npm run build     # Build para producción (genera carpeta dist/)
npm run preview   # Preview del build de producción
```

## Personalización

### Cambiar colores de semestres

Edita `src/components/GraficoDashboard.svelte`, línea ~25:

```typescript
const coloresSemestres: Record<string, string> = {
  'Sexto': 'rgba(255, 99, 132, 0.8)',     // Rosa
  'Séptimo': 'rgba(54, 162, 235, 0.8)',   // Azul
  'Octavo': 'rgba(255, 206, 86, 0.8)',    // Amarillo
};
```

### Cambiar altura del gráfico

Edita `src/components/GraficoDashboard.svelte`, en los estilos de `.grafico-container`:

```css
.grafico-container {
  height: 600px;  /* Cambia este valor */
}
```

### Modificar título

Edita `src/components/GraficoDashboard.svelte`, línea ~168:

```svelte
<h1>Dashboard Educativo - UNESUM</h1>
```

## Troubleshooting

### Error: "Debes configurar APPS_SCRIPT_URL"

Asegúrate de haber actualizado `src/config.ts` con la URL correcta de tu Apps Script.

### El gráfico no se muestra

1. Abre la consola del navegador (F12)
2. Revisa los errores
3. Verifica que la URL del Apps Script sea correcta
4. Verifica que el Apps Script esté desplegado con acceso "Cualquier persona"

### Error de CORS

Si ves errores de CORS, verifica que el Apps Script devuelva los headers correctos (ya incluidos en `Code.gs`).

### Los datos no coinciden con el Sheet

1. Verifica que el `SHEET_ID` en `Code.gs` sea correcto
2. Verifica que el `SHEET_NAME` coincida con el nombre de la pestaña
3. Ejecuta la función `testProcesarDatos()` en Apps Script para ver el JSON generado

## Licencia

MIT

## Autor

Desarrollado para la Universidad Estatal del Sur de Manabí (UNESUM)

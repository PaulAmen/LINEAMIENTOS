# 📝 Changelog - Dashboard Educativo UNESUM

## [2.0.0] - 2026-01-20

### 🎉 Major Release - Dashboard Analítico Completo

Esta versión transforma completamente el dashboard de un gráfico simple a un sistema profesional de análisis educativo con múltiples visualizaciones.

---

### ✨ Nuevas Características

#### Frontend

**6 Visualizaciones Profesionales:**

1. **Panel de KPIs** (Siempre visible)
   - Total de estudiantes
   - Media global
   - Total de dimensiones
   - Mejor dimensión (indicador verde)
   - Peor dimensión (indicador rojo)

2. **Gráfico Circular** (Pestaña: Resumen)
   - Distribución porcentual de estudiantes por semestre
   - Tooltips con valores absolutos y porcentajes

3. **Ranking de Dimensiones** (Pestaña: Ranking)
   - Top 20 dimensiones ordenadas por promedio
   - Código de colores: Verde (top 5), Azul (medio), Rojo (bottom 5)
   - Barras horizontales para mejor legibilidad

4. **Gráfico de Radar** (Pestaña: Perfil)
   - Perfil curricular comparativo
   - Top 8 dimensiones más relevantes
   - Una línea por semestre con áreas sombreadas

5. **Distribución de Frecuencias** (Pestaña: Distribución)
   - Histograma de respuestas 1-5
   - Código de colores del rojo (1) al verde (5)
   - Porcentajes en tooltips

6. **Comparación por Semestre** (Pestaña: Comparación)
   - Barras apiladas mejoradas
   - Top 10 dimensiones
   - Vista acumulada por semestre

**Sistema de Navegación:**
- Navegación por pestañas responsive
- Lazy loading de gráficos (solo se renderizan al activar la pestaña)
- Transiciones suaves entre pestañas

**UI/UX:**
- Diseño mobile-first completamente responsive
- Colores distintivos por semestre mantenidos
- Tooltips informativos en todos los gráficos
- Destrucción automática de charts al cambiar de pestaña

---

#### Backend

**Procesamiento Estadístico Completo:**

- ✅ Cálculo de estadísticas descriptivas por dimensión:
  - Promedio
  - Mediana
  - Desviación estándar
  - Cuartiles Q1 y Q3
  - Mínimo y máximo
  - Conteo de respuestas

- ✅ Ranking automático de dimensiones ordenado por promedio

- ✅ Distribución de frecuencias global (valores 1-6)

- ✅ Estadísticas globales de todas las respuestas

- ✅ Conteo de estudiantes por semestre

- ✅ Múltiples formatos de datos para diferentes visualizaciones

**Optimizaciones:**
- Función `calcularEstadisticas()` reutilizable
- Función `percentil()` para cálculo de cuartiles
- Compatibilidad retroactiva con v1.0 (`porSemestre`)

---

### 🔧 Mejoras Técnicas

#### Arquitectura

- **Svelte 5 Runes:** Uso completo de `$state` para reactividad
- **TypeScript Estricto:** Interfaces completas para todos los datos
- **Chart.js 4:** Múltiples tipos de gráficos (bar, pie, radar)
- **Componentes Modulares:** Separación clara entre lógica y presentación

#### Rendimiento

- Lazy rendering de gráficos (mejora tiempo de carga inicial)
- Destrucción de charts al cambiar de pestaña (previene memory leaks)
- Cálculos pesados en backend (Apps Script)
- Frontend solo renderiza datos procesados

#### Mantenibilidad

- Código comentado extensamente
- Funciones pequeñas y reutilizables
- Constantes centralizadas (`coloresSemestres`)
- Separación de responsabilidades

---

### 📚 Documentación

**Nuevos Archivos:**

- `DASHBOARD_V2_GUIA.md` - Guía completa de uso (350 líneas)
  - Descripción detallada de cada visualización
  - Flujos de análisis por rol (Directivos/Coordinadores/Comité)
  - Guía de interpretación
  - Instrucciones de personalización
  - Troubleshooting

- `CHANGELOG_V2.md` - Este archivo

**Actualizados:**

- `Code.gs` - Backend v2.0 con estadísticas completas
- `src/pages/index.astro` - Usa DashboardV2.svelte

**Respaldos:**

- `src/components/GraficoDashboard.svelte.v1` - Versión anterior

---

### 🐛 Correcciones

- Eliminado `.setHeaders()` de Apps Script (no soportado)
- Actualizado de Svelte 4 a Svelte 5
- Migrado de variables reactivas a runes `$state`
- Corregida compatibilidad Astro 5 + Svelte 5

---

### ⚙️ Cambios Internos

#### Datos Retornados por Backend

```diff
{
+ "porSemestreDetallado": [...],      // Con estadísticas completas
+ "rankingDimensiones": [...],        // Ordenado por promedio
+ "distribucionFrecuencias": {...},   // Conteo 1-5
+ "estadisticasGlobales": {...},      // Media, mediana, DE
+ "estudiantesPorSemestre": {...},    // Conteo por semestre
+ "totalEstudiantes": 604,
+ "respuestasPorDimension": {...},    // Para análisis detallado
+ "metadata": {...}
}
```

#### Dependencias

Sin cambios. Mismas dependencias que v1.0:
- Astro 5.16.11
- Svelte 5.22.1
- Chart.js 4.4.8
- TypeScript 5.7.3

---

### 🚀 Migración desde v1.0

**Para Usuarios:**

1. El dashboard se actualizó automáticamente vía GitHub Actions
2. Abre https://paulamen.github.io/LINEAMIENTOS/
3. Deberías ver el nuevo dashboard con pestañas

**Para Actualizar el Backend:**

1. Abre https://script.google.com/
2. Abre tu proyecto de Apps Script
3. Reemplaza TODO el código con el nuevo `Code.gs`
4. Guarda (Ctrl+S)
5. El mismo URL de deployment seguirá funcionando

---

### 📊 Datos Soportados

**Contexto de la Encuesta:**
- 604 estudiantes encuestados
- 27 dimensiones educativas
- 164 ítems de evaluación
- 3 semestres (Sexto, Séptimo, Octavo)
- Escala Likert 1-5
- ~99,000 respuestas totales

**Dimensiones Evaluadas:**
1. Alineación con la Misión de la UNESUM
2. Alineación con la Visión de la UNESUM
3. Coherencia interna de la Carrera
4. Claridad y concisión
5. Pertinencia y relevancia
6. Incorporación de principios
7. Coherencia con pertinencia social
8. Metodologías activas
9. Desarrollo del pensamiento crítico
10. Coherencia unidades temáticas
11. Articulación docencia-investigación-vinculación
12. Prácticas preprofesionales
13. Competencias profesionales específicas
14. Competencias investigativas
15. Competencias digitales e informacionales
16. Integración de tecnologías emergentes
... (y 11 más)

---

### 🎯 Próximas Versiones (Roadmap)

**v2.1 (Futuro):**
- [ ] Boxplot por semestre (visualizar dispersión)
- [ ] Heatmap completo (matriz 27×3)
- [ ] Exportación de datos filtrados (CSV/Excel)
- [ ] Comparación con períodos anteriores

**v2.2 (Futuro):**
- [ ] Análisis de correlaciones entre dimensiones
- [ ] Gráficos de líneas temporales
- [ ] Dashboard configurable (guardar preferencias)
- [ ] Modo oscuro

---

### 👥 Créditos

**Desarrollado para:**
Universidad Estatal del Sur de Manabí (UNESUM)

**Stack Tecnológico:**
- Frontend: Astro + Svelte + TypeScript
- Gráficos: Chart.js
- Backend: Google Apps Script
- Deploy: GitHub Pages + GitHub Actions

---

### 📄 Licencia

MIT

---

## [1.0.0] - 2026-01-19

### Versión Inicial

- Gráfico de barras apiladas básico
- Filtros por semestre y dimensión
- Backend simple con promedios
- Deploy en GitHub Pages


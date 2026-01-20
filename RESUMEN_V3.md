# 📊 Dashboard UNESUM - Versión 3.0

## 🎯 Nueva Funcionalidad: Vista de 164 Preguntas Individuales

### ✅ Problema Resuelto

**Antes**: Solo se visualizaban 27 dimensiones agrupadas
**Ahora**: Se pueden ver AMBOS niveles:
- ✅ 27 dimensiones agrupadas (para análisis macro)
- ✅ 164 preguntas individuales (para análisis detallado)

---

## 🆕 Qué Hay de Nuevo

### Nueva Pestaña: "📋 Preguntas Individuales (164)"

**Visualización**:
- Gráfico de barras horizontal con las 164 preguntas
- Ordenadas de mayor a menor promedio
- Altura: 3500px (para mostrar todas sin scroll excesivo)

**Código de Colores Visual**:
- 🟢 **Verde**: Top 20% (mejores preguntas evaluadas)
- 🔵 **Azul**: 60% medio
- 🔴 **Rojo**: Bottom 20% (requieren atención)

**Tooltips Informativos**:
- Pregunta completa (sin truncar)
- Categoría/dimensión a la que pertenece
- Promedio (x.xx / 5)
- Total de respuestas

**KPI Adicional**:
- Nuevo indicador mostrando "164 Preguntas"

---

## 🔧 Cambios Técnicos Implementados

### Backend (Code.gs v3.0)

**Problema Original**: 
```javascript
// ❌ Esto causaba que el JSON se cortara
"Investigación formativa progresiva  [Existe un": { ... }
```

**Solución**:
```javascript
// ✅ Ahora usamos arrays con IDs numéricos
preguntasIndividuales: [
  {
    id: 0,
    pregunta: "Investigación formativa progresiva [Existe un proceso completo...]",
    categoria: "Investigación formativa",
    promedio: 4.12,
    ...
  },
  ...
]
```

**Nuevos campos retornados**:
- `preguntasIndividuales`: Array con las 164 preguntas y sus estadísticas
- `metadata.totalPreguntasIndividuales`: Total de preguntas procesadas (164)

### Frontend (DashboardV2.svelte)

**Nuevos componentes**:
- Función `renderizarPreguntasIndividuales()` 
- Canvas `canvasPreguntasIndividuales`
- Chart `chartPreguntasIndividuales`
- Estilo CSS `.chart-container.xxlarge` (3500px)

**Manejo de errores**:
- Si el backend no está actualizado, muestra mensaje instructivo
- Validación de datos antes de renderizar

---

## 📦 Estructura de Datos

### Ejemplo de Pregunta Individual

```json
{
  "id": 23,
  "pregunta": "Vinculación con la sociedad - La carrera realiza actividades de divulgación...",
  "categoria": "Vinculación con la sociedad",
  "promedio": 4.25,
  "mediana": 4,
  "desviacionEstandar": 0.82,
  "minimo": 1,
  "maximo": 5,
  "q1": 4,
  "q3": 5,
  "totalRespuestas": 604,
  "porSemestre": {
    "Sexto": {
      "promedio": 4.18,
      "mediana": 4,
      ...
    },
    "Séptimo": {
      "promedio": 4.28,
      ...
    },
    "Octavo": {
      "promedio": 4.31,
      ...
    }
  }
}
```

---

## 🚀 Cómo Actualizar el Backend

### ⚠️ ACCIÓN REQUERIDA

Para que la nueva pestaña funcione, **DEBES** actualizar el Google Apps Script:

1. **Abre**: https://script.google.com/
2. **Proyecto**: "Backend Dashboard UNESUM"
3. **Reemplaza** TODO el código con el contenido de `Code.gs`
4. **Guarda**: Ctrl+S
5. **NO** necesitas redesplegar (mismo URL funciona)

**Documentación completa**: Ver `ACTUALIZACION_BACKEND_V3.md`

---

## 📊 Pestañas del Dashboard (Ahora 6)

1. **📊 Resumen** - Distribución de estudiantes por semestre (pie chart)
2. **📈 Ranking (27 Dimensiones)** - Ranking de dimensiones agrupadas
3. **📋 Preguntas Individuales (164)** - NUEVA - Ranking detallado de todas las preguntas
4. **🕸️ Perfil** - Radar chart con top 8 dimensiones
5. **📊 Comparación** - Barras agrupadas por semestre
6. **🔍 Análisis Personalizado** - Filtros interactivos

---

## 🎨 Comparación Visual

### Nivel Macro (27 Dimensiones)
```
Vinculación con la sociedad         ████████████ 4.25
Investigación formativa              ███████████▌ 4.12
Infraestructura                      ██████████▊   3.87
...
```

### Nivel Micro (164 Preguntas)
```
Vinculación - Actividades de divulgación     ████████████▌ 4.28 🟢
Vinculación - Proyectos comunitarios          ████████████  4.23 🟢
Investigación - Procesos completos            ███████████▊  4.19 🟢
...
Infraestructura - Espacios de estudio         ██████████   3.65 🔴
Infraestructura - Laboratorios equipados      █████████▌   3.52 🔴
```

---

## 📈 Beneficios de la Versión 3.0

### Para Administradores
- ✅ Identificar **preguntas específicas** que requieren mejora
- ✅ Ver el **desempeño granular** de cada ítem de la encuesta
- ✅ **Priorizar acciones** basadas en el ranking detallado
- ✅ **Comparar** dimensiones generales vs preguntas específicas

### Para Analistas
- ✅ Máxima granularidad en los datos (nivel pregunta)
- ✅ Estadísticas completas por pregunta y por semestre
- ✅ Tooltips con contexto completo
- ✅ Exportable para análisis adicional (futuro)

### Para Tomadores de Decisión
- ✅ Vista **macro** (27 dimensiones) y **micro** (164 preguntas)
- ✅ Código de colores para identificación rápida
- ✅ Datos actualizados automáticamente desde Google Sheets

---

## 🔢 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Estudiantes encuestados | 604 |
| Dimensiones educativas | 27 |
| Preguntas individuales | 164 |
| Total de respuestas | ~99,000 |
| Pestañas en dashboard | 6 |
| Tipos de visualización | 6 |
| Líneas de código (frontend) | ~850 |
| Líneas de código (backend) | 425 |

---

## 📝 Archivos Modificados en v3.0

### Código
- ✅ `Code.gs` - Backend actualizado con arrays para preguntas
- ✅ `src/components/DashboardV2.svelte` - Nueva pestaña y gráfico

### Documentación
- ✅ `ACTUALIZACION_BACKEND_V3.md` - Guía de actualización
- ✅ `RESUMEN_V3.md` - Este documento

---

## 🔮 Futuras Mejoras Sugeridas

1. **Filtros en Preguntas Individuales**
   - Filtrar por categoría
   - Filtrar por rango de promedio
   - Búsqueda de texto

2. **Exportación de Datos**
   - Descargar lista de preguntas como CSV
   - Exportar gráficos como PNG/PDF

3. **Análisis Comparativo**
   - Comparar una pregunta específica entre semestres
   - Boxplot de distribución de respuestas

4. **Alertas y Notificaciones**
   - Resaltar preguntas que bajaron de promedio
   - Identificar tendencias preocupantes

---

## 📅 Historial de Versiones

### v3.0 (2026-01-20)
- ✅ Nueva pestaña de 164 preguntas individuales
- ✅ Solución a problema de JSON cortado
- ✅ Código de colores visual
- ✅ KPI adicional

### v2.1 (2026-01-20)
- Ranking completo (27 dimensiones)
- Tooltips con nombres completos
- Barras agrupadas (no apiladas)
- Análisis personalizado con filtros

### v2.0 (2026-01-19)
- 5 pestañas con diferentes visualizaciones
- Backend con estadísticas completas
- KPIs informativos

### v1.0 (2026-01-18)
- Dashboard básico con barras apiladas
- Filtros por semestre y dimensión

---

**Fecha**: 20 de enero de 2026  
**Versión**: 3.0  
**Estado**: ✅ Desplegado (requiere actualización de backend)  
**URL**: https://paulamen.github.io/LINEAMIENTOS/

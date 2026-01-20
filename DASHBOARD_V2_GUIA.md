# 📊 Dashboard Educativo UNESUM - Versión 2.0

## Guía Completa de Visualizaciones

### 🎯 Resumen de Mejoras

**Versión 1.0 → 2.0:**
- ❌ 1 gráfico (barras apiladas)
- ✅ 6 visualizaciones profesionales
- ✅ Panel de KPIs
- ✅ Navegación por pestañas
- ✅ Backend con estadísticas completas

---

## 📈 Visualizaciones Disponibles

### 1. Panel de KPIs (Siempre Visible)

**Métricas Mostradas:**
- **Total Estudiantes**: 604 encuestados
- **Media Global**: Promedio general de todas las respuestas
- **Total Dimensiones**: Número de dimensiones evaluadas (27)
- **Mejor Dimensión**: Dimensión con mayor promedio (con indicador verde)
- **Menor Dimensión**: Dimensión con menor promedio (con indicador rojo)

**Utilidad:**
- Vista rápida de indicadores clave
- Identificación inmediata de fortalezas y debilidades
- Base para profundizar en análisis específico

---

### 2. 📊 Pestaña: Resumen

**Gráfico:** Circular (Pie Chart)

**Muestra:**
- Distribución porcentual de estudiantes por semestre
- Colores distintivos:
  - Sexto: Rosa (#FF6384)
  - Séptimo: Azul (#36A2EB)
  - Octavo: Amarillo (#FFCE56)

**Interpretación:**
- Permite ver la representatividad de cada semestre
- Tooltip muestra: Número absoluto + Porcentaje
- Ejemplo: "Séptimo: 268 (44.4%)"

**Uso recomendado:**
- Validar que la muestra sea balanceada
- Contextualizar resultados por semestre

---

### 3. 📈 Pestaña: Ranking

**Gráfico:** Barras Horizontales

**Muestra:**
- Top 20 dimensiones educativas ordenadas por promedio
- Código de colores:
  - Verde: Top 5 (Fortalezas)
  - Azul: Posiciones 6-15 (Medio)
  - Rojo: Bottom 5 (Áreas de mejora)

**Interpretación:**
- Ranking descendente de mejor a menor
- Escala 1-5 en eje X
- Tooltip muestra promedio exacto

**Preguntas que responde:**
- ¿Cuáles son las dimensiones mejor valoradas?
- ¿Qué áreas necesitan intervención prioritaria?
- ¿Hay dimensiones con puntuaciones críticas (<3)?

**Ejemplo de uso:**
```
Top 1: "Prácticas preprofesionales" (4.13)
  → Fortaleza a mantener

Bottom 1: "Incorporación de principios" (3.61)
  → Área de mejora urgente
```

---

### 4. 🕸️ Pestaña: Perfil

**Gráfico:** Radar (Spider Chart)

**Muestra:**
- Top 8 dimensiones más relevantes
- Una línea por semestre (3 líneas en total)
- Área sombreada para cada semestre

**Interpretación:**
- Perfil multidimensional comparativo
- Áreas más amplias = mejor desempeño
- Solapamientos = dimensiones con percepción similar
- Distancias = diferencias entre semestres

**Preguntas que responde:**
- ¿Qué semestre tiene mejor percepción general?
- ¿Hay dimensiones donde todos coinciden?
- ¿Qué dimensión es fortaleza en todos los semestres?

**Limitación:**
- Solo muestra 8 dimensiones por legibilidad
- Para análisis completo, usar Ranking

---

### 5. 📉 Pestaña: Distribución

**Gráfico:** Histograma de Barras

**Muestra:**
- Frecuencia de cada valoración (1, 2, 3, 4, 5)
- Código de colores:
  - 1 (Muy malo): Rojo
  - 2 (Malo): Naranja
  - 3 (Regular): Amarillo
  - 4 (Bueno): Verde claro
  - 5 (Excelente): Verde oscuro

**Interpretación:**
- Distribución general de respuestas
- Tooltip muestra: Frecuencia + Porcentaje
- Identifica sesgos en las respuestas

**Patrones esperados:**

**Distribución Normal:**
```
  |
  |     ▓▓
  |   ▓▓▓▓▓▓
  | ▓▓▓▓▓▓▓▓▓▓
  +─────────────
    1 2 3 4 5
```

**Distribución Positiva (actual):**
```
  |         ▓▓▓▓
  |       ▓▓▓▓▓▓
  |     ▓▓▓▓▓▓▓▓
  |   ▓▓▓▓▓▓▓▓▓▓
  | ▓▓▓▓▓▓▓▓▓▓▓▓
  +─────────────
    1 2 3 4 5
```

**Preguntas que responde:**
- ¿Las respuestas tienden a ser positivas o negativas?
- ¿Hay consenso o polarización?
- ¿Qué porcentaje de respuestas son críticas (1-2)?

---

### 6. 📊 Pestaña: Comparación

**Gráfico:** Barras Apiladas

**Muestra:**
- Top 10 dimensiones
- Barras apiladas por semestre
- Altura total = suma de promedios de los 3 semestres

**Interpretación:**
- Compara contribución de cada semestre
- Segmentos de color por semestre
- Tooltip muestra: Semestre + Valor individual

**Utilidad:**
- Ver qué semestre contribuye más a cada dimensión
- Identificar dimensiones con consenso alto
- Detectar outliers (un semestre muy diferente)

**Ejemplo:**
```
Dimensión: "Metodologías activas"
  Sexto:   3.5
  Séptimo: 4.0
  Octavo:  4.2
  Total:   11.7 (altura de la barra)
```

---

## 🔍 Flujo de Análisis Recomendado

### Para Directivos (Vista Ejecutiva)

1. **KPIs** → Visión general en 5 segundos
2. **Resumen** → Validar representatividad
3. **Ranking** → Identificar top 3 fortalezas y 3 debilidades

**Tiempo: 2 minutos**

---

### Para Coordinadores Académicos (Análisis Táctico)

1. **KPIs** → Contexto general
2. **Ranking** → Análisis completo de las 20 dimensiones
3. **Perfil** → Ver si hay patrones por semestre
4. **Distribución** → Validar calidad de las respuestas

**Tiempo: 10 minutos**

---

### Para Comité de Evaluación (Análisis Profundo)

1. **KPIs** → Benchmarks
2. **Ranking** → Priorización de intervenciones
3. **Perfil** → Hipótesis de diferencias por nivel
4. **Distribución** → Validez estadística
5. **Comparación** → Consistencia interna

**Tiempo: 30 minutos + informe**

---

## 📊 Datos del Backend (v2.0)

### Estructura JSON Retornada

```json
{
  "porSemestre": [...],              // Compatibilidad v1
  "porSemestreDetallado": [...],     // Con estadísticas completas
  "rankingDimensiones": [...],       // Ordenado por promedio
  "distribucionFrecuencias": {...},  // Conteo 1-5
  "estadisticasGlobales": {          // Media, mediana, DE, Q1, Q3
    "promedio": 3.74,
    "mediana": 4.0,
    "desviacionEstandar": 1.50,
    ...
  },
  "estudiantesPorSemestre": {        // Conteo
    "Sexto": 219,
    "Séptimo": 268,
    "Octavo": 117
  },
  "totalEstudiantes": 604,
  "respuestasPorDimension": {...},   // Para futuros análisis
  "metadata": {...}
}
```

---

## 🎨 Personalización

### Cambiar Colores de Semestres

Edita `src/components/DashboardV2.svelte`, línea ~35:

```typescript
const coloresSemestres: Record<string, string> = {
  'Sexto': '#FF6384',    // Cambia este color
  'Séptimo': '#36A2EB',
  'Octavo': '#FFCE56',
};
```

### Ajustar Número de Dimensiones en Ranking

Línea ~150 del componente:

```typescript
const top20 = datos.rankingDimensiones.slice(0, 20); // Cambiar 20 por otro número
```

### Modificar Altura de Gráficos

CSS del componente, estilos `.chart-container`:

```css
.chart-container.large {
  height: 700px;  /* Ajustar según necesidad */
}
```

---

## 🚀 Próximas Mejoras (Opcionales)

Visualizaciones adicionales que se pueden agregar:

- [ ] **Boxplot por Semestre** → Ver dispersión y outliers
- [ ] **Heatmap Dimensiones × Semestre** → Matriz de calor completa
- [ ] **Gráfico de Líneas Temporal** → Si hay datos históricos
- [ ] **Tabla Exportable** → Descargar datos filtrados
- [ ] **Filtros Avanzados** → Por dimensión específica
- [ ] **Comparación con Años Anteriores** → Tendencias

---

## 📝 Notas Técnicas

### Limitaciones Conocidas

1. **Radar Chart**: Limitado a 8 dimensiones por legibilidad
2. **Ranking**: Muestra top 20 de 27 por espacio
3. **Distribución**: Escala 1-5 (hay algunos valores 6 en los datos originales)

### Rendimiento

- Gráficos se renderizan solo al cambiar de pestaña (optimización)
- Lazy loading de canvas elements
- Destrucción de charts anteriores para evitar memory leaks

### Compatibilidad

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Tablet (iPad, Android)
- ✅ Móvil (responsive, optimizado para pantallas pequeñas)

---

## 🆘 Troubleshooting

### Los gráficos no se muestran

1. Verifica que `APPS_SCRIPT_URL` esté configurado en `src/config.ts`
2. Abre consola (F12) y busca errores
3. Verifica que el backend devuelva JSON válido

### KPIs muestran valores extraños

- Verifica que el backend v2.0 esté desplegado
- El backend v1.0 no incluye los campos necesarios

### Gráfico de Radar aparece distorsionado

- Es normal si hay mucha diferencia entre valores
- Puedes ajustar `max: 5` en las opciones del radar

---

**Versión**: 2.0  
**Fecha**: Enero 2026  
**Autor**: Dashboard Educativo UNESUM  
**Licencia**: MIT

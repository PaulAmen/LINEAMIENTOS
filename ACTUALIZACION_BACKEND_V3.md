# 🚀 ACTUALIZACIÓN URGENTE - Backend v3.0

## ⚠️ PROBLEMA DETECTADO

El dashboard tiene una nueva pestaña **"Preguntas Individuales (164)"** pero el backend de Google Apps Script necesita actualizarse para soportarla.

**Error identificado**: El JSON estaba cortando las claves largas como `"Investigación formativa progresiva [Existe un":`

**Solución implementada**: Cambiamos de objetos con claves largas a arrays con IDs numéricos.

---

## 📋 INSTRUCCIONES DE ACTUALIZACIÓN (5 minutos)

### PASO 1: Abrir Google Apps Script

1. Abre tu navegador
2. Ve a: **https://script.google.com/**
3. Busca y abre el proyecto: **"Backend Dashboard UNESUM"**

---

### PASO 2: Reemplazar el Código

1. **Selecciona TODO el código existente** (Ctrl+A)
2. **Bórralo** (Delete)
3. **Copia TODO el contenido** del archivo `Code.gs` de este repositorio
4. **Pégalo** en el editor de Apps Script (Ctrl+V)
5. **Guarda** (Ctrl+S)

---

### PASO 3: Probar que Funciona

1. En el menú superior, selecciona la función: `testProcesarDatos`
2. Haz clic en el botón **Ejecutar** (▶️)
3. Espera unos segundos...
4. Ve a **"Ver" → "Registros"** (o presiona Ctrl+Enter)
5. **Verifica que veas un JSON con**:
   - `"preguntasIndividuales": [...]` (debe ser un ARRAY)
   - `"metadata": { "totalPreguntasIndividuales": 164, ...}`

**Ejemplo de lo que debes ver en los logs**:

```json
{
  "porSemestre": [...],
  "rankingDimensiones": [...],
  "preguntasIndividuales": [
    {
      "id": 0,
      "pregunta": "Vinculación con la sociedad - La carrera realiza...",
      "categoria": "Vinculación con la sociedad",
      "promedio": 4.25,
      "totalRespuestas": 604,
      ...
    },
    ...
  ],
  "metadata": {
    "totalDimensiones": 27,
    "totalPreguntasIndividuales": 164,
    "totalRespuestas": 99056,
    ...
  }
}
```

---

### PASO 4: NO Necesitas Redesplegar

**IMPORTANTE**: El mismo URL de tu Web App seguirá funcionando automáticamente.

- ✅ **NO necesitas** crear una nueva implementación
- ✅ **NO necesitas** actualizar `src/config.ts`
- ✅ **NO necesitas** hacer nada más en Google Apps Script

---

### PASO 5: Verificar en el Dashboard

1. Abre tu dashboard: **https://paulamen.github.io/LINEAMIENTOS/**
   - O en desarrollo: **http://localhost:4322/LINEAMIENTOS**
2. Recarga la página (F5 o Ctrl+R)
3. Haz clic en la pestaña **"📋 Preguntas Individuales (164)"**
4. Deberías ver un gráfico de barras horizontal con las 164 preguntas ordenadas por promedio

---

## 🎯 CAMBIOS IMPLEMENTADOS EN BACKEND V3

### Antes (v2.0) - ❌ PROBLEMA
```javascript
respuestasPorPreguntaIndividual = {
  "Vinculación con la sociedad - La carrera realiza...": { ... },
  "Investigación formativa progresiva  [Existe un": { ... } // ⚠️ CORTADO!
}
```

### Después (v3.0) - ✅ SOLUCIONADO
```javascript
preguntasIndividuales = [
  {
    id: 0,
    pregunta: "Vinculación con la sociedad - La carrera realiza actividades...",
    categoria: "Vinculación con la sociedad",
    promedio: 4.25,
    ...
  },
  {
    id: 1,
    pregunta: "Investigación formativa progresiva [Existe un proceso completo...]",
    categoria: "Investigación formativa",
    promedio: 4.12,
    ...
  },
  // ... 164 preguntas en total
]
```

---

## 🔍 VERIFICACIÓN DE DATOS

### ¿Qué datos retorna ahora el backend?

1. **`preguntasIndividuales`** (ARRAY de 164 items):
   - `id`: Identificador numérico (0-163)
   - `pregunta`: Texto completo de la pregunta (SIN CORTAR)
   - `categoria`: Dimensión educativa a la que pertenece
   - `promedio`: Promedio global (1-5)
   - `mediana`, `desviacionEstandar`, `q1`, `q3`: Estadísticas
   - `totalRespuestas`: Cantidad de respuestas
   - `porSemestre`: Estadísticas por semestre (Sexto, Séptimo, Octavo)

2. **`metadata.totalPreguntasIndividuales`**: Debe ser **164**

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "preguntasIndividuales is undefined"
- ✅ Actualiza el backend con el nuevo `Code.gs`
- ✅ Ejecuta `testProcesarDatos` para verificar
- ✅ Recarga el dashboard

### Error: "preguntasIndividuales tiene 0 elementos"
- ⚠️ Verifica que la hoja de cálculo tenga datos
- ⚠️ Verifica el `SHEET_ID` en línea 16 del `Code.gs`
- ⚠️ Ejecuta `testProcesarDatos` y revisa los logs

### La pestaña muestra el mensaje "Actualización Requerida"
- 📌 Significa que el backend aún no tiene los datos de preguntas individuales
- 📌 Sigue los pasos 1-3 de este documento

### El JSON aún se corta
- 🔧 Asegúrate de haber copiado **TODO** el código del nuevo `Code.gs`
- 🔧 Verifica que uses **arrays** (`[]`) y no objetos (`{}`) para preguntas individuales

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

- [ ] Abrí Google Apps Script (script.google.com)
- [ ] Encontré el proyecto "Backend Dashboard UNESUM"
- [ ] Reemplacé TODO el código con el nuevo `Code.gs`
- [ ] Guardé los cambios (Ctrl+S)
- [ ] Ejecuté `testProcesarDatos` exitosamente
- [ ] Vi en los logs un array `preguntasIndividuales` con 164 elementos
- [ ] Reloadé el dashboard
- [ ] La pestaña "Preguntas Individuales (164)" muestra el gráfico correctamente

---

## 📞 PRÓXIMOS PASOS

Una vez completada la actualización:

1. **Explora la nueva pestaña** de preguntas individuales
2. **Identifica preguntas específicas** que necesiten atención
3. **Compara dimensiones agrupadas** (27) vs preguntas individuales (164)
4. **Analiza patrones** por semestre en el nivel de detalle más granular

---

**Tiempo estimado total**: 5-10 minutos

**Beneficio**: Análisis de 164 preguntas individuales + código de colores visual (verde/azul/rojo) + tooltips informativos

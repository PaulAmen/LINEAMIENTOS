/**
 * GOOGLE APPS SCRIPT - BACKEND PARA DASHBOARD EDUCATIVO UNESUM
 * Versión 2.0 - Dashboard Analítico Completo
 * 
 * INSTRUCCIONES DE ACTUALIZACIÓN:
 * 1. Abre https://script.google.com/
 * 2. Abre tu proyecto existente
 * 3. Reemplaza TODO el código con este archivo
 * 4. Guarda (Ctrl+S)
 * 5. ¡Listo! El mismo URL seguirá funcionando
 * 
 * VINCULACIÓN DEL SHEET:
 * Sheet ID: 1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek
 */

const SHEET_ID = '1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek';
const SHEET_NAME = 'Respuestas de formulario 1';

/**
 * Función principal que maneja las peticiones HTTP GET
 */
function doGet(e) {
  try {
    const datos = procesarDatosEncuesta();
    
    return ContentService
      .createTextOutput(JSON.stringify(datos))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: true,
        message: error.toString(),
        stack: error.stack
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Procesa los datos de la encuesta y devuelve JSON estructurado
 * con múltiples formatos para diferentes visualizaciones
 */
function procesarDatosEncuesta() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  
  if (!sheet) {
    throw new Error('No se pudo acceder a la hoja de cálculo');
  }
  
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    throw new Error('La hoja no contiene suficientes datos');
  }
  
  const headers = data[0].map(h => String(h).trim());
  const filas = data.slice(1);
  
  // Encontrar índice de la columna de semestre
  const colSemestre = headers.findIndex(h => 
    h.toLowerCase().includes('nivel') || h.toLowerCase().includes('semestre')
  );
  
  if (colSemestre === -1) {
    throw new Error('No se encontró la columna de Nivel/Semestre');
  }
  
  // Identificar columnas a excluir
  const columnasExcluidas = new Set();
  headers.forEach((header, idx) => {
    const headerLower = header.toLowerCase();
    if (headerLower.includes('marca temporal') || 
        headerLower.includes('marca de tiempo') ||
        headerLower.includes('timestamp') ||
        headerLower.includes('elija su carrera') ||
        headerLower.includes('carrera')) {
      columnasExcluidas.add(idx);
    }
  });
  
  // Identificar columnas numéricas y extraer categorías
  const columnasNumericas = [];
  const categoriasMap = new Map();
  
  headers.forEach((header, idx) => {
    if (idx === colSemestre || columnasExcluidas.has(idx)) {
      return;
    }
    
    const categoria = extraerCategoria(header);
    
    if (categoria) {
      columnasNumericas.push(idx);
      categoriasMap.set(idx, categoria);
    }
  });
  
  // Estructuras de datos para diferentes visualizaciones
  const datosPorSemestre = {};
  const todasLasRespuestas = [];
  const distribucionFrecuencias = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const respuestasPorDimension = {};
  
  // Procesar cada fila
  filas.forEach(fila => {
    const semestre = String(fila[colSemestre]).trim();
    
    if (!semestre || semestre === '') {
      return;
    }
    
    if (!datosPorSemestre[semestre]) {
      datosPorSemestre[semestre] = {};
    }
    
    columnasNumericas.forEach(idx => {
      const valor = fila[idx];
      const categoria = categoriasMap.get(idx);
      
      const num = Number(valor);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        // Para promedios por semestre
        if (!datosPorSemestre[semestre][categoria]) {
          datosPorSemestre[semestre][categoria] = [];
        }
        datosPorSemestre[semestre][categoria].push(num);
        
        // Para distribución de frecuencias global
        distribucionFrecuencias[num]++;
        
        // Para respuestas por dimensión
        if (!respuestasPorDimension[categoria]) {
          respuestasPorDimension[categoria] = {
            total: [],
            porSemestre: {}
          };
        }
        respuestasPorDimension[categoria].total.push(num);
        
        if (!respuestasPorDimension[categoria].porSemestre[semestre]) {
          respuestasPorDimension[categoria].porSemestre[semestre] = [];
        }
        respuestasPorDimension[categoria].porSemestre[semestre].push(num);
        
        todasLasRespuestas.push(num);
      }
    });
  });
  
  // Calcular estadísticas por dimensión y semestre
  const datosPorSemestreConEstadisticas = [];
  
  Object.keys(datosPorSemestre).forEach(semestre => {
    const metricas = {};
    
    Object.keys(datosPorSemestre[semestre]).forEach(categoria => {
      const valores = datosPorSemestre[semestre][categoria];
      metricas[categoria] = calcularEstadisticas(valores);
    });
    
    datosPorSemestreConEstadisticas.push({
      semestre: semestre,
      metricas: metricas
    });
  });
  
  // Calcular ranking de dimensiones (global)
  const rankingDimensiones = [];
  Object.keys(respuestasPorDimension).forEach(dimension => {
    const valores = respuestasPorDimension[dimension].total;
    const stats = calcularEstadisticas(valores);
    
    rankingDimensiones.push({
      dimension: dimension,
      ...stats,
      totalRespuestas: valores.length
    });
  });
  
  // Ordenar por promedio descendente
  rankingDimensiones.sort((a, b) => b.promedio - a.promedio);
  
  // Calcular estadísticas globales
  const estadisticasGlobales = calcularEstadisticas(todasLasRespuestas);
  
  // Ordenar semestres
  const ordenSemestres = { 'Sexto': 1, 'Séptimo': 2, 'Octavo': 3 };
  datosPorSemestreConEstadisticas.sort((a, b) => {
    const ordenA = ordenSemestres[a.semestre] || 999;
    const ordenB = ordenSemestres[b.semestre] || 999;
    return ordenA - ordenB;
  });
  
  // Contar estudiantes por semestre
  const estudiantesPorSemestre = {};
  filas.forEach(fila => {
    const semestre = String(fila[colSemestre]).trim();
    if (semestre) {
      estudiantesPorSemestre[semestre] = (estudiantesPorSemestre[semestre] || 0) + 1;
    }
  });
  
  // Retornar objeto completo con múltiples formatos
  return {
    // Formato original (compatibilidad con gráfico actual)
    porSemestre: datosPorSemestreConEstadisticas.map(d => ({
      semestre: d.semestre,
      metricas: Object.keys(d.metricas).reduce((acc, key) => {
        acc[key] = d.metricas[key].promedio;
        return acc;
      }, {})
    })),
    
    // Datos detallados por semestre (con estadísticas completas)
    porSemestreDetallado: datosPorSemestreConEstadisticas,
    
    // Ranking de dimensiones
    rankingDimensiones: rankingDimensiones,
    
    // Distribución de frecuencias
    distribucionFrecuencias: distribucionFrecuencias,
    
    // Estadísticas globales
    estadisticasGlobales: estadisticasGlobales,
    
    // Conteo de estudiantes
    estudiantesPorSemestre: estudiantesPorSemestre,
    totalEstudiantes: filas.length,
    
    // Respuestas por dimensión (para boxplot y análisis detallado)
    respuestasPorDimension: respuestasPorDimension,
    
    // Metadata
    metadata: {
      totalDimensiones: Object.keys(respuestasPorDimension).length,
      totalRespuestas: todasLasRespuestas.length,
      fechaProcesamiento: new Date().toISOString()
    }
  };
}

/**
 * Calcula estadísticas descriptivas de un array de valores
 */
function calcularEstadisticas(valores) {
  if (!valores || valores.length === 0) {
    return {
      promedio: 0,
      mediana: 0,
      desviacionEstandar: 0,
      minimo: 0,
      maximo: 0,
      q1: 0,
      q3: 0,
      count: 0
    };
  }
  
  const sorted = valores.slice().sort((a, b) => a - b);
  const n = sorted.length;
  
  // Promedio
  const promedio = valores.reduce((a, b) => a + b, 0) / n;
  
  // Mediana
  const mediana = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  // Desviación estándar
  const varianza = valores.reduce((sum, val) => sum + Math.pow(val - promedio, 2), 0) / n;
  const desviacionEstandar = Math.sqrt(varianza);
  
  // Cuartiles
  const q1 = percentil(sorted, 25);
  const q3 = percentil(sorted, 75);
  
  return {
    promedio: Math.round(promedio * 100) / 100,
    mediana: Math.round(mediana * 100) / 100,
    desviacionEstandar: Math.round(desviacionEstandar * 100) / 100,
    minimo: sorted[0],
    maximo: sorted[n - 1],
    q1: Math.round(q1 * 100) / 100,
    q3: Math.round(q3 * 100) / 100,
    count: n
  };
}

/**
 * Calcula un percentil de un array ordenado
 */
function percentil(sortedArray, p) {
  const index = (p / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index % 1;
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Extrae el nombre de la categoría desde el header de la columna
 */
function extraerCategoria(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }
  
  const headerTrim = header.trim();
  
  // Patrón 1: "Categoría - Pregunta específica"
  if (headerTrim.includes(' - ')) {
    const partes = headerTrim.split(' - ');
    if (partes.length >= 2 && partes[0].length > 5) {
      return partes[0].trim();
    }
  }
  
  // Patrón 2: "Categoría... resto"
  if (headerTrim.includes('...')) {
    const partes = headerTrim.split('...');
    if (partes[0].length > 5) {
      return partes[0].trim();
    }
  }
  
  // Patrón 3: Primeras palabras significativas
  if (headerTrim.length > 40) {
    const palabras = headerTrim.split(' ');
    if (palabras.length > 3) {
      const posibleCategoria = palabras.slice(0, Math.min(6, palabras.length)).join(' ');
      
      if (posibleCategoria.endsWith('de') || 
          posibleCategoria.endsWith('con') || 
          posibleCategoria.endsWith('la') ||
          posibleCategoria.endsWith('el')) {
        return palabras.slice(0, Math.min(7, palabras.length)).join(' ');
      }
      
      return posibleCategoria;
    }
  }
  
  return null;
}

/**
 * Función de prueba para debugging
 */
function testProcesarDatos() {
  const resultado = procesarDatosEncuesta();
  Logger.log(JSON.stringify(resultado, null, 2));
}

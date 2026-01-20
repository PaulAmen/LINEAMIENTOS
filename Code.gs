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
  
  // Identificar columnas a excluir (solo administrativas, no las dimensiones)
  const columnasExcluidas = new Set();
  headers.forEach((header, idx) => {
    const headerLower = header.toLowerCase().trim();
    // Solo excluir columnas administrativas específicas
    if (headerLower.includes('marca temporal') || 
        headerLower.includes('marca de tiempo') ||
        headerLower.includes('timestamp') ||
        headerLower.startsWith('elija') ||
        headerLower === 'carrera') {
      columnasExcluidas.add(idx);
    }
  });
  
  // Identificar columnas numéricas y extraer categorías
  const columnasNumericas = [];
  const categoriasMap = new Map();
  const preguntasIndividualesMap = new Map(); // NUEVO: para 164 preguntas
  
  headers.forEach((header, idx) => {
    // Excluir: timestamp (col 0), carrera (col 1), semestre (col 2), y otras columnas excluidas
    if (idx === colSemestre || columnasExcluidas.has(idx)) {
      return;
    }
    
    const categoria = extraerCategoria(header);
    
    // Excluir también si la categoría extraída contiene "nivel" o "semestre"
    if (categoria && (categoria.toLowerCase().includes('nivel') || 
                      categoria.toLowerCase().includes('semestre que cursa'))) {
      return;
    }
    
    if (categoria) {
      columnasNumericas.push(idx);
      categoriasMap.set(idx, categoria);
      preguntasIndividualesMap.set(idx, header); // Guardar pregunta completa
    }
  });
  
  // Estructuras de datos para diferentes visualizaciones
  const datosPorSemestre = {};
  const todasLasRespuestas = [];
  const distribucionFrecuencias = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const respuestasPorDimension = {};
  const respuestasPorPreguntaIndividual = []; // NUEVO: Array para 164 preguntas (no objeto)
  const preguntasIndexMap = new Map(); // Mapeo de índice de columna a posición en array
  
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
      const preguntaCompleta = preguntasIndividualesMap.get(idx);
      
      const num = Number(valor);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        // Para promedios por semestre (dimensiones agrupadas)
        if (!datosPorSemestre[semestre][categoria]) {
          datosPorSemestre[semestre][categoria] = [];
        }
        datosPorSemestre[semestre][categoria].push(num);
        
        // Para distribución de frecuencias global
        distribucionFrecuencias[num]++;
        
        // Para respuestas por dimensión (agrupadas)
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
        
        // NUEVO: Para preguntas individuales (164 items) usando ARRAY
        let preguntaIndex = preguntasIndexMap.get(idx);
        
        if (preguntaIndex === undefined) {
          // Primera vez que vemos esta pregunta - crear entrada
          preguntaIndex = respuestasPorPreguntaIndividual.length;
          preguntasIndexMap.set(idx, preguntaIndex);
          
          respuestasPorPreguntaIndividual.push({
            id: preguntaIndex,
            pregunta: preguntaCompleta,
            categoria: categoria,
            indiceColumna: idx,
            total: [],
            porSemestre: {}
          });
        }
        
        // Agregar respuesta
        respuestasPorPreguntaIndividual[preguntaIndex].total.push(num);
        
        if (!respuestasPorPreguntaIndividual[preguntaIndex].porSemestre[semestre]) {
          respuestasPorPreguntaIndividual[preguntaIndex].porSemestre[semestre] = [];
        }
        respuestasPorPreguntaIndividual[preguntaIndex].porSemestre[semestre].push(num);
        
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
  
  // DEBUG: Loggear dimensiones detectadas
  Logger.log('===== DIMENSIONES DETECTADAS =====');
  Logger.log('Total de dimensiones únicas: ' + rankingDimensiones.length);
  Logger.log('Listado completo:');
  rankingDimensiones.forEach((dim, idx) => {
    Logger.log((idx + 1) + '. ' + dim.dimension);
  });
  Logger.log('==================================');
  
  // NUEVO: Calcular ranking de preguntas individuales (164 items)
  const rankingPreguntasIndividuales = respuestasPorPreguntaIndividual.map(preguntaData => {
    const stats = calcularEstadisticas(preguntaData.total);
    
    const porSemestreStats = {};
    Object.keys(preguntaData.porSemestre).forEach(sem => {
      porSemestreStats[sem] = calcularEstadisticas(preguntaData.porSemestre[sem]);
    });
    
    return {
      id: preguntaData.id,
      pregunta: preguntaData.pregunta,
      categoria: preguntaData.categoria,
      promedio: stats.promedio,
      mediana: stats.mediana,
      desviacionEstandar: stats.desviacionEstandar,
      minimo: stats.minimo,
      maximo: stats.maximo,
      q1: stats.q1,
      q3: stats.q3,
      totalRespuestas: stats.count,
      porSemestre: porSemestreStats
    };
  });
  
  // Ordenar por promedio descendente
  rankingPreguntasIndividuales.sort((a, b) => b.promedio - a.promedio);
  
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
    
    // NUEVO: Preguntas individuales
    preguntasIndividuales: rankingPreguntasIndividuales,
    
    // Metadata
    metadata: {
      totalDimensiones: Object.keys(respuestasPorDimension).length,
      totalPreguntasIndividuales: rankingPreguntasIndividuales.length,
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
 * Patrón principal: "Categoría [Pregunta específica]"
 */
function extraerCategoria(header) {
  if (!header || typeof header !== 'string') {
    return null;
  }
  
  const headerTrim = header.trim();
  
  // Patrón PRINCIPAL: "Categoría [Pregunta específica]"
  // Este es el patrón usado en las 164 preguntas de UNESUM
  if (headerTrim.includes('[')) {
    const partes = headerTrim.split('[');
    if (partes.length >= 2 && partes[0].trim().length > 0) {
      return partes[0].trim();
    }
  }
  
  // Patrón alternativo: "Categoría - Pregunta específica"
  if (headerTrim.includes(' - ')) {
    const partes = headerTrim.split(' - ');
    if (partes.length >= 2 && partes[0].length > 0) {
      return partes[0].trim();
    }
  }
  
  // Patrón alternativo: "Categoría... resto"
  if (headerTrim.includes('...')) {
    const partes = headerTrim.split('...');
    if (partes[0].length > 0) {
      return partes[0].trim();
    }
  }
  
  // Si no tiene separadores reconocidos, usar el texto completo como categoría
  // (esto garantiza que ninguna pregunta se quede sin procesar)
  return headerTrim;
}

/**
 * Función de prueba para debugging
 */
function testProcesarDatos() {
  const resultado = procesarDatosEncuesta();
  Logger.log(JSON.stringify(resultado, null, 2));
}

/**
 * Función de debug para ver qué dimensiones se están detectando
 */
function debugDimensiones() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const datos = sheet.getDataRange().getValues();
  const headers = datos[0];
  
  Logger.log('===== ANÁLISIS DE ENCABEZADOS =====');
  Logger.log('Total de columnas: ' + headers.length);
  
  const dimensionesUnicas = new Set();
  
  // Encontrar columna de semestre
  const colSemestre = headers.findIndex(h => 
    h.toLowerCase().includes('nivel') || h.toLowerCase().includes('semestre')
  );
  
  // Identificar columnas a excluir (solo administrativas)
  const columnasExcluidas = new Set();
  headers.forEach((header, idx) => {
    const headerLower = header.toLowerCase().trim();
    if (headerLower.includes('marca temporal') || 
        headerLower.includes('marca de tiempo') ||
        headerLower.includes('timestamp') ||
        headerLower.startsWith('elija') ||
        headerLower === 'carrera') {
      columnasExcluidas.add(idx);
    }
  });
  
  headers.forEach((header, idx) => {
    if (idx === colSemestre || columnasExcluidas.has(idx)) {
      Logger.log('Columna ' + idx + ' EXCLUIDA: ' + header);
      return;
    }
    
    const categoria = extraerCategoria(header);
    
    // Excluir también si la categoría extraída contiene "nivel" o "semestre que cursa"
    if (categoria && (categoria.toLowerCase().includes('nivel') || 
                      categoria.toLowerCase().includes('semestre que cursa'))) {
      Logger.log('Columna ' + idx + ' EXCLUIDA (es semestre): ' + header);
      return;
    }
    
    if (categoria) {
      dimensionesUnicas.add(categoria);
      Logger.log('Columna ' + idx + ' → Dimensión: "' + categoria + '"');
      Logger.log('  Header completo: ' + header);
    } else {
      Logger.log('Columna ' + idx + ' SIN CATEGORÍA: ' + header);
    }
  });
  
  Logger.log('\n===== RESUMEN =====');
  Logger.log('Total de dimensiones únicas detectadas: ' + dimensionesUnicas.size);
  Logger.log('\nListado de dimensiones:');
  Array.from(dimensionesUnicas).sort().forEach((dim, idx) => {
    Logger.log((idx + 1) + '. ' + dim);
  });
  Logger.log('==================');
}

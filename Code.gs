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
 * MAPEO DE INDICADORES A DIMENSIONES (27 indicadores → 6 dimensiones)
 * Cada indicador pertenece a una dimensión superior
 */
const MAPA_INDICADOR_DIMENSION = {
  // DIMENSIÓN 1: FILOSOFÍA INSTITUCIONAL (8 indicadores)
  'Alineación con la Misión de la UNESUM': 'Filosofía Institucional',
  'Alineación con la Visión de la UNESUM': 'Filosofía Institucional',
  'Coherencia interna de la Carrera': 'Filosofía Institucional',
  'Claridad y concisión': 'Filosofía Institucional',
  'Pertinencia y relevancia': 'Filosofía Institucional',
  'Incorporación de principios del Sistema de Educación Superior en el diseño curricular de la Carrera': 'Filosofía Institucional',
  'Coherencia del diseño curricular de la Carrera con la pertinencia social y regional.': 'Filosofía Institucional',
  'Articulación del diseño curricular de la Carrera con los Objetivos de Desarrollo Sostenible (ODS)': 'Filosofía Institucional',

  // DIMENSIÓN 2: EPISTEMOLÓGICA-PEDAGÓGICA (4 indicadores)
  'Metodologías activas de enseñanza-aprendizaje sustentadas en el constructivismo': 'Epistemológica-Pedagógica',
  'Desarrollo del pensamiento crítico y metacognición': 'Epistemológica-Pedagógica',
  'Coherencia entre las unidades temáticas y los resultados de aprendizaje en las subdimensiones: actitudinal, cognitiva y procedimental': 'Epistemológica-Pedagógica',
  'Coherencia entre carga horaria – créditos y equilibrio teoría - práctica': 'Epistemológica-Pedagógica',
  
  // DIMENSIÓN 3: FUNCIONES SUSTANTIVAS (5 indicadores)
  'Articulación docencia-investigación-vinculación': 'Funciones Sustantivas',
  'Proyectos en aula/integradores de saberes': 'Funciones Sustantivas',
  'Investigación formativa progresiva': 'Funciones Sustantivas',
  'Prácticas preprofesionales contextualizadas': 'Funciones Sustantivas',
  'Vinculación con escenarios permanentes': 'Funciones Sustantivas',
  
  // DIMENSIÓN 4: COMPETENCIAS - PERFIL DE EGRESO (6 indicadores)
  'Competencias profesionales específicas': 'Competencias - Perfil de Egreso',
  'Competencias investigativas': 'Competencias - Perfil de Egreso',
  'Competencias digitales e informacionales': 'Competencias - Perfil de Egreso',
  'Competencias de emprendimiento e innovación social': 'Competencias - Perfil de Egreso',
  'Estrategias de inserción laboral': 'Competencias - Perfil de Egreso',
  'Valores institucionales y habilidades blandas': 'Competencias - Perfil de Egreso',
  
  // DIMENSIÓN 5: INNOVACIÓN Y TECNOLOGÍA (3 indicadores)
  'Integración de tecnologías emergentes-recursos didácticos tecnológicos - (TIC, TAC, TEP-IA) en correlación con el conectivismo educativo': 'Innovación y Tecnología',
  'Ambientes de aprendizaje innovadores': 'Innovación y Tecnología',
  'Modalidades de estudio flexibles': 'Innovación y Tecnología',
  
  // DIMENSIÓN 6: SOSTENIBILIDAD E INTERNACIONALIZACIÓN (1 indicador)
  'Sostenibilidad e Internacionalización': 'Sostenibilidad e Internacionalización'
};

/**
 * Función de normalización para claves de indicadores
 * Elimina espacios duplicados y normaliza caracteres especiales si es necesario
 */
function normalizarClave(texto) {
  if (!texto) return '';
  return texto.trim().replace(/\s+/g, ' ');
}

/**
 * Mapeo normalizado para búsquedas resilientes
 */
const MAPA_NORMALIZADO = {};
Object.keys(MAPA_INDICADOR_DIMENSION).forEach(k => {
  MAPA_NORMALIZADO[normalizarClave(k)] = MAPA_INDICADOR_DIMENSION[k];
});

/**
 * Función para buscar dimensión con normalización
 */
function buscarDimension(indicador) {
  if (!indicador) return undefined;
  
  // 1. Intento directo
  if (MAPA_INDICADOR_DIMENSION[indicador]) return MAPA_INDICADOR_DIMENSION[indicador];
  
  // 2. Intento normalizado
  const normalizado = normalizarClave(indicador);
  if (MAPA_NORMALIZADO[normalizado]) return MAPA_NORMALIZADO[normalizado];
  
  // 3. Intento específico para el caso problemático de subdimensiones
  if (normalizado.includes('subdimensiones') && normalizado.includes('actitudinal')) {
    return 'Epistemológica-Pedagógica';
  }
  
  return undefined;
}

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
  
  // Identificar columnas numéricas y extraer indicadores (antes llamados "categorías")
  const columnasNumericas = [];
  const indicadoresMap = new Map(); // Mapeo columna → indicador
  const preguntasIndividualesMap = new Map(); // NUEVO: para 164 preguntas
  
  headers.forEach((header, idx) => {
    // Excluir: timestamp (col 0), carrera (col 1), semestre (col 2), y otras columnas excluidas
    if (idx === colSemestre || columnasExcluidas.has(idx)) {
      return;
    }
    
    const indicador = extraerCategoria(header);
    
    // Excluir también si el indicador extraído contiene "nivel" o "semestre"
    if (indicador && (indicador.toLowerCase().includes('nivel') || 
                      indicador.toLowerCase().includes('semestre que cursa'))) {
      return;
    }
    
    if (indicador) {
      columnasNumericas.push(idx);
      indicadoresMap.set(idx, indicador);
      preguntasIndividualesMap.set(idx, header); // Guardar pregunta completa
    }
  });
  
  // Estructuras de datos para diferentes visualizaciones
  const datosPorSemestre = {};
  const todasLasRespuestas = [];
  const distribucionFrecuencias = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  const respuestasPorIndicador = {}; // Antes llamado respuestasPorDimension (27 indicadores)
  const respuestasPorDimension = {}; // NUEVO: Las 6 dimensiones reales
  const respuestasPorPreguntaIndividual = []; // Array para 164 preguntas
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
      const indicador = indicadoresMap.get(idx);
      const preguntaCompleta = preguntasIndividualesMap.get(idx);
      
      // Usar función de búsqueda resiliente
      const dimension = buscarDimension(indicador);
      
      // Si el indicador no tiene una dimensión mapeada, lo saltamos
      if (!dimension) {
        return; 
      }
      
      const num = Number(valor);
      if (!isNaN(num) && num >= 1 && num <= 6) {
        // Para promedios por semestre (indicadores agrupados)
        if (!datosPorSemestre[semestre][indicador]) {
          datosPorSemestre[semestre][indicador] = [];
        }
        datosPorSemestre[semestre][indicador].push(num);
        
        // Para distribución de frecuencias global
        distribucionFrecuencias[num]++;
        
        // Para respuestas por INDICADOR (27 indicadores)
        if (!respuestasPorIndicador[indicador]) {
          respuestasPorIndicador[indicador] = {
            total: [],
            porSemestre: {},
            dimension: dimension
          };
        }
        respuestasPorIndicador[indicador].total.push(num);
        
        if (!respuestasPorIndicador[indicador].porSemestre[semestre]) {
          respuestasPorIndicador[indicador].porSemestre[semestre] = [];
        }
        respuestasPorIndicador[indicador].porSemestre[semestre].push(num);
        
        // Para respuestas por DIMENSIÓN (6 dimensiones reales)
        if (!respuestasPorDimension[dimension]) {
          respuestasPorDimension[dimension] = {
            total: [],
            porSemestre: {}
          };
        }
        respuestasPorDimension[dimension].total.push(num);
        
        if (!respuestasPorDimension[dimension].porSemestre[semestre]) {
          respuestasPorDimension[dimension].porSemestre[semestre] = [];
        }
        respuestasPorDimension[dimension].porSemestre[semestre].push(num);
        
        // NUEVO: Para preguntas individuales (164 items) usando ARRAY
        let preguntaIndex = preguntasIndexMap.get(idx);
        
        if (preguntaIndex === undefined) {
          // Primera vez que vemos esta pregunta - crear entrada
          preguntaIndex = respuestasPorPreguntaIndividual.length;
          preguntasIndexMap.set(idx, preguntaIndex);
          
          respuestasPorPreguntaIndividual.push({
            id: preguntaIndex,
            pregunta: preguntaCompleta,
            indicador: indicador,
            dimension: dimension,
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
  
  // Calcular estadísticas por INDICADOR y semestre
  const datosPorSemestreConEstadisticas = [];
  
  Object.keys(datosPorSemestre).forEach(semestre => {
    const metricas = {};
    
    Object.keys(datosPorSemestre[semestre]).forEach(indicador => {
      const valores = datosPorSemestre[semestre][indicador];
      metricas[indicador] = calcularEstadisticas(valores);
    });
    
    datosPorSemestreConEstadisticas.push({
      semestre: semestre,
      metricas: metricas
    });
  });
  
  // Calcular ranking de INDICADORES (27 indicadores)
  const rankingIndicadores = [];
  Object.keys(respuestasPorIndicador).forEach(indicador => {
    const valores = respuestasPorIndicador[indicador].total;
    const stats = calcularEstadisticas(valores);
    const dimension = respuestasPorIndicador[indicador].dimension;
    
    rankingIndicadores.push({
      indicador: indicador,
      dimension: dimension,
      ...stats,
      totalRespuestas: valores.length
    });
  });
  
  // Ordenar por promedio descendente
  rankingIndicadores.sort((a, b) => b.promedio - a.promedio);
  
  // Calcular ranking de DIMENSIONES (6 dimensiones reales)
  const rankingDimensiones = [];
  Object.keys(respuestasPorDimension).forEach(dimension => {
    const valores = respuestasPorDimension[dimension].total;
    const stats = calcularEstadisticas(valores);
    
    // Contar cuántos indicadores tiene esta dimensión
    const indicadoresEnDimension = rankingIndicadores.filter(ind => ind.dimension === dimension);
    
    rankingDimensiones.push({
      dimension: dimension,
      ...stats,
      totalRespuestas: valores.length,
      cantidadIndicadores: indicadoresEnDimension.length
    });
  });
  
  // Ordenar por promedio descendente
  rankingDimensiones.sort((a, b) => b.promedio - a.promedio);
  
  // Calcular dimensiones por semestre para gráficos comparativos
  const dimensionesPorSemestre = [];
  Object.keys(datosPorSemestre).forEach(semestre => {
    const metricasDimensiones = {};
    
    Object.keys(respuestasPorDimension).forEach(dimension => {
      const valoresDimension = respuestasPorDimension[dimension].porSemestre[semestre] || [];
      if (valoresDimension.length > 0) {
        metricasDimensiones[dimension] = calcularEstadisticas(valoresDimension);
      }
    });
    
    dimensionesPorSemestre.push({
      semestre: semestre,
      metricas: metricasDimensiones
    });
  });
  
  // DEBUG: Loggear estructura detectada
  Logger.log('===== ESTRUCTURA JERÁRQUICA DETECTADA =====');
  Logger.log('Total de DIMENSIONES: ' + rankingDimensiones.length);
  Logger.log('Total de INDICADORES: ' + rankingIndicadores.length);
  Logger.log('\nListado de DIMENSIONES:');
  rankingDimensiones.forEach((dim, idx) => {
    Logger.log((idx + 1) + '. ' + dim.dimension + ' (' + dim.cantidadIndicadores + ' indicadores)');
  });
  Logger.log('==========================================');
  
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
      indicador: preguntaData.indicador,
      dimension: preguntaData.dimension,
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
    // Formato original - Indicadores por semestre (compatibilidad)
    porSemestre: datosPorSemestreConEstadisticas.map(d => ({
      semestre: d.semestre,
      metricas: Object.keys(d.metricas).reduce((acc, key) => {
        acc[key] = d.metricas[key].promedio;
        return acc;
      }, {})
    })),
    
    // Datos detallados por semestre (con estadísticas completas)
    porSemestreDetallado: datosPorSemestreConEstadisticas,
    
    // NUEVO: Dimensiones por semestre (6 dimensiones)
    dimensionesPorSemestre: dimensionesPorSemestre.map(d => ({
      semestre: d.semestre,
      metricas: Object.keys(d.metricas).reduce((acc, key) => {
        acc[key] = d.metricas[key].promedio;
        return acc;
      }, {})
    })),
    
    // Ranking de las 6 DIMENSIONES (nivel superior)
    rankingDimensiones: rankingDimensiones,
    
    // Ranking de los 27 INDICADORES (nivel medio)
    rankingIndicadores: rankingIndicadores,
    
    // Distribución de frecuencias
    distribucionFrecuencias: distribucionFrecuencias,
    
    // Estadísticas globales
    estadisticasGlobales: estadisticasGlobales,
    
    // Conteo de estudiantes
    estudiantesPorSemestre: estudiantesPorSemestre,
    totalEstudiantes: filas.length,
    
    // Respuestas por dimensión (para boxplot y análisis detallado)
    respuestasPorDimension: respuestasPorDimension,
    
    // Respuestas por indicador (para análisis detallado)
    respuestasPorIndicador: respuestasPorIndicador,
    
    // NUEVO: Preguntas individuales (164 items)
    preguntasIndividuales: rankingPreguntasIndividuales,
    
    // Metadata
    metadata: {
      totalDimensiones: rankingDimensiones.length,
      totalIndicadores: rankingIndicadores.length,
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
 * Función de debug para ver qué indicadores y dimensiones se están detectando
 */
function debugDimensiones() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const datos = sheet.getDataRange().getValues();
  const headers = datos[0];
  
  Logger.log('===== ANÁLISIS DE ENCABEZADOS =====');
  Logger.log('Total de columnas: ' + headers.length);
  
  const indicadoresUnicos = new Set();
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
      // Logger.log('Columna ' + idx + ' EXCLUIDA: ' + header); // Removed for performance
      return;
    }
    
    const indicador = extraerCategoria(header);
    
    // Excluir también si el indicador extraído contiene "nivel" o "semestre"
    if (indicador && (indicador.toLowerCase().includes('nivel') || 
                      indicador.toLowerCase().includes('semestre que cursa'))) {
      // Logger.log('Columna ' + idx + ' EXCLUIDA (es semestre): ' + header); // Removed for performance
      return;
    }
    
      if (indicador) {
      // Usar función de búsqueda resiliente
      const dimension = buscarDimension(indicador);
      
      if (dimension) { // Only log and add if a dimension is found
        indicadoresUnicos.add(indicador);
        dimensionesUnicas.add(dimension);
        // Logger.log('Columna ' + idx + ' → Indicador: "' + indicador + '" → Dimensión: "' + dimension + '"'); // Removed for performance
        // Logger.log('  Header completo: ' + header); // Removed for performance
      } else {
        // Logger.log('Columna ' + idx + ' SIN DIMENSIÓN MAPEADA: ' + header + ' (Ignorado para ranking de dimensiones)'); // Removed for performance
      }
    } else {
      // Logger.log('Columna ' + idx + ' SIN INDICADOR: ' + header); // Removed for performance
    }
  });
  
  Logger.log('\n===== RESUMEN =====');
  Logger.log('Total de DIMENSIONES únicas: ' + dimensionesUnicas.size);
  Logger.log('Total de INDICADORES únicos: ' + indicadoresUnicos.size);
  Logger.log('\nListado de DIMENSIONES:');
  Array.from(dimensionesUnicas).sort().forEach((dim, idx) => {
    Logger.log((idx + 1) + '. ' + dim);
  });
  Logger.log('\nListado de INDICADORES:');
  Array.from(indicadoresUnicos).sort().forEach((ind, idx) => {
    Logger.log((idx + 1) + '. ' + ind);
  });
  Logger.log('==================');
}

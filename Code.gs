/**
 * GOOGLE APPS SCRIPT - BACKEND PARA DASHBOARD EDUCATIVO UNESUM
 * 
 * INSTRUCCIONES DE DESPLIEGUE:
 * 1. Abre https://script.google.com/
 * 2. Crea un nuevo proyecto
 * 3. Pega este código completo
 * 4. Guarda el proyecto (Ctrl+S)
 * 5. Ve a "Implementar" > "Nueva implementación"
 * 6. Tipo: "Aplicación web"
 * 7. Ejecutar como: "Yo"
 * 8. Quién tiene acceso: "Cualquier persona"
 * 9. Haz clic en "Implementar"
 * 10. Copia la URL de la implementación
 * 11. Pega esa URL en src/config.ts del proyecto frontend
 * 
 * VINCULACIÓN DEL SHEET:
 * Reemplaza el SHEET_ID abajo con: 1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek
 */

const SHEET_ID = '1gTUShHOJ5jlN5JBEais547zwYO3jzHL2rBJ3aR6UZek';
const SHEET_NAME = 'Respuestas de formulario 1'; // Primera hoja (ajusta si tiene otro nombre)

/**
 * Función principal que maneja las peticiones HTTP GET
 */
function doGet(e) {
  try {
    const datos = procesarDatosEncuesta();
    
    return ContentService
      .createTextOutput(JSON.stringify(datos))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: true,
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Procesa los datos de la encuesta y devuelve JSON estructurado
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
  
  // Identificar columnas numéricas (preguntas con escala 1-5) y extraer categorías
  const columnasNumericas = [];
  const categoriasMap = new Map(); // Map de índice de columna -> nombre de categoría
  
  headers.forEach((header, idx) => {
    if (idx === colSemestre || columnasExcluidas.has(idx)) {
      return;
    }
    
    // Detectar si es una pregunta numérica (normalmente tienen formato "Categoría - Pregunta específica")
    // Extraemos el prefijo antes de los "..." o antes del primer " - "
    const categoria = extraerCategoria(header);
    
    if (categoria) {
      columnasNumericas.push(idx);
      categoriasMap.set(idx, categoria);
    }
  });
  
  // Agrupar datos por semestre
  const datosPorSemestre = {};
  
  filas.forEach(fila => {
    const semestre = String(fila[colSemestre]).trim();
    
    if (!semestre || semestre === '') {
      return; // Saltar filas sin semestre
    }
    
    if (!datosPorSemestre[semestre]) {
      datosPorSemestre[semestre] = {};
    }
    
    columnasNumericas.forEach(idx => {
      const valor = fila[idx];
      const categoria = categoriasMap.get(idx);
      
      // Validar que sea un número entre 1 y 5
      const num = Number(valor);
      if (!isNaN(num) && num >= 1 && num <= 5) {
        if (!datosPorSemestre[semestre][categoria]) {
          datosPorSemestre[semestre][categoria] = [];
        }
        datosPorSemestre[semestre][categoria].push(num);
      }
    });
  });
  
  // Calcular promedios por categoría y semestre
  const resultado = [];
  
  Object.keys(datosPorSemestre).forEach(semestre => {
    const metricas = {};
    
    Object.keys(datosPorSemestre[semestre]).forEach(categoria => {
      const valores = datosPorSemestre[semestre][categoria];
      const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
      metricas[categoria] = Math.round(promedio * 100) / 100; // 2 decimales
    });
    
    resultado.push({
      semestre: semestre,
      metricas: metricas
    });
  });
  
  // Ordenar por semestre (Sexto, Séptimo, Octavo)
  const ordenSemestres = { 'Sexto': 1, 'Séptimo': 2, 'Octavo': 3 };
  resultado.sort((a, b) => {
    const ordenA = ordenSemestres[a.semestre] || 999;
    const ordenB = ordenSemestres[b.semestre] || 999;
    return ordenA - ordenB;
  });
  
  return resultado;
}

/**
 * Extrae el nombre de la categoría desde el header de la columna
 * Busca patrones como "Categoría - Pregunta" o "Categoría..."
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
  
  // Patrón 3: Si el header es largo y parece una pregunta completa
  // intentamos extraer las primeras palabras significativas
  if (headerTrim.length > 40) {
    // Buscar primeras 4-6 palabras que formen una frase coherente
    const palabras = headerTrim.split(' ');
    if (palabras.length > 3) {
      // Categorías típicas tienen entre 3-8 palabras
      const posibleCategoria = palabras.slice(0, Math.min(6, palabras.length)).join(' ');
      
      // Si termina en preposición o artículo, extender un poco más
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
 * Ejecuta esta función desde el editor para ver el resultado
 */
function testProcesarDatos() {
  const resultado = procesarDatosEncuesta();
  Logger.log(JSON.stringify(resultado, null, 2));
}

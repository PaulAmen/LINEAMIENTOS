<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { APPS_SCRIPT_URL } from '../config';

  Chart.register(...registerables);

  // Interfaces
  interface Estadisticas {
    promedio: number;
    mediana: number;
    desviacionEstandar: number;
    minimo: number;
    maximo: number;
    q1: number;
    q3: number;
    count: number;
  }

  interface DimensionRanking {
    dimension: string;
    promedio: number;
    totalRespuestas: number;
  }

  interface PreguntaIndividual {
    pregunta: string;
    categoria: string;
    promedio: number;
    totalRespuestas: number;
    porSemestre: Record<string, Estadisticas>;
  }

  interface DatosBackend {
    porSemestre: any[];
    rankingDimensiones: DimensionRanking[];
    preguntasIndividuales: PreguntaIndividual[];
    distribucionFrecuencias: Record<number, number>;
    estadisticasGlobales: Estadisticas;
    estudiantesPorSemestre: Record<string, number>;
    totalEstudiantes: number;
    metadata: {
      totalDimensiones: number;
      totalPreguntasIndividuales: number;
      totalRespuestas: number;
      fechaProcesamiento: string;
    };
  }

  // Estado
  let datos = $state<DatosBackend | null>(null);
  let cargando = $state(true);
  let error = $state('');
  let tabActiva = $state('resumen');
  
  // Filtros
  let semestresSeleccionados = $state(new Set<string>());
  let dimensionesSeleccionadas = $state(new Set<string>());
  let semestresDisponibles = $state<string[]>([]);
  let dimensionesDisponibles = $state<string[]>([]);
  
  // Charts
  let chartCircular = $state<Chart | null>(null);
  let chartRanking = $state<Chart | null>(null);
  let chartRadar = $state<Chart | null>(null);
  let chartComparacion = $state<Chart | null>(null);
  let chartPreguntasIndividuales = $state<Chart | null>(null);

  // Canvas refs
  let canvasCircular = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRanking = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRadar = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasComparacion = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasPreguntasIndividuales = $state<HTMLCanvasElement | undefined>(undefined);

  const coloresSemestres: Record<string, string> = {
    'Sexto': '#FF6384',
    'Séptimo': '#36A2EB',
    'Octavo': '#FFCE56',
  };

  async function cargarDatos() {
    cargando = true;
    error = '';

    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
        throw new Error('Configura APPS_SCRIPT_URL en src/config.ts');
      }

      const response = await fetch(APPS_SCRIPT_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const json = await response.json();
      if (json.error) throw new Error(json.message);

      datos = json;
      
      // DEBUG: Verificar dimensiones recibidas
      console.log('===== DEBUG DIMENSIONES =====');
      console.log('Total dimensiones recibidas:', datos.rankingDimensiones.length);
      console.log('Metadata total:', datos.metadata?.totalDimensiones);
      console.log('Listado:', datos.rankingDimensiones.map((d, i) => `${i+1}. ${d.dimension}`));
      console.log('============================');
      
      // Inicializar filtros
      semestresDisponibles = datos.porSemestre.map(s => s.semestre);
      semestresSeleccionados = new Set(semestresDisponibles);
      
      dimensionesDisponibles = datos.rankingDimensiones.map(d => d.dimension);
      dimensionesSeleccionadas = new Set(dimensionesDisponibles.slice(0, 10)); // Por defecto top 10
      
      setTimeout(() => renderizarGraficos(), 100);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar datos';
      console.error(err);
    } finally {
      cargando = false;
    }
  }

  function renderizarGraficos() {
    if (tabActiva === 'resumen') {
      renderizarCircular();
    } else if (tabActiva === 'ranking') {
      renderizarRanking();
    } else if (tabActiva === 'radar') {
      renderizarRadar();
    } else if (tabActiva === 'comparacion') {
      renderizarComparacion();
    } else if (tabActiva === 'analisis') {
      renderizarComparacion(); // Mismo gráfico pero con filtros
    } else if (tabActiva === 'preguntas') {
      renderizarPreguntasIndividuales();
    }
  }

  function renderizarCircular() {
    if (!canvasCircular || !datos) return;
    if (chartCircular) chartCircular.destroy();

    const ctx = canvasCircular.getContext('2d');
    if (!ctx) return;

    const semestres = Object.keys(datos.estudiantesPorSemestre);
    const estudiantes = Object.values(datos.estudiantesPorSemestre);

    chartCircular = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: semestres,
        datasets: [{
          data: estudiantes,
          backgroundColor: semestres.map(s => coloresSemestres[s] || '#999'),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Estudiantes por Semestre',
            font: { size: 16, weight: 'bold' }
          },
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = datos!.totalEstudiantes;
                const valor = context.parsed as number;
                const porcentaje = ((valor / total) * 100).toFixed(1);
                return `${context.label}: ${valor} (${porcentaje}%)`;
              }
            }
          }
        }
      }
    });
  }

  function renderizarRanking() {
    if (!canvasRanking || !datos) return;
    if (chartRanking) chartRanking.destroy();

    const ctx = canvasRanking.getContext('2d');
    if (!ctx) return;

    // MOSTRAR TODAS LAS DIMENSIONES (no solo 20)
    const todasDimensiones = datos.rankingDimensiones;

    chartRanking = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: todasDimensiones.map(d => {
          // Truncar para la etiqueta visual
          return d.dimension.length > 50 
            ? d.dimension.substring(0, 50) + '...' 
            : d.dimension;
        }),
        datasets: [{
          label: 'Promedio',
          data: todasDimensiones.map(d => d.promedio),
          backgroundColor: todasDimensiones.map((d, i) => {
            const total = todasDimensiones.length;
            if (i < 5) return '#4CAF50'; // Top 5 verde
            if (i >= total - 5) return '#F44336'; // Bottom 5 rojo
            return '#2196F3'; // Medio azul
          }),
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Ranking de las ${todasDimensiones.length} Dimensiones Educativas`,
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              // MOSTRAR NOMBRE COMPLETO EN TOOLTIP
              title: (context) => {
                const index = context[0].dataIndex;
                return todasDimensiones[index].dimension;
              },
              label: (context) => `Promedio: ${context.parsed.x.toFixed(2)} / 5`
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            title: { display: true, text: 'Promedio (escala 1-5)' }
          },
          y: {
            ticks: {
              font: { size: 9 }
            }
          }
        }
      }
    });
  }

  function renderizarRadar() {
    if (!canvasRadar || !datos) return;
    if (chartRadar) chartRadar.destroy();

    const ctx = canvasRadar.getContext('2d');
    if (!ctx) return;

    const top8 = datos.rankingDimensiones.slice(0, 8);
    const labels = top8.map(d => d.dimension.substring(0, 30) + '...');

    const datasets = datos.porSemestre.map(sem => ({
      label: sem.semestre,
      data: top8.map(dim => sem.metricas[dim.dimension] || 0),
      backgroundColor: coloresSemestres[sem.semestre] + '33',
      borderColor: coloresSemestres[sem.semestre],
      borderWidth: 2,
      pointBackgroundColor: coloresSemestres[sem.semestre],
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: coloresSemestres[sem.semestre]
    }));

    chartRadar = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Perfil Curricular por Semestre (Top 8 Dimensiones)',
            font: { size: 16, weight: 'bold' }
          },
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return top8[index].dimension;
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 5,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
  }

  function renderizarComparacion() {
    if (!canvasComparacion || !datos) return;
    if (chartComparacion) chartComparacion.destroy();

    const ctx = canvasComparacion.getContext('2d');
    if (!ctx) return;

    // Filtrar por dimensiones seleccionadas
    const dimensionesFiltradas = Array.from(dimensionesSeleccionadas);
    const semestresFiltrados = datos.porSemestre.filter(s => 
      semestresSeleccionados.has(s.semestre)
    );

    if (dimensionesFiltradas.length === 0 || semestresFiltrados.length === 0) {
      return;
    }

    // BARRAS AGRUPADAS (LADO A LADO, NO APILADAS)
    const datasets = semestresFiltrados.map(sem => ({
      label: sem.semestre,
      data: dimensionesFiltradas.map(dim => sem.metricas[dim] || 0),
      backgroundColor: coloresSemestres[sem.semestre] + 'CC',
      borderColor: coloresSemestres[sem.semestre],
      borderWidth: 1
      // NO incluir 'stack' para que queden lado a lado
    }));

    chartComparacion = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dimensionesFiltradas.map(d => {
          return d.length > 40 ? d.substring(0, 40) + '...' : d;
        }),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Comparación por Semestre (${dimensionesFiltradas.length} Dimensiones)`,
            font: { size: 16, weight: 'bold' }
          },
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return dimensionesFiltradas[index];
              },
              label: (context) => {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} / 5`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: { size: 9 }
            }
          },
          y: {
            beginAtZero: true,
            max: 5,
            title: { display: true, text: 'Promedio (1-5)' }
          }
        }
      }
    });
  }

  function renderizarPreguntasIndividuales() {
    if (!canvasPreguntasIndividuales || !datos || !datos.preguntasIndividuales) return;
    if (chartPreguntasIndividuales) chartPreguntasIndividuales.destroy();

    const ctx = canvasPreguntasIndividuales.getContext('2d');
    if (!ctx) return;

    // Tomar las 164 preguntas (o las que haya)
    const todasPreguntas = datos.preguntasIndividuales;

    // Colores para ranking (verde=top, azul=medio, rojo=bajo)
    const colores = todasPreguntas.map((_, idx) => {
      const porcentaje = idx / todasPreguntas.length;
      if (porcentaje < 0.2) return '#4CAF50'; // Top 20% verde
      if (porcentaje > 0.8) return '#F44336'; // Bottom 20% rojo
      return '#2196F3'; // Medio azul
    });

    chartPreguntasIndividuales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: todasPreguntas.map(p => {
          // Truncar pregunta larga
          return p.pregunta.length > 60 ? p.pregunta.substring(0, 60) + '...' : p.pregunta;
        }),
        datasets: [{
          label: 'Promedio',
          data: todasPreguntas.map(p => p.promedio),
          backgroundColor: colores.map(c => c + 'CC'),
          borderColor: colores,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Ranking de las ${todasPreguntas.length} Preguntas Individuales`,
            font: { size: 18, weight: 'bold' }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (context) => {
                const index = context[0].dataIndex;
                return todasPreguntas[index].pregunta;
              },
              label: (context) => {
                const index = context.dataIndex;
                const pregunta = todasPreguntas[index];
                return [
                  `Promedio: ${pregunta.promedio.toFixed(2)} / 5`,
                  `Categoría: ${pregunta.categoria}`,
                  `Respuestas: ${pregunta.totalRespuestas}`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 5,
            title: { display: true, text: 'Promedio (1-5)' }
          },
          y: {
            ticks: {
              font: { size: 8 },
              autoSkip: false
            }
          }
        }
      }
    });
  }

  function cambiarTab(tab: string) {
    tabActiva = tab;
    setTimeout(() => renderizarGraficos(), 50);
  }

  function toggleSemestre(semestre: string) {
    if (semestresSeleccionados.has(semestre)) {
      semestresSeleccionados.delete(semestre);
    } else {
      semestresSeleccionados.add(semestre);
    }
    semestresSeleccionados = new Set(semestresSeleccionados);
    renderizarComparacion();
  }

  function toggleDimension(dimension: string) {
    if (dimensionesSeleccionadas.has(dimension)) {
      dimensionesSeleccionadas.delete(dimension);
    } else {
      dimensionesSeleccionadas.add(dimension);
    }
    dimensionesSeleccionadas = new Set(dimensionesSeleccionadas);
    renderizarComparacion();
  }

  function seleccionarTodosSemestres() {
    semestresSeleccionados = new Set(semestresDisponibles);
    renderizarComparacion();
  }

  function deseleccionarTodosSemestres() {
    semestresSeleccionados = new Set();
    renderizarComparacion();
  }

  function seleccionarTodasDimensiones() {
    dimensionesSeleccionadas = new Set(dimensionesDisponibles);
    renderizarComparacion();
  }

  function deseleccionarTodasDimensiones() {
    dimensionesSeleccionadas = new Set();
    renderizarComparacion();
  }

  onMount(() => {
    cargarDatos();
  });
</script>

<div class="dashboard">
  <header class="header">
    <h1>Dashboard Carrera Educación UNESUM</h1>
    <p>Análisis de Evaluación Curricular - 604 Estudiantes</p>
  </header>

  {#if cargando}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando datos del backend...</p>
    </div>
  {:else if error}
    <div class="error">
      <h3>Error al cargar datos</h3>
      <p>{error}</p>
      <button onclick={cargarDatos}>Reintentar</button>
    </div>
  {:else if datos}
    <!-- KPIs -->
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-value">{datos.totalEstudiantes}</div>
        <div class="kpi-label">Estudiantes</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{datos.estadisticasGlobales.promedio.toFixed(2)}</div>
        <div class="kpi-label">Media Global</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{datos.rankingDimensiones.length}</div>
        <div class="kpi-label">Dimensiones</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{datos.metadata?.totalPreguntasIndividuales || 164}</div>
        <div class="kpi-label">Preguntas</div>
      </div>
      <div class="kpi success">
        <div class="kpi-value">{datos.rankingDimensiones[0].promedio.toFixed(2)}</div>
        <div class="kpi-label" title={datos.rankingDimensiones[0].dimension}>
          Mejor: {datos.rankingDimensiones[0].dimension.substring(0, 20)}...
        </div>
      </div>
      <div class="kpi danger">
        <div class="kpi-value">{datos.rankingDimensiones[datos.rankingDimensiones.length - 1].promedio.toFixed(2)}</div>
        <div class="kpi-label" title={datos.rankingDimensiones[datos.rankingDimensiones.length - 1].dimension}>
          Menor: {datos.rankingDimensiones[datos.rankingDimensiones.length - 1].dimension.substring(0, 20)}...
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class:active={tabActiva === 'resumen'} onclick={() => cambiarTab('resumen')}>
        📊 Resumen
      </button>
      <button class:active={tabActiva === 'ranking'} onclick={() => cambiarTab('ranking')}>
        📈 Ranking ({datos.rankingDimensiones.length} Dimensiones)
      </button>
      <button class:active={tabActiva === 'preguntas'} onclick={() => cambiarTab('preguntas')}>
        📋 Preguntas Individuales ({datos.metadata?.totalPreguntasIndividuales || 164})
      </button>
      <button class:active={tabActiva === 'radar'} onclick={() => cambiarTab('radar')}>
        🕸️ Perfil
      </button>
      <button class:active={tabActiva === 'comparacion'} onclick={() => cambiarTab('comparacion')}>
        📊 Comparación
      </button>
      <button class:active={tabActiva === 'analisis'} onclick={() => cambiarTab('analisis')}>
        🔍 Análisis Personalizado
      </button>
    </div>

    <!-- Contenido de tabs -->
    <div class="tab-content">
      {#if tabActiva === 'resumen'}
        <div class="chart-container small">
          <canvas bind:this={canvasCircular}></canvas>
        </div>
        
      {:else if tabActiva === 'ranking'}
        <div class="chart-container xlarge">
          <canvas bind:this={canvasRanking}></canvas>
        </div>
        
      {:else if tabActiva === 'preguntas'}
        {#if datos.preguntasIndividuales && datos.preguntasIndividuales.length > 0}
          <div class="chart-container xxlarge">
            <canvas bind:this={canvasPreguntasIndividuales}></canvas>
          </div>
        {:else}
          <div class="error">
            <h3>⚠️ Actualización Requerida</h3>
            <p>Para ver las 164 preguntas individuales, necesitas actualizar el backend de Google Apps Script.</p>
            <ol style="text-align: left; max-width: 600px; margin: 1rem auto;">
              <li>Abre <a href="https://script.google.com/" target="_blank">script.google.com</a></li>
              <li>Abre tu proyecto "Backend Dashboard UNESUM"</li>
              <li>Reemplaza TODO el código con el archivo <code>Code.gs</code> actualizado</li>
              <li>Guarda (Ctrl+S) y recarga esta página</li>
            </ol>
          </div>
        {/if}
        
      {:else if tabActiva === 'radar'}
        <div class="chart-container medium">
          <canvas bind:this={canvasRadar}></canvas>
        </div>
        
      {:else if tabActiva === 'comparacion'}
        <div class="chart-container large">
          <canvas bind:this={canvasComparacion}></canvas>
        </div>
        
      {:else if tabActiva === 'analisis'}
        <!-- PESTAÑA CON FILTROS -->
        <div class="filtros-container">
          <div class="filtro-grupo">
            <h3>Filtrar por Semestre</h3>
            <div class="filtro-acciones">
              <button onclick={seleccionarTodosSemestres} class="btn-small">Todos</button>
              <button onclick={deseleccionarTodosSemestres} class="btn-small">Ninguno</button>
            </div>
            <div class="checkbox-group">
              {#each semestresDisponibles as semestre}
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    checked={semestresSeleccionados.has(semestre)}
                    onchange={() => toggleSemestre(semestre)}
                  />
                  <span style="color: {coloresSemestres[semestre]}">{semestre}</span>
                </label>
              {/each}
            </div>
          </div>

          <div class="filtro-grupo">
            <h3>Filtrar por Dimensión</h3>
            <div class="filtro-acciones">
              <button onclick={seleccionarTodasDimensiones} class="btn-small">Todas</button>
              <button onclick={deseleccionarTodasDimensiones} class="btn-small">Ninguna</button>
            </div>
            <div class="checkbox-group scroll">
              {#each dimensionesDisponibles as dimension}
                <label class="checkbox-label" title={dimension}>
                  <input
                    type="checkbox"
                    checked={dimensionesSeleccionadas.has(dimension)}
                    onchange={() => toggleDimension(dimension)}
                  />
                  <span>{dimension.substring(0, 50)}{dimension.length > 50 ? '...' : ''}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>
        
        <div class="chart-container large">
          <canvas bind:this={canvasComparacion}></canvas>
        </div>
      {/if}
    </div>
  {/if}

  <footer class="footer">
    <p>Dashboard Carrera Educación UNESUM | Contacto: <a href="mailto:paul.amen@unesum.edu.ec">paul.amen@unesum.edu.ec</a></p>
  </footer>
</div>

<style>
  .dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .header {
    text-align: center;
    padding: 2rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 4rem 2rem;
  }

  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #667eea;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    background: #fee;
    border: 2px solid #fcc;
    border-radius: 8px;
    padding: 2rem;
    text-align: center;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .kpis {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .kpi {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
  }

  .kpi.success {
    border-left: 4px solid #4CAF50;
  }

  .kpi.danger {
    border-left: 4px solid #F44336;
  }

  .kpi-value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
  }

  .kpi-label {
    font-size: 0.85rem;
    color: #666;
    margin-top: 0.5rem;
    cursor: help;
  }

  .tabs {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
  }

  .tabs button {
    padding: 0.75rem 1.5rem;
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
  }

  .tabs button:hover {
    background: #f5f5f5;
  }

  .tabs button.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .tab-content {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .chart-container {
    position: relative;
  }

  .chart-container.small {
    height: 400px;
  }

  .chart-container.medium {
    height: 500px;
  }

  .chart-container.large {
    height: 700px;
  }

  .chart-container.xlarge {
    height: 1200px;
  }

  .chart-container.xxlarge {
    height: 3500px; /* Para mostrar las 164 preguntas */
  }

  .filtros-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .filtro-grupo {
    background: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
  }

  .filtro-grupo h3 {
    font-size: 1.1rem;
    margin-bottom: 1rem;
    color: #333;
  }

  .filtro-acciones {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .btn-small {
    padding: 0.4rem 0.8rem;
    background: #f0f0f0;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .btn-small:hover {
    background: #e0e0e0;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .checkbox-group.scroll {
    max-height: 300px;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    padding: 0.3rem 0;
    transition: background 0.2s;
  }

  .checkbox-label:hover {
    background: #fff;
    padding-left: 0.5rem;
    border-radius: 4px;
  }

  .checkbox-label input[type="checkbox"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  .checkbox-label span {
    font-size: 0.95rem;
    user-select: none;
  }

  @media (max-width: 768px) {
    .header h1 {
      font-size: 1.5rem;
    }

    .kpis {
      grid-template-columns: repeat(2, 1fr);
    }

    .tabs {
      flex-direction: column;
    }

    .tabs button {
      border-radius: 8px;
    }

    .chart-container.large,
    .chart-container.xlarge {
      height: 500px;
    }

    .filtros-container {
      grid-template-columns: 1fr;
    }
  }

  .footer {
    text-align: center;
    padding: 2rem;
    margin-top: 3rem;
    background: #f5f5f5;
    border-top: 2px solid #e0e0e0;
    border-radius: 8px;
    color: #666;
    font-size: 0.95rem;
  }

  .footer a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .footer a:hover {
    color: #764ba2;
    text-decoration: underline;
  }
</style>

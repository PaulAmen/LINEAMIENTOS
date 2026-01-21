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

  interface IndicadorRanking {
    indicador: string;
    dimension: string;
    promedio: number;
    totalRespuestas: number;
  }

  interface PreguntaIndividual {
    pregunta: string;
    indicador: string;
    dimension: string;
    promedio: number;
    totalRespuestas: number;
    porSemestre: Record<string, Estadisticas>;
  }

  interface DatosBackend {
    porSemestre: any[];
    dimensionesPorSemestre: { semestre: string; metricas: Record<string, number> }[];
    rankingDimensiones: DimensionRanking[];
    rankingIndicadores: IndicadorRanking[];
    preguntasIndividuales: PreguntaIndividual[];
    distribucionFrecuencias: Record<number, number>;
    estadisticasGlobales: Estadisticas;
    estudiantesPorSemestre: Record<string, number>;
    totalEstudiantes: number;
    metadata: {
      totalDimensiones: number;
      totalIndicadores: number;
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
  let dimensionesRealesSeleccionadas = $state(new Set<string>());
  let semestresDisponibles = $state<string[]>([]);
  let dimensionesRealesDisponibles = $state<string[]>([]);
  
  // Charts
  let chartCircular = $state<Chart | null>(null);
  let chartRanking = $state<Chart | null>(null);
  let chartRankingIndicadores = $state<Chart | null>(null);
  let chartRadar = $state<Chart | null>(null);
  let chartComparacion = $state<Chart | null>(null);
  let chartPreguntasIndividuales = $state<Chart | null>(null);

  // Canvas refs
  let canvasCircular = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRanking = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRankingIndicadores = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRadar = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasComparacion = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasPreguntasIndividuales = $state<HTMLCanvasElement | undefined>(undefined);

  const coloresSemestres: Record<string, string> = {
    'Sexto': '#FF6384',
    'Séptimo': '#36A2EB',
    'Octavo': '#FFCE56',
  };

  const coloresDimensiones: Record<string, string> = {
    'Filosofía Institucional': '#8B5CF6',
    'Epistemológica-Pedagógica': '#3B82F6',
    'Funciones Sustantivas': '#10B981',
    'Competencias - Perfil de Egreso': '#F59E0B',
    'Innovación y Tecnología': '#EF4444',
    'Sostenibilidad e Internacionalización': '#EC4899',
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
      
      // Inicializar filtros
      semestresDisponibles = datos.porSemestre.map(s => s.semestre);
      semestresSeleccionados = new Set(semestresDisponibles);
      
      dimensionesRealesDisponibles = datos.rankingDimensiones.map(d => d.dimension);
      dimensionesRealesSeleccionadas = new Set(dimensionesRealesDisponibles);
      
      setTimeout(() => renderizarGraficos(), 100);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar datos';
      console.error(err);
    } finally {
      cargando = false;
    }
  }

  function renderizarGraficos() {
    if (!datos) return;

    if (chartCircular) chartCircular.destroy();
    if (chartRanking) chartRanking.destroy();
    if (chartRadar) chartRadar.destroy();
    if (chartComparacion) chartComparacion.destroy();
    if (chartPreguntasIndividuales) chartPreguntasIndividuales.destroy();
    if (chartRankingIndicadores) chartRankingIndicadores.destroy();

    if (tabActiva === 'resumen') {
      renderizarCircular();
    } else if (tabActiva === 'dimensiones') {
      renderizarRankingDimensiones();
    } else if (tabActiva === 'indicadores') {
      renderizarRankingIndicadores();
    } else if (tabActiva === 'preguntas') {
      renderizarPreguntasIndividuales();
    } else if (tabActiva === 'radar') {
      renderizarRadar();
    } else if (tabActiva === 'analisis') {
      renderizarComparacion();
    }
  }

  function renderizarCircular() {
    if (!canvasCircular || !datos) return;
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
          title: { display: true, text: 'Distribución de Estudiantes por Semestre', font: { size: 16 } },
          legend: { position: 'bottom' }
        }
      }
    });
  }

  function renderizarRankingDimensiones() {
    if (!canvasRanking || !datos) return;
    const ctx = canvasRanking.getContext('2d');
    if (!ctx) return;

    const todasDimensiones = datos.rankingDimensiones;

    chartRanking = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: todasDimensiones.map(d => d.dimension),
        datasets: [{
          label: 'Promedio',
          data: todasDimensiones.map(d => d.promedio),
          backgroundColor: todasDimensiones.map(d => coloresDimensiones[d.dimension] || '#2196F3'),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: 'Ranking de las 6 Dimensiones Educativas', font: { size: 16 } },
          legend: { display: false }
        },
        scales: { x: { beginAtZero: true, max: 5 } }
      }
    });
  }

  function renderizarRankingIndicadores() {
    if (!canvasRankingIndicadores || !datos) return;
    const ctx = canvasRankingIndicadores.getContext('2d');
    if (!ctx) return;

    // Filtrar indicadores por las dimensiones reales seleccionadas en el análisis (o todas)
    const indicadoresFiltrados = datos.rankingIndicadores.filter(ind => 
      dimensionesRealesSeleccionadas.size === 0 || dimensionesRealesSeleccionadas.has(ind.dimension)
    );

    chartRankingIndicadores = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: indicadoresFiltrados.map(i => i.indicador.length > 50 ? i.indicador.substring(0, 50) + '...' : i.indicador),
        datasets: [{
          label: 'Promedio',
          data: indicadoresFiltrados.map(i => i.promedio),
          backgroundColor: indicadoresFiltrados.map(i => coloresDimensiones[i.dimension] || '#2196F3'),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: `Ranking de Indicadores (${indicadoresFiltrados.length})`, font: { size: 16 } },
          legend: { display: false }
        },
        scales: { x: { beginAtZero: true, max: 5 } }
      }
    });
  }

  function renderizarRadar() {
    if (!canvasRadar || !datos) return;
    const ctx = canvasRadar.getContext('2d');
    if (!ctx) return;

    const topDimensions = datos.rankingDimensiones;
    const labels = topDimensions.map(d => d.dimension.substring(0, 20) + '...');

    const datasets = datos.dimensionesPorSemestre.map(semData => ({
      label: semData.semestre,
      data: topDimensions.map(dim => semData.metricas[dim.dimension] || 0),
      backgroundColor: coloresSemestres[semData.semestre] + '33',
      borderColor: coloresSemestres[semData.semestre],
      borderWidth: 2
    }));

    chartRadar = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } }
      }
    });
  }

  function renderizarComparacion() {
    if (!canvasComparacion || !datos) return;
    // CRITICAL FIX: Destroy existing chart instance before re-creating
    if (chartComparacion) chartComparacion.destroy();
    
    const ctx = canvasComparacion.getContext('2d');
    if (!ctx) return;

    const dimensionesFiltradas = Array.from(dimensionesRealesSeleccionadas);
    const semestresFiltrados = datos.dimensionesPorSemestre.filter(s => semestresSeleccionados.has(s.semestre));

    const datasets = semestresFiltrados.map(semData => ({
      label: semData.semestre,
      data: dimensionesFiltradas.map(dim => semData.metricas[dim] || 0),
      backgroundColor: coloresSemestres[semData.semestre] + 'CC',
      borderColor: coloresSemestres[semData.semestre],
      borderWidth: 1
    }));

    chartComparacion = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dimensionesFiltradas.map(d => d.substring(0, 30) + '...'),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { title: { display: true, text: 'Comparación por Dimensión y Semestre' } },
        scales: { y: { beginAtZero: true, max: 5 } }
      }
    });
  }

  function renderizarPreguntasIndividuales() {
    if (!canvasPreguntasIndividuales || !datos) return;
    const ctx = canvasPreguntasIndividuales.getContext('2d');
    if (!ctx) return;

    const todasPreguntas = datos.preguntasIndividuales;
    const colores = todasPreguntas.map((_, idx) => {
      const porcentaje = idx / todasPreguntas.length;
      if (porcentaje < 0.2) return '#4CAF50';
      if (porcentaje > 0.8) return '#F44336';
      return '#2196F3';
    });

    chartPreguntasIndividuales = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: todasPreguntas.map(p => p.pregunta.substring(0, 60) + '...'),
        datasets: [{
          label: 'Promedio',
          data: todasPreguntas.map(p => p.promedio),
          backgroundColor: colores,
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: { display: true, text: `Ranking de las ${todasPreguntas.length} Preguntas Individuales` },
          tooltip: {
            callbacks: {
              title: (context) => todasPreguntas[context[0].dataIndex].pregunta,
              label: (context) => `Promedio: ${context.parsed.x.toFixed(2)}`
            }
          }
        },
        scales: { x: { beginAtZero: true, max: 5 }, y: { ticks: { font: { size: 8 } } } }
      }
    });
  }

  function cambiarTab(tab: string) {
    tabActiva = tab;
    setTimeout(() => renderizarGraficos(), 50);
  }

  function toggleSemestre(semestre: string) {
    if (semestresSeleccionados.has(semestre)) semestresSeleccionados.delete(semestre);
    else semestresSeleccionados.add(semestre);
    semestresSeleccionados = new Set(semestresSeleccionados);
    renderizarComparacion();
  }

  function toggleDimension(dimension: string) {
    if (dimensionesRealesSeleccionadas.has(dimension)) dimensionesRealesSeleccionadas.delete(dimension);
    else dimensionesRealesSeleccionadas.add(dimension);
    dimensionesRealesSeleccionadas = new Set(dimensionesRealesSeleccionadas);
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
    dimensionesRealesSeleccionadas = new Set(dimensionesRealesDisponibles);
    renderizarComparacion();
  }

  function deseleccionarTodasDimensiones() {
    dimensionesRealesSeleccionadas = new Set();
    renderizarComparacion();
  }

  onMount(() => cargarDatos());
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
        <div class="kpi-value">{datos.rankingIndicadores.length}</div>
        <div class="kpi-label">Indicadores</div>
      </div>
      <div class="kpi">
        <div class="kpi-value">{datos.preguntasIndividuales.length}</div>
        <div class="kpi-label">Preguntas</div>
      </div>
      <div class="kpi success">
        <div class="kpi-value">{datos.rankingDimensiones[0].promedio.toFixed(2)}</div>
        <div class="kpi-label">Mejor Dimensión</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class:active={tabActiva === 'resumen'} onclick={() => cambiarTab('resumen')}>📊 Resumen</button>
      <button class:active={tabActiva === 'dimensiones'} onclick={() => cambiarTab('dimensiones')}>📈 Dimensiones (6)</button>
      <button class:active={tabActiva === 'indicadores'} onclick={() => cambiarTab('indicadores')}>📊 Indicadores (27)</button>
      <button class:active={tabActiva === 'preguntas'} onclick={() => cambiarTab('preguntas')}>📋 Preguntas (164)</button>
      <button class:active={tabActiva === 'radar'} onclick={() => cambiarTab('radar')}>🕸️ Radar</button>
      <button class:active={tabActiva === 'analisis'} onclick={() => cambiarTab('analisis')}>🔍 Análisis</button>
    </div>

    <!-- Contenido -->
    <div class="tab-content">
      {#if tabActiva === 'resumen'}
        <div class="chart-container small"><canvas bind:this={canvasCircular}></canvas></div>
      {:else if tabActiva === 'dimensiones'}
        <div class="chart-container xlarge"><canvas bind:this={canvasRanking}></canvas></div>
      {:else if tabActiva === 'indicadores'}
        <div class="chart-container xlarge"><canvas bind:this={canvasRankingIndicadores}></canvas></div>
      {:else if tabActiva === 'preguntas'}
        <div class="chart-container xxlarge"><canvas bind:this={canvasPreguntasIndividuales}></canvas></div>
      {:else if tabActiva === 'radar'}
        <div class="chart-container medium"><canvas bind:this={canvasRadar}></canvas></div>
      {:else if tabActiva === 'analisis'}
        <div class="filtros-container">
          <div class="filtro-grupo">
            <h3>Filtrar por Semestre</h3>
            <div class="checkbox-group">
              {#each semestresDisponibles as semestre}
                <label class="checkbox-label">
                  <input type="checkbox" checked={semestresSeleccionados.has(semestre)} onchange={() => toggleSemestre(semestre)} />
                  <span style="color: {coloresSemestres[semestre]}">{semestre}</span>
                </label>
              {/each}
            </div>
          </div>
          <div class="filtro-grupo">
            <h3>Filtrar por Dimensión Real</h3>
            <div class="checkbox-group scroll">
              {#each dimensionesRealesDisponibles as dimension}
                <label class="checkbox-label">
                  <input type="checkbox" checked={dimensionesRealesSeleccionadas.has(dimension)} onchange={() => toggleDimension(dimension)} />
                  <span>{dimension}</span>
                </label>
              {/each}
            </div>
          </div>
        </div>
        <div class="chart-container large"><canvas bind:this={canvasComparacion}></canvas></div>
      {/if}
    </div>
  {/if}

  <footer class="footer">
    <p>Dashboard Carrera Educación UNESUM | Contacto: <a href="mailto:paul.amen@unesum.edu.ec">paul.amen@unesum.edu.ec</a></p>
  </footer>
</div>

<style>
  .dashboard { max-width: 1400px; margin: 0 auto; padding: 1rem; font-family: sans-serif; }
  .header { text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin-bottom: 2rem; }
  .kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
  .kpi { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; border-bottom: 4px solid #ddd; }
  .kpi.success { border-bottom-color: #4CAF50; }
  .kpi-value { font-size: 2rem; font-weight: bold; }
  .kpi-label { font-size: 0.9rem; color: #666; margin-top: 0.5rem; }
  .tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
  .tabs button { padding: 0.75rem 1.2rem; background: white; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; }
  .tabs button.active { background: #667eea; color: white; border-color: #667eea; }
  .tab-content { background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); padding: 1.5rem; min-height: 500px; }
  .chart-container { position: relative; width: 100%; }
  .chart-container.small { height: 350px; }
  .chart-container.medium { height: 500px; }
  .chart-container.large { height: 600px; }
  .chart-container.xlarge { height: 800px; }
  .chart-container.xxlarge { height: 3500px; }
  .filtros-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
  .filtro-grupo { background: #f9f9f9; padding: 1rem; border-radius: 8px; border: 1px solid #eee; }
  .checkbox-group { display: flex; flex-direction: column; gap: 0.5rem; }
  .checkbox-group.scroll { max-height: 250px; overflow-y: auto; }
  .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem; }
  .loading { text-align: center; padding: 5rem; }
  .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  
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
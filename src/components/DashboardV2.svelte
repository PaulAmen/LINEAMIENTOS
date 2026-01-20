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

  interface DatosBackend {
    porSemestre: any[];
    rankingDimensiones: DimensionRanking[];
    distribucionFrecuencias: Record<number, number>;
    estadisticasGlobales: Estadisticas;
    estudiantesPorSemestre: Record<string, number>;
    totalEstudiantes: number;
  }

  // Estado
  let datos = $state<DatosBackend | null>(null);
  let cargando = $state(true);
  let error = $state('');
  let tabActiva = $state('resumen');
  
  // Charts
  let chartCircular = $state<Chart | null>(null);
  let chartRanking = $state<Chart | null>(null);
  let chartRadar = $state<Chart | null>(null);
  let chartDistribucion = $state<Chart | null>(null);
  let chartApiladas = $state<Chart | null>(null);

  // Canvas refs
  let canvasCircular = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRanking = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasRadar = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasDistribucion = $state<HTMLCanvasElement | undefined>(undefined);
  let canvasApiladas = $state<HTMLCanvasElement | undefined>(undefined);

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
      
      // Renderizar gráfico inicial
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
    } else if (tabActiva === 'distribucion') {
      renderizarDistribucion();
    } else if (tabActiva === 'comparacion') {
      renderizarApiladas();
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

    const top20 = datos.rankingDimensiones.slice(0, 20);

    chartRanking = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: top20.map(d => d.dimension),
        datasets: [{
          label: 'Promedio',
          data: top20.map(d => d.promedio),
          backgroundColor: top20.map((d, i) => {
            if (i < 5) return '#4CAF50'; // Top 5 verde
            if (i >= 15) return '#F44336'; // Bottom 5 rojo
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
            text: 'Top 20 Dimensiones Educativas (Ordenadas por Promedio)',
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
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
              font: { size: 10 }
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
          legend: { position: 'bottom' }
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

  function renderizarDistribucion() {
    if (!canvasDistribucion || !datos) return;
    if (chartDistribucion) chartDistribucion.destroy();

    const ctx = canvasDistribucion.getContext('2d');
    if (!ctx) return;

    const valores = [1, 2, 3, 4, 5];
    const frecuencias = valores.map(v => datos!.distribucionFrecuencias[v] || 0);
    const total = frecuencias.reduce((a, b) => a + b, 0);

    chartDistribucion = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: valores.map(v => `Valor ${v}`),
        datasets: [{
          label: 'Frecuencia',
          data: frecuencias,
          backgroundColor: ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'],
          borderWidth: 1,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Frecuencias de Respuestas',
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                const valor = context.parsed.y;
                const porcentaje = ((valor / total) * 100).toFixed(1);
                return `Frecuencia: ${valor} (${porcentaje}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Número de respuestas' }
          },
          x: {
            title: { display: true, text: 'Valoración' }
          }
        }
      }
    });
  }

  function renderizarApiladas() {
    if (!canvasApiladas || !datos) return;
    if (chartApiladas) chartApiladas.destroy();

    const ctx = canvasApiladas.getContext('2d');
    if (!ctx) return;

    const dimensiones = datos.rankingDimensiones.slice(0, 10).map(d => d.dimension);
    
    const datasets = datos.porSemestre.map(sem => ({
      label: sem.semestre,
      data: dimensiones.map(dim => sem.metricas[dim] || 0),
      backgroundColor: coloresSemestres[sem.semestre] + 'CC',
      borderColor: coloresSemestres[sem.semestre],
      borderWidth: 1,
      stack: 'Stack 0'
    }));

    chartApiladas = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dimensiones.map(d => d.substring(0, 40) + '...'),
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Comparación por Semestre (Top 10 Dimensiones)',
            font: { size: 16, weight: 'bold' }
          },
          legend: { position: 'top' }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: { size: 9 }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 15,
            title: { display: true, text: 'Puntuación acumulada' }
          }
        }
      }
    });
  }

  function cambiarTab(tab: string) {
    tabActiva = tab;
    setTimeout(() => renderizarGraficos(), 50);
  }

  onMount(() => {
    cargarDatos();
  });
</script>

<div class="dashboard">
  <header class="header">
    <h1>Dashboard Educativo UNESUM</h1>
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
      <div class="kpi success">
        <div class="kpi-value">{datos.rankingDimensiones[0].promedio.toFixed(2)}</div>
        <div class="kpi-label">Mejor: {datos.rankingDimensiones[0].dimension.substring(0, 20)}...</div>
      </div>
      <div class="kpi danger">
        <div class="kpi-value">{datos.rankingDimensiones[datos.rankingDimensiones.length - 1].promedio.toFixed(2)}</div>
        <div class="kpi-label">Menor: {datos.rankingDimensiones[datos.rankingDimensiones.length - 1].dimension.substring(0, 20)}...</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button class:active={tabActiva === 'resumen'} onclick={() => cambiarTab('resumen')}>
        📊 Resumen
      </button>
      <button class:active={tabActiva === 'ranking'} onclick={() => cambiarTab('ranking')}>
        📈 Ranking
      </button>
      <button class:active={tabActiva === 'radar'} onclick={() => cambiarTab('radar')}>
        🕸️ Perfil
      </button>
      <button class:active={tabActiva === 'distribucion'} onclick={() => cambiarTab('distribucion')}>
        📉 Distribución
      </button>
      <button class:active={tabActiva === 'comparacion'} onclick={() => cambiarTab('comparacion')}>
        📊 Comparación
      </button>
    </div>

    <!-- Contenido de tabs -->
    <div class="tab-content">
      {#if tabActiva === 'resumen'}
        <div class="chart-container small">
          <canvas bind:this={canvasCircular}></canvas>
        </div>
      {:else if tabActiva === 'ranking'}
        <div class="chart-container large">
          <canvas bind:this={canvasRanking}></canvas>
        </div>
      {:else if tabActiva === 'radar'}
        <div class="chart-container medium">
          <canvas bind:this={canvasRadar}></canvas>
        </div>
      {:else if tabActiva === 'distribucion'}
        <div class="chart-container medium">
          <canvas bind:this={canvasDistribucion}></canvas>
        </div>
      {:else if tabActiva === 'comparacion'}
        <div class="chart-container large">
          <canvas bind:this={canvasApiladas}></canvas>
        </div>
      {/if}
    </div>
  {/if}
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

    .chart-container.large {
      height: 500px;
    }
  }
</style>

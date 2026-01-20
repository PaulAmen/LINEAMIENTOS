<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { APPS_SCRIPT_URL } from '../config';

  // Registrar todos los componentes de Chart.js
  Chart.register(...registerables);

  // Interfaces TypeScript
  interface Metricas {
    [categoria: string]: number;
  }

  interface DatoSemestre {
    semestre: string;
    metricas: Metricas;
  }

  // Estado del componente
  let datos: DatoSemestre[] = [];
  let cargando = true;
  let error = '';
  let chart: Chart | null = null;
  let canvasElement: HTMLCanvasElement;

  // Estados de los filtros
  let semestresDisponibles: string[] = [];
  let dimensionesDisponibles: string[] = [];
  let semestresSeleccionados = new Set<string>();
  let dimensionesSeleccionadas = new Set<string>();

  // Paleta de colores para los semestres
  const coloresSemestres: Record<string, string> = {
    'Sexto': 'rgba(255, 99, 132, 0.8)',
    'Séptimo': 'rgba(54, 162, 235, 0.8)',
    'Octavo': 'rgba(255, 206, 86, 0.8)',
  };

  /**
   * Fetch de datos desde Google Apps Script
   */
  async function cargarDatos() {
    cargando = true;
    error = '';

    try {
      if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'TU_URL_DE_APPS_SCRIPT_AQUI') {
        throw new Error('Debes configurar APPS_SCRIPT_URL en src/config.ts');
      }

      const response = await fetch(APPS_SCRIPT_URL);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const json = await response.json();

      if (json.error) {
        throw new Error(json.message || 'Error desconocido del servidor');
      }

      datos = json;

      // Extraer semestres únicos
      semestresDisponibles = [...new Set(datos.map(d => d.semestre))];
      semestresSeleccionados = new Set(semestresDisponibles);

      // Extraer dimensiones únicas (de todas las métricas de todos los semestres)
      const todasLasDimensiones = new Set<string>();
      datos.forEach(d => {
        Object.keys(d.metricas).forEach(dim => todasLasDimensiones.add(dim));
      });
      dimensionesDisponibles = Array.from(todasLasDimensiones).sort();
      dimensionesSeleccionadas = new Set(dimensionesDisponibles);

      renderizarGrafico();
    } catch (err) {
      error = err instanceof Error ? err.message : 'Error al cargar los datos';
      console.error('Error:', err);
    } finally {
      cargando = false;
    }
  }

  /**
   * Renderiza o actualiza el gráfico de Chart.js
   */
  function renderizarGrafico() {
    if (!canvasElement) return;

    // Destruir gráfico anterior si existe
    if (chart) {
      chart.destroy();
    }

    // Filtrar datos según selecciones
    const datosFiltrados = datos.filter(d => semestresSeleccionados.has(d.semestre));
    const dimensionesFiltradas = Array.from(dimensionesSeleccionadas).sort();

    if (datosFiltrados.length === 0 || dimensionesFiltradas.length === 0) {
      return;
    }

    // Preparar datasets: un dataset por semestre (para barras apiladas)
    const datasets = datosFiltrados.map(dato => {
      const semestreData = dimensionesFiltradas.map(dim => {
        return dato.metricas[dim] || 0;
      });

      return {
        label: dato.semestre,
        data: semestreData,
        backgroundColor: coloresSemestres[dato.semestre] || 'rgba(128, 128, 128, 0.8)',
        borderColor: coloresSemestres[dato.semestre]?.replace('0.8', '1') || 'rgba(128, 128, 128, 1)',
        borderWidth: 1,
        stack: 'Stack 0' // Apilar todas las barras
      };
    });

    // Crear gráfico
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;

    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: dimensionesFiltradas,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Evaluación de Dimensiones Educativas por Semestre',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          legend: {
            display: true,
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const semestre = context.dataset.label || '';
                const valor = context.parsed.y.toFixed(2);
                return `${semestre}: ${valor} / 5`;
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            ticks: {
              autoSkip: false,
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          },
          y: {
            stacked: true,
            beginAtZero: true,
            max: 15, // Máximo 5 * 3 semestres
            title: {
              display: true,
              text: 'Puntuación (escala 1-5)'
            }
          }
        }
      }
    });
  }

  /**
   * Manejadores de filtros
   */
  function toggleSemestre(semestre: string) {
    if (semestresSeleccionados.has(semestre)) {
      semestresSeleccionados.delete(semestre);
    } else {
      semestresSeleccionados.add(semestre);
    }
    semestresSeleccionados = semestresSeleccionados; // Trigger reactivity
    renderizarGrafico();
  }

  function toggleDimension(dimension: string) {
    if (dimensionesSeleccionadas.has(dimension)) {
      dimensionesSeleccionadas.delete(dimension);
    } else {
      dimensionesSeleccionadas.add(dimension);
    }
    dimensionesSeleccionadas = dimensionesSeleccionadas; // Trigger reactivity
    renderizarGrafico();
  }

  function seleccionarTodosSemestres() {
    semestresSeleccionados = new Set(semestresDisponibles);
    renderizarGrafico();
  }

  function deseleccionarTodosSemestres() {
    semestresSeleccionados = new Set();
    renderizarGrafico();
  }

  function seleccionarTodasDimensiones() {
    dimensionesSeleccionadas = new Set(dimensionesDisponibles);
    renderizarGrafico();
  }

  function deseleccionarTodasDimensiones() {
    dimensionesSeleccionadas = new Set();
    renderizarGrafico();
  }

  // Cargar datos al montar el componente
  onMount(() => {
    cargarDatos();
  });
</script>

<div class="dashboard-container">
  <header class="dashboard-header">
    <h1>Dashboard Educativo - UNESUM</h1>
    <p>Análisis de Encuestas de Evaluación Curricular</p>
  </header>

  {#if cargando}
    <div class="loading">
      <div class="spinner"></div>
      <p>Cargando datos...</p>
    </div>
  {:else if error}
    <div class="error">
      <h3>Error al cargar los datos</h3>
      <p>{error}</p>
      <button on:click={cargarDatos}>Reintentar</button>
    </div>
  {:else}
    <div class="filtros-container">
      <!-- Filtro de Semestres -->
      <div class="filtro-grupo">
        <h3>Filtrar por Semestre</h3>
        <div class="filtro-acciones">
          <button on:click={seleccionarTodosSemestres} class="btn-small">Todos</button>
          <button on:click={deseleccionarTodosSemestres} class="btn-small">Ninguno</button>
        </div>
        <div class="checkbox-group">
          {#each semestresDisponibles as semestre}
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={semestresSeleccionados.has(semestre)}
                on:change={() => toggleSemestre(semestre)}
              />
              <span style="color: {coloresSemestres[semestre] || '#000'}">{semestre}</span>
            </label>
          {/each}
        </div>
      </div>

      <!-- Filtro de Dimensiones -->
      <div class="filtro-grupo">
        <h3>Filtrar por Dimensión</h3>
        <div class="filtro-acciones">
          <button on:click={seleccionarTodasDimensiones} class="btn-small">Todas</button>
          <button on:click={deseleccionarTodasDimensiones} class="btn-small">Ninguna</button>
        </div>
        <div class="checkbox-group dimensiones-scroll">
          {#each dimensionesDisponibles as dimension}
            <label class="checkbox-label">
              <input
                type="checkbox"
                checked={dimensionesSeleccionadas.has(dimension)}
                on:change={() => toggleDimension(dimension)}
              />
              <span>{dimension}</span>
            </label>
          {/each}
        </div>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="grafico-container">
      <canvas bind:this={canvasElement}></canvas>
    </div>
  {/if}
</div>

<style>
  .dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 1rem;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .dashboard-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .dashboard-header p {
    font-size: 1rem;
    opacity: 0.95;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

  .error h3 {
    color: #c00;
    margin-bottom: 1rem;
  }

  .error button {
    margin-top: 1rem;
    padding: 0.5rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .error button:hover {
    background: #5568d3;
  }

  .filtros-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .filtro-grupo {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  .dimensiones-scroll {
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
    background: #f9f9f9;
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

  .grafico-container {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    height: 600px;
  }

  @media (max-width: 768px) {
    .dashboard-header h1 {
      font-size: 1.5rem;
    }

    .filtros-container {
      grid-template-columns: 1fr;
    }

    .grafico-container {
      height: 450px;
      padding: 1rem;
    }
  }
</style>

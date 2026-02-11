import type { ChartData3D } from './calculatePositions';

/**
 * Generate Plotly.js traces for 3D scatter plot
 */
export function generate3DTraces(data: ChartData3D) {
  const basePointsA = data.basePoints.filter(p => p.doseType === 'A');
  const basePointsB = data.basePoints.filter(p => p.doseType === 'B');
  const offsetsA = data.offsetPositions.filter(p => p.doseType === 'A');
  const offsetsB = data.offsetPositions.filter(p => p.doseType === 'B');
  
  return [
    // Base Points - Dose A
    {
      x: basePointsA.map(p => p.x),
      y: basePointsA.map(p => p.y),
      z: basePointsA.map(p => p.z),
      mode: 'markers+text',
      type: 'scatter3d',
      name: 'Base Points A',
      marker: {
        size: 8,
        color: '#3b82f6',
        symbol: 'circle',
        line: { width: 2, color: '#1d4ed8' }
      },
      text: basePointsA.map(p => p.name),
      textposition: 'top center',
      textfont: { size: 10, color: '#1d4ed8' },
      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>'
    },
    // Base Points - Dose B
    {
      x: basePointsB.map(p => p.x),
      y: basePointsB.map(p => p.y),
      z: basePointsB.map(p => p.z),
      mode: 'markers+text',
      type: 'scatter3d',
      name: 'Base Points B',
      marker: {
        size: 8,
        color: '#10b981',
        symbol: 'square',
        line: { width: 2, color: '#059669' }
      },
      text: basePointsB.map(p => p.name),
      textposition: 'top center',
      textfont: { size: 10, color: '#059669' },
      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<extra></extra>'
    },
    // Offset Points - Dose A
    {
      x: offsetsA.map(p => p.x),
      y: offsetsA.map(p => p.y),
      z: offsetsA.map(p => p.z),
      mode: 'markers',
      type: 'scatter3d',
      name: 'Offsets A',
      marker: {
        size: 3,
        color: '#93c5fd',
        symbol: 'circle',
        line: { width: 0.5, color: '#3b82f6' }
      },
      text: offsetsA.map(p => p.name),
      customdata: offsetsA.map(p => p.basePoint),
      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<br>Base: %{customdata}<extra></extra>'
    },
    // Offset Points - Dose B
    {
      x: offsetsB.map(p => p.x),
      y: offsetsB.map(p => p.y),
      z: offsetsB.map(p => p.z),
      mode: 'markers',
      type: 'scatter3d',
      name: 'Offsets B',
      marker: {
        size: 3,
        color: '#6ee7b7',
        symbol: 'square',
        line: { width: 0.5, color: '#10b981' }
      },
      text: offsetsB.map(p => p.name),
      customdata: offsetsB.map(p => p.basePoint),
      hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Z: %{z:.2f}<br>Base: %{customdata}<extra></extra>'
    }
  ];
}

/**
 * Generate layout configuration for 3D chart
 */
export function generate3DLayout() {
  return {
    title: '',
    scene: {
      xaxis: {
        title: 'X Position (mm)',
        gridcolor: '#e5e7eb',
        showgrid: true,
      },
      yaxis: {
        title: 'Y Position (mm)',
        gridcolor: '#e5e7eb',
        showgrid: true,
      },
      zaxis: {
        title: 'Z Position (mm)',
        gridcolor: '#e5e7eb',
        showgrid: true,
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.2 },
        center: { x: 0, y: 0, z: 0 },
      },
      aspectmode: 'cube',
    },
    hovermode: 'closest',
    showlegend: true,
    legend: {
      x: 1.02,
      y: 1,
      xanchor: 'left',
      yanchor: 'top',
      bgcolor: 'rgba(255, 255, 255, 0.9)',
      bordercolor: '#e5e7eb',
      borderwidth: 1,
    },
    plot_bgcolor: '#fafafa',
    paper_bgcolor: 'white',
    margin: { t: 40, b: 40, l: 40, r: 150 },
  };
}

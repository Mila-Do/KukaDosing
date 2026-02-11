import type { ChartData, ChartData3D } from './calculatePositions';
import type { Trajectory, Trajectory3D } from './types';
import { generate3DTraces, generate3DLayout } from './plotChart3D';

/**
 * Generate HTML with Plotly.js chart (2D and 3D with view switcher)
 */
export function generateChartHtml(
  data: ChartData, 
  data3D: ChartData3D,
  trajectory?: Trajectory,
  trajectory3D?: Trajectory3D
): string {
  // Prepare base points data
  const basePointsA = data.basePoints.filter(p => p.doseType === 'A');
  const basePointsB = data.basePoints.filter(p => p.doseType === 'B');
  
  // Prepare offset positions data
  const offsetsA = data.offsetPositions.filter(p => p.doseType === 'A');
  const offsetsB = data.offsetPositions.filter(p => p.doseType === 'B');
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KUKA Dispensing Points - 2D/3D Visualization</title>
  <script src="https://cdn.plot.ly/plotly-2.27.0.min.js"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 10px;
    }
    .view-switcher {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }
    .view-btn {
      padding: 10px 30px;
      border: 2px solid #3b82f6;
      border-radius: 6px;
      background: white;
      color: #3b82f6;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .view-btn:hover {
      background: #eff6ff;
    }
    .view-btn.active {
      background: #3b82f6;
      color: white;
    }
    .stats {
      display: flex;
      justify-content: center;
      gap: 30px;
      margin-bottom: 20px;
      color: #666;
    }
    .stat-item {
      font-size: 14px;
    }
    .stat-value {
      font-weight: bold;
      color: #333;
    }
    .chart-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    #chart2D, #chart3D {
      min-height: 600px;
    }
    .chart-view {
      display: none;
    }
    .chart-view.active {
      display: block;
    }
    .animation-controls {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 20px;
      display: ${trajectory ? 'flex' : 'none'};
      align-items: center;
      justify-content: center;
      gap: 15px;
      flex-wrap: wrap;
    }
    .control-group {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      background: #3b82f6;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover {
      background: #2563eb;
    }
    button:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    .speed-btn {
      padding: 8px 15px;
      background: #64748b;
      font-size: 13px;
    }
    .speed-btn:hover {
      background: #475569;
    }
    .speed-btn.active {
      background: #10b981;
    }
    .speed-btn.active:hover {
      background: #059669;
    }
    .progress {
      flex: 1;
      min-width: 200px;
      max-width: 400px;
    }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #10b981);
      transition: width 0.3s;
      border-radius: 4px;
    }
    .progress-text {
      text-align: center;
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>KUKA Dispensing Points Visualization</h1>
    
    <div class="view-switcher">
      <button class="view-btn active" id="btn2D" onclick="switchView('2D')">2D View</button>
      <button class="view-btn" id="btn3D" onclick="switchView('3D')">3D View</button>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        Base Points: <span class="stat-value">${data.basePoints.length}</span>
      </div>
      <div class="stat-item">
        Dose A Offsets: <span class="stat-value">${offsetsA.length}</span>
      </div>
      <div class="stat-item">
        Dose B Offsets: <span class="stat-value">${offsetsB.length}</span>
      </div>
      <div class="stat-item">
        Total Points: <span class="stat-value">${data.offsetPositions.length}</span>
      </div>
    </div>
    
    <div class="animation-controls">
      <div class="control-group">
        <button id="playBtn" onclick="togglePlay()">▶ Play</button>
        <button id="restartBtn" onclick="restart()">↻ Restart</button>
      </div>
      
      <div class="progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progressFill"></div>
        </div>
        <div class="progress-text" id="progressText">0 / ${trajectory?.totalPoints || 0}</div>
      </div>
      
      <div class="control-group">
        <button class="speed-btn" onclick="setSpeed(0.25)">0.25x</button>
        <button class="speed-btn" onclick="setSpeed(0.5)">0.5x</button>
        <button class="speed-btn active" id="speed1x" onclick="setSpeed(1)">1x</button>
        <button class="speed-btn" onclick="setSpeed(2)">2x</button>
      </div>
    </div>
    
    <div class="chart-container">
      <div id="chart2D" class="chart-view active"></div>
      <div id="chart3D" class="chart-view"></div>
    </div>
  </div>
  <script>
    const traces = [
      // Base Points - Dose A
      {
        x: ${JSON.stringify(basePointsA.map(p => p.x))},
        y: ${JSON.stringify(basePointsA.map(p => p.y))},
        mode: 'markers+text',
        type: 'scatter',
        name: 'Base Points A',
        marker: {
          size: 16,
          color: '#3b82f6',
          symbol: 'circle',
          line: { width: 2, color: '#1d4ed8' }
        },
        text: ${JSON.stringify(basePointsA.map(p => p.name))},
        textposition: 'top center',
        textfont: { size: 12, color: '#1d4ed8' },
        hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>'
      },
      // Base Points - Dose B
      {
        x: ${JSON.stringify(basePointsB.map(p => p.x))},
        y: ${JSON.stringify(basePointsB.map(p => p.y))},
        mode: 'markers+text',
        type: 'scatter',
        name: 'Base Points B',
        marker: {
          size: 16,
          color: '#10b981',
          symbol: 'square',
          line: { width: 2, color: '#059669' }
        },
        text: ${JSON.stringify(basePointsB.map(p => p.name))},
        textposition: 'top center',
        textfont: { size: 12, color: '#059669' },
        hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<extra></extra>'
      },
      // Offset Points - Dose A
      {
        x: ${JSON.stringify(offsetsA.map(p => p.x))},
        y: ${JSON.stringify(offsetsA.map(p => p.y))},
        mode: 'markers',
        type: 'scatter',
        name: 'Offsets A',
        marker: {
          size: 6,
          color: '#93c5fd',
          symbol: 'circle',
          line: { width: 1, color: '#3b82f6' }
        },
        text: ${JSON.stringify(offsetsA.map(p => p.name))},
        customdata: ${JSON.stringify(offsetsA.map(p => p.basePoint))},
        hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Base: %{customdata}<extra></extra>'
      },
      // Offset Points - Dose B
      {
        x: ${JSON.stringify(offsetsB.map(p => p.x))},
        y: ${JSON.stringify(offsetsB.map(p => p.y))},
        mode: 'markers',
        type: 'scatter',
        name: 'Offsets B',
        marker: {
          size: 6,
          color: '#6ee7b7',
          symbol: 'square',
          line: { width: 1, color: '#10b981' }
        },
        text: ${JSON.stringify(offsetsB.map(p => p.name))},
        customdata: ${JSON.stringify(offsetsB.map(p => p.basePoint))},
        hovertemplate: '<b>%{text}</b><br>X: %{x:.2f}<br>Y: %{y:.2f}<br>Base: %{customdata}<extra></extra>'
      }
    ];

    const layout = {
      title: '',
      xaxis: {
        title: 'X Position (mm)',
        zeroline: true,
        gridcolor: '#e5e7eb',
        showgrid: true,
      },
      yaxis: {
        title: 'Y Position (mm)',
        zeroline: true,
        gridcolor: '#e5e7eb',
        showgrid: true,
        scaleanchor: 'x',
        scaleratio: 1,
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
      margin: { t: 40, b: 60, l: 60, r: 150 },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['lasso2d', 'select2d'],
      toImageButtonOptions: {
        format: 'png',
        filename: 'kuka_dispensing_points_2d',
        height: 1080,
        width: 1920,
        scale: 2
      }
    };

    // 3D Traces and Layout
    const traces3D = ${JSON.stringify(generate3DTraces(data3D))};
    const layout3D = ${JSON.stringify(generate3DLayout())};
    const config3D = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      toImageButtonOptions: {
        format: 'png',
        filename: 'kuka_dispensing_points_3d',
        height: 1080,
        width: 1920,
        scale: 2
      }
    };

    // Shared Animation State
    const trajectoryData2D = ${trajectory ? JSON.stringify(trajectory.points) : 'null'};
    const trajectoryData3D = ${trajectory3D ? JSON.stringify(trajectory3D.points) : 'null'};
    
    // Add animation traces BEFORE initializing charts
    if (trajectoryData2D && trajectoryData2D.length > 0) {
      traces.push({
        x: [],
        y: [],
        mode: 'lines',
        type: 'scatter',
        name: 'Trajectory',
        line: { color: '#f59e0b', width: 2 },
        hoverinfo: 'skip',
      });
      traces.push({
        x: [],
        y: [],
        mode: 'markers',
        type: 'scatter',
        name: 'Current Point',
        marker: {
          size: 14,
          color: '#ef4444',
          symbol: 'star',
          line: { width: 2, color: '#dc2626' }
        },
        text: [],
        hoverinfo: 'skip',
      });
    }
    
    if (trajectoryData3D && trajectoryData3D.length > 0) {
      traces3D.push({
        x: [],
        y: [],
        z: [],
        mode: 'lines',
        type: 'scatter3d',
        name: 'Trajectory',
        line: { color: '#f59e0b', width: 4 },
        hoverinfo: 'skip',
      });
      traces3D.push({
        x: [],
        y: [],
        z: [],
        mode: 'markers',
        type: 'scatter3d',
        name: 'Current Point',
        marker: {
          size: 8,
          color: '#ef4444',
          symbol: 'diamond',
          line: { width: 2, color: '#dc2626' }
        },
        text: [],
        hoverinfo: 'skip',
      });
    }

    // NOW initialize both charts with complete traces
    Plotly.newPlot('chart2D', traces, layout, config);
    Plotly.newPlot('chart3D', traces3D, layout3D, config3D);
    let currentFrame = 0;
    let isPlaying = false;
    let animationSpeed = 1; // 1x = 500ms per frame
    let animationInterval = null;
    let currentView = '2D'; // Track current view
    
    // View Switcher
    function switchView(view) {
      currentView = view;
      
      // Update buttons
      document.getElementById('btn2D').classList.toggle('active', view === '2D');
      document.getElementById('btn3D').classList.toggle('active', view === '3D');
      
      // Update chart visibility
      document.getElementById('chart2D').classList.toggle('active', view === '2D');
      document.getElementById('chart3D').classList.toggle('active', view === '3D');
      
      // Redraw current animation state
      updateAnimation();
    }
    
    // Animation functions - synchronized between 2D and 3D
    function updateAnimation() {
      if (!trajectoryData2D || currentFrame >= trajectoryData2D.length) {
        pause();
        return;
      }
      
      // Update 2D animation
      if (trajectoryData2D && traces.length >= 6) {
        const segment2D = trajectoryData2D.slice(0, currentFrame + 1);
        const currentPoint2D = trajectoryData2D[currentFrame];
        
        const pathX = segment2D.map(p => p.x);
        const pathY = segment2D.map(p => p.y);
        
        // Update traces
        traces[4].x = pathX;
        traces[4].y = pathY;
        traces[5].x = [currentPoint2D.x];
        traces[5].y = [currentPoint2D.y];
        traces[5].text = [currentPoint2D.name];
        
        // Use restyle to preserve user interactions (zoom, pan)
        Plotly.restyle('chart2D', {
          x: [pathX, [currentPoint2D.x]],
          y: [pathY, [currentPoint2D.y]],
          text: [null, [currentPoint2D.name]]
        }, [4, 5]);
      }
      
      // Update 3D animation
      if (trajectoryData3D && traces3D.length >= 6) {
        const segment3D = trajectoryData3D.slice(0, currentFrame + 1);
        const currentPoint3D = trajectoryData3D[currentFrame];
        
        const pathX3D = segment3D.map(p => p.x);
        const pathY3D = segment3D.map(p => p.y);
        const pathZ3D = segment3D.map(p => p.z);
        
        // Update traces
        traces3D[4].x = pathX3D;
        traces3D[4].y = pathY3D;
        traces3D[4].z = pathZ3D;
        traces3D[5].x = [currentPoint3D.x];
        traces3D[5].y = [currentPoint3D.y];
        traces3D[5].z = [currentPoint3D.z];
        traces3D[5].text = [currentPoint3D.name];
        
        // Use restyle to preserve 3D camera orientation
        Plotly.restyle('chart3D', {
          x: [pathX3D, [currentPoint3D.x]],
          y: [pathY3D, [currentPoint3D.y]],
          z: [pathZ3D, [currentPoint3D.z]],
          text: [null, [currentPoint3D.name]]
        }, [4, 5]);
      }
      
      // Update progress
      const progress = ((currentFrame + 1) / trajectoryData2D.length) * 100;
      document.getElementById('progressFill').style.width = progress + '%';
      document.getElementById('progressText').textContent = 
        (currentFrame + 1) + ' / ' + trajectoryData2D.length;
    }
    
    function nextFrame() {
      if (!trajectoryData2D) return;
      
      if (currentFrame < trajectoryData2D.length - 1) {
        currentFrame++;
        updateAnimation();
      } else {
        pause();
      }
    }
    
    function play() {
      if (!trajectoryData2D || isPlaying) return;
      
      isPlaying = true;
      document.getElementById('playBtn').textContent = '⏸ Pause';
      
      const interval = 500 / animationSpeed; // base 500ms per frame
      animationInterval = setInterval(nextFrame, interval);
    }
    
    function pause() {
      isPlaying = false;
      document.getElementById('playBtn').textContent = '▶ Play';
      
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
    }
    
    function togglePlay() {
      if (isPlaying) {
        pause();
      } else {
        play();
      }
    }
    
    function restart() {
      pause();
      currentFrame = 0;
      
      // Clear animation trace data (but keep the traces)
      if (traces.length >= 6) {
        traces[4].x = [];
        traces[4].y = [];
        traces[5].x = [];
        traces[5].y = [];
        traces[5].text = [];
      }
      if (traces3D.length >= 6) {
        traces3D[4].x = [];
        traces3D[4].y = [];
        traces3D[4].z = [];
        traces3D[5].x = [];
        traces3D[5].y = [];
        traces3D[5].z = [];
        traces3D[5].text = [];
      }
      
      Plotly.react('chart2D', traces, layout, config);
      Plotly.react('chart3D', traces3D, layout3D, config3D);
      
      // Reset progress
      document.getElementById('progressFill').style.width = '0%';
      document.getElementById('progressText').textContent = '0 / ' + trajectoryData2D.length;
    }
    
    function setSpeed(speed) {
      animationSpeed = speed;
      
      // Update active button
      document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      
      // Restart interval with new speed if playing
      if (isPlaying) {
        pause();
        play();
      }
    }
  </script>
</body>
</html>`;
  
  return html;
}

/**
 * Save chart to HTML file (2D and 3D)
 */
export async function saveChartToFile(
  data: ChartData,
  data3D: ChartData3D,
  outputPath: string = 'chart.html',
  trajectory?: Trajectory,
  trajectory3D?: Trajectory3D
): Promise<void> {
  const html = generateChartHtml(data, data3D, trajectory, trajectory3D);
  await Bun.write(outputPath, html);
  console.log(`✅ Chart saved to: ${outputPath}`);
  console.log(`📊 2D View: XY plane visualization`);
  console.log(`📊 3D View: XYZ space visualization`);
  if (trajectory && trajectory3D) {
    console.log(`🎬 Animation enabled with ${trajectory.totalPoints} trajectory points (synchronized)`);
  }
}

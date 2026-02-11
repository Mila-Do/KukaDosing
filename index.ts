import { parseSrcFile } from './src/parser';
import { parseDatFile, parseDatFile3D } from './src/datParser';
import { ConfigSchema } from './src/types';
import { 
  calculatePositions, 
  calculatePositions3D,
  organizeChartData,
  organizeChartData3D 
} from './src/calculatePositions';
import { saveChartToFile } from './src/plotChart';
import { saveOffsetsListToFile } from './src/generateOffsetsList';
import { buildTrajectory, buildTrajectory3D } from './src/animation';

async function main() {
  // Load config
  const configFile = await Bun.file('config.json').text();
  const config = ConfigSchema.parse(JSON.parse(configFile));
  
  console.log('📖 Loading files...\n');
  
  // Phase 2: Parse .dat for base points (2D and 3D)
  const datContent = await Bun.file(config.datPath).text();
  const basePoints = parseDatFile(datContent);
  const basePoints3D = parseDatFile3D(datContent);
  
  console.log('🎯 Base Points (2D):');
  for (const [name, point] of Object.entries(basePoints)) {
    console.log(`  ${name}: (${point.x}, ${point.y})`);
  }
  
  console.log('\n🎯 Base Points (3D):');
  for (const [name, point] of Object.entries(basePoints3D)) {
    console.log(`  ${name}: (${point.x}, ${point.y}, ${point.z})`);
  }
  
  // Phase 1: Parse .src for offsets
  const srcContent = await Bun.file(config.srcPath).text();
  const offsets = parseSrcFile(srcContent);
  
  console.log(`\n📍 Found ${offsets.length} offsets:\n`);
  
  // Group by dose type
  const doseA = offsets.filter(o => o.doseType === 'A');
  const doseB = offsets.filter(o => o.doseType === 'B');
  
  console.log(`  dose_A: ${doseA.length} offsets`);
  console.log(`  dose_B: ${doseB.length} offsets`);
  
  // Show sample offsets
  console.log('\n📝 Sample offsets:');
  offsets.slice(0, 5).forEach(offset => {
    console.log(`  ${offset.name}: (${offset.x}, ${offset.y}) @ ${offset.basePoint}`);
  });
  
  // Phase 3: Calculate 2D and 3D positions
  console.log('\n🧮 Calculating 2D positions...\n');
  const positions = calculatePositions(offsets, basePoints);
  console.log(`✅ Successfully calculated ${positions.length} 2D positions`);
  
  console.log('\n🧮 Calculating 3D positions...\n');
  const positions3D = calculatePositions3D(offsets, basePoints3D);
  console.log(`✅ Successfully calculated ${positions3D.length} 3D positions`);
  
  // Show sample positions
  console.log('\n📊 Sample final positions (2D):');
  positions.slice(0, 3).forEach(pos => {
    console.log(`  ${pos.name}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}) [base: ${pos.basePoint}]`);
  });
  
  console.log('\n📊 Sample final positions (3D):');
  positions3D.slice(0, 3).forEach(pos => {
    console.log(`  ${pos.name}: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}) [base: ${pos.basePoint}]`);
  });
  
  // Phase 4: Generate chart data
  console.log('\n📈 Organizing chart data (2D and 3D)...\n');
  const chartData = organizeChartData(basePoints, positions);
  const chartData3D = organizeChartData3D(basePoints3D, positions3D);
  
  // Phase 6: Build trajectory for animation (2D and 3D)
  console.log('🎬 Building trajectory for animation...\n');
  const trajectory = buildTrajectory(srcContent, offsets, basePoints);
  console.log(`✅ 2D Trajectory built: ${trajectory.totalPoints} sequential points`);
  
  const trajectory3D = buildTrajectory3D(srcContent, offsets, basePoints3D);
  console.log(`✅ 3D Trajectory built: ${trajectory3D.totalPoints} sequential points`);
  
  // Phase 7: Save chart with 2D/3D views
  await saveChartToFile(chartData, chartData3D, 'dispensing-points.html', trajectory, trajectory3D);
  
  // Export data to JSON
  const exportData = {
    basePoints,
    offsets,
    positions,
    stats: {
      totalOffsets: offsets.length,
      dose_A_count: doseA.length,
      dose_B_count: doseB.length,
      totalPositions: positions.length,
    }
  };
  
  await Bun.write('dispensing-data.json', JSON.stringify(exportData, null, 2));
  console.log('💾 Data exported to: dispensing-data.json');
  
  // Generate offsets list markdown
  await saveOffsetsListToFile(basePoints, offsets, 'offsets-list.md');
  
  console.log('\n✨ All phases complete (including Phase 7: 3D Visualization)!');
  console.log('📊 Open dispensing-points.html in your browser to view the 2D/3D animated chart');
  console.log('🔄 Switch between 2D and 3D views using the toggle buttons');
  console.log('🎬 Animation synchronized across both views');
  console.log('🎮 Controls: Play/Pause, Speed (0.25x-2x), Progress tracker, View switcher');
  console.log('📄 Full data: dispensing-data.json (JSON) | offsets-list.md (readable)\n');
}

main().catch(console.error);

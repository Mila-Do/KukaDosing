import { describe, test, expect } from 'bun:test';
import { buildTrajectory } from './animation';
import { parseSrcFile } from './parser';
import { parseDatFile } from './datParser';
import type { BasePoints } from './datParser';

describe('Animation - Trajectory Building', () => {
  test('should build trajectory in correct sequence from .src file', async () => {
    // Load real files
    const srcContent = await Bun.file('PickAndDrop.src').text();
    const datContent = await Bun.file('PickAndDrop.dat').text();
    
    const basePoints = parseDatFile(datContent);
    const offsets = parseSrcFile(srcContent);
    
    const trajectory = buildTrajectory(srcContent, offsets, basePoints);
    
    // Verify total points
    expect(trajectory.totalPoints).toBe(60);
    expect(trajectory.points.length).toBe(60);
    
    // Verify sequence indices are sequential
    trajectory.points.forEach((point, idx) => {
      expect(point.sequenceIndex).toBe(idx);
    });
  });
  
  test('should execute dose_A before dose_B', async () => {
    const srcContent = await Bun.file('PickAndDrop.src').text();
    const datContent = await Bun.file('PickAndDrop.dat').text();
    
    const basePoints = parseDatFile(datContent);
    const offsets = parseSrcFile(srcContent);
    
    const trajectory = buildTrajectory(srcContent, offsets, basePoints);
    
    // First 30 points should be dose_A
    const first30 = trajectory.points.slice(0, 30);
    first30.forEach(point => {
      expect(point.doseType).toBe('A');
    });
    
    // Last 30 points should be dose_B
    const last30 = trajectory.points.slice(30);
    last30.forEach(point => {
      expect(point.doseType).toBe('B');
    });
  });
  
  test('should match expected sequence from .src file', async () => {
    const srcContent = await Bun.file('PickAndDrop.src').text();
    const datContent = await Bun.file('PickAndDrop.dat').text();
    
    const basePoints = parseDatFile(datContent);
    const offsets = parseSrcFile(srcContent);
    
    const trajectory = buildTrajectory(srcContent, offsets, basePoints);
    
    // Verify first 5 points
    expect(trajectory.points[0].name).toBe('dose_A_offset_010');
    expect(trajectory.points[0].doseType).toBe('A');
    
    expect(trajectory.points[1].name).toBe('dose_A_offset_020');
    expect(trajectory.points[1].doseType).toBe('A');
    
    expect(trajectory.points[2].name).toBe('dose_A_offset_030');
    expect(trajectory.points[2].doseType).toBe('A');
    
    expect(trajectory.points[3].name).toBe('dose_A_offset_040');
    expect(trajectory.points[3].doseType).toBe('A');
    
    expect(trajectory.points[4].name).toBe('dose_A_offset_050');
    expect(trajectory.points[4].doseType).toBe('A');
    
    // Verify transition point (last dose_A to first dose_B)
    expect(trajectory.points[29].name).toBe('dose_A_offset_230');
    expect(trajectory.points[29].doseType).toBe('A');
    
    expect(trajectory.points[30].name).toBe('dose_B_offset_010');
    expect(trajectory.points[30].doseType).toBe('B');
    
    // Verify last 3 points (0-indexed, so 57, 58, 59)
    expect(trajectory.points[57].name).toBe('dose_B_offset_210');
    expect(trajectory.points[57].doseType).toBe('B');
    
    expect(trajectory.points[58].name).toBe('dose_B_offset_220');
    expect(trajectory.points[58].doseType).toBe('B');
    
    expect(trajectory.points[59].name).toBe('dose_B_offset_230');
    expect(trajectory.points[59].doseType).toBe('B');
  });
  
  test('should calculate correct 2D positions', async () => {
    const srcContent = await Bun.file('PickAndDrop.src').text();
    const datContent = await Bun.file('PickAndDrop.dat').text();
    
    const basePoints = parseDatFile(datContent);
    const offsets = parseSrcFile(srcContent);
    
    const trajectory = buildTrajectory(srcContent, offsets, basePoints);
    
    // All points should have valid coordinates
    trajectory.points.forEach(point => {
      expect(typeof point.x).toBe('number');
      expect(typeof point.y).toBe('number');
      expect(isNaN(point.x)).toBe(false);
      expect(isNaN(point.y)).toBe(false);
    });
    
    // Verify first point calculation (dose_A_offset_010 from Xdose_A_1)
    // Xdose_A_1 = (17, 3), offset_010 = (-2, -2)
    // Expected position = (15, 1)
    expect(trajectory.points[0].x).toBeCloseTo(15, 2);
    expect(trajectory.points[0].y).toBeCloseTo(1, 2);
  });
  
  test('should preserve instruction type (PTP/LIN)', async () => {
    const srcContent = await Bun.file('PickAndDrop.src').text();
    const datContent = await Bun.file('PickAndDrop.dat').text();
    
    const basePoints = parseDatFile(datContent);
    const offsets = parseSrcFile(srcContent);
    
    const trajectory = buildTrajectory(srcContent, offsets, basePoints);
    
    // All points should have instruction type
    trajectory.points.forEach(point => {
      expect(['PTP', 'LIN']).toContain(point.instructionType);
    });
  });
});

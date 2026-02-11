import type { Offset, OffsetPosition2D, OffsetPosition3D } from './types';
import type { BasePoints, BasePoints3D } from './datParser';

/**
 * Calculate 2D positions for all offsets
 * Formula: pos = base + offset
 */
export function calculatePositions(
  offsets: Offset[],
  basePoints: BasePoints
): OffsetPosition2D[] {
  const positions: OffsetPosition2D[] = [];
  
  for (const offset of offsets) {
    const base = basePoints[offset.basePoint as keyof BasePoints];
    
    if (!base) {
      console.warn(`⚠️  Warning: Base point ${offset.basePoint} not found for ${offset.name}`);
      continue;
    }
    
    positions.push({
      name: offset.name,
      x: base.x + offset.x,
      y: base.y + offset.y,
      basePoint: offset.basePoint,
      doseType: offset.doseType,
    });
  }
  
  return positions;
}

/**
 * Calculate 3D positions for all offsets
 * Formula: pos = base + offset
 */
export function calculatePositions3D(
  offsets: Offset[],
  basePoints: BasePoints3D
): OffsetPosition3D[] {
  const positions: OffsetPosition3D[] = [];
  
  for (const offset of offsets) {
    const base = basePoints[offset.basePoint as keyof BasePoints3D];
    
    if (!base) {
      console.warn(`⚠️  Warning: Base point ${offset.basePoint} not found for ${offset.name}`);
      continue;
    }
    
    positions.push({
      name: offset.name,
      x: base.x + offset.x,
      y: base.y + offset.y,
      z: base.z + offset.z,
      basePoint: offset.basePoint,
      doseType: offset.doseType,
    });
  }
  
  return positions;
}

/**
 * Organize data for charting (2D)
 */
export interface ChartData {
  basePoints: Array<{
    name: string;
    x: number;
    y: number;
    doseType: 'A' | 'B';
    position: '1' | '2';
  }>;
  offsetPositions: OffsetPosition2D[];
}

export function organizeChartData(
  basePoints: BasePoints,
  positions: OffsetPosition2D[]
): ChartData {
  return {
    basePoints: [
      { name: 'Xdose_A_1', ...basePoints.Xdose_A_1, doseType: 'A' as const, position: '1' as const },
      { name: 'Xdose_A_2', ...basePoints.Xdose_A_2, doseType: 'A' as const, position: '2' as const },
      { name: 'Xdose_B_1', ...basePoints.Xdose_B_1, doseType: 'B' as const, position: '1' as const },
      { name: 'Xdose_B_2', ...basePoints.Xdose_B_2, doseType: 'B' as const, position: '2' as const },
    ],
    offsetPositions: positions,
  };
}

/**
 * Organize data for charting (3D)
 */
export interface ChartData3D {
  basePoints: Array<{
    name: string;
    x: number;
    y: number;
    z: number;
    doseType: 'A' | 'B';
    position: '1' | '2';
  }>;
  offsetPositions: OffsetPosition3D[];
}

export function organizeChartData3D(
  basePoints: BasePoints3D,
  positions: OffsetPosition3D[]
): ChartData3D {
  return {
    basePoints: [
      { name: 'Xdose_A_1', ...basePoints.Xdose_A_1, doseType: 'A' as const, position: '1' as const },
      { name: 'Xdose_A_2', ...basePoints.Xdose_A_2, doseType: 'A' as const, position: '2' as const },
      { name: 'Xdose_B_1', ...basePoints.Xdose_B_1, doseType: 'B' as const, position: '1' as const },
      { name: 'Xdose_B_2', ...basePoints.Xdose_B_2, doseType: 'B' as const, position: '2' as const },
    ],
    offsetPositions: positions,
  };
}

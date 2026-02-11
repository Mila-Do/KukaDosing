import type { Point2D, Point3D } from './types';

export interface BasePoints {
  Xdose_A_1: Point2D;
  Xdose_A_2: Point2D;
  Xdose_B_1: Point2D;
  Xdose_B_2: Point2D;
}

export interface BasePoints3D {
  Xdose_A_1: Point3D;
  Xdose_A_2: Point3D;
  Xdose_B_1: Point3D;
  Xdose_B_2: Point3D;
}

/**
 * Parse base points from .dat file (2D - X, Y only)
 * Format: GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,...}
 */
export function parseDatFile(content: string): BasePoints {
  const basePoints: Partial<BasePoints> = {};
  
  const basePointNames = ['Xdose_A_1', 'Xdose_A_2', 'Xdose_B_1', 'Xdose_B_2'] as const;
  
  for (const name of basePointNames) {
    const regex = new RegExp(
      `GLOBAL E6POS ${name}=\\{X\\s+([-\\d.]+),Y\\s+([-\\d.]+)`,
      'i'
    );
    
    const match = content.match(regex);
    if (match) {
      const [, x, y] = match;
      basePoints[name] = {
        x: parseFloat(x),
        y: parseFloat(y),
      };
    }
  }
  
  // Validate all base points were found
  for (const name of basePointNames) {
    if (!basePoints[name]) {
      throw new Error(`Base point ${name} not found in .dat file`);
    }
  }
  
  return basePoints as BasePoints;
}

/**
 * Parse base points from .dat file (3D - X, Y, Z)
 * Format: GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,...}
 */
export function parseDatFile3D(content: string): BasePoints3D {
  const basePoints: Partial<BasePoints3D> = {};
  
  const basePointNames = ['Xdose_A_1', 'Xdose_A_2', 'Xdose_B_1', 'Xdose_B_2'] as const;
  
  for (const name of basePointNames) {
    const regex = new RegExp(
      `GLOBAL E6POS ${name}=\\{X\\s+([-\\d.]+),Y\\s+([-\\d.]+),Z\\s+([-\\d.]+)`,
      'i'
    );
    
    const match = content.match(regex);
    if (match) {
      const [, x, y, z] = match;
      basePoints[name] = {
        x: parseFloat(x),
        y: parseFloat(y),
        z: parseFloat(z),
      };
    }
  }
  
  // Validate all base points were found
  for (const name of basePointNames) {
    if (!basePoints[name]) {
      throw new Error(`Base point ${name} not found in .dat file`);
    }
  }
  
  return basePoints as BasePoints3D;
}

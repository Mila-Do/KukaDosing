import { z } from 'zod';

export const Point2DSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const Point3DSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export const ConfigSchema = z.object({
  srcPath: z.string(),
  datPath: z.string(),
});

export type Point2D = z.infer<typeof Point2DSchema>;
export type Point3D = z.infer<typeof Point3DSchema>;
export type Config = z.infer<typeof ConfigSchema>;

export interface Offset {
  name: string;
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  c: number;
  basePoint: string;
  doseType: 'A' | 'B';
}

export interface OffsetPosition2D {
  name: string;
  x: number;
  y: number;
  basePoint: string;
  doseType: 'A' | 'B';
}

export interface OffsetPosition3D {
  name: string;
  x: number;
  y: number;
  z: number;
  basePoint: string;
  doseType: 'A' | 'B';
}

/**
 * Sequential point in trajectory - includes order index
 */
export interface TrajectoryPoint {
  name: string;
  x: number;
  y: number;
  basePoint: string;
  doseType: 'A' | 'B';
  sequenceIndex: number;
  instructionType: 'PTP' | 'LIN';
}

/**
 * Sequential point in 3D trajectory - includes Z coordinate
 */
export interface TrajectoryPoint3D {
  name: string;
  x: number;
  y: number;
  z: number;
  basePoint: string;
  doseType: 'A' | 'B';
  sequenceIndex: number;
  instructionType: 'PTP' | 'LIN';
}

/**
 * Trajectory data for animation
 */
export interface Trajectory {
  points: TrajectoryPoint[];
  totalPoints: number;
}

/**
 * 3D Trajectory data for animation
 */
export interface Trajectory3D {
  points: TrajectoryPoint3D[];
  totalPoints: number;
}

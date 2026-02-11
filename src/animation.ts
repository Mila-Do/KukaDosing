import type { Offset, Trajectory, TrajectoryPoint, Trajectory3D, TrajectoryPoint3D } from './types';
import type { BasePoints, BasePoints3D } from './datParser';
import { parseAllSequentialOffsetUsage } from './parser';

/**
 * Build trajectory from sequential offset usage
 * Combines definitions with sequence order and calculates 2D positions
 */
export function buildTrajectory(
  srcContent: string,
  offsets: Offset[],
  basePoints: BasePoints
): Trajectory {
  // Parse ALL offset usage in order of appearance in file
  const allSequence = parseAllSequentialOffsetUsage(srcContent);
  
  // Create offset lookup map
  const offsetMap = new Map<string, Offset>();
  for (const offset of offsets) {
    offsetMap.set(offset.name, offset);
  }
  
  // Build trajectory points with calculated positions
  const points: TrajectoryPoint[] = [];
  
  for (const seq of allSequence) {
    const offset = offsetMap.get(seq.offsetName);
    if (!offset) {
      console.warn(`⚠️  Offset not found: ${seq.offsetName}`);
      continue;
    }
    
    // Get base point position
    const basePoint = basePoints[seq.basePoint as keyof BasePoints];
    if (!basePoint) {
      console.warn(`⚠️  Base point not found: ${seq.basePoint}`);
      continue;
    }
    
    // Calculate final position
    const finalX = basePoint.x + offset.x;
    const finalY = basePoint.y + offset.y;
    
    points.push({
      name: offset.name,
      x: finalX,
      y: finalY,
      basePoint: seq.basePoint,
      doseType: offset.doseType,
      sequenceIndex: seq.sequenceIndex,
      instructionType: seq.instructionType,
    });
  }
  
  return {
    points,
    totalPoints: points.length,
  };
}

/**
 * Get trajectory segment for animation frame
 * Returns points from 0 to currentFrame (inclusive)
 */
export function getTrajectorySegment(
  trajectory: Trajectory,
  currentFrame: number
): TrajectoryPoint[] {
  return trajectory.points.slice(0, currentFrame + 1);
}

/**
 * Generate trajectory data for Plotly animation
 */
export interface AnimationFrame {
  frame: number;
  points: TrajectoryPoint[];
  pathX: number[];
  pathY: number[];
}

export function generateAnimationFrames(trajectory: Trajectory): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  
  for (let i = 0; i < trajectory.points.length; i++) {
    const segment = getTrajectorySegment(trajectory, i);
    
    frames.push({
      frame: i,
      points: segment,
      pathX: segment.map(p => p.x),
      pathY: segment.map(p => p.y),
    });
  }
  
  return frames;
}

/**
 * Build 3D trajectory from sequential offset usage
 * Combines definitions with sequence order and calculates 3D positions
 */
export function buildTrajectory3D(
  srcContent: string,
  offsets: Offset[],
  basePoints: BasePoints3D
): Trajectory3D {
  // Parse ALL offset usage in order of appearance in file
  const allSequence = parseAllSequentialOffsetUsage(srcContent);
  
  // Create offset lookup map
  const offsetMap = new Map<string, Offset>();
  for (const offset of offsets) {
    offsetMap.set(offset.name, offset);
  }
  
  // Build trajectory points with calculated 3D positions
  const points: TrajectoryPoint3D[] = [];
  
  for (const seq of allSequence) {
    const offset = offsetMap.get(seq.offsetName);
    if (!offset) {
      console.warn(`⚠️  Offset not found: ${seq.offsetName}`);
      continue;
    }
    
    // Get base point position
    const basePoint = basePoints[seq.basePoint as keyof BasePoints3D];
    if (!basePoint) {
      console.warn(`⚠️  Base point not found: ${seq.basePoint}`);
      continue;
    }
    
    // Calculate final 3D position
    const finalX = basePoint.x + offset.x;
    const finalY = basePoint.y + offset.y;
    const finalZ = basePoint.z + offset.z;
    
    points.push({
      name: offset.name,
      x: finalX,
      y: finalY,
      z: finalZ,
      basePoint: seq.basePoint,
      doseType: offset.doseType,
      sequenceIndex: seq.sequenceIndex,
      instructionType: seq.instructionType,
    });
  }
  
  return {
    points,
    totalPoints: points.length,
  };
}

/**
 * Get 3D trajectory segment for animation frame
 */
export function getTrajectorySegment3D(
  trajectory: Trajectory3D,
  currentFrame: number
): TrajectoryPoint3D[] {
  return trajectory.points.slice(0, currentFrame + 1);
}

/**
 * Generate 3D trajectory data for Plotly animation
 */
export interface AnimationFrame3D {
  frame: number;
  points: TrajectoryPoint3D[];
  pathX: number[];
  pathY: number[];
  pathZ: number[];
}

export function generateAnimationFrames3D(trajectory: Trajectory3D): AnimationFrame3D[] {
  const frames: AnimationFrame3D[] = [];
  
  for (let i = 0; i < trajectory.points.length; i++) {
    const segment = getTrajectorySegment3D(trajectory, i);
    
    frames.push({
      frame: i,
      points: segment,
      pathX: segment.map(p => p.x),
      pathY: segment.map(p => p.y),
      pathZ: segment.map(p => p.z),
    });
  }
  
  return frames;
}

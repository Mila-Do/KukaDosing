import type { Offset } from './types';

interface OffsetDefinition {
  name: string;
  x: number;
  y: number;
  z: number;
  a: number;
  b: number;
  c: number;
}

interface OffsetUsage {
  offsetName: string;
  basePoint: string;
}

/**
 * Extract dose sections - we'll search in entire file for simplicity
 * Since definitions and usages are close together
 */
function extractDoseFolds(content: string): { doseA: string; doseB: string } {
  // For simplicity, we search the entire file
  // The regex patterns will filter by dose_A vs dose_B anyway
  return {
    doseA: content,
    doseB: content,
  };
}

/**
 * Parse offset definitions from a fold block
 * Example: dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
 */
function parseOffsetDefinitions(block: string, doseType: 'A' | 'B'): Map<string, OffsetDefinition> {
  const definitions = new Map<string, OffsetDefinition>();
  
  const regex = new RegExp(
    `(dose_${doseType}_offset_\\d+)\\s*=\\s*\\{X\\s+([-\\d.]+),Y\\s+([-\\d.]+),Z\\s+([-\\d.]+),A\\s+([-\\d.]+),B\\s+([-\\d.]+),C\\s+([-\\d.]+)\\}`,
    'gi'
  );
  
  let match;
  while ((match = regex.exec(block)) !== null) {
    const [, name, x, y, z, a, b, c] = match;
    definitions.set(name, {
      name,
      x: parseFloat(x),
      y: parseFloat(y),
      z: parseFloat(z),
      a: parseFloat(a),
      b: parseFloat(b),
      c: parseFloat(c),
    });
  }
  
  return definitions;
}

/**
 * Parse offset usage from PTP/LIN commands
 * Example: PTP dose_A_offset_010:Xdose_A_1  C_Dis
 */
function parseOffsetUsage(block: string, doseType: 'A' | 'B'): OffsetUsage[] {
  const usages: OffsetUsage[] = [];
  
  const regex = new RegExp(
    `(?:PTP|LIN)\\s+(dose_${doseType}_offset_\\d+):(Xdose_${doseType}_[12])`,
    'gi'
  );
  
  let match;
  while ((match = regex.exec(block)) !== null) {
    const [, offsetName, basePoint] = match;
    usages.push({
      offsetName,
      basePoint,
    });
  }
  
  return usages;
}

/**
 * Parse sequential offset usage with instruction type and order
 * Returns array preserving the order of execution
 */
export interface SequentialOffsetUsage {
  offsetName: string;
  basePoint: string;
  instructionType: 'PTP' | 'LIN';
  sequenceIndex: number;
  doseType: 'A' | 'B';
}

export function parseSequentialOffsetUsage(
  content: string,
  doseType: 'A' | 'B'
): SequentialOffsetUsage[] {
  const usages: SequentialOffsetUsage[] = [];
  
  const regex = new RegExp(
    `(PTP|LIN)\\s+(dose_${doseType}_offset_\\d+):(Xdose_${doseType}_[12])`,
    'gi'
  );
  
  let match;
  let sequenceIndex = 0;
  while ((match = regex.exec(content)) !== null) {
    const [, instructionType, offsetName, basePoint] = match;
    usages.push({
      offsetName,
      basePoint,
      instructionType: instructionType.toUpperCase() as 'PTP' | 'LIN',
      sequenceIndex: sequenceIndex++,
      doseType,
    });
  }
  
  return usages;
}

/**
 * Parse ALL sequential offset usage (both dose_A and dose_B)
 * Returns array in order of appearance in file
 */
export function parseAllSequentialOffsetUsage(content: string): SequentialOffsetUsage[] {
  const usages: SequentialOffsetUsage[] = [];
  
  // Match both dose_A and dose_B in one pass
  // Groups: 1=instruction, 2=offsetName, 3=doseType, 4=basePoint
  const regex = /(PTP|LIN)\s+(dose_([AB])_offset_\d+):(Xdose_[AB]_[12])/gi;
  
  let match;
  let sequenceIndex = 0;
  while ((match = regex.exec(content)) !== null) {
    const [, instructionType, offsetName, doseType, basePoint] = match;
    
    usages.push({
      offsetName,
      basePoint: match[4], // 4th capture group is the basePoint
      instructionType: instructionType.toUpperCase() as 'PTP' | 'LIN',
      sequenceIndex: sequenceIndex++,
      doseType: doseType as 'A' | 'B',
    });
  }
  
  return usages;
}

/**
 * Parse all offsets from the .src file
 */
export function parseSrcFile(content: string): Offset[] {
  const { doseA, doseB } = extractDoseFolds(content);
  const offsets: Offset[] = [];
  
  // Process dose_A
  const defsA = parseOffsetDefinitions(doseA, 'A');
  const usagesA = parseOffsetUsage(doseA, 'A');
  
  for (const usage of usagesA) {
    const def = defsA.get(usage.offsetName);
    if (def) {
      offsets.push({
        ...def,
        basePoint: usage.basePoint,
        doseType: 'A',
      });
    }
  }
  
  // Process dose_B
  const defsB = parseOffsetDefinitions(doseB, 'B');
  const usagesB = parseOffsetUsage(doseB, 'B');
  
  for (const usage of usagesB) {
    const def = defsB.get(usage.offsetName);
    if (def) {
      offsets.push({
        ...def,
        basePoint: usage.basePoint,
        doseType: 'B',
      });
    }
  }
  
  return offsets;
}

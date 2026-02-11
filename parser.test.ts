import { describe, test, expect } from 'bun:test';
import { parseSrcFile } from './src/parser';
import { parseDatFile } from './src/datParser';

describe('SRC Parser', () => {
  test('parses offset definitions', () => {
    const content = `
      ;FOLD dose_A
        dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
        PTP dose_A_offset_010:Xdose_A_1 C_Dis
      ;ENDFOLD
    `;
    
    const offsets = parseSrcFile(content);
    
    expect(offsets).toHaveLength(1);
    expect(offsets[0]).toEqual({
      name: 'dose_A_offset_010',
      x: -2.0,
      y: -2.0,
      z: 45.0,
      a: 0.0,
      b: 0.0,
      c: 0.0,
      basePoint: 'Xdose_A_1',
      doseType: 'A',
    });
  });

  test('parses multiple offsets with different bases', () => {
    const content = `
      ;FOLD dose_A
        dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
        PTP dose_A_offset_010:Xdose_A_1 C_Dis
        
        dose_A_offset_020={X -4.0000,Y -2.5000000,Z 0.50000,A 0.0,B 0.0,C 0.0}
        PTP dose_A_offset_020:Xdose_A_2
      ;ENDFOLD
      
      ;FOLD dose_B
        dose_B_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
        PTP dose_B_offset_010:Xdose_B_1 C_Dis
      ;ENDFOLD
    `;
    
    const offsets = parseSrcFile(content);
    
    expect(offsets).toHaveLength(3);
    expect(offsets[0].basePoint).toBe('Xdose_A_1');
    expect(offsets[1].basePoint).toBe('Xdose_A_2');
    expect(offsets[2].basePoint).toBe('Xdose_B_1');
    expect(offsets[2].doseType).toBe('B');
  });

  test('ignores offsets not used in PTP/LIN', () => {
    const content = `
      ;FOLD dose_A
        dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}
        dose_A_offset_020={X -4.0000,Y -2.5000000,Z 0.50000,A 0.0,B 0.0,C 0.0}
        PTP dose_A_offset_010:Xdose_A_1 C_Dis
      ;ENDFOLD
    `;
    
    const offsets = parseSrcFile(content);
    
    expect(offsets).toHaveLength(1);
    expect(offsets[0].name).toBe('dose_A_offset_010');
  });
});

describe('DAT Parser', () => {
  test('parses base points from .dat file', () => {
    const content = `
      GLOBAL E6POS Xdose_A_2={X 31.0000,Y 3.00000,Z 2.95810342,A 178.876236,B -0.0567103736,C -0.0165922958,S 6,T 50,E1 0.0,E2 0.0,E3 0.0,E4 0.0,E5 0.0,E6 0.0}
      GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,A 178.876266,B -0.0572387315,C -0.0433490872,S 6,T 50,E1 0.0,E2 0.0,E3 0.0,E4 0.0,E5 0.0,E6 0.0}
      GLOBAL E6POS Xdose_B_1={X 17.0000,Y -5.00000,Z 0.168337673,A 178.876266,B -0.0572269112,C -0.0429156423,S 6,T 50,E1 0.0,E2 0.0,E3 0.0,E4 0.0,E5 0.0,E6 0.0}
      GLOBAL E6POS Xdose_B_2={X 31.0000,Y -7.00000,Z 2.99627256,A 178.876266,B -0.0571733080,C -0.0400373712,S 6,T 50,E1 0.0,E2 0.0,E3 0.0,E4 0.0,E5 0.0,E6 0.0}
    `;
    
    const basePoints = parseDatFile(content);
    
    expect(basePoints.Xdose_A_1).toEqual({ x: 17.0, y: 3.0 });
    expect(basePoints.Xdose_A_2).toEqual({ x: 31.0, y: 3.0 });
    expect(basePoints.Xdose_B_1).toEqual({ x: 17.0, y: -5.0 });
    expect(basePoints.Xdose_B_2).toEqual({ x: 31.0, y: -7.0 });
  });

  test('throws error if base point is missing', () => {
    const content = `
      GLOBAL E6POS Xdose_A_1={X 17.0000,Y 3.00000,Z 0.274462,A 178.876266,B -0.0572387315,C -0.0433490872,S 6,T 50,E1 0.0,E2 0.0,E3 0.0,E4 0.0,E5 0.0,E6 0.0}
    `;
    
    expect(() => parseDatFile(content)).toThrow('Base point');
  });
});

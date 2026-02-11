import { describe, test, expect } from 'bun:test';
import { parseSrcFile } from './parser';

const testSrcContent = `
;FOLD dose_A  
   ;some other code
   
   dose_A_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}      
   ;more code
   PTP dose_A_offset_010:Xdose_A_1  C_Dis               
   
   dose_A_offset_020={X -4.0000,Y -2.5000000,Z 0.50000,A 0.0,B 0.0,C 0.0}      
   PTP dose_A_offset_020:Xdose_A_2                  
   
   dose_A_offset_030={X -5.50000,Y -2.500000,Z -1.0000,A 0.0,B 0.0,C 0.0}      
   ;this one is not used, should be ignored
   
;ENDFOLD

;FOLD dose_B
   dose_B_offset_010={X -2.0000,Y -2.00000,Z 45.00000,A 0.0,B 0.0,C 0.0}      
   PTP dose_B_offset_010:Xdose_B_1  C_Dis               
   
   dose_B_offset_020={X -4.0000,Y -2.5000000,Z 0.50000,A 0.0,B 0.0,C 0.0}      
   LIN dose_B_offset_020:Xdose_B_2                  
;ENDFOLD
`;

describe('parseSrcFile', () => {
  test('should parse dose_A offsets', () => {
    const offsets = parseSrcFile(testSrcContent);
    const doseAOffsets = offsets.filter(o => o.doseType === 'A');
    
    expect(doseAOffsets).toHaveLength(2);
    expect(doseAOffsets[0].name).toBe('dose_A_offset_010');
    expect(doseAOffsets[0].x).toBe(-2);
    expect(doseAOffsets[0].y).toBe(-2);
    expect(doseAOffsets[0].z).toBe(45);
    expect(doseAOffsets[0].basePoint).toBe('Xdose_A_1');
    expect(doseAOffsets[0].doseType).toBe('A');
  });
  
  test('should parse dose_B offsets', () => {
    const offsets = parseSrcFile(testSrcContent);
    const doseBOffsets = offsets.filter(o => o.doseType === 'B');
    
    expect(doseBOffsets).toHaveLength(2);
    expect(doseBOffsets[0].name).toBe('dose_B_offset_010');
    expect(doseBOffsets[0].basePoint).toBe('Xdose_B_1');
    expect(doseBOffsets[0].doseType).toBe('B');
  });
  
  test('should handle both PTP and LIN commands', () => {
    const offsets = parseSrcFile(testSrcContent);
    const doseB020 = offsets.find(o => o.name === 'dose_B_offset_020');
    
    expect(doseB020).toBeDefined();
    expect(doseB020?.basePoint).toBe('Xdose_B_2');
  });
  
  test('should only include offsets that are used in PTP/LIN', () => {
    const offsets = parseSrcFile(testSrcContent);
    const dose030 = offsets.find(o => o.name === 'dose_A_offset_030');
    
    expect(dose030).toBeUndefined();
  });
  
  test('should parse negative and positive numbers correctly', () => {
    const offsets = parseSrcFile(testSrcContent);
    const offset010 = offsets.find(o => o.name === 'dose_A_offset_010');
    
    expect(offset010?.x).toBe(-2);
    expect(offset010?.y).toBe(-2);
    expect(offset010?.z).toBe(45);
  });
  
  test('should handle base points with _1 and _2 suffixes', () => {
    const offsets = parseSrcFile(testSrcContent);
    const offset010 = offsets.find(o => o.name === 'dose_A_offset_010');
    const offset020 = offsets.find(o => o.name === 'dose_A_offset_020');
    
    expect(offset010?.basePoint).toBe('Xdose_A_1');
    expect(offset020?.basePoint).toBe('Xdose_A_2');
  });
});

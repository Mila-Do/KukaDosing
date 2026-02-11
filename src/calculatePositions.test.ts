import { describe, test, expect } from 'bun:test';
import { 
  calculatePositions, 
  calculatePositions3D,
  organizeChartData,
  organizeChartData3D 
} from './calculatePositions';
import type { Offset } from './types';
import type { BasePoints, BasePoints3D } from './datParser';

describe('calculatePositions', () => {
  const mockBasePoints: BasePoints = {
    Xdose_A_1: { x: 10, y: 20 },
    Xdose_A_2: { x: 30, y: 20 },
    Xdose_B_1: { x: 10, y: 0 },
    Xdose_B_2: { x: 30, y: 0 },
  };

  test('should calculate correct 2D positions', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_1',
        doseType: 'A',
      },
      {
        name: 'dose_B_offset_020',
        x: -5,
        y: 10,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_B_1',
        doseType: 'B',
      },
    ];

    const positions = calculatePositions(offsets, mockBasePoints);

    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      name: 'dose_A_offset_010',
      x: 12, // 10 + 2
      y: 23, // 20 + 3
      basePoint: 'Xdose_A_1',
      doseType: 'A',
    });
    expect(positions[1]).toEqual({
      name: 'dose_B_offset_020',
      x: 5, // 10 + (-5)
      y: 10, // 0 + 10
      basePoint: 'Xdose_B_1',
      doseType: 'B',
    });
  });

  test('should handle negative offsets', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: -2.5,
        y: -3.5,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_2',
        doseType: 'A',
      },
    ];

    const positions = calculatePositions(offsets, mockBasePoints);

    expect(positions[0].x).toBe(27.5); // 30 + (-2.5)
    expect(positions[0].y).toBe(16.5); // 20 + (-3.5)
  });

  test('should skip offsets with missing base points', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_1',
        doseType: 'A',
      },
      {
        name: 'dose_A_offset_020',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'NonExistentBase',
        doseType: 'A',
      },
    ];

    const positions = calculatePositions(offsets, mockBasePoints);

    expect(positions).toHaveLength(1);
    expect(positions[0].name).toBe('dose_A_offset_010');
  });

  test('should handle empty offsets array', () => {
    const positions = calculatePositions([], mockBasePoints);
    expect(positions).toHaveLength(0);
  });

  test('should preserve doseType and basePoint', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_B_offset_050',
        x: 1,
        y: 1,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_B_2',
        doseType: 'B',
      },
    ];

    const positions = calculatePositions(offsets, mockBasePoints);

    expect(positions[0].doseType).toBe('B');
    expect(positions[0].basePoint).toBe('Xdose_B_2');
  });
});

describe('organizeChartData', () => {
  const mockBasePoints: BasePoints = {
    Xdose_A_1: { x: 10, y: 20 },
    Xdose_A_2: { x: 30, y: 20 },
    Xdose_B_1: { x: 10, y: 0 },
    Xdose_B_2: { x: 30, y: 0 },
  };

  test('should organize base points correctly', () => {
    const chartData = organizeChartData(mockBasePoints, []);

    expect(chartData.basePoints).toHaveLength(4);
    expect(chartData.basePoints[0]).toEqual({
      name: 'Xdose_A_1',
      x: 10,
      y: 20,
      doseType: 'A',
      position: '1',
    });
    expect(chartData.basePoints[2]).toEqual({
      name: 'Xdose_B_1',
      x: 10,
      y: 0,
      doseType: 'B',
      position: '1',
    });
  });

  test('should include all offset positions', () => {
    const positions = [
      {
        name: 'dose_A_offset_010',
        x: 12,
        y: 23,
        basePoint: 'Xdose_A_1',
        doseType: 'A' as const,
      },
      {
        name: 'dose_B_offset_020',
        x: 5,
        y: 10,
        basePoint: 'Xdose_B_1',
        doseType: 'B' as const,
      },
    ];

    const chartData = organizeChartData(mockBasePoints, positions);

    expect(chartData.offsetPositions).toHaveLength(2);
    expect(chartData.offsetPositions).toEqual(positions);
  });

  test('should handle empty positions', () => {
    const chartData = organizeChartData(mockBasePoints, []);

    expect(chartData.basePoints).toHaveLength(4);
    expect(chartData.offsetPositions).toHaveLength(0);
  });
});

describe('calculatePositions3D', () => {
  const mockBasePoints3D: BasePoints3D = {
    Xdose_A_1: { x: 10, y: 20, z: 0.5 },
    Xdose_A_2: { x: 30, y: 20, z: 2.5 },
    Xdose_B_1: { x: 10, y: 0, z: 0.3 },
    Xdose_B_2: { x: 30, y: 0, z: 2.8 },
  };

  test('should calculate correct 3D positions', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_1',
        doseType: 'A',
      },
      {
        name: 'dose_B_offset_020',
        x: -5,
        y: 10,
        z: 50,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_B_1',
        doseType: 'B',
      },
    ];

    const positions = calculatePositions3D(offsets, mockBasePoints3D);

    expect(positions).toHaveLength(2);
    expect(positions[0]).toEqual({
      name: 'dose_A_offset_010',
      x: 12, // 10 + 2
      y: 23, // 20 + 3
      z: 45.5, // 0.5 + 45
      basePoint: 'Xdose_A_1',
      doseType: 'A',
    });
    expect(positions[1]).toEqual({
      name: 'dose_B_offset_020',
      x: 5, // 10 + (-5)
      y: 10, // 0 + 10
      z: 50.3, // 0.3 + 50
      basePoint: 'Xdose_B_1',
      doseType: 'B',
    });
  });

  test('should handle negative Z offsets', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: 0,
        y: 0,
        z: -1.5,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_2',
        doseType: 'A',
      },
    ];

    const positions = calculatePositions3D(offsets, mockBasePoints3D);

    expect(positions[0].z).toBe(1.0); // 2.5 + (-1.5)
  });

  test('should skip offsets with missing base points in 3D', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_A_offset_010',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_A_1',
        doseType: 'A',
      },
      {
        name: 'dose_A_offset_020',
        x: 2,
        y: 3,
        z: 45,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'NonExistentBase',
        doseType: 'A',
      },
    ];

    const positions = calculatePositions3D(offsets, mockBasePoints3D);

    expect(positions).toHaveLength(1);
    expect(positions[0].name).toBe('dose_A_offset_010');
  });

  test('should preserve all coordinates and metadata', () => {
    const offsets: Offset[] = [
      {
        name: 'dose_B_offset_050',
        x: 1.5,
        y: 2.5,
        z: 30.5,
        a: 0,
        b: 0,
        c: 0,
        basePoint: 'Xdose_B_2',
        doseType: 'B',
      },
    ];

    const positions = calculatePositions3D(offsets, mockBasePoints3D);

    expect(positions[0]).toEqual({
      name: 'dose_B_offset_050',
      x: 31.5, // 30 + 1.5
      y: 2.5, // 0 + 2.5
      z: 33.3, // 2.8 + 30.5
      basePoint: 'Xdose_B_2',
      doseType: 'B',
    });
  });
});

describe('organizeChartData3D', () => {
  const mockBasePoints3D: BasePoints3D = {
    Xdose_A_1: { x: 10, y: 20, z: 0.5 },
    Xdose_A_2: { x: 30, y: 20, z: 2.5 },
    Xdose_B_1: { x: 10, y: 0, z: 0.3 },
    Xdose_B_2: { x: 30, y: 0, z: 2.8 },
  };

  test('should organize 3D base points correctly', () => {
    const chartData = organizeChartData3D(mockBasePoints3D, []);

    expect(chartData.basePoints).toHaveLength(4);
    expect(chartData.basePoints[0]).toEqual({
      name: 'Xdose_A_1',
      x: 10,
      y: 20,
      z: 0.5,
      doseType: 'A',
      position: '1',
    });
    expect(chartData.basePoints[3]).toEqual({
      name: 'Xdose_B_2',
      x: 30,
      y: 0,
      z: 2.8,
      doseType: 'B',
      position: '2',
    });
  });

  test('should include all 3D offset positions', () => {
    const positions = [
      {
        name: 'dose_A_offset_010',
        x: 12,
        y: 23,
        z: 45.5,
        basePoint: 'Xdose_A_1',
        doseType: 'A' as const,
      },
      {
        name: 'dose_B_offset_020',
        x: 5,
        y: 10,
        z: 50.3,
        basePoint: 'Xdose_B_1',
        doseType: 'B' as const,
      },
    ];

    const chartData = organizeChartData3D(mockBasePoints3D, positions);

    expect(chartData.offsetPositions).toHaveLength(2);
    expect(chartData.offsetPositions).toEqual(positions);
  });
});

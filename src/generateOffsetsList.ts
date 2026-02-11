import type { Offset, OffsetPosition2D } from './types';
import type { BasePoints } from './datParser';

/**
 * Group offsets by their base points
 */
function groupOffsetsByBase(offsets: Offset[]): Map<string, Offset[]> {
  const groups = new Map<string, Offset[]>();
  
  for (const offset of offsets) {
    if (!groups.has(offset.basePoint)) {
      groups.set(offset.basePoint, []);
    }
    groups.get(offset.basePoint)!.push(offset);
  }
  
  return groups;
}

/**
 * Generate markdown table for offsets
 */
function generateOffsetTable(
  offsets: Offset[],
  basePoint: { x: number; y: number }
): string {
  let table = '| Offset | Offset X | Offset Y | Offset Z | Pozycja X | Pozycja Y |\n';
  table += '|--------|----------|----------|----------|-----------|-----------|\n';
  
  for (const offset of offsets) {
    const finalX = basePoint.x + offset.x;
    const finalY = basePoint.y + offset.y;
    
    table += `| ${offset.name} `;
    table += `| ${offset.x.toFixed(2)} `;
    table += `| ${offset.y.toFixed(2)} `;
    table += `| ${offset.z.toFixed(2)} `;
    table += `| ${finalX.toFixed(2)} `;
    table += `| ${finalY.toFixed(2)} |\n`;
  }
  
  return table;
}

/**
 * Generate complete offsets list markdown
 */
export function generateOffsetsListMarkdown(
  basePoints: BasePoints,
  offsets: Offset[]
): string {
  const doseA = offsets.filter(o => o.doseType === 'A');
  const doseB = offsets.filter(o => o.doseType === 'B');
  
  const groupsA = groupOffsetsByBase(doseA);
  const groupsB = groupOffsetsByBase(doseB);
  
  let md = '# Lista Punktów Dozowania - KUKA\n\n';
  
  // Base points table
  md += '## Punkty Bazowe\n\n';
  md += '| Nazwa | X (mm) | Y (mm) |\n';
  md += '|-------|--------|--------|\n';
  md += `| **Xdose_A_1** | ${basePoints.Xdose_A_1.x.toFixed(2)} | ${basePoints.Xdose_A_1.y.toFixed(2)} |\n`;
  md += `| **Xdose_A_2** | ${basePoints.Xdose_A_2.x.toFixed(2)} | ${basePoints.Xdose_A_2.y.toFixed(2)} |\n`;
  md += `| **Xdose_B_1** | ${basePoints.Xdose_B_1.x.toFixed(2)} | ${basePoints.Xdose_B_1.y.toFixed(2)} |\n`;
  md += `| **Xdose_B_2** | ${basePoints.Xdose_B_2.x.toFixed(2)} | ${basePoints.Xdose_B_2.y.toFixed(2)} |\n\n`;
  
  md += '---\n\n';
  
  // DOSE A section
  md += '## DOSE A - Offsety i Pozycje Finalne\n\n';
  
  // Xdose_A_1
  if (groupsA.has('Xdose_A_1')) {
    const offsetsA1 = groupsA.get('Xdose_A_1')!;
    md += `### Baza: Xdose_A_1 (${basePoints.Xdose_A_1.x.toFixed(2)}, ${basePoints.Xdose_A_1.y.toFixed(2)})\n\n`;
    md += generateOffsetTable(offsetsA1, basePoints.Xdose_A_1);
    md += '\n';
  }
  
  // Xdose_A_2
  if (groupsA.has('Xdose_A_2')) {
    const offsetsA2 = groupsA.get('Xdose_A_2')!;
    md += `### Baza: Xdose_A_2 (${basePoints.Xdose_A_2.x.toFixed(2)}, ${basePoints.Xdose_A_2.y.toFixed(2)})\n\n`;
    md += generateOffsetTable(offsetsA2, basePoints.Xdose_A_2);
    md += '\n';
  }
  
  md += '---\n\n';
  
  // DOSE B section
  md += '## DOSE B - Offsety i Pozycje Finalne\n\n';
  
  // Xdose_B_1
  if (groupsB.has('Xdose_B_1')) {
    const offsetsB1 = groupsB.get('Xdose_B_1')!;
    md += `### Baza: Xdose_B_1 (${basePoints.Xdose_B_1.x.toFixed(2)}, ${basePoints.Xdose_B_1.y.toFixed(2)})\n\n`;
    md += generateOffsetTable(offsetsB1, basePoints.Xdose_B_1);
    md += '\n';
  }
  
  // Xdose_B_2
  if (groupsB.has('Xdose_B_2')) {
    const offsetsB2 = groupsB.get('Xdose_B_2')!;
    md += `### Baza: Xdose_B_2 (${basePoints.Xdose_B_2.x.toFixed(2)}, ${basePoints.Xdose_B_2.y.toFixed(2)})\n\n`;
    md += generateOffsetTable(offsetsB2, basePoints.Xdose_B_2);
    md += '\n';
  }
  
  md += '---\n\n';
  
  // Summary
  md += '## Podsumowanie\n\n';
  md += '- **Punkty bazowe**: 4\n';
  md += `- **Total offsetów**: ${offsets.length}\n`;
  md += `  - **dose_A**: ${doseA.length} offsetów`;
  md += ` (${groupsA.get('Xdose_A_1')?.length || 0} od Xdose_A_1, `;
  md += `${groupsA.get('Xdose_A_2')?.length || 0} od Xdose_A_2)\n`;
  md += `  - **dose_B**: ${doseB.length} offsetów`;
  md += ` (${groupsB.get('Xdose_B_1')?.length || 0} od Xdose_B_1, `;
  md += `${groupsB.get('Xdose_B_2')?.length || 0} od Xdose_B_2)\n\n`;
  md += '**Formuła**: `Pozycja = Punkt Bazowy + Offset`\n';
  
  return md;
}

/**
 * Save offsets list to markdown file
 */
export async function saveOffsetsListToFile(
  basePoints: BasePoints,
  offsets: Offset[],
  outputPath: string = 'offsets-list.md'
): Promise<void> {
  const markdown = generateOffsetsListMarkdown(basePoints, offsets);
  await Bun.write(outputPath, markdown);
  console.log(`📄 Offsets list saved to: ${outputPath}`);
}

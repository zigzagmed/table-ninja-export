
// Excel export functionality

import * as XLSX from 'xlsx';
import { ExportData, ExportConfig } from './types';
import { formatNumber, getSignificanceStars } from './formatters';

export const exportToExcel = (data: ExportData, config: ExportConfig, customHeaders: Record<string, string>) => {
  try {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Create workbook with multiple sheets
    const wb = XLSX.utils.book_new();
    
    // Main results table with publication formatting
    const headers = visibleColumnOrder.map((col: string) => customHeaders[col]);
    const rows = data.coefficients.map((row: any) => 
      visibleColumnOrder.map((columnId: string) => {
        if (columnId === 'variable') return row[columnId];
        if (columnId === 'coef') {
          const coef = formatNumber(row[columnId], 'coefficient', config.decimalPlaces);
          const stars = getSignificanceStars(row.p_value, config.showSignificance);
          return `${coef}${stars}`;
        }
        if (columnId === 'p_value') return formatNumber(row[columnId], 'pvalue', config.decimalPlaces);
        return formatNumber(row[columnId], 'default', config.decimalPlaces);
      })
    );

    // Add significance note if applicable
    const tableData = [
      [config.tableTitle],
      [],
      headers,
      ...rows
    ];

    if (config.showSignificance) {
      tableData.push([]);
      tableData.push(['Note: * p<0.05, ** p<0.01, *** p<0.001']);
    }

    const ws = XLSX.utils.aoa_to_sheet(tableData);
    
    // Style the worksheet for publication
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Set column widths
    ws['!cols'] = visibleColumnOrder.map(() => ({ wch: 12 }));
    
    // Apply bold formatting to header row (row 3, which is index 2)
    const headerRowIndex = 2;
    for (let col = 0; col < visibleColumnOrder.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (ws[cellAddress]) {
        if (!ws[cellAddress].s) ws[cellAddress].s = {};
        if (!ws[cellAddress].s.font) ws[cellAddress].s.font = {};
        ws[cellAddress].s.font.bold = true;
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Regression Results');
    
    // Add model statistics sheet if enabled
    if (config.includeModelStats) {
      const statsData = [
        ['Model Statistics'],
        [],
        ['Statistic', 'Value'],
        ['Model', data.modelInfo.model],
        ['Dependent Variable', data.modelInfo.dependentVariable],
        ['No. Observations', data.modelInfo.observations],
        ['R-squared', formatNumber(data.modelStats.rSquared, 'default', config.decimalPlaces)],
        ['Adj. R-squared', formatNumber(data.modelStats.adjRSquared, 'default', config.decimalPlaces)],
        ['F-statistic', formatNumber(data.modelStats.fStatistic, 'default', config.decimalPlaces)],
        ['AIC', formatNumber(data.modelStats.aic, 'default', config.decimalPlaces)],
        ['BIC', formatNumber(data.modelStats.bic, 'default', config.decimalPlaces)],
      ];
      
      const statsWs = XLSX.utils.aoa_to_sheet(statsData);
      statsWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
      
      // Apply bold formatting to statistics headers
      const statsHeaderCells = ['A3', 'B3'];
      statsHeaderCells.forEach(cellAddress => {
        if (statsWs[cellAddress]) {
          if (!statsWs[cellAddress].s) statsWs[cellAddress].s = {};
          if (!statsWs[cellAddress].s.font) statsWs[cellAddress].s.font = {};
          statsWs[cellAddress].s.font.bold = true;
        }
      });
      
      XLSX.utils.book_append_sheet(wb, statsWs, 'Model Statistics');
    }
    
    // Save file with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${config.tableTitle.replace(/\s+/g, '_')}_${timestamp}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
};


// Utility functions for exporting data in various formats

import * as XLSX from 'xlsx';
import { Document, Packer, Table as DocxTable, TableRow, TableCell, Paragraph, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';

// Types for export functionality
export interface ExportConfig {
  tableTitle: string;
  decimalPlaces: number;
  showSignificance: boolean;
  includeModelStats: boolean;
  columnOrder: string[];
  visibleColumns: string[];
}

export interface ModelInfo {
  model: string;
  dependentVariable: string;
  observations: number;
}

export interface ModelStats {
  rSquared: number;
  adjRSquared: number;
  fStatistic: number;
  aic: number;
  bic: number;
}

export interface ExportData {
  coefficients: any[];
  modelInfo: ModelInfo;
  modelStats: ModelStats;
}

// Helper functions
export const formatNumber = (value: number, type: string = 'default', decimals: number = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'pvalue':
      return value < 0.001 ? '<0.001' : value.toFixed(decimals);
    case 'coefficient':
      return value.toFixed(decimals);
    default:
      return value.toFixed(decimals);
  }
};

export const getSignificanceStars = (pValue: number, showSignificance: boolean) => {
  if (!showSignificance) return '';
  if (pValue < 0.001) return '^{***}';
  if (pValue < 0.01) return '^{**}';
  if (pValue < 0.05) return '^{*}';
  return '';
};

// Excel Export Function
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

// Word Export Function
export const exportToWord = async (data: ExportData, config: ExportConfig, customHeaders: Record<string, string>) => {
  try {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Create header row with bold text and bottom border only
    const headerRow = new TableRow({
      children: visibleColumnOrder.map(col => 
        new TableCell({
          children: [new Paragraph({
            text: customHeaders[col],
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            run: {
              font: "Times New Roman",
              size: 24, // 12pt font
              bold: true,
            }
          })],
          width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0 },
            bottom: { style: BorderStyle.SINGLE, size: 6 },
            left: { style: BorderStyle.NONE, size: 0 },
            right: { style: BorderStyle.NONE, size: 0 },
          },
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
        })
      ),
    });

    // Create data rows with no borders except for the last row
    const dataRows = data.coefficients.map((row: any, index: number) => {
      const isLastRow = index === data.coefficients.length - 1;
      
      return new TableRow({
        children: visibleColumnOrder.map((columnId: string) => {
          let cellValue = '';
          
          if (columnId === 'variable') {
            cellValue = row[columnId];
          } else if (columnId === 'coef') {
            cellValue = formatNumber(row[columnId], 'coefficient', config.decimalPlaces) + 
              getSignificanceStars(row.p_value, config.showSignificance);
          } else if (columnId === 'p_value') {
            cellValue = formatNumber(row[columnId], 'pvalue', config.decimalPlaces);
          } else {
            cellValue = formatNumber(row[columnId], 'default', config.decimalPlaces);
          }
          
          return new TableCell({
            children: [new Paragraph({
              text: cellValue,
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              run: {
                font: "Times New Roman",
                size: 22, // 11pt font for data
              }
            })],
            width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0 },
              bottom: isLastRow ? { style: BorderStyle.SINGLE, size: 6 } : { style: BorderStyle.NONE, size: 0 },
              left: { style: BorderStyle.NONE, size: 0 },
              right: { style: BorderStyle.NONE, size: 0 },
            },
            margins: { top: 100, bottom: 100, left: 100, right: 100 },
          });
        }),
      });
    });

    // Create table with minimal borders
    const table = new DocxTable({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0 },
        bottom: { style: BorderStyle.NONE, size: 0 },
        left: { style: BorderStyle.NONE, size: 0 },
        right: { style: BorderStyle.NONE, size: 0 },
        insideHorizontal: { style: BorderStyle.NONE, size: 0 },
        insideVertical: { style: BorderStyle.NONE, size: 0 },
      },
      layout: "autofit",
    });

    // Build document sections with proper academic formatting
    const sections = [
      new Paragraph({
        text: config.tableTitle,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        run: {
          font: "Times New Roman",
          size: 28, // 14pt font
          bold: true,
        }
      }),
      new Paragraph({ 
        text: "",
        spacing: { after: 200 }
      }), // Spacing
      table,
    ];

    // Add significance note if enabled with proper formatting
    if (config.showSignificance) {
      sections.push(
        new Paragraph({ 
          text: "",
          spacing: { after: 200 }
        }), // Spacing
        new Paragraph({
          text: "Note: * p<0.05, ** p<0.01, *** p<0.001",
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
          run: {
            font: "Times New Roman",
            size: 20, // 10pt font for notes
            italics: true,
          }
        })
      );
    }

    // Add model statistics if enabled with proper formatting
    if (config.includeModelStats) {
      sections.push(
        new Paragraph({ 
          text: "",
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "Model Statistics",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
          run: {
            font: "Times New Roman",
            size: 24, // 12pt font
            bold: true,
          }
        }),
        new Paragraph({
          text: `Model: ${data.modelInfo.model}; Dependent Variable: ${data.modelInfo.dependentVariable}; N = ${data.modelInfo.observations}; R² = ${formatNumber(data.modelStats.rSquared, 'default', config.decimalPlaces)}; Adj. R² = ${formatNumber(data.modelStats.adjRSquared, 'default', config.decimalPlaces)}; F = ${formatNumber(data.modelStats.fStatistic, 'default', config.decimalPlaces)}`,
          spacing: { after: 200 },
          run: {
            font: "Times New Roman",
            size: 22, // 11pt font
          }
        })
      );
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              font: "Times New Roman",
              size: 22,
            },
            paragraph: {
              spacing: {
                line: 360, // 1.5 line spacing
                lineRule: "auto",
              }
            }
          }
        }
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440, // 1 inch margins
              bottom: 1440,
              left: 1440,
              right: 1440,
            }
          }
        },
        children: sections,
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    a.download = `${config.tableTitle.replace(/\s+/g, '_')}_${timestamp}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Word export error:', error);
    return false;
  }
};

// LaTeX Code Generation
export const generateLatexCode = (data: ExportData, config: ExportConfig, customHeaders: Record<string, string>) => {
  try {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Count non-variable columns for the table specification
    const dataColumns = visibleColumnOrder.filter(col => col !== 'variable');
    const columnCount = dataColumns.length;

    // Generate professional LaTeX table code following academic standards
    let latexCode = `\\documentclass[12pt]{article}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{amsmath}
\\usepackage[margin=1in]{geometry}
\\begin{document}

\\begin{table}[htbp]
\\centering
\\caption{${config.tableTitle}}
\\begin{tabular}{l*{${columnCount}}{c}}
\\toprule
`;

    // Add header row with model numbers and column names
    const headers = [''];
    dataColumns.forEach((col, index) => {
      headers.push(`(${index + 1})`);
    });
    latexCode += headers.join(' & ') + ' \\\\\n';

    // Add column names row
    const columnNames = [''];
    dataColumns.forEach(col => {
      columnNames.push(customHeaders[col]);
    });
    latexCode += columnNames.join(' & ') + ' \\\\\n\\midrule\n';

    // Add data rows with coefficients and t-statistics
    data.coefficients.forEach((row: any, rowIndex: number) => {
      // Coefficient row
      const coeffRow = [row.variable || ''];
      dataColumns.forEach(columnId => {
        if (columnId === 'coef') {
          const coef = formatNumber(row[columnId], 'coefficient', config.decimalPlaces);
          const stars = getSignificanceStars(row.p_value, config.showSignificance);
          coeffRow.push(`${coef}${stars}`);
        } else if (columnId === 'p_value') {
          coeffRow.push(formatNumber(row[columnId], 'pvalue', config.decimalPlaces));
        } else {
          coeffRow.push(formatNumber(row[columnId], 'default', config.decimalPlaces));
        }
      });
      latexCode += coeffRow.join(' & ') + ' \\\\\n';

      // t-statistic row (in parentheses)
      if (row.t !== undefined) {
        const tStatRow = [''];
        dataColumns.forEach(columnId => {
          if (columnId === 'coef') {
            tStatRow.push(`(${formatNumber(row.t, 'default', 2)})`);
          } else {
            tStatRow.push(''); // Empty for other columns
          }
        });
        latexCode += tStatRow.join(' & ') + ' \\\\\n';
      }

      // Add empty row for spacing between variables (except after last variable)
      if (rowIndex < data.coefficients.length - 1) {
        const emptyRow = new Array(dataColumns.length + 1).fill('');
        latexCode += emptyRow.join(' & ') + ' \\\\\n';
      }
    });

    latexCode += '\\midrule\n';

    // Add model statistics if enabled
    if (config.includeModelStats) {
      const statsRow = ['Observations'];
      dataColumns.forEach(() => {
        statsRow.push(data.modelInfo.observations.toString());
      });
      latexCode += statsRow.join(' & ') + ' \\\\\n';

      const r2Row = ['R$^2$'];
      dataColumns.forEach(() => {
        r2Row.push(formatNumber(data.modelStats.rSquared, 'default', config.decimalPlaces));
      });
      latexCode += r2Row.join(' & ') + ' \\\\\n';

      const adjR2Row = ['Adjusted R$^2$'];
      dataColumns.forEach(() => {
        adjR2Row.push(formatNumber(data.modelStats.adjRSquared, 'default', config.decimalPlaces));
      });
      latexCode += adjR2Row.join(' & ') + ' \\\\\n';
    }

    latexCode += '\\bottomrule\n';
    latexCode += '\\end{tabular}\n';

    // Add professional footnotes
    if (config.showSignificance) {
      latexCode += '\\\\[1em]\n';
      latexCode += '\\footnotesize\n';
      latexCode += '\\flushleft\n';
      latexCode += '$t$ statistics in parentheses\\\\\n';
      latexCode += '$^{*}$ $p<0.05$, $^{**}$ $p<0.01$, $^{***}$ $p<0.001$\n';
    }

    latexCode += '\\end{table}\n\n\\end{document}';
    
    return latexCode;
  } catch (error) {
    console.error('LaTeX generation error:', error);
    return null;
  }
};

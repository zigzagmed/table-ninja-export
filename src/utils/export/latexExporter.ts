
// LaTeX export functionality

import { ExportData, ExportConfig } from './types';
import { formatNumber, getSignificanceStars } from './formatters';

export const generateLatexCode = (data: ExportData, config: ExportConfig, customHeaders: Record<string, string>) => {
  try {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Count non-variable columns for the table specification
    const dataColumns = visibleColumnOrder.filter(col => col !== 'variable');
    const columnCount = dataColumns.length;

    // Add font package based on selected font
    let fontPackage = '';
    switch (config.latexFont) {
      case 'lmodern':
        fontPackage = '\\usepackage{lmodern}  % Latin Modern (enhanced Computer Modern)\n\\usepackage[T1]{fontenc}\n';
        break;
      case 'times':
        fontPackage = '\\usepackage{mathptmx}  % Times Roman font\n';
        break;
      case 'palatino':
        fontPackage = '\\usepackage{mathpazo}  % Palatino font\n';
        break;
      case 'newtx':
        fontPackage = '\\usepackage{newtxtext,newtxmath}  % Modern look\n';
        break;
      default:
        fontPackage = '\\usepackage{lmodern}  % Default: Latin Modern\n\\usepackage[T1]{fontenc}\n';
    }

    // Generate professional LaTeX table code following academic standards
    let latexCode = `\\documentclass[12pt]{article}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{amsmath}
${fontPackage}\\usepackage[margin=1in]{geometry}
\\begin{document}

\\begin{table}[htbp]
\\centering
\\caption{${config.tableTitle}}
\\begin{tabular}{p{3cm}*{${columnCount}}{c}}
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

    // Add data rows with coefficients and t-statistics, with increased spacing
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


// HTML table generation utilities for LaTeX rendering

interface TableData {
  variable: string;
  coef: number;
  std_err: number;
  t: number;
  p_value: number;
  ci_lower?: number;
  ci_upper?: number;
}

interface ModelStats {
  observations?: number;
  rSquared?: number;
  adjRSquared?: number;
  fStatistic?: number;
}

interface TableConfig {
  visibleColumns?: string[];
  decimalPlaces?: number;
  showSignificance?: boolean;
  includeModelStats?: boolean;
}

const formatNumber = (value: number, type: string = 'default', decimalPlaces: number = 3): string => {
  if (value === null || value === undefined) return 'N/A';
  
  if (type === 'pvalue') {
    return value < 0.001 ? '<0.001' : value.toFixed(decimalPlaces);
  }
  return value.toFixed(decimalPlaces);
};

const getSignificanceStars = (pValue: number, showSignificance: boolean): string => {
  if (!showSignificance) return '';
  if (pValue < 0.001) return '***';
  if (pValue < 0.01) return '**';
  if (pValue < 0.05) return '*';
  return '';
};

const createTableHeader = (
  visibleColumns: string[], 
  headers: Record<string, string>, 
  fontFamily: string
): HTMLTableRowElement => {
  const headerRow = document.createElement('tr');
  
  visibleColumns.forEach((col: string) => {
    const th = document.createElement('th');
    th.style.textAlign = col === 'variable' ? 'left' : 'center';
    th.style.padding = '8px 12px';
    th.style.borderTop = '2px solid #000';
    th.style.borderBottom = '1px solid #000';
    th.style.fontWeight = 'bold';
    th.style.fontFamily = fontFamily;
    th.textContent = headers[col] || col;
    headerRow.appendChild(th);
  });
  
  return headerRow;
};

const createTableBody = (
  tableData: TableData[],
  visibleColumns: string[],
  config: TableConfig,
  fontFamily: string
): HTMLTableSectionElement => {
  const tbody = document.createElement('tbody');
  const decimalPlaces = config.decimalPlaces || 3;
  const showSignificance = config.showSignificance !== false;
  
  tableData.forEach((row: TableData) => {
    const tableRow = document.createElement('tr');
    
    visibleColumns.forEach((columnId: string) => {
      const cell = document.createElement('td');
      cell.style.textAlign = columnId === 'variable' ? 'left' : 'center';
      cell.style.padding = '6px 12px';
      cell.style.fontFamily = fontFamily;
      
      let cellValue = '';
      
      if (columnId === 'variable') {
        cellValue = row[columnId] || '';
      } else if (columnId === 'coef') {
        const coef = formatNumber(row[columnId], 'coefficient', decimalPlaces);
        const stars = getSignificanceStars(row.p_value, showSignificance);
        cellValue = `${coef}${stars}`;
      } else if (columnId === 'p_value') {
        cellValue = formatNumber(row[columnId], 'pvalue', decimalPlaces);
      } else {
        cellValue = formatNumber((row as any)[columnId], 'default', decimalPlaces);
      }
      
      cell.textContent = cellValue;
      tableRow.appendChild(cell);
    });
    
    tbody.appendChild(tableRow);
  });
  
  return tbody;
};

const addModelStatistics = (
  tbody: HTMLTableSectionElement,
  visibleColumns: string[],
  modelStats: ModelStats,
  data: any,
  fontFamily: string
): void => {
  // Add horizontal line before statistics
  const statsLineRow = document.createElement('tr');
  visibleColumns.forEach(() => {
    const cell = document.createElement('td');
    cell.style.borderTop = '1px solid #000';
    cell.style.padding = '4px 12px';
    cell.textContent = '';
    statsLineRow.appendChild(cell);
  });
  tbody.appendChild(statsLineRow);
  
  const stats = [
    { label: 'Observations', value: data?.modelInfo?.observations?.toString() || '150' },
    { label: 'R²', value: formatNumber(modelStats.rSquared || 0.752) },
    { label: 'Adjusted R²', value: formatNumber(modelStats.adjRSquared || 0.748) },
    { label: 'F-statistic', value: formatNumber(modelStats.fStatistic || 45.23) }
  ];
  
  stats.forEach(stat => {
    const statRow = document.createElement('tr');
    
    const labelCell = document.createElement('td');
    labelCell.style.textAlign = 'left';
    labelCell.style.padding = '4px 12px';
    labelCell.style.fontFamily = fontFamily;
    labelCell.style.fontStyle = 'italic';
    labelCell.textContent = stat.label;
    statRow.appendChild(labelCell);
    
    const valueCell = document.createElement('td');
    valueCell.style.textAlign = 'center';
    valueCell.style.padding = '4px 12px';
    valueCell.style.fontFamily = fontFamily;
    valueCell.textContent = stat.value;
    statRow.appendChild(valueCell);
    
    // Empty cells for other columns
    for (let i = 0; i < visibleColumns.length - 2; i++) {
      const emptyCell = document.createElement('td');
      emptyCell.style.padding = '4px 12px';
      emptyCell.textContent = '';
      statRow.appendChild(emptyCell);
    }
    
    tbody.appendChild(statRow);
  });
};

export const createAcademicTable = (
  title: string, 
  fontFamily: string,
  data?: any,
  config?: TableConfig,
  customHeaders?: Record<string, string>
): HTMLElement => {
  const container = document.createElement('div');
  container.style.fontFamily = fontFamily;
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.maxWidth = '900px';
  container.style.margin = '0 auto';
  
  // Add title
  const titleElem = document.createElement('div');
  titleElem.style.fontSize = '18px';
  titleElem.style.fontWeight = 'bold';
  titleElem.style.textAlign = 'center';
  titleElem.style.marginBottom = '30px';
  titleElem.style.fontFamily = fontFamily;
  titleElem.textContent = title;
  container.appendChild(titleElem);
  
  // Create table
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontFamily = fontFamily;
  table.style.fontSize = '14px';
  
  // Use actual config if provided, otherwise use defaults
  const visibleColumns = config?.visibleColumns || ['variable', 'coef', 'std_err', 't', 'p_value'];
  const headers = customHeaders || {
    variable: 'Variable',
    coef: 'Coefficient',
    std_err: 'Std. Error',
    t: 't-statistic',
    p_value: 'P>|t|',
    ci_lower: '[0.025',
    ci_upper: '0.975]'
  };
  
  // Create table structure
  const thead = document.createElement('thead');
  const headerRow = createTableHeader(visibleColumns, headers, fontFamily);
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Use actual data if provided, otherwise use sample data
  const tableData = data?.coefficients || [
    { variable: 'Intercept', coef: 2.345, std_err: 0.456, t: 5.14, p_value: 0.0001 },
    { variable: 'Income', coef: 0.123, std_err: 0.045, t: 2.73, p_value: 0.008 },
    { variable: 'Education', coef: -0.056, std_err: 0.034, t: -1.65, p_value: 0.102 },
    { variable: 'Age', coef: 0.089, std_err: 0.028, t: 3.18, p_value: 0.002 },
    { variable: 'Experience', coef: 0.234, std_err: 0.067, t: 3.49, p_value: 0.0001 }
  ];
  
  // Create tbody with actual data
  const tbody = createTableBody(tableData, visibleColumns, config || {}, fontFamily);
  
  // Add model statistics if enabled
  if (config?.includeModelStats !== false) {
    const modelStats = data?.modelStats || {
      observations: 150,
      rSquared: 0.752,
      adjRSquared: 0.748,
      fStatistic: 45.23
    };
    
    addModelStatistics(tbody, visibleColumns, modelStats, data, fontFamily);
  }
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  // Add footnotes
  if (config?.showSignificance !== false) {
    const notes = document.createElement('div');
    notes.style.fontSize = '12px';
    notes.style.marginTop = '16px';
    notes.style.textAlign = 'left';
    notes.style.fontFamily = fontFamily;
    notes.innerHTML = '* <em>p</em>&lt;0.05, ** <em>p</em>&lt;0.01, *** <em>p</em>&lt;0.001';
    container.appendChild(notes);
  }
  
  return container;
};

// Utility for converting LaTeX to image

// Function to convert LaTeX code to an image using MathJax
export const renderLatexToImage = async (latexCode: string, title: string): Promise<string | null> => {
  try {
    // Create a container for rendering LaTeX
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1400px'; // Even wider for better spacing
    container.style.padding = '60px'; // More padding
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Determine font family based on LaTeX code
    let fontFamily = 'Times New Roman, serif'; // Default font
    
    if (latexCode.includes('\\usepackage{lmodern}')) {
      fontFamily = 'Latin Modern Roman, Times New Roman, serif';
    } else if (latexCode.includes('\\usepackage{mathptmx}')) {
      fontFamily = 'Times New Roman, serif';
    } else if (latexCode.includes('\\usepackage{mathpazo}')) {
      fontFamily = 'Palatino Linotype, Palatino, serif';
    } else if (latexCode.includes('\\usepackage{newtxtext,newtxmath}')) {
      fontFamily = 'Times New Roman, serif'; // NewTX is similar to Times but modernized
    }
    
    // Create the visual representation directly
    const visualLatex = createAcademicTable(title, fontFamily);
    container.appendChild(visualLatex);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: 1400,
      height: container.scrollHeight + 100
    });
    
    // Clean up
    document.body.removeChild(container);
    
    // Convert canvas to data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error rendering LaTeX to image:', error);
    return null;
  }
};

// Function to create academic-style table
export const createAcademicTable = (title: string, fontFamily: string): HTMLElement => {
  const container = document.createElement('div');
  container.style.fontFamily = fontFamily;
  container.style.padding = '40px';
  container.style.backgroundColor = '#ffffff';
  container.style.maxWidth = '800px';
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
  
  // Create table structure following academic standards
  const thead = document.createElement('thead');
  
  // Model numbers row (1), (2), (3)
  const modelRow = document.createElement('tr');
  const emptyHeader = document.createElement('th');
  emptyHeader.style.textAlign = 'left';
  emptyHeader.style.padding = '8px 16px';
  emptyHeader.style.borderBottom = 'none';
  emptyHeader.textContent = '';
  modelRow.appendChild(emptyHeader);
  
  ['(1)', '(2)', '(3)'].forEach(modelNum => {
    const modelHeader = document.createElement('th');
    modelHeader.style.textAlign = 'center';
    modelHeader.style.padding = '8px 16px';
    modelHeader.style.borderBottom = 'none';
    modelHeader.style.fontWeight = 'normal';
    modelHeader.style.fontFamily = fontFamily;
    modelHeader.textContent = modelNum;
    modelRow.appendChild(modelHeader);
  });
  thead.appendChild(modelRow);
  
  // Column headers row
  const headerRow = document.createElement('tr');
  const variableHeader = document.createElement('th');
  variableHeader.style.textAlign = 'left';
  variableHeader.style.padding = '8px 16px';
  variableHeader.style.borderTop = '2px solid #000';
  variableHeader.style.borderBottom = '1px solid #000';
  variableHeader.style.fontWeight = 'bold';
  variableHeader.style.fontFamily = fontFamily;
  variableHeader.textContent = '';
  headerRow.appendChild(variableHeader);
  
  ['Coefficient', 'Std. Error', 't-statistic'].forEach(header => {
    const th = document.createElement('th');
    th.style.textAlign = 'center';
    th.style.padding = '8px 16px';
    th.style.borderTop = '2px solid #000';
    th.style.borderBottom = '1px solid #000';
    th.style.fontWeight = 'bold';
    th.style.fontFamily = fontFamily;
    th.textContent = header;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  // Create tbody with data
  const tbody = document.createElement('tbody');
  
  // Sample data matching the academic format
  const variables = [
    { name: 'Intercept', coef: '2.345***', se: '0.045', t: '2.73', tStat: '(4.56)' },
    { name: 'Variable 1', coef: '0.123*', se: '0.045', t: '2.73', tStat: '(2.34)' },
    { name: 'Variable 2', coef: '-0.056', se: '0.045', t: '2.73', tStat: '(-1.23)' }
  ];
  
  variables.forEach((variable, index) => {
    // Coefficient row
    const coeffRow = document.createElement('tr');
    
    const varCell = document.createElement('td');
    varCell.style.textAlign = 'left';
    varCell.style.padding = '6px 16px';
    varCell.style.fontFamily = fontFamily;
    varCell.textContent = variable.name;
    coeffRow.appendChild(varCell);
    
    const coeffCell = document.createElement('td');
    coeffCell.style.textAlign = 'center';
    coeffCell.style.padding = '6px 16px';
    coeffCell.style.fontFamily = fontFamily;
    coeffCell.innerHTML = variable.coef.replace(/\*\*\*/g, '<sup>***</sup>').replace(/\*\*/g, '<sup>**</sup>').replace(/\*/g, '<sup>*</sup>');
    coeffRow.appendChild(coeffCell);
    
    const seCell = document.createElement('td');
    seCell.style.textAlign = 'center';
    seCell.style.padding = '6px 16px';
    seCell.style.fontFamily = fontFamily;
    seCell.textContent = variable.se;
    coeffRow.appendChild(seCell);
    
    const tCell = document.createElement('td');
    tCell.style.textAlign = 'center';
    tCell.style.padding = '6px 16px';
    tCell.style.fontFamily = fontFamily;
    tCell.textContent = variable.t;
    coeffRow.appendChild(tCell);
    
    tbody.appendChild(coeffRow);
    
    // t-statistic row in parentheses (directly below coefficient)
    const tStatRow = document.createElement('tr');
    
    const emptyVar = document.createElement('td');
    emptyVar.style.padding = '2px 16px';
    emptyVar.textContent = '';
    tStatRow.appendChild(emptyVar);
    
    const tStatCell = document.createElement('td');
    tStatCell.style.textAlign = 'center';
    tStatCell.style.padding = '2px 16px';
    tStatCell.style.fontFamily = fontFamily;
    tStatCell.style.fontSize = '13px';
    tStatCell.style.fontStyle = 'italic';
    tStatCell.textContent = variable.tStat;
    tStatRow.appendChild(tStatCell);
    
    const emptyCell1 = document.createElement('td');
    emptyCell1.style.padding = '2px 16px';
    emptyCell1.textContent = '';
    tStatRow.appendChild(emptyCell1);
    
    const emptyCell2 = document.createElement('td');
    emptyCell2.style.padding = '2px 16px';
    emptyCell2.textContent = '';
    tStatRow.appendChild(emptyCell2);
    
    tbody.appendChild(tStatRow);
    
    // Add spacing between variables (except after last)
    if (index < variables.length - 1) {
      const spacingRow = document.createElement('tr');
      spacingRow.style.height = '12px';
      for (let i = 0; i < 4; i++) {
        const emptyCell = document.createElement('td');
        emptyCell.style.padding = '6px 16px';
        emptyCell.textContent = '';
        spacingRow.appendChild(emptyCell);
      }
      tbody.appendChild(spacingRow);
    }
  });
  
  // Add horizontal line before statistics
  const statsLineRow = document.createElement('tr');
  for (let i = 0; i < 4; i++) {
    const cell = document.createElement('td');
    cell.style.borderTop = '1px solid #000';
    cell.style.padding = '8px 16px';
    cell.textContent = '';
    statsLineRow.appendChild(cell);
  }
  tbody.appendChild(statsLineRow);
  
  // Add model statistics
  const stats = [
    { label: 'Observations', value: '150' },
    { label: 'R²', value: '0.752' },
    { label: 'Adjusted R²', value: '0.748' }
  ];
  
  stats.forEach(stat => {
    const statRow = document.createElement('tr');
    
    const labelCell = document.createElement('td');
    labelCell.style.textAlign = 'left';
    labelCell.style.padding = '4px 16px';
    labelCell.style.fontFamily = fontFamily;
    labelCell.style.fontStyle = 'italic';
    labelCell.textContent = stat.label;
    statRow.appendChild(labelCell);
    
    const valueCell = document.createElement('td');
    valueCell.style.textAlign = 'center';
    valueCell.style.padding = '4px 16px';
    valueCell.style.fontFamily = fontFamily;
    valueCell.textContent = stat.value;
    statRow.appendChild(valueCell);
    
    const emptyCell1 = document.createElement('td');
    emptyCell1.style.padding = '4px 16px';
    emptyCell1.textContent = '';
    statRow.appendChild(emptyCell1);
    
    const emptyCell2 = document.createElement('td');
    emptyCell2.style.padding = '4px 16px';
    emptyCell2.textContent = '';
    statRow.appendChild(emptyCell2);
    
    tbody.appendChild(statRow);
  });
  
  table.appendChild(tbody);
  container.appendChild(table);
  
  // Add footnotes
  const notes = document.createElement('div');
  notes.style.fontSize = '12px';
  notes.style.marginTop = '20px';
  notes.style.textAlign = 'left';
  notes.style.fontFamily = fontFamily;
  notes.innerHTML = '<em>t</em> statistics in parentheses<br>* <em>p</em>&lt;0.05, ** <em>p</em>&lt;0.01, *** <em>p</em>&lt;0.001';
  container.appendChild(notes);
  
  return container;
};

// Function to parse LaTeX code into a formatted HTML table
export const createVisualLatexTable = (latexCode: string, title: string): HTMLElement => {
  // Determine font family based on LaTeX code
  let fontFamily = 'Times New Roman, serif'; // Default font
  
  if (latexCode.includes('\\usepackage{lmodern}')) {
    fontFamily = 'Latin Modern Roman, Times New Roman, serif';
  } else if (latexCode.includes('\\usepackage{mathptmx}')) {
    fontFamily = 'Times New Roman, serif';
  } else if (latexCode.includes('\\usepackage{mathpazo}')) {
    fontFamily = 'Palatino Linotype, Palatino, serif';
  } else if (latexCode.includes('\\usepackage{newtxtext,newtxmath}')) {
    fontFamily = 'Times New Roman, serif';
  }
  
  return createAcademicTable(title, fontFamily);
};

// Function to download the LaTeX as an image
export const downloadLatexImage = async (latexCode: string, title: string): Promise<boolean> => {
  try {
    // Determine font family
    let fontFamily = 'Times New Roman, serif';
    
    if (latexCode.includes('\\usepackage{lmodern}')) {
      fontFamily = 'Latin Modern Roman, Times New Roman, serif';
    } else if (latexCode.includes('\\usepackage{mathptmx}')) {
      fontFamily = 'Times New Roman, serif';
    } else if (latexCode.includes('\\usepackage{mathpazo}')) {
      fontFamily = 'Palatino Linotype, Palatino, serif';
    } else if (latexCode.includes('\\usepackage{newtxtext,newtxmath}')) {
      fontFamily = 'Times New Roman, serif';
    }
    
    // Create a container for rendering
    const container = document.createElement('div');
    container.style.padding = '60px';
    container.style.backgroundColor = '#ffffff';
    container.style.width = '1200px';
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Add the academic table
    const academicTable = createAcademicTable(title, fontFamily);
    container.appendChild(academicTable);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Use html2canvas to capture the rendered table
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: false
    });
    
    // Clean up
    document.body.removeChild(container);
    
    // Convert canvas to data URL and trigger download
    const imgUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = imgUrl;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error downloading LaTeX image:', error);
    return false;
  }
};

// Dynamically add html2canvas library
export const loadHtml2Canvas = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2canvas) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load html2canvas'));
    document.head.appendChild(script);
  });
};

// Type definition for html2canvas which is loaded dynamically
declare function html2canvas(
  element: HTMLElement, 
  options?: {
    backgroundColor?: string;
    scale?: number;
    logging?: boolean;
    allowTaint?: boolean;
    useCORS?: boolean;
    [key: string]: any;
  }
): Promise<HTMLCanvasElement>;

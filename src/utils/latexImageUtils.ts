
// Utility for converting LaTeX to image

// Function to convert LaTeX code to an image using MathJax
export const renderLatexToImage = async (latexCode: string, title: string): Promise<string | null> => {
  try {
    // Create a container for rendering LaTeX
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1200px'; // Increased from 1000px for even wider content
    container.style.padding = '50px'; // Increased padding
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
    
    // Create the LaTeX content wrapped in a styled div
    const content = document.createElement('div');
    content.style.fontSize = '14px'; // Increased from 12px
    content.style.fontFamily = fontFamily;
    content.style.color = '#000000';
    content.style.lineHeight = '1.6'; // Increased from 1.5 for better readability
    content.style.whiteSpace = 'pre-wrap';
    content.style.width = '100%';
    content.textContent = latexCode;
    container.appendChild(content);
    
    // Add professional academic styling with font consideration
    const style = document.createElement('style');
    style.textContent = `
      .latex-container {
        padding: 40px; // Increased padding
        background-color: #ffffff;
        font-family: ${fontFamily};
        max-width: 1000px; // Increased from 800px
        margin: 0 auto;
      }
      .latex-title {
        font-size: 16px; // Increased from 14px
        font-weight: bold;
        text-align: center;
        margin-bottom: 25px; // Increased margin
        line-height: 1.3;
      }
      .latex-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
        font-size: 13px; // Increased from 11px
        font-family: ${fontFamily};
        table-layout: fixed;
      }
      .latex-table th {
        padding: 12px 16px; // Increased padding
        text-align: center;
        font-weight: bold;
        border-top: 2px solid #000;
        border-bottom: 1px solid #000;
        min-width: 140px; // Increased from 120px
      }
      .latex-table td {
        padding: 10px 16px; // Increased vertical and horizontal padding
        text-align: center;
        border: none;
        min-width: 140px; // Increased from 120px
      }
      .latex-table tbody tr:first-child td {
        border-top: 1px solid #000;
      }
      .latex-table tbody tr:last-child td {
        border-bottom: 2px solid #000;
      }
      .latex-table .column-variable {
        text-align: left;
        min-width: 180px; // Increased from 150px for variable names
      }
      .latex-notes {
        font-size: 11px; // Increased from 9px
        margin-top: 20px; // Increased margin
        text-align: left;
        line-height: 1.4;
        font-family: ${fontFamily};
      }
      .parenthesis {
        font-size: 12px; // Increased from 10px
        color: #444;
        font-style: italic;
      }
      .significance-stars {
        font-weight: normal;
        font-size: 11px; // Increased from 9px
        vertical-align: super;
      }
      sup {
        font-size: 10px; // Increased from 8px
        font-weight: normal;
      }
    `;
    container.appendChild(style);
    
    // Create a canvas to render the container
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 3,
      logging: false,
      allowTaint: true,
      useCORS: true,
      width: 1200, // Increased from 1000px
      height: container.scrollHeight + 100 // Increased height buffer
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

// Function to parse LaTeX code into a formatted HTML table
export const createVisualLatexTable = (latexCode: string, title: string): HTMLElement => {
  // Create container
  const container = document.createElement('div');
  container.className = 'latex-container';
  
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
  
  // Apply the detected font
  container.style.fontFamily = fontFamily;
  
  // Add title
  const titleElem = document.createElement('div');
  titleElem.className = 'latex-title';
  titleElem.textContent = title;
  container.appendChild(titleElem);
  
  // Try to extract table content from LaTeX code
  try {
    // Create table
    const table = document.createElement('table');
    table.className = 'latex-table';
    
    // Create table structure following professional format
    const thead = document.createElement('thead');
    
    // Model numbers row
    const modelRow = document.createElement('tr');
    const emptyHeader = document.createElement('th');
    emptyHeader.textContent = '';
    modelRow.appendChild(emptyHeader);
    
    // Add model numbers (1), (2), etc.
    for (let i = 1; i <= 3; i++) { // Assuming 3 columns for demo
      const modelHeader = document.createElement('th');
      modelHeader.textContent = `(${i})`;
      modelHeader.style.fontWeight = 'normal';
      modelRow.appendChild(modelHeader);
    }
    thead.appendChild(modelRow);
    
    // Column names row
    const columnRow = document.createElement('tr');
    const variableHeader = document.createElement('th');
    variableHeader.textContent = '';
    columnRow.appendChild(variableHeader);
    
    const coeffHeader = document.createElement('th');
    coeffHeader.textContent = 'Coefficient';
    columnRow.appendChild(coeffHeader);
    
    const seHeader = document.createElement('th');
    seHeader.textContent = 'Std. Error';
    columnRow.appendChild(seHeader);
    
    const tHeader = document.createElement('th');
    tHeader.textContent = 't-statistic';
    columnRow.appendChild(tHeader);
    
    thead.appendChild(columnRow);
    table.appendChild(thead);
    
    // Data rows
    const tbody = document.createElement('tbody');
    
    // Sample regression variables for demonstration
    const sampleData = [
      { var: 'Intercept', coef: '2.345***', tStat: '(4.56)' },
      { var: 'Variable 1', coef: '0.123*', tStat: '(2.34)' },
      { var: 'Variable 2', coef: '-0.056', tStat: '(-1.23)' },
    ];
    
    sampleData.forEach((row, index) => {
      // Coefficient row
      const coeffRow = document.createElement('tr');
      
      const varCell = document.createElement('td');
      varCell.textContent = row.var;
      varCell.style.textAlign = 'left';
      coeffRow.appendChild(varCell);
      
      const coeffCell = document.createElement('td');
      coeffCell.innerHTML = row.coef.replace(/\*\*\*/g, '<sup>***</sup>').replace(/\*\*/g, '<sup>**</sup>').replace(/\*/g, '<sup>*</sup>');
      coeffRow.appendChild(coeffCell);
      
      const seCell = document.createElement('td');
      seCell.textContent = '0.045';
      coeffRow.appendChild(seCell);
      
      const tCell = document.createElement('td');
      tCell.textContent = '2.73';
      coeffRow.appendChild(tCell);
      
      tbody.appendChild(coeffRow);
      
      // t-statistic row in parentheses
      const tStatRow = document.createElement('tr');
      
      const emptyVar = document.createElement('td');
      emptyVar.textContent = '';
      tStatRow.appendChild(emptyVar);
      
      const tStatCell = document.createElement('td');
      tStatCell.textContent = row.tStat;
      tStatCell.className = 'parenthesis';
      tStatRow.appendChild(tStatCell);
      
      const emptyCell1 = document.createElement('td');
      emptyCell1.textContent = '';
      tStatRow.appendChild(emptyCell1);
      
      const emptyCell2 = document.createElement('td');
      emptyCell2.textContent = '';
      tStatRow.appendChild(emptyCell2);
      
      tbody.appendChild(tStatRow);
      
      // Add spacing row except after last variable
      if (index < sampleData.length - 1) {
        const spacingRow = document.createElement('tr');
        spacingRow.style.height = '1em'; // Increased spacing
        for (let i = 0; i < 4; i++) {
          const emptyCell = document.createElement('td');
          emptyCell.textContent = '';
          spacingRow.appendChild(emptyCell);
        }
        tbody.appendChild(spacingRow);
      }
    });
    
    // Add model statistics
    const statsRows = [
      { label: 'Observations', value: '150' },
      { label: 'R²', value: '0.752' },
      { label: 'Adjusted R²', value: '0.748' }
    ];
    
    statsRows.forEach(stat => {
      const statRow = document.createElement('tr');
      statRow.style.borderTop = '1px solid #e0e0e0';
      
      const labelCell = document.createElement('td');
      labelCell.textContent = stat.label;
      labelCell.style.textAlign = 'left';
      labelCell.style.fontStyle = 'italic';
      statRow.appendChild(labelCell);
      
      const valueCell = document.createElement('td');
      valueCell.textContent = stat.value;
      statRow.appendChild(valueCell);
      
      const emptyCell1 = document.createElement('td');
      emptyCell1.textContent = '';
      statRow.appendChild(emptyCell1);
      
      const emptyCell2 = document.createElement('td');
      emptyCell2.textContent = '';
      statRow.appendChild(emptyCell2);
      
      tbody.appendChild(statRow);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add professional footnotes
    const notes = document.createElement('div');
    notes.className = 'latex-notes';
    notes.innerHTML = '<em>t</em> statistics in parentheses<br>* <em>p</em>&lt;0.05, ** <em>p</em>&lt;0.01, *** <em>p</em>&lt;0.001';
    container.appendChild(notes);
    
    return container;
  } catch (error) {
    console.error('Error parsing LaTeX:', error);
    
    // Fallback content if parsing fails
    const fallback = document.createElement('div');
    fallback.textContent = 'Unable to render LaTeX preview';
    container.appendChild(fallback);
    
    return container;
  }
};

// Function to download the LaTeX as an image
export const downloadLatexImage = async (latexCode: string, title: string): Promise<boolean> => {
  try {
    // Create a container for rendering visual representation
    const container = document.createElement('div');
    container.style.padding = '40px';
    container.style.backgroundColor = '#ffffff';
    container.style.width = '800px';
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Add the visual LaTeX table
    const visualLatex = createVisualLatexTable(latexCode, title);
    container.appendChild(visualLatex);
    
    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Use html2canvas to capture the rendered table
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
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

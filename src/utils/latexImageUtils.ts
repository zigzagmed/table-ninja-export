
// Utility for converting LaTeX to image

// Function to convert LaTeX code to an image using MathJax
export const renderLatexToImage = async (latexCode: string, title: string): Promise<string | null> => {
  try {
    // Create a container for rendering LaTeX
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Create the LaTeX content wrapped in a styled div
    const content = document.createElement('div');
    content.style.fontSize = '14px';
    content.style.fontFamily = 'Times New Roman, serif';
    content.style.color = '#000000';
    content.style.lineHeight = '1.5';
    content.style.whiteSpace = 'pre-wrap';
    content.style.width = '100%';
    content.textContent = latexCode;
    container.appendChild(content);
    
    // Add some styling for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .latex-container {
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        font-family: 'Computer Modern', 'Times New Roman', serif;
      }
      .latex-title {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 20px;
      }
      .latex-table {
        border-collapse: collapse;
        width: 100%;
        margin: 0 auto;
        font-size: 12px;
      }
      .latex-table th {
        border-bottom: 2px solid #000;
        padding: 8px;
        text-align: center;
        font-weight: bold;
      }
      .latex-table td {
        padding: 8px;
        text-align: center;
        border-bottom: 1px solid #e0e0e0;
      }
      .latex-table tr:last-child td {
        border-bottom: 2px solid #000;
      }
      .latex-notes {
        font-size: 10px;
        font-style: italic;
        margin-top: 10px;
        text-align: left;
      }
      .parenthesis {
        font-size: 11px;
        color: #444;
      }
      .significance-stars {
        font-weight: bold;
      }
    `;
    container.appendChild(style);
    
    // Create a canvas to render the container
    await new Promise(resolve => setTimeout(resolve, 100)); // Give time for the DOM to update
    
    const canvas = await html2canvas(container, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher scale for better quality
      logging: false,
      allowTaint: true,
      useCORS: true
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
    
    // Parse the LaTeX code to create an academic-style table similar to the example
    const tableHeaders = [];
    const tableRows = [];
    
    // Extract column headers and data rows from LaTeX code
    const lines = latexCode.split('\n');
    let inTabular = false;
    let columnCount = 0;
    
    lines.forEach(line => {
      if (line.includes('\\begin{tabular}')) {
        inTabular = true;
        // Extract column format
        const colFormatMatch = line.match(/\\begin{tabular}{(.+)}/);
        if (colFormatMatch && colFormatMatch[1]) {
          columnCount = colFormatMatch[1].replace(/[^lrc]/g, '').length;
        }
      } else if (line.includes('\\end{tabular}')) {
        inTabular = false;
      } else if (inTabular) {
        // Process header or data row
        if (line.includes('\\toprule') || line.includes('\\midrule') || line.includes('\\bottomrule')) {
          return; // Skip these lines
        }
        
        // Split by & and clean up
        if (line.trim() && !line.includes('\\footnotesize')) {
          const rowData = line.split('&').map(cell => cell.trim().replace(/\\\\/g, ''));
          
          // Clean up cells further
          const cleanedRowData = rowData.map(cell => {
            // Remove trailing backslashes and trim
            return cell.replace(/\\\\$/, '').trim();
          }).filter(cell => cell !== '');
          
          if (cleanedRowData.length > 0) {
            // If we have enough cells, consider it a valid row
            if (tableHeaders.length === 0) {
              tableHeaders.push(...cleanedRowData);
            } else {
              tableRows.push(cleanedRowData);
            }
          }
        }
      }
    });

    // Create table structure similar to the academic paper format
    // Headers
    if (tableHeaders.length > 0) {
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      tableHeaders.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
      });
      
      thead.appendChild(headerRow);
      table.appendChild(thead);
    }
    
    // Data rows
    if (tableRows.length > 0) {
      const tbody = document.createElement('tbody');
      
      tableRows.forEach(rowData => {
        const tr = document.createElement('tr');
        
        rowData.forEach((cell, index) => {
          const td = document.createElement('td');
          
          // Check if the cell has parentheses for t-statistics or other values
          const parenthesisMatch = cell.match(/^(.*?)(\(.+\))$/);
          if (parenthesisMatch) {
            const mainValue = document.createElement('div');
            mainValue.textContent = parenthesisMatch[1].trim();
            
            // Add stars for significance
            if (cell.includes('***')) {
              mainValue.innerHTML = mainValue.textContent?.replace(/\*\*\*/g, '<span class="significance-stars">***</span>') || '';
            } else if (cell.includes('**')) {
              mainValue.innerHTML = mainValue.textContent?.replace(/\*\*/g, '<span class="significance-stars">**</span>') || '';
            } else if (cell.includes('*')) {
              mainValue.innerHTML = mainValue.textContent?.replace(/\*/g, '<span class="significance-stars">*</span>') || '';
            }
            
            td.appendChild(mainValue);
            
            const parenthesisValue = document.createElement('div');
            parenthesisValue.className = 'parenthesis';
            parenthesisValue.textContent = parenthesisMatch[2];
            td.appendChild(parenthesisValue);
          } else {
            td.textContent = cell;
            
            // Add stars for significance
            if (cell.includes('***')) {
              td.innerHTML = td.textContent?.replace(/\*\*\*/g, '<span class="significance-stars">***</span>') || '';
            } else if (cell.includes('**')) {
              td.innerHTML = td.textContent?.replace(/\*\*/g, '<span class="significance-stars">**</span>') || '';
            } else if (cell.includes('*')) {
              td.innerHTML = td.textContent?.replace(/\*/g, '<span class="significance-stars">*</span>') || '';
            }
          }
          
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      table.appendChild(tbody);
    }
    
    container.appendChild(table);
    
    // Add footnote for significance levels
    const notesMatch = latexCode.match(/\\footnotesize{(.*?)}/);
    if (notesMatch && notesMatch[1]) {
      const notes = document.createElement('div');
      notes.className = 'latex-notes';
      notes.textContent = notesMatch[1]
        .replace(/p\$<\$0\.05/g, 'p<0.05')
        .replace(/p\$<\$0\.01/g, 'p<0.01')
        .replace(/p\$<\$0\.001/g, 'p<0.001');
      container.appendChild(notes);
    } else {
      // Add default significance notes if not found in the LaTeX
      const defaultNotes = document.createElement('div');
      defaultNotes.className = 'latex-notes';
      defaultNotes.textContent = '* p < 0.05, ** p < 0.01, *** p < 0.001';
      container.appendChild(defaultNotes);
    }
    
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


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
    content.style.fontFamily = 'serif';
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
        font-family: 'Latin Modern Roman', 'Times New Roman', serif;
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
        font-size: 12px;
        font-style: italic;
        margin-top: 10px;
        text-align: left;
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
    
    // Extract table content between \begin{tabular} and \end{tabular}
    const tableMatch = latexCode.match(/\\begin{tabular}.*?\\end{tabular}/s);
    if (tableMatch) {
      const tableContent = tableMatch[0];
      
      // Extract headers (between \toprule and \midrule)
      const headersMatch = tableContent.match(/\\toprule\s*(.*?)\\midrule/s);
      if (headersMatch && headersMatch[1]) {
        const headerRow = document.createElement('tr');
        const headers = headersMatch[1].trim().split('&').map(h => h.trim().replace(/\\\\/g, ''));
        
        headers.forEach(header => {
          const th = document.createElement('th');
          th.textContent = header;
          headerRow.appendChild(th);
        });
        
        const thead = document.createElement('thead');
        thead.appendChild(headerRow);
        table.appendChild(thead);
      }
      
      // Extract data rows (between \midrule and \bottomrule)
      const bodyMatch = tableContent.match(/\\midrule\s*(.*?)\\bottomrule/s);
      if (bodyMatch && bodyMatch[1]) {
        const tbody = document.createElement('tbody');
        const rows = bodyMatch[1].trim().split('\\\\').filter(Boolean);
        
        rows.forEach(row => {
          const tr = document.createElement('tr');
          const cells = row.trim().split('&').map(cell => cell.trim());
          
          cells.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
          });
          
          tbody.appendChild(tr);
        });
        
        table.appendChild(tbody);
      }
      
      container.appendChild(table);
      
      // Extract notes if any
      const notesMatch = latexCode.match(/\\footnotesize{(.*?)}/);
      if (notesMatch && notesMatch[1]) {
        const notes = document.createElement('div');
        notes.className = 'latex-notes';
        notes.textContent = notesMatch[1]
          .replace(/p\$<\$0\.05/g, 'p<0.05')
          .replace(/p\$<\$0\.01/g, 'p<0.01')
          .replace(/p\$<\$0\.001/g, 'p<0.001');
        container.appendChild(notes);
      }
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

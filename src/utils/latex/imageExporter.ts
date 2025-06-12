
// Image export utilities for LaTeX tables

import { createAcademicTable } from './htmlTableGenerator';
import { getFontFamily } from './fontUtils';

// Type definition for html2canvas which is loaded dynamically
declare function html2canvas(
  element: HTMLElement, 
  options?: {
    backgroundColor?: string;
    scale?: number;
    logging?: boolean;
    allowTaint?: boolean;
    useCORS?: boolean;
    width?: number;
    height?: number;
    [key: string]: any;
  }
): Promise<HTMLCanvasElement>;

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

// Function to convert LaTeX code to an image using MathJax
export const renderLatexToImage = async (latexCode: string, title: string): Promise<string | null> => {
  try {
    // Create a container for rendering LaTeX
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '1400px';
    container.style.padding = '60px';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);
    
    // Determine font family based on LaTeX code
    const fontFamily = getFontFamily(latexCode);
    
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

// Function to download the LaTeX as an image
export const downloadLatexImage = async (
  latexCode: string, 
  title: string, 
  data?: any, 
  config?: any, 
  customHeaders?: any
): Promise<boolean> => {
  try {
    // Determine font family
    const fontFamily = getFontFamily(latexCode);
    
    // Create a container for rendering
    const container = document.createElement('div');
    container.style.padding = '60px';
    container.style.backgroundColor = '#ffffff';
    container.style.width = '1200px';
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    
    // Add the academic table with actual data and config
    const academicTable = createAcademicTable(title, fontFamily, data, config, customHeaders);
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

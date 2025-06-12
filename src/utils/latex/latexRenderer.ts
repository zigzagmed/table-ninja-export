
// LaTeX rendering utilities

import { createAcademicTable } from './htmlTableGenerator';
import { getFontFamily } from './fontUtils';

// Function to parse LaTeX code into a formatted HTML table
export const createVisualLatexTable = (latexCode: string, title: string): HTMLElement => {
  // Determine font family based on LaTeX code
  const fontFamily = getFontFamily(latexCode);
  
  return createAcademicTable(title, fontFamily);
};


// Word export functionality

import { Document, Packer, Table as DocxTable, TableRow, TableCell, Paragraph, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { ExportData, ExportConfig } from './types';
import { formatNumber, getSignificanceStars } from './formatters';

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
              alignment: columnId === 'variable' ? AlignmentType.LEFT : AlignmentType.CENTER,
              spacing: { after: 100 },
              run: {
                font: "Times New Roman",
                size: 22, // 11pt font for data
                bold: columnId === 'variable', // Make variable names bold
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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { Document, Packer, Table as DocxTable, TableRow, TableCell, Paragraph, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';

interface ExportPanelProps {
  data: any;
  config: any;
  customHeaders: any;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ data, config, customHeaders }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportStyle, setExportStyle] = useState('standard');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatNumber = (value: number, type: string = 'default') => {
    if (value === null || value === undefined) return 'N/A';
    
    const decimals = config.decimalPlaces;
    
    switch (type) {
      case 'pvalue':
        return value < 0.001 ? '<0.001' : value.toFixed(decimals);
      case 'coefficient':
        return value.toFixed(decimals);
      default:
        return value.toFixed(decimals);
    }
  };

  const getSignificanceStars = (pValue: number) => {
    if (!config.showSignificance) return '';
    if (pValue < 0.001) return '***';
    if (pValue < 0.01) return '**';
    if (pValue < 0.05) return '*';
    return '';
  };

  const exportToExcel = () => {
    setIsExporting(true);
    
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
            const coef = formatNumber(row[columnId], 'coefficient');
            const stars = getSignificanceStars(row.p_value);
            return `${coef}${stars}`;
          }
          if (columnId === 'p_value') return formatNumber(row[columnId], 'pvalue');
          return formatNumber(row[columnId]);
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
          ['R-squared', formatNumber(data.modelStats.rSquared)],
          ['Adj. R-squared', formatNumber(data.modelStats.adjRSquared)],
          ['F-statistic', formatNumber(data.modelStats.fStatistic)],
          ['AIC', formatNumber(data.modelStats.aic)],
          ['BIC', formatNumber(data.modelStats.bic)],
        ];
        
        const statsWs = XLSX.utils.aoa_to_sheet(statsData);
        statsWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, statsWs, 'Model Statistics');
      }
      
      // Save file with timestamp
      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `${config.tableTitle.replace(/\s+/g, '_')}_${timestamp}.xlsx`);
      
      toast({
        title: "Export Successful",
        description: "Excel file has been downloaded with publication formatting.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToWord = async () => {
    setIsExporting(true);
    
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
              cellValue = formatNumber(row[columnId], 'coefficient') + getSignificanceStars(row.p_value);
            } else if (columnId === 'p_value') {
              cellValue = formatNumber(row[columnId], 'pvalue');
            } else {
              cellValue = formatNumber(row[columnId]);
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
            text: `Model: ${data.modelInfo.model}; Dependent Variable: ${data.modelInfo.dependentVariable}; N = ${data.modelInfo.observations}; R² = ${formatNumber(data.modelStats.rSquared)}; Adj. R² = ${formatNumber(data.modelStats.adjRSquared)}; F = ${formatNumber(data.modelStats.fStatistic)}`,
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

      toast({
        title: "Export Successful",
        description: "Publication-ready Word document has been downloaded with clean formatting.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Word.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToLatex = () => {
    setIsExporting(true);
    
    try {
      const visibleColumnOrder = config.columnOrder.filter((col: string) => 
        config.visibleColumns.includes(col)
      );

      // Generate LaTeX table code
      let latexCode = `\\begin{table}[htbp]
\\centering
\\caption{${config.tableTitle}}
\\label{tab:regression}
\\begin{tabular}{${'l' + 'c'.repeat(visibleColumnOrder.length - 1)}}
\\toprule
`;

      // Add header row
      const headers = visibleColumnOrder.map(col => customHeaders[col]);
      latexCode += headers.join(' & ') + ' \\\\\n\\midrule\n';

      // Add data rows
      data.coefficients.forEach((row: any, index: number) => {
        const rowData = visibleColumnOrder.map((columnId: string) => {
          if (columnId === 'variable') {
            return row[columnId];
          } else if (columnId === 'coef') {
            const coef = formatNumber(row[columnId], 'coefficient');
            const stars = getSignificanceStars(row.p_value);
            return `${coef}${stars}`;
          } else if (columnId === 'p_value') {
            return formatNumber(row[columnId], 'pvalue');
          } else {
            return formatNumber(row[columnId]);
          }
        });
        
        latexCode += rowData.join(' & ') + ' \\\\\n';
      });

      latexCode += '\\bottomrule\n\\end{tabular}\n';

      // Add significance note if enabled
      if (config.showSignificance) {
        latexCode += '\\begin{tablenotes}\n';
        latexCode += '\\small\n';
        latexCode += '\\item Note: * p$<$0.05, ** p$<$0.01, *** p$<$0.001\n';
        latexCode += '\\end{tablenotes}\n';
      }

      latexCode += '\\end{table}';

      // Add model statistics if enabled
      if (config.includeModelStats) {
        latexCode += '\n\n% Model Statistics:\n';
        latexCode += `% Model: ${data.modelInfo.model}\n`;
        latexCode += `% Dependent Variable: ${data.modelInfo.dependentVariable}\n`;
        latexCode += `% Observations: ${data.modelInfo.observations}\n`;
        latexCode += `% R-squared: ${formatNumber(data.modelStats.rSquared)}\n`;
        latexCode += `% Adj. R-squared: ${formatNumber(data.modelStats.adjRSquared)}\n`;
        latexCode += `% F-statistic: ${formatNumber(data.modelStats.fStatistic)}\n`;
      }

      // Create and download file
      const blob = new Blob([latexCode], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 10);
      a.download = `${config.tableTitle.replace(/\s+/g, '_')}_${timestamp}.tex`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "LaTeX table code has been downloaded. Requires booktabs and threeparttable packages.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting to LaTeX.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else if (exportFormat === 'word') {
      exportToWord();
    } else if (exportFormat === 'latex') {
      exportToLatex();
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileDown className="h-5 w-5" />
          Export Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Format */}
        <div className="space-y-2">
          <Label htmlFor="export-format">Export Format</Label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="word">Word (.docx)</SelectItem>
              <SelectItem value="latex">LaTeX (.tex)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Export Style */}
        <div className="space-y-2">
          <Label htmlFor="export-style">Style Template</Label>
          <Select value={exportStyle} onValueChange={setExportStyle}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="apa">APA Style</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="publication">Publication Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Export Preview */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Export Preview</Label>
          <div className="p-3 bg-muted/30 rounded text-xs font-mono space-y-1">
            <div>Title: {config.tableTitle}</div>
            <div>Columns: {config.visibleColumns.length}</div>
            <div>Rows: {data.coefficients.length}</div>
            <div>Format: {exportFormat.toUpperCase()}</div>
            {config.includeModelStats && <div>+ Model Statistics</div>}
            {config.showSignificance && <div>+ Significance Stars</div>}
          </div>
        </div>

        <Separator />

        {/* Export Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleExport} 
            className="w-full" 
            size="lg"
            disabled={isExporting}
          >
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? 'Exporting...' : `Export ${exportFormat === 'excel' ? 'Excel' : exportFormat === 'word' ? 'Word' : 'LaTeX'}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileDown, Table, Copy, Eye } from 'lucide-react';
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

      // Create publication-ready table with proper borders and styling
      const headerRow = new TableRow({
        children: visibleColumnOrder.map(col => 
          new TableCell({
            children: [new Paragraph({
              text: customHeaders[col],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
          })
        ),
      });

      const dataRows = data.coefficients.map((row: any) => 
        new TableRow({
          children: visibleColumnOrder.map((columnId: string) => {
            let cellValue = '';
            let alignment = AlignmentType.CENTER;
            
            if (columnId === 'variable') {
              cellValue = row[columnId];
              alignment = AlignmentType.LEFT;
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
                alignment: alignment,
              })],
              width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
            });
          }),
        })
      );

      // Create table with professional styling
      const table = new DocxTable({
        rows: [headerRow, ...dataRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
      });

      // Build document sections
      const sections = [
        new Paragraph({
          text: config.tableTitle,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }), // Spacing
        table,
      ];

      // Add significance note if enabled
      if (config.showSignificance) {
        sections.push(
          new Paragraph({ text: "" }), // Spacing
          new Paragraph({
            text: "Note: * p<0.05, ** p<0.01, *** p<0.001",
            alignment: AlignmentType.LEFT,
          })
        );
      }

      // Add model statistics if enabled
      if (config.includeModelStats) {
        sections.push(
          new Paragraph({ text: "" }),
          new Paragraph({
            text: "Model Statistics",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: `Model: ${data.modelInfo.model}; Dependent Variable: ${data.modelInfo.dependentVariable}; N = ${data.modelInfo.observations}; R² = ${formatNumber(data.modelStats.rSquared)}; Adj. R² = ${formatNumber(data.modelStats.adjRSquared)}; F = ${formatNumber(data.modelStats.fStatistic)}`,
          })
        );
      }

      const doc = new Document({
        sections: [{
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
        description: "Word document has been downloaded with publication formatting.",
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

  const handlePreview = () => {
    // Create a preview modal/window with the formatted table
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );
    
    let previewContent = `${config.tableTitle}\n\n`;
    previewContent += visibleColumnOrder.map(col => customHeaders[col]).join('\t') + '\n';
    previewContent += data.coefficients.map((row: any) => 
      visibleColumnOrder.map((columnId: string) => {
        if (columnId === 'variable') return row[columnId];
        if (columnId === 'coef') {
          return formatNumber(row[columnId], 'coefficient') + getSignificanceStars(row.p_value);
        }
        if (columnId === 'p_value') return formatNumber(row[columnId], 'pvalue');
        return formatNumber(row[columnId]);
      }).join('\t')
    ).join('\n');
    
    if (config.showSignificance) {
      previewContent += '\n\nNote: * p<0.05, ** p<0.01, *** p<0.001';
    }
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head><title>Table Preview</title></head>
          <body style="font-family: monospace; padding: 20px;">
            <pre>${previewContent}</pre>
          </body>
        </html>
      `);
    }
  };

  const handleCopyHTML = async () => {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );
    
    let htmlContent = `<table border="1" style="border-collapse: collapse;">
      <caption>${config.tableTitle}</caption>
      <thead>
        <tr>
          ${visibleColumnOrder.map(col => `<th>${customHeaders[col]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${data.coefficients.map((row: any) => 
          `<tr>
            ${visibleColumnOrder.map((columnId: string) => {
              let cellValue = '';
              if (columnId === 'variable') cellValue = row[columnId];
              else if (columnId === 'coef') {
                cellValue = formatNumber(row[columnId], 'coefficient') + getSignificanceStars(row.p_value);
              } else if (columnId === 'p_value') {
                cellValue = formatNumber(row[columnId], 'pvalue');
              } else {
                cellValue = formatNumber(row[columnId]);
              }
              return `<td>${cellValue}</td>`;
            }).join('')}
          </tr>`
        ).join('')}
      </tbody>
    </table>`;
    
    if (config.showSignificance) {
      htmlContent += '<p><em>Note: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001</em></p>';
    }
    
    try {
      await navigator.clipboard.writeText(htmlContent);
      toast({
        title: "HTML Copied",
        description: "Table HTML has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy HTML to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else if (exportFormat === 'word') {
      exportToWord();
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
            {isExporting ? 'Exporting...' : `Export ${exportFormat === 'excel' ? 'Excel' : 'Word'}`}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyHTML}>
              <Copy className="h-4 w-4 mr-1" />
              Copy HTML
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

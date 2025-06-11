
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, Export, Table } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Document, Packer, Table as DocxTable, TableRow, TableCell, Paragraph, WidthType } from 'docx';

interface ExportPanelProps {
  data: any;
  config: any;
  customHeaders: any;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ data, config, customHeaders }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [exportStyle, setExportStyle] = useState('standard');

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
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Create header row
    const headers = visibleColumnOrder.map((col: string) => customHeaders[col]);
    
    // Create data rows
    const rows = data.coefficients.map((row: any) => 
      visibleColumnOrder.map((columnId: string) => {
        if (columnId === 'variable') return row[columnId];
        if (columnId === 'coef') {
          return formatNumber(row[columnId], 'coefficient') + getSignificanceStars(row.p_value);
        }
        if (columnId === 'p_value') return formatNumber(row[columnId], 'pvalue');
        return formatNumber(row[columnId]);
      })
    );

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create main results sheet
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Add model statistics if included
    if (config.includeModelStats) {
      const statsData = [
        ['Model Statistics', ''],
        ['Model', data.modelInfo.model],
        ['Dependent Variable', data.modelInfo.dependentVariable],
        ['No. Observations', data.modelInfo.observations],
        ['R-squared', data.modelStats.rSquared],
        ['Adj. R-squared', data.modelStats.adjRSquared],
        ['F-statistic', data.modelStats.fStatistic],
        ['AIC', data.modelStats.aic],
        ['BIC', data.modelStats.bic],
      ];
      
      const statsWs = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, statsWs, 'Model Statistics');
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Regression Results');
    
    // Save file
    XLSX.writeFile(wb, `${config.tableTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  const exportToWord = async () => {
    const visibleColumnOrder = config.columnOrder.filter((col: string) => 
      config.visibleColumns.includes(col)
    );

    // Create table rows
    const headerRow = new TableRow({
      children: visibleColumnOrder.map(col => 
        new TableCell({
          children: [new Paragraph(customHeaders[col])],
          width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
        })
      ),
    });

    const dataRows = data.coefficients.map((row: any) => 
      new TableRow({
        children: visibleColumnOrder.map((columnId: string) => {
          let cellValue = '';
          if (columnId === 'variable') cellValue = row[columnId];
          else if (columnId === 'coef') {
            cellValue = formatNumber(row[columnId], 'coefficient') + getSignificanceStars(row.p_value);
          } else if (columnId === 'p_value') {
            cellValue = formatNumber(row[columnId], 'pvalue');
          } else {
            cellValue = formatNumber(row[columnId]);
          }
          
          return new TableCell({
            children: [new Paragraph(cellValue)],
            width: { size: 100 / visibleColumnOrder.length, type: WidthType.PERCENTAGE },
          });
        }),
      })
    );

    const table = new DocxTable({
      rows: [headerRow, ...dataRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });

    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: config.tableTitle,
            heading: 'Heading1',
          }),
          table,
          ...(config.showSignificance ? [
            new Paragraph({
              text: 'Significance levels: * p<0.05, ** p<0.01, *** p<0.001',
              spacing: { before: 200 },
            })
          ] : [])
        ],
      }],
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.tableTitle.replace(/\s+/g, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
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
          <Export className="h-5 w-5" />
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
          >
            <Download className="h-4 w-4 mr-2" />
            Export {exportFormat === 'excel' ? 'Excel' : 'Word'}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm">
              <Table className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button variant="outline" size="sm">
              Copy HTML
            </Button>
          </div>
        </div>

        <Separator />

        {/* Batch Export */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Batch Export</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm">
              Export All Formats
            </Button>
            <Button variant="outline" size="sm">
              Export with Diagnostics
            </Button>
          </div>
        </div>

        <Separator />

        {/* Export History */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Recent Exports</Label>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• regression_results.xlsx (2 min ago)</div>
            <div>• ols_table.docx (1 hour ago)</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

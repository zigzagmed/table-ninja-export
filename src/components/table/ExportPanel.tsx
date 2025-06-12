import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileDown, Image, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { exportToExcel, exportToWord, generateLatexCode } from '@/utils/exportUtils';
import { loadHtml2Canvas, downloadLatexImage } from '@/utils/latexImageUtils';

interface ExportPanelProps {
  data: any;
  config: any;
  customHeaders: any;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ data, config, customHeaders }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [latexFont, setLatexFont] = useState('lmodern');
  const [isExporting, setIsExporting] = useState(false);
  const [latexDialogOpen, setLatexDialogOpen] = useState(false);
  const [latexCode, setLatexCode] = useState('');
  const [latexTableOnly, setLatexTableOnly] = useState('');
  const [latexImage, setLatexImage] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();
  
  // Load html2canvas when component mounts
  useEffect(() => {
    loadHtml2Canvas()
      .catch(error => {
        console.error('Failed to load html2canvas:', error);
      });
  }, []);

  // Reset copy button state
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const extractLatexTableOnly = (fullLatexCode: string): string => {
    // Extract just the table environment
    const tableStart = fullLatexCode.indexOf('\\begin{table}');
    const tableEnd = fullLatexCode.indexOf('\\end{table}') + '\\end{table}'.length;
    
    if (tableStart !== -1 && tableEnd !== -1) {
      return fullLatexCode.substring(tableStart, tableEnd);
    }
    return fullLatexCode; // Fallback to full code if extraction fails
  };

  const copyLatexCode = () => {
    navigator.clipboard.writeText(latexTableOnly)
      .then(() => {
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "LaTeX code copied to clipboard",
        });
      })
      .catch(err => {
        console.error('Failed to copy LaTeX code:', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy to clipboard",
          variant: "destructive",
        });
      });
  };

  const exportToLatexImage = async () => {
    setIsExporting(true);
    
    try {
      // Generate LaTeX code with selected font
      const latexCode = generateLatexCode(data, {...config, latexFont}, customHeaders);
      
      if (!latexCode) {
        throw new Error('Failed to generate LaTeX code');
      }
      
      setLatexCode(latexCode);
      
      // Extract just the table environment for copy functionality
      const tableOnly = extractLatexTableOnly(latexCode);
      setLatexTableOnly(tableOnly);
      
      // Attempt to download as image with actual data and config
      const success = await downloadLatexImage(latexCode, config.tableTitle, data, config, customHeaders);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "LaTeX table image has been downloaded as PNG.",
        });
        
        // Show dialog with LaTeX code as well
        setLatexDialogOpen(true);
      } else {
        throw new Error('Failed to generate image');
      }
      
    } catch (error) {
      console.error('LaTeX image export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the LaTeX image. Downloading LaTeX code instead.",
        variant: "destructive",
      });
      
      // Fallback: download LaTeX code as text file if image generation fails
      if (latexCode) {
        const blob = new Blob([latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 10);
        a.download = `${config.tableTitle.replace(/\s+/g, '_')}_${timestamp}.tex`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Show dialog with LaTeX code
        setLatexDialogOpen(true);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (exportFormat === 'excel') {
      setIsExporting(true);
      const success = exportToExcel(data, config, customHeaders);
      setIsExporting(false);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Excel file has been downloaded with publication formatting.",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "There was an error exporting to Excel.",
          variant: "destructive",
        });
      }
    } else if (exportFormat === 'word') {
      setIsExporting(true);
      exportToWord(data, config, customHeaders)
        .then(success => {
          if (success) {
            toast({
              title: "Export Successful",
              description: "Publication-ready Word document has been downloaded.",
            });
          } else {
            toast({
              title: "Export Failed",
              description: "There was an error exporting to Word.",
              variant: "destructive",
            });
          }
        })
        .finally(() => {
          setIsExporting(false);
        });
    } else if (exportFormat === 'latex') {
      exportToLatexImage();
    }
  };

  // Get font name for display
  const getFontDisplayName = (fontValue: string) => {
    switch (fontValue) {
      case 'lmodern': return 'Latin Modern';
      case 'times': return 'Times Roman';
      case 'palatino': return 'Palatino';
      case 'newtx': return 'NewTX';
      default: return 'Latin Modern';
    }
  };

  // Get font family for CSS
  const getFontFamily = (fontValue: string) => {
    switch (fontValue) {
      case 'lmodern': return 'Latin Modern Roman, Times New Roman, serif';
      case 'times': return 'Times New Roman, serif';
      case 'palatino': return 'Palatino Linotype, Palatino, serif';
      case 'newtx': return 'Times New Roman, serif';
      default: return 'Latin Modern Roman, Times New Roman, serif';
    }
  };

  return (
    <>
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
                <SelectItem value="latex">LaTeX Table Image (.png)</SelectItem>
              </SelectContent>
            </Select>
            
            {exportFormat === 'latex' && (
              <div className="text-xs text-muted-foreground mt-1">
                Exports a visual representation of your LaTeX table as a PNG image.
              </div>
            )}
          </div>

          {/* LaTeX Font (only show when LaTeX format is selected) */}
          {exportFormat === 'latex' && (
            <div className="space-y-2">
              <Label htmlFor="latex-font">LaTeX Font</Label>
              <Select value={latexFont} onValueChange={setLatexFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lmodern">Latin Modern</SelectItem>
                  <SelectItem value="times">Times Roman</SelectItem>
                  <SelectItem value="palatino">Palatino</SelectItem>
                  <SelectItem value="newtx">NewTX (Modern)</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1">
                Select font package for LaTeX document
              </div>
            </div>
          )}

          <Separator />

          {/* Export Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Export Preview</Label>
              
              {exportFormat === 'latex' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                      <Image className="h-3.5 w-3.5 mr-1" />
                      Preview
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-96 p-0" align="end">
                    <div className="p-4 bg-white rounded-md">
                      <div className="font-medium mb-2 text-sm">{config.tableTitle}</div>
                      <div className="border rounded-md overflow-hidden">
                        <div className="p-2 bg-muted/30 text-center text-xs">
                          LaTeX Table Preview ({getFontDisplayName(latexFont)} font)
                        </div>
                        <div className="p-4 bg-white text-xs overflow-hidden" style={{ fontFamily: getFontFamily(latexFont) }}>
                          <div className="text-center mb-3 font-bold text-sm">
                            {config.tableTitle}
                          </div>
                          <table className="w-full border-collapse" style={{ fontFamily: getFontFamily(latexFont) }}>
                            <thead>
                              <tr>
                                {config.visibleColumns.map((col: string) => (
                                  <th key={col} className="border-b-2 border-black p-2 text-center font-bold">
                                    {customHeaders[col]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.coefficients.slice(0, 3).map((row: any, idx: number) => (
                                <tr key={idx}>
                                  {config.visibleColumns.map((col: string) => (
                                    <td key={`${idx}-${col}`} className="p-2 text-center">
                                      {col === 'variable' ? row[col] : '0.00'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {data.coefficients.length > 3 && (
                                <tr>
                                  <td colSpan={config.visibleColumns.length} className="text-center p-2">...</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          {config.showSignificance && (
                            <div className="text-xs italic mt-3 text-left" style={{ fontFamily: getFontFamily(latexFont) }}>
                              Note: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        The actual downloaded image will have proper LaTeX formatting with wider spacing.
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            
            <div className="p-3 bg-muted/30 rounded text-xs font-mono space-y-1">
              <div>Title: {config.tableTitle}</div>
              <div>Columns: {config.visibleColumns.length}</div>
              <div>Rows: {data.coefficients.length}</div>
              <div>Format: {exportFormat === 'excel' ? 'Excel (.xlsx)' : 
                         exportFormat === 'word' ? 'Word (.docx)' : 
                         'LaTeX Table Image (.png)'}</div>
              {exportFormat === 'latex' && <div>Font: {getFontDisplayName(latexFont)}</div>}
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
              {exportFormat === 'latex' ? 
                <Image className="h-4 w-4 mr-2" /> : 
                <Download className="h-4 w-4 mr-2" />
              }
              {isExporting ? 'Exporting...' : 
                exportFormat === 'excel' ? 'Export Excel' : 
                exportFormat === 'word' ? 'Export Word' : 
                'Export LaTeX Image'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* LaTeX Code Dialog */}
      <Dialog open={latexDialogOpen} onOpenChange={setLatexDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>LaTeX Table Exported</DialogTitle>
            <DialogDescription>
              Your LaTeX table has been rendered as an image and downloaded. You can copy just the table code below.
            </DialogDescription>
          </DialogHeader>
          
          {latexImage && (
            <div className="my-4 border rounded-md overflow-hidden">
              <img src={latexImage} alt="LaTeX Table" className="w-full" />
            </div>
          )}
          
          <div className="bg-muted/30 rounded-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">LaTeX Table Code</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyLatexCode} 
                className="h-8"
              >
                {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {isCopied ? 'Copied!' : 'Copy Code'}
              </Button>
            </div>
            <div className="bg-background border rounded-md p-3 overflow-x-auto max-h-[200px]">
              <pre className="text-xs font-mono whitespace-pre-wrap">{latexTableOnly}</pre>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This is just the table code, ready to be used in your LaTeX document.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLatexDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Download, FileDown, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [exportStyle, setExportStyle] = useState('standard');
  const [isExporting, setIsExporting] = useState(false);
  const [latexDialogOpen, setLatexDialogOpen] = useState(false);
  const [latexCode, setLatexCode] = useState('');
  const [latexImage, setLatexImage] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { toast } = useToast();
  
  // Load html2canvas when component mounts
  useEffect(() => {
    loadHtml2Canvas()
      .catch(error => {
        console.error('Failed to load html2canvas:', error);
      });
  }, []);

  const exportToLatexImage = async () => {
    setIsExporting(true);
    
    try {
      // Generate LaTeX code first
      const latexCode = generateLatexCode(data, config, customHeaders);
      
      if (!latexCode) {
        throw new Error('Failed to generate LaTeX code');
      }
      
      setLatexCode(latexCode);
      
      // Attempt to download as image
      const success = await downloadLatexImage(latexCode, config.tableTitle);
      
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
                          LaTeX Table Preview
                        </div>
                        <div className="p-3 bg-white text-xs overflow-hidden">
                          <div className="text-center mb-2 font-bold">
                            {config.tableTitle}
                          </div>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr>
                                {config.visibleColumns.map((col: string) => (
                                  <th key={col} className="border-b-2 border-black p-1 text-center">
                                    {customHeaders[col]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {data.coefficients.slice(0, 3).map((row: any, idx: number) => (
                                <tr key={idx}>
                                  {config.visibleColumns.map((col: string) => (
                                    <td key={`${idx}-${col}`} className="p-1 text-center">
                                      {col === 'variable' ? row[col] : '0.00'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {data.coefficients.length > 3 && (
                                <tr>
                                  <td colSpan={config.visibleColumns.length} className="text-center p-1">...</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          {config.showSignificance && (
                            <div className="text-xs italic mt-2 text-left">
                              Note: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        The actual downloaded image will have proper LaTeX formatting.
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
              {latexImage ? 
                'Your LaTeX table has been rendered as an image and downloaded. You can also copy the LaTeX code below.' :
                'The image has been downloaded. You can also copy the LaTeX code below if needed.'}
            </DialogDescription>
          </DialogHeader>
          
          {latexImage && (
            <div className="my-4 border rounded-md overflow-hidden">
              <img src={latexImage} alt="LaTeX Table" className="w-full" />
            </div>
          )}
          
          <div className="bg-muted/30 rounded p-3 overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">{latexCode}</pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

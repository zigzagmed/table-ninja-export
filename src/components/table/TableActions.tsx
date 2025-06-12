
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TableCustomizer } from './TableCustomizer';
import { ExportPanel } from './ExportPanel';
import { Settings, Download } from 'lucide-react';

interface TableActionsProps {
  config: any;
  customHeaders: any;
  data: any;
  customizeOpen: boolean;
  exportOpen: boolean;
  onCustomizeOpenChange: (open: boolean) => void;
  onExportOpenChange: (open: boolean) => void;
  onConfigChange: (config: any) => void;
  onHeaderChange: (column: string, newHeader: string) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  config,
  customHeaders,
  data,
  customizeOpen,
  exportOpen,
  onCustomizeOpenChange,
  onExportOpenChange,
  onConfigChange,
  onHeaderChange
}) => {
  return (
    <div className="flex gap-2">
      <Dialog open={customizeOpen} onOpenChange={onCustomizeOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Table Customization</DialogTitle>
          </DialogHeader>
          <TableCustomizer 
            config={config}
            customHeaders={customHeaders}
            onConfigChange={onConfigChange}
            onHeaderChange={onHeaderChange}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={exportOpen} onOpenChange={onExportOpenChange}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Options</DialogTitle>
          </DialogHeader>
          <ExportPanel 
            data={data}
            config={config}
            customHeaders={customHeaders}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

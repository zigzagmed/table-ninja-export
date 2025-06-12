
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelStatsSection } from './ModelStatsSection';
import { TableSection } from './TableSection';
import { SignificanceLegend } from './SignificanceLegend';
import { TableActions } from './TableActions';

interface InteractiveTableProps {
  data: any;
  config: any;
  customHeaders: any;
  onConfigChange: (config: any) => void;
  onHeaderChange: (column: string, newHeader: string) => void;
}

export const InteractiveTable: React.FC<InteractiveTableProps> = React.memo(({
  data,
  config,
  customHeaders,
  onConfigChange,
  onHeaderChange
}) => {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const handleCustomizeOpenChange = useCallback((open: boolean) => {
    setCustomizeOpen(open);
  }, []);

  const handleExportOpenChange = useCallback((open: boolean) => {
    setExportOpen(open);
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{config.tableTitle}</CardTitle>
          <TableActions
            config={config}
            customHeaders={customHeaders}
            data={data}
            customizeOpen={customizeOpen}
            exportOpen={exportOpen}
            onCustomizeOpenChange={handleCustomizeOpenChange}
            onExportOpenChange={handleExportOpenChange}
            onConfigChange={onConfigChange}
            onHeaderChange={onHeaderChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <ModelStatsSection data={data} config={config} />
        <TableSection 
          data={data}
          config={config}
          customHeaders={customHeaders}
          onConfigChange={onConfigChange}
        />
        <SignificanceLegend config={config} />
      </CardContent>
    </Card>
  );
});

InteractiveTable.displayName = 'InteractiveTable';

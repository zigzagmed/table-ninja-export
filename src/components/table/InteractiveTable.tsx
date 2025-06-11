
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTableHeader } from './SortableTableHeader';
import { TableCustomizer } from './TableCustomizer';
import { ExportPanel } from './ExportPanel';
import { Settings, Download } from 'lucide-react';

interface InteractiveTableProps {
  data: any;
  config: any;
  customHeaders: any;
  onConfigChange: (config: any) => void;
  onHeaderChange: (column: string, newHeader: string) => void;
}

export const InteractiveTable: React.FC<InteractiveTableProps> = ({
  data,
  config,
  customHeaders,
  onConfigChange,
  onHeaderChange
}) => {
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = config.columnOrder.indexOf(active.id);
      const newIndex = config.columnOrder.indexOf(over.id);
      
      const newColumnOrder = arrayMove(config.columnOrder, oldIndex, newIndex);
      onConfigChange({ columnOrder: newColumnOrder });
    }
  };

  const visibleColumnOrder = config.columnOrder.filter((col: string) => 
    config.visibleColumns.includes(col)
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{config.tableTitle}</CardTitle>
          <div className="flex gap-2">
            <Dialog open={customizeOpen} onOpenChange={setCustomizeOpen}>
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

            <Dialog open={exportOpen} onOpenChange={setExportOpen}>
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
        </div>
      </CardHeader>
      <CardContent>
        {/* Model Information */}
        {config.includeModelStats && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Model:</span>
                  <span>{data.modelInfo.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dependent Variable:</span>
                  <span>{data.modelInfo.dependentVariable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">No. Observations:</span>
                  <span>{data.modelInfo.observations}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">R-squared:</span>
                  <span>{data.modelStats.rSquared}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Adj. R-squared:</span>
                  <span>{data.modelStats.adjRSquared}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">F-statistic:</span>
                  <span>{data.modelStats.fStatistic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">AIC:</span>
                  <span>{data.modelStats.aic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">BIC:</span>
                  <span>{data.modelStats.bic}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Coefficients Table */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableContext items={visibleColumnOrder} strategy={horizontalListSortingStrategy}>
                    {visibleColumnOrder.map((columnId: string) => (
                      <SortableTableHeader
                        key={columnId}
                        id={columnId}
                        title={customHeaders[columnId]}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.coefficients.map((row: any, index: number) => (
                  <TableRow key={index}>
                    {visibleColumnOrder.map((columnId: string) => (
                      <TableCell key={columnId} className="font-mono text-sm">
                        {columnId === 'variable' && row[columnId]}
                        {columnId === 'coef' && (
                          <span>
                            {formatNumber(row[columnId], 'coefficient')}
                            {getSignificanceStars(row.p_value)}
                          </span>
                        )}
                        {columnId === 'std_err' && formatNumber(row[columnId])}
                        {columnId === 't' && formatNumber(row[columnId])}
                        {columnId === 'p_value' && formatNumber(row[columnId], 'pvalue')}
                        {columnId === 'ci_lower' && formatNumber(row[columnId])}
                        {columnId === 'ci_upper' && formatNumber(row[columnId])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DndContext>

        {/* Significance Legend */}
        {config.showSignificance && (
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Significance levels: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

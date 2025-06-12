
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTableHeader } from './SortableTableHeader';

interface TableSectionProps {
  data: any;
  config: any;
  customHeaders: any;
  onConfigChange: (config: any) => void;
}

export const TableSection: React.FC<TableSectionProps> = ({
  data,
  config,
  customHeaders,
  onConfigChange
}) => {
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
                  <TableCell key={columnId} className="text-sm">
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
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface TableCustomizerProps {
  config: any;
  customHeaders: any;
  onConfigChange: (config: any) => void;
  onHeaderChange: (column: string, header: string) => void;
}

export const TableCustomizer: React.FC<TableCustomizerProps> = ({
  config,
  customHeaders,
  onConfigChange,
  onHeaderChange
}) => {
  const availableColumns = [
    { id: 'variable', label: 'Variable' },
    { id: 'coef', label: 'Coefficient' },
    { id: 'std_err', label: 'Std. Error' },
    { id: 't', label: 't-statistic' },
    { id: 'p_value', label: 'P-value' },
    { id: 'ci_lower', label: 'CI Lower' },
    { id: 'ci_upper', label: 'CI Upper' }
  ];

  const handleColumnVisibility = (columnId: string, visible: boolean) => {
    const newVisibleColumns = visible 
      ? [...config.visibleColumns, columnId]
      : config.visibleColumns.filter((col: string) => col !== columnId);
    
    onConfigChange({ visibleColumns: newVisibleColumns });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="text-lg">Table Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Title */}
        <div className="space-y-2">
          <Label htmlFor="table-title">Table Title</Label>
          <Input
            id="table-title"
            value={config.tableTitle}
            onChange={(e) => onConfigChange({ tableTitle: e.target.value })}
            placeholder="Enter table title"
          />
        </div>

        <Separator />

        {/* Column Visibility */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visible Columns</Label>
          {availableColumns.map((column) => (
            <div key={column.id} className="flex items-center justify-between">
              <Label htmlFor={`col-${column.id}`} className="text-sm">
                {column.label}
              </Label>
              <Switch
                id={`col-${column.id}`}
                checked={config.visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => handleColumnVisibility(column.id, checked)}
              />
            </div>
          ))}
        </div>

        <Separator />

        {/* Formatting Options */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Formatting</Label>
          
          <div className="space-y-2">
            <Label htmlFor="decimal-places" className="text-sm">Decimal Places</Label>
            <Select 
              value={config.decimalPlaces.toString()} 
              onValueChange={(value) => onConfigChange({ decimalPlaces: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-significance" className="text-sm">
              Show Significance Stars
            </Label>
            <Switch
              id="show-significance"
              checked={config.showSignificance}
              onCheckedChange={(checked) => onConfigChange({ showSignificance: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-stats" className="text-sm">
              Include Model Statistics
            </Label>
            <Switch
              id="include-stats"
              checked={config.includeModelStats}
              onCheckedChange={(checked) => onConfigChange({ includeModelStats: checked })}
            />
          </div>
        </div>

        <Separator />

        {/* Custom Headers */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Custom Headers</Label>
          {config.visibleColumns.map((columnId: string) => {
            const column = availableColumns.find(col => col.id === columnId);
            if (!column) return null;
            
            return (
              <div key={columnId} className="space-y-1">
                <Label htmlFor={`header-${columnId}`} className="text-xs text-muted-foreground">
                  {column.label}
                </Label>
                <Input
                  id={`header-${columnId}`}
                  value={customHeaders[columnId] || column.label}
                  onChange={(e) => onHeaderChange(columnId, e.target.value)}
                  className="text-sm"
                />
              </div>
            );
          })}
        </div>

        <Separator />

        {/* Templates */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Templates</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button variant="outline" size="sm" onClick={() => console.log('Load APA template')}>
              APA Style
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log('Load Academic template')}>
              Academic
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log('Save current template')}>
              Save Current
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

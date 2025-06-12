import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface TableCustomizerProps {
  config: any;
  customHeaders: any;
  onConfigChange: (config: any) => void;
  onHeaderChange: (column: string, newHeader: string) => void;
  onClose: () => void;
}

const DEFAULT_CONFIG = {
  tableTitle: 'Regression Results',
  decimalPlaces: 3,
  showSignificance: true,
  includeModelStats: true,
  visibleColumns: ['variable', 'coef', 'std_err', 't', 'p_value', 'ci_lower', 'ci_upper'],
  columnOrder: ['variable', 'coef', 'std_err', 't', 'p_value', 'ci_lower', 'ci_upper']
};

const DEFAULT_HEADERS = {
  variable: 'Variable',
  coef: 'Coefficient',
  std_err: 'Std Error',
  t: 't-statistic',
  p_value: 'P-value',
  ci_lower: 'CI Lower',
  ci_upper: 'CI Upper'
};

export const TableCustomizer: React.FC<TableCustomizerProps> = ({
  config,
  customHeaders,
  onConfigChange,
  onHeaderChange,
  onClose
}) => {
  const handleReset = () => {
    onConfigChange(DEFAULT_CONFIG);
    Object.entries(DEFAULT_HEADERS).forEach(([column, header]) => {
      onHeaderChange(column, header);
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="tableTitle">Table Title</Label>
          <Input
            id="tableTitle"
            value={config.tableTitle}
            onChange={(e) => onConfigChange({ tableTitle: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="decimalPlaces">Decimal Places</Label>
          <Select
            value={config.decimalPlaces.toString()}
            onValueChange={(value) => onConfigChange({ decimalPlaces: parseInt(value) })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showSignificance"
            checked={config.showSignificance}
            onCheckedChange={(checked) => onConfigChange({ showSignificance: checked })}
          />
          <Label htmlFor="showSignificance">Show significance stars</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="includeModelStats"
            checked={config.includeModelStats}
            onCheckedChange={(checked) => onConfigChange({ includeModelStats: checked })}
          />
          <Label htmlFor="includeModelStats">Include model statistics</Label>
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium">Visible Columns</Label>
        <div className="mt-2 space-y-2">
          {config.columnOrder.map((column: string) => (
            <div key={column} className="flex items-center space-x-2">
              <Checkbox
                id={`column-${column}`}
                checked={config.visibleColumns.includes(column)}
                onCheckedChange={(checked) => {
                  const newVisibleColumns = checked
                    ? [...config.visibleColumns, column]
                    : config.visibleColumns.filter((col: string) => col !== column);
                  onConfigChange({ visibleColumns: newVisibleColumns });
                }}
              />
              <Label htmlFor={`column-${column}`} className="flex-1">
                {customHeaders[column]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-sm font-medium">Column Headers</Label>
        <div className="mt-2 space-y-2">
          {config.columnOrder.map((column: string) => (
            <div key={column}>
              <Label htmlFor={`header-${column}`} className="text-xs text-muted-foreground">
                {column}
              </Label>
              <Input
                id={`header-${column}`}
                value={customHeaders[column]}
                onChange={(e) => onHeaderChange(column, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
};

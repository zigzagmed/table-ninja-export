
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Columns } from 'lucide-react';

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
    <div className="space-y-6">
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

      {/* Column Visibility Dropdown */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Visible Columns</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Columns className="h-4 w-4" />
                <span>{config.visibleColumns.length} of {availableColumns.length} columns</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Select Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={config.visibleColumns.includes(column.id)}
                onCheckedChange={(checked) => handleColumnVisibility(column.id, checked)}
              >
                {column.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
    </div>
  );
};

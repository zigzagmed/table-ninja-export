
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTable } from './table/InteractiveTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRegressionData } from '../hooks/useRegressionData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

interface RegressionTableProps {
  regressionId?: string;
}

export const RegressionTable: React.FC<RegressionTableProps> = ({ regressionId }) => {
  const [tableConfig, setTableConfig] = useState({
    visibleColumns: ['variable', 'coef', 'std_err', 't', 'p_value', 'ci_lower', 'ci_upper'],
    decimalPlaces: 4,
    showSignificance: true,
    tableTitle: 'OLS Regression Results',
    includeModelStats: true,
    columnOrder: ['variable', 'coef', 'std_err', 't', 'p_value', 'ci_lower', 'ci_upper']
  });

  const [customHeaders, setCustomHeaders] = useState({
    variable: 'Variable',
    coef: 'Coefficient',
    std_err: 'Std. Error',
    t: 't-statistic',
    p_value: 'P>|t|',
    ci_lower: '[0.025',
    ci_upper: '0.975]'
  });

  const {
    regressionData,
    isLoading,
    error,
    isUsingFallback,
    refreshData
  } = useRegressionData(regressionId);

  const handleConfigChange = (newConfig: any) => {
    setTableConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleHeaderChange = (column: string, newHeader: string) => {
    setCustomHeaders(prev => ({ ...prev, [column]: newHeader }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading regression data...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {/* Status alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load regression data: {error.message}</span>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {isUsingFallback && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Using demo data - Connect to your Python backend to load real results</span>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Backend
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="table" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="output" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regression Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    Raw output from Python regression analysis will appear here.
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Connect your backend to see the full statistical output.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="table" className="space-y-4">
            <div className="max-w-6xl mx-auto">
              <InteractiveTable 
                data={regressionData}
                config={tableConfig}
                customHeaders={customHeaders}
                onConfigChange={handleConfigChange}
                onHeaderChange={handleHeaderChange}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="diagnostic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostic Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-muted-foreground text-center">
                    Diagnostic plots and tests from Python analysis will appear here.
                  </p>
                  <p className="text-sm text-muted-foreground text-center mt-2">
                    Connect your backend to see residual plots, normality tests, etc.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};


import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTable } from './table/InteractiveTable';
import { TooltipProvider } from '@/components/ui/tooltip';
import { regressionData } from '../data/regressionData';

export const RegressionTable = () => {
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

  const handleConfigChange = (newConfig: any) => {
    setTableConfig(prev => ({ ...prev, ...newConfig }));
  };

  const handleHeaderChange = (column: string, newHeader: string) => {
    setCustomHeaders(prev => ({ ...prev, [column]: newHeader }));
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
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
                  <p className="text-muted-foreground text-center">This is filler content for the output tab.</p>
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
                  <p className="text-muted-foreground text-center">This is filler content for the diagnostic tab.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
};


import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TableCustomizer } from './table/TableCustomizer';
import { InteractiveTable } from './table/InteractiveTable';
import { ExportPanel } from './table/ExportPanel';
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
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Regression Analysis - Table View</h2>
        <p className="text-muted-foreground">Customize and export your OLS regression results</p>
      </div>
      
      <Tabs defaultValue="output" className="w-full">
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
              <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                <pre>{`                            OLS Regression Results                            
==============================================================================
Dep. Variable:              realcons   R-squared:                       0.758
Model:                            OLS   Adj. R-squared:                  0.757
Method:                 Least Squares   F-statistic:                     630.1
Date:                2025-06-11 09:12   Prob (F-statistic):           7.20e-64
Time:                        09:12:00   Log-Likelihood:                 -1716.
No. Observations:                 203   AIC:                             3436.
Df Residuals:                     201   BIC:                             3442.
Df Model:                           1                                         
Covariance Type:            nonrobust                                         
==============================================================================
                 coef    std err          t      P>|t|      [0.025      0.975]
------------------------------------------------------------------------------
Intercept   -4659.....    386.266    -12.064      0.000   -5421...   -3898...
realgovt       14.2994      0.570     25.101      0.000      13.176     15.423
==============================================================================
Omnibus:                       34.617   Durbin-Watson:                   0.028
Prob(Omnibus):                  0.000   Jarque-Bera (JB):                8.591
Skew:                           0.067   Prob(JB):                        0.014
Kurtosis:                       2.001   Condition No.:                   3272.`}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="space-y-4">
          <div className="grid grid-cols-12 gap-6">
            {/* Left Panel - Customization Controls */}
            <div className="col-span-3">
              <TableCustomizer 
                config={tableConfig}
                customHeaders={customHeaders}
                onConfigChange={handleConfigChange}
                onHeaderChange={handleHeaderChange}
              />
            </div>
            
            {/* Center Panel - Interactive Table */}
            <div className="col-span-6">
              <InteractiveTable 
                data={regressionData}
                config={tableConfig}
                customHeaders={customHeaders}
                onConfigChange={handleConfigChange}
              />
            </div>
            
            {/* Right Panel - Export Options */}
            <div className="col-span-3">
              <ExportPanel 
                data={regressionData}
                config={tableConfig}
                customHeaders={customHeaders}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="diagnostic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostic Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Residual Tests</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Omnibus:</span>
                      <span>34.617</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prob(Omnibus):</span>
                      <span>0.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Skew:</span>
                      <span>0.067</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kurtosis:</span>
                      <span>2.001</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Autocorrelation Tests</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Durbin-Watson:</span>
                      <span>0.028</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jarque-Bera (JB):</span>
                      <span>8.591</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prob(JB):</span>
                      <span>0.014</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Condition No.:</span>
                      <span>3272</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface DiagnosticsData {
  omnibus: number;
  probOmnibus: number;
  skew: number;
  kurtosis: number;
  durbinWatson: number;
  jarqueBera: number;
  probJB: number;
  conditionNo: number;
}

interface DiagnosticAnalysisProps {
  diagnostics: DiagnosticsData;
}

export const DiagnosticAnalysis: React.FC<DiagnosticAnalysisProps> = ({ diagnostics }) => {
  const getTestResult = (pValue: number, threshold: number = 0.05) => {
    if (pValue < threshold) {
      return { status: 'reject', color: 'destructive', icon: AlertTriangle };
    }
    return { status: 'fail-to-reject', color: 'default', icon: CheckCircle };
  };

  const getNormalityStatus = () => {
    const omniResult = getTestResult(diagnostics.probOmnibus);
    const jbResult = getTestResult(diagnostics.probJB);
    
    if (omniResult.status === 'reject' || jbResult.status === 'reject') {
      return { status: 'violation', message: 'Evidence against normality', severity: 'warning' };
    }
    return { status: 'ok', message: 'No strong evidence against normality', severity: 'info' };
  };

  const getAutocorrelationStatus = () => {
    const dw = diagnostics.durbinWatson;
    if (dw < 1.5) {
      return { status: 'positive', message: 'Positive autocorrelation detected', severity: 'warning' };
    } else if (dw > 2.5) {
      return { status: 'negative', message: 'Negative autocorrelation detected', severity: 'warning' };
    }
    return { status: 'ok', message: 'No strong evidence of autocorrelation', severity: 'info' };
  };

  const getMulticollinearityStatus = () => {
    const condNo = diagnostics.conditionNo;
    if (condNo > 30) {
      return { status: 'severe', message: 'Severe multicollinearity concern', severity: 'error' };
    } else if (condNo > 15) {
      return { status: 'moderate', message: 'Moderate multicollinearity concern', severity: 'warning' };
    }
    return { status: 'ok', message: 'No multicollinearity concern', severity: 'info' };
  };

  const normalityStatus = getNormalityStatus();
  const autocorrelationStatus = getAutocorrelationStatus();
  const multicollinearityStatus = getMulticollinearityStatus();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">Diagnostic Analysis</h3>
        <p className="text-muted-foreground">
          Assessment of regression assumptions and model validity
        </p>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Diagnostic Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Alert className={normalityStatus.severity === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
              <AlertDescription className="flex items-center justify-between">
                <span>Residual Normality</span>
                <Badge variant={normalityStatus.severity === 'warning' ? 'destructive' : 'secondary'}>
                  {normalityStatus.status === 'violation' ? 'Concern' : 'OK'}
                </Badge>
              </AlertDescription>
            </Alert>
            
            <Alert className={autocorrelationStatus.severity === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
              <AlertDescription className="flex items-center justify-between">
                <span>Autocorrelation</span>
                <Badge variant={autocorrelationStatus.severity === 'warning' ? 'destructive' : 'secondary'}>
                  {autocorrelationStatus.status === 'ok' ? 'OK' : 'Concern'}
                </Badge>
              </AlertDescription>
            </Alert>
            
            <Alert className={multicollinearityStatus.severity === 'error' ? 'border-red-200 bg-red-50' : 
                               multicollinearityStatus.severity === 'warning' ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}>
              <AlertDescription className="flex items-center justify-between">
                <span>Multicollinearity</span>
                <Badge variant={multicollinearityStatus.severity === 'info' ? 'secondary' : 'destructive'}>
                  {multicollinearityStatus.status === 'ok' ? 'OK' : 'Concern'}
                </Badge>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Normality Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Residual Normality Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm text-muted-foreground">
              <p>
                These tests check whether the residuals follow a normal distribution, 
                which is an important assumption for valid statistical inference in OLS regression.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Omnibus Test</div>
                  <div className="text-sm text-muted-foreground">
                    Tests for normality using skewness and kurtosis
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.omnibus.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">p = {diagnostics.probOmnibus.toFixed(3)}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Jarque-Bera Test</div>
                  <div className="text-sm text-muted-foreground">
                    Another test for normality based on skewness and kurtosis
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.jarqueBera.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">p = {diagnostics.probJB.toFixed(3)}</div>
                </div>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Interpretation:</strong> {normalityStatus.message}. 
                P-values &lt; 0.05 suggest non-normal residuals, which may affect the validity of confidence intervals and hypothesis tests.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Autocorrelation Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Autocorrelation Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm text-muted-foreground">
              <p>
                Tests for serial correlation in residuals, which violates the independence assumption 
                and can lead to inefficient estimates and invalid standard errors.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Durbin-Watson Test</div>
                  <div className="text-sm text-muted-foreground">
                    Tests for first-order autocorrelation
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.durbinWatson.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">
                    Range: 0-4 (2 = no correlation)
                  </div>
                </div>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Interpretation:</strong> {autocorrelationStatus.message}. 
                Values close to 2 indicate no autocorrelation, while values near 0 or 4 suggest positive or negative autocorrelation respectively.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Multicollinearity */}
        <Card>
          <CardHeader>
            <CardTitle>Multicollinearity Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm text-muted-foreground">
              <p>
                Checks for high correlation among independent variables, which can make 
                coefficient estimates unstable and difficult to interpret.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Condition Number</div>
                  <div className="text-sm text-muted-foreground">
                    Measures linear dependence among regressors
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.conditionNo.toFixed(0)}</div>
                  <div className="text-xs text-muted-foreground">
                    &lt;15: Good, 15-30: Moderate, &gt;30: High concern
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className={multicollinearityStatus.severity === 'error' ? 'border-red-200 bg-red-50' : 
                               multicollinearityStatus.severity === 'warning' ? 'border-orange-200 bg-orange-50' : ''}>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Interpretation:</strong> {multicollinearityStatus.message}. 
                High multicollinearity can inflate standard errors and make individual coefficient tests unreliable.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Additional Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Diagnostics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm text-muted-foreground">
              <p>
                Additional measures of residual distribution characteristics that help 
                assess model adequacy and identify potential issues.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Skewness</div>
                  <div className="text-sm text-muted-foreground">
                    Measures asymmetry of residual distribution
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.skew.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">
                    0 = symmetric
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                <div>
                  <div className="font-medium">Kurtosis</div>
                  <div className="text-sm text-muted-foreground">
                    Measures tail heaviness of residual distribution
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{diagnostics.kurtosis.toFixed(3)}</div>
                  <div className="text-xs text-muted-foreground">
                    3 = normal
                  </div>
                </div>
              </div>
            </div>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Normal residuals</strong> should have skewness near 0 and kurtosis near 3. 
                Significant deviations may indicate model misspecification or the presence of outliers.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {normalityStatus.status === 'violation' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Non-normal residuals:</strong> Consider transforming variables, using robust standard errors, 
                  or examining residual plots for outliers or model misspecification.
                </AlertDescription>
              </Alert>
            )}
            
            {autocorrelationStatus.status !== 'ok' && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Autocorrelation detected:</strong> Consider using Newey-West standard errors, 
                  adding lagged variables, or using time series methods if data has temporal structure.
                </AlertDescription>
              </Alert>
            )}
            
            {multicollinearityStatus.status !== 'ok' && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Multicollinearity concern:</strong> Consider removing highly correlated variables, 
                  using principal components, or ridge regression to address this issue.
                </AlertDescription>
              </Alert>
            )}
            
            {normalityStatus.status === 'ok' && autocorrelationStatus.status === 'ok' && multicollinearityStatus.status === 'ok' && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Good diagnostics:</strong> The model appears to satisfy key regression assumptions. 
                  Standard statistical inference should be reliable.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

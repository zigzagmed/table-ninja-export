
// API types for backend integration

export interface RegressionRequest {
  dependentVariable: string;
  independentVariables: string[];
  data: Record<string, number>[];
  modelType?: 'OLS' | 'Logistic' | 'Ridge' | 'Lasso';
  options?: {
    includeIntercept?: boolean;
    confidenceLevel?: number;
  };
}

export interface RegressionResponse {
  modelInfo: {
    model: string;
    dependentVariable: string;
    date: string;
    observations: number;
    dfResiduals: number;
    dfModel: number;
  };
  modelStats: {
    rSquared: number;
    adjRSquared: number;
    fStatistic: number;
    probFStatistic: number;
    logLikelihood: number;
    aic: number;
    bic: number;
    scale: number;
  };
  coefficients: Array<{
    variable: string;
    coef: number;
    std_err: number;
    t: number;
    p_value: number;
    ci_lower: number;
    ci_upper: number;
  }>;
  diagnostics: {
    omnibus: number;
    probOmnibus: number;
    skew: number;
    kurtosis: number;
    durbinWatson: number;
    jarqueBera: number;
    probJB: number;
    conditionNo: number;
  };
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

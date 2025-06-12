
// Type definitions for export functionality

export interface ExportConfig {
  tableTitle: string;
  decimalPlaces: number;
  showSignificance: boolean;
  includeModelStats: boolean;
  columnOrder: string[];
  visibleColumns: string[];
  latexFont?: string;
}

export interface ModelInfo {
  model: string;
  dependentVariable: string;
  observations: number;
}

export interface ModelStats {
  rSquared: number;
  adjRSquared: number;
  fStatistic: number;
  aic: number;
  bic: number;
}

export interface ExportData {
  coefficients: any[];
  modelInfo: ModelInfo;
  modelStats: ModelStats;
}

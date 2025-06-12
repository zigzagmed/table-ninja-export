
// Formatting utility functions for export data

export const formatNumber = (value: number, type: string = 'default', decimals: number = 2) => {
  if (value === null || value === undefined) return 'N/A';
  
  switch (type) {
    case 'pvalue':
      return value < 0.001 ? '<0.001' : value.toFixed(decimals);
    case 'coefficient':
      return value.toFixed(decimals);
    default:
      return value.toFixed(decimals);
  }
};

export const getSignificanceStars = (pValue: number, showSignificance: boolean) => {
  if (!showSignificance) return '';
  if (pValue < 0.001) return '***';
  if (pValue < 0.01) return '**';
  if (pValue < 0.05) return '*';
  return '';
};

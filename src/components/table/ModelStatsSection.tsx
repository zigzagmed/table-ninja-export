
import React from 'react';

interface ModelStatsSectionProps {
  data: any;
  config: any;
}

export const ModelStatsSection: React.FC<ModelStatsSectionProps> = React.memo(({ data, config }) => {
  if (!config.includeModelStats) return null;

  return (
    <div className="mb-6 p-4 bg-muted/30 rounded-lg">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Model:</span>
            <span>{data.modelInfo.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Dependent Variable:</span>
            <span>{data.modelInfo.dependentVariable}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">No. Observations:</span>
            <span>{data.modelInfo.observations}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">R-squared:</span>
            <span>{data.modelStats.rSquared}</span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-medium">Adj. R-squared:</span>
            <span>{data.modelStats.adjRSquared}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">F-statistic:</span>
            <span>{data.modelStats.fStatistic}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">AIC:</span>
            <span>{data.modelStats.aic}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">BIC:</span>
            <span>{data.modelStats.bic}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ModelStatsSection.displayName = 'ModelStatsSection';

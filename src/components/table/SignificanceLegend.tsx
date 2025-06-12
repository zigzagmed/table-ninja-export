
import React from 'react';

interface SignificanceLegendProps {
  config: any;
}

export const SignificanceLegend: React.FC<SignificanceLegendProps> = ({ config }) => {
  if (!config.showSignificance) return null;

  return (
    <div className="mt-4 text-xs text-muted-foreground">
      <p>Significance levels: * p&lt;0.05, ** p&lt;0.01, *** p&lt;0.001</p>
    </div>
  );
};

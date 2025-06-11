
export const regressionData = {
  modelInfo: {
    model: 'OLS',
    dependentVariable: 'realcons',
    date: '2025-06-11 09:12',
    observations: 203,
    dfResiduals: 201,
    dfModel: 1
  },
  modelStats: {
    rSquared: 0.758,
    adjRSquared: 0.757,
    fStatistic: 630.1,
    probFStatistic: 7.2e-64,
    logLikelihood: -1716,
    aic: 3436.0077,
    bic: 3442.6341,
    scale: 1300800
  },
  coefficients: [
    {
      variable: 'Intercept',
      coef: -4659.123,
      std_err: 386.2657,
      t: -12.0639,
      p_value: 0.0000,
      ci_lower: -5421.456,
      ci_upper: -3898.789
    },
    {
      variable: 'realgovt',
      coef: 14.2994,
      std_err: 0.5697,
      t: 25.1010,
      p_value: 0.0000,
      ci_lower: 13.1761,
      ci_upper: 15.4227
    }
  ],
  diagnostics: {
    omnibus: 34.617,
    probOmnibus: 0.000,
    skew: 0.067,
    kurtosis: 2.001,
    durbinWatson: 0.028,
    jarqueBera: 8.591,
    probJB: 0.014,
    conditionNo: 3272
  }
};

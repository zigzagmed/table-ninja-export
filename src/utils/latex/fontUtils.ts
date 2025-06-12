
// Font utility functions for LaTeX rendering

export const getFontFamily = (latexCode: string): string => {
  if (latexCode.includes('\\usepackage{lmodern}')) {
    return 'Latin Modern Roman, Times New Roman, serif';
  } else if (latexCode.includes('\\usepackage{mathptmx}')) {
    return 'Times New Roman, serif';
  } else if (latexCode.includes('\\usepackage{mathpazo}')) {
    return 'Palatino Linotype, Palatino, serif';
  } else if (latexCode.includes('\\usepackage{newtxtext,newtxmath}')) {
    return 'Times New Roman, serif';
  }
  return 'Times New Roman, serif';
};

export const getFontDisplayName = (fontValue: string): string => {
  switch (fontValue) {
    case 'lmodern': return 'Latin Modern';
    case 'times': return 'Times Roman';
    case 'palatino': return 'Palatino';
    case 'newtx': return 'NewTX';
    default: return 'Latin Modern';
  }
};

export const getFontFamilyFromValue = (fontValue: string): string => {
  switch (fontValue) {
    case 'lmodern': return 'Latin Modern Roman, Times New Roman, serif';
    case 'times': return 'Times New Roman, serif';
    case 'palatino': return 'Palatino Linotype, Palatino, serif';
    case 'newtx': return 'Times New Roman, serif';
    default: return 'Latin Modern Roman, Times New Roman, serif';
  }
};

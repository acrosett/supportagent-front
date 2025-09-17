// composables/useTheme.ts
export const useTheme = () => {
  const getColor = (colorName: string): string => {
    if (import.meta.client) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${colorName}`)
        .trim();
      return value || '';
    }
    return '';
  };

  return {
    colors: {
      brand: () => getColor('brand'),
      brand2: () => getColor('brand-2'),
      text: () => getColor('text'),
      textLight: () => getColor('text-light'),
      textMuted: () => getColor('text-muted'),
      textWhite: () => getColor('text-white'),
      bg: () => getColor('bg'),
      bgWhite: () => getColor('bg-white'),
      bgDark: () => getColor('bg-dark'),
      panel: () => getColor('panel'),
      cta: () => getColor('cta'),
      ctaSecondary: () => getColor('cta-secondary'),
      ok: () => getColor('ok'),
      warning: () => getColor('warning'),
      error: () => getColor('error'),
      muted: () => getColor('muted'),
      ring: () => getColor('ring'),
      border: () => getColor('border'),
    }
  };
};
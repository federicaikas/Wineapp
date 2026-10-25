/**
 * Helper per mappare il nome del paese alla relativa emoji bandiera
 */
export const getCountryFlag = (country?: string): string => {
  if (!country) return '';
  const c = country.toLowerCase().trim();
  if (c.includes('italia') || c.includes('italy') || c === 'it') return '🇮🇹';
  if (c.includes('francia') || c.includes('france') || c === 'fr') return '🇫🇷';
  if (c.includes('spagna') || c.includes('spain') || c === 'es') return '🇪🇸';
  if (c.includes('germania') || c.includes('germany') || c === 'de') return '🇩🇪';
  if (c.includes('portogallo') || c.includes('portugal') || c === 'pt') return '🇵🇹';
  if (c.includes('stati uniti') || c.includes('usa') || c.includes('united states') || c === 'us') return '🇺🇸';
  if (c.includes('austria') || c === 'at') return '🇦🇹';
  if (c.includes('svizzera') || c.includes('switzerland') || c === 'ch') return '🇨🇭';
  if (c.includes('australia') || c === 'au') return '🇦🇺';
  if (c.includes('nuova zelanda') || c.includes('new zealand') || c === 'nz') return '🇳🇿';
  if (c.includes('cile') || c.includes('chile') || c === 'cl') return '🇨🇱';
  if (c.includes('argentina') || c === 'ar') return '🇦🇷';
  if (c.includes('sudafrica') || c.includes('south africa') || c === 'za') return '🇿🇦';
  return '';
};


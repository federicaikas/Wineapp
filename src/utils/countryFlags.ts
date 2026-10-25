export type CountryCode = 'IT' | 'FR' | 'ES' | 'EE';

const ITALIAN_REGIONS = [
  'abruzzo', 'basilicata', 'calabria', 'campania', 'emilia', 'romagna',
  'friuli', 'lazio', 'liguria', 'lombardia', 'marche', 'molise',
  'piemonte', 'puglia', 'sardegna', 'sicilia', 'toscana', 'trentino',
  'alto adige', 'südtirol', 'umbria', 'valle d\'aosta', 'aosta', 'veneto'
];

const FRENCH_KEYWORDS = [
  'francia', 'france', 'champagne', 'bordeaux', 'bourgogne', 'burgundy',
  'rhone', 'rhône', 'chateauneuf', 'châteauneuf', 'alsace', 'alsazia',
  'loire', 'loira', 'aoc', 'aop', 'chablis', 'beaujolais'
];

const SPANISH_KEYWORDS = [
  'spagna', 'spain', 'espana', 'españa', 'rioja', 'ribera', 'priorat',
  'cava', 'jerez', 'sherry', 'tempranillo'
];

const OTHER_FOREIGN = [
  'germania', 'germany', 'deutschland', 'mosel', 'mosella',
  'austria', 'österreich',
  'svizzera', 'switzerland', 'schweiz',
  'slovenia', 'slovenija', 'vipava',
  'ungheria', 'hungary', 'tokaj', 'tokaji',
  'portogallo', 'portugal', 'douro', 'porto',
  'stati uniti', 'usa', 'california', 'napa', 'oregon',
  'australia', 'nuova zelanda', 'new zealand', 'cile', 'chile', 'argentina', 'mendoza', 'sudafrica', 'south africa'
];

/**
 * Determina il codice paese normalizzato ('IT' | 'FR' | 'ES' | 'EE') analizzando
 * paese, regione, denominazione e nome della bottiglia.
 */
export const getWineCountryCode = (wine: {
  country?: string;
  region?: string;
  appellation?: string;
  name?: string;
}): CountryCode => {
  const combined = `${wine.country || ''} ${wine.region || ''} ${wine.appellation || ''} ${wine.name || ''}`.toLowerCase();

  // 1. Francia
  if (FRENCH_KEYWORDS.some((k) => combined.includes(k))) {
    return 'FR';
  }

  // 2. Spagna
  if (SPANISH_KEYWORDS.some((k) => combined.includes(k))) {
    return 'ES';
  }

  // 3. Estero generico (altre nazioni)
  if (OTHER_FOREIGN.some((k) => combined.includes(k))) {
    return 'EE';
  }

  // 4. Riconoscimento Italia esplicito o tramite regioni / classificazioni
  if (combined.includes('italia') || combined.includes('italy') || combined.includes(' it')) {
    return 'IT';
  }
  if (ITALIAN_REGIONS.some((r) => combined.includes(r))) {
    return 'IT';
  }
  if (
    combined.includes('docg') ||
    combined.includes('doc') ||
    combined.includes('igt') ||
    combined.includes('dop') ||
    combined.includes('igp')
  ) {
    return 'IT';
  }

  // Fallback predefinito per cantina italiana
  return 'IT';
};

/**
 * Helper per mappare paese, regione o denominazione alla relativa emoji bandiera
 */
export const getCountryFlag = (country?: string, region?: string, appellation?: string): string => {
  const combined = `${country || ''} ${region || ''} ${appellation || ''}`.toLowerCase().trim();
  if (!combined) return '';

  const code = getWineCountryCode({ country, region, appellation });
  if (code === 'IT') return '🇮🇹';
  if (code === 'FR') return '🇫🇷';
  if (code === 'ES') return '🇪🇸';

  if (combined.includes('germania') || combined.includes('germany') || combined.includes('mosel') || combined.includes('de')) return '🇩🇪';
  if (combined.includes('portogallo') || combined.includes('portugal') || combined.includes('pt')) return '🇵🇹';
  if (combined.includes('stati uniti') || combined.includes('usa') || combined.includes('us')) return '🇺🇸';
  if (combined.includes('austria') || combined.includes('at')) return '🇦🇹';
  if (combined.includes('svizzera') || combined.includes('switzerland') || combined.includes('ch')) return '🇨🇭';
  if (combined.includes('slovenia') || combined.includes('vipava')) return '🇸🇮';
  if (combined.includes('ungheria') || combined.includes('tokaj')) return '🇭🇺';
  if (combined.includes('australia') || combined.includes('au')) return '🇦🇺';
  if (combined.includes('nuova zelanda') || combined.includes('new zealand') || combined.includes('nz')) return '🇳🇿';
  if (combined.includes('cile') || combined.includes('chile') || combined.includes('cl')) return '🇨🇱';
  if (combined.includes('argentina') || combined.includes('ar')) return '🇦🇷';
  if (combined.includes('sudafrica') || combined.includes('south africa') || combined.includes('za')) return '🇿🇦';

  return '';
};



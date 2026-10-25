export type CountryCode = 'IT' | 'FR' | 'ES' | 'EE';
export type FlagKey = 'IT' | 'FR' | 'ES' | 'DE' | 'AT' | 'PT' | 'CH' | 'US' | 'SI' | 'HU' | 'AR' | 'CL';

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
 * Codice della bandiera flat da mostrare (null se il paese non e' riconosciuto).
 */
export const getFlagKey = (country?: string, region?: string, appellation?: string): FlagKey | null => {
  const combined = `${country || ''} ${region || ''} ${appellation || ''}`.toLowerCase().trim();
  if (!combined) return null;

  const code = getWineCountryCode({ country, region, appellation });
  if (code === 'IT' || code === 'FR' || code === 'ES') return code;

  const has = (...keys: string[]) => keys.some((k) => combined.includes(k));
  if (has('germania', 'germany', 'deutschland', 'mosel')) return 'DE';
  if (has('portogallo', 'portugal', 'douro')) return 'PT';
  if (has('stati uniti', 'usa', 'california', 'napa', 'oregon')) return 'US';
  if (has('austria', 'österreich')) return 'AT';
  if (has('svizzera', 'switzerland', 'schweiz')) return 'CH';
  if (has('slovenia', 'slovenija', 'vipava')) return 'SI';
  if (has('ungheria', 'hungary', 'tokaj')) return 'HU';
  if (has('argentina', 'mendoza')) return 'AR';
  if (has('cile', 'chile')) return 'CL';
  return null;
};

const NATION_NAMES: Record<FlagKey, string> = {
  IT: 'Italia', FR: 'Francia', ES: 'Spagna', DE: 'Germania', AT: 'Austria', PT: 'Portogallo',
  CH: 'Svizzera', US: 'Stati Uniti', SI: 'Slovenia', HU: 'Ungheria', AR: 'Argentina', CL: 'Cile',
};

/**
 * Nazione di un vino (nome + bandiera), ricavata da paese, regione, denominazione e nome.
 * Serve perché il campo "paese" spesso contiene la denominazione (es. "Toscana IGT").
 */
export const getWineNation = (wine: {
  country?: string;
  region?: string;
  appellation?: string;
  name?: string;
}): { name: string; flag: FlagKey | null } => {
  const code = getWineCountryCode(wine);
  if (code === 'IT' || code === 'FR' || code === 'ES') return { name: NATION_NAMES[code], flag: code };
  const flag = getFlagKey(wine.country, wine.region, wine.appellation);
  if (flag) return { name: NATION_NAMES[flag], flag };
  return { name: 'Altri paesi', flag: null };
};

const WINERY_WEBSITE_MAP: Record<string, string> = {
  'giacomo conterno': 'https://conterno.it',
  'conterno': 'https://conterno.it',
  'dom pérignon': 'https://www.domperignon.com',
  'dom perignon': 'https://www.domperignon.com',
  'tenuta san guido': 'https://www.tenutasanguido.com',
  'san guido': 'https://www.tenutasanguido.com',
  'ca\' del bosco': 'https://www.cadelbosco.com',
  'ca del bosco': 'https://www.cadelbosco.com',
  'marchesi antinori': 'https://www.antinori.it',
  'antinori': 'https://www.antinori.it',
  'biondi santi': 'https://www.biondisanti.it',
  'giuseppe quintarelli': 'https://www.giuseppequintarelli.it',
  'quintarelli': 'https://www.giuseppequintarelli.it',
  'domaine tempier': 'https://www.domainetempier.com',
  'tempier': 'https://www.domainetempier.com',
  'antonelli': 'https://www.antonellisanmarco.it',
  'diubaldo': 'https://www.diubaldowine.com',
  'frescobaldi': 'https://www.frescobaldi.com',
  'masi': 'https://www.masi.it',
  'tommasi': 'https://www.tommasi.com',
  'allegrini': 'https://www.allegrini.it',
  'bellavista': 'https://www.bellavistawine.it',
  'berlucchi': 'https://www.berlucchi.it',
  'vietti': 'https://www.vietti.com',
  'fontanafredda': 'https://www.fontanafredda.it',
  'banfi': 'https://www.banfi.it',
  'duca della cornea': 'https://www.ducadellacornea.it',
  'tenute del cerro': 'https://www.tenutedelcerro.it',
  'kellerei cantina': 'https://www.kellereikaltern.com',
};

export function getWineryWebsiteUrl(producer: string, customUrl?: string): string {
  if (customUrl && customUrl.trim().length > 0) {
    const trimmed = customUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  const p = (producer || '').toLowerCase().trim();

  for (const [key, url] of Object.entries(WINERY_WEBSITE_MAP)) {
    if (p.includes(key)) {
      return url;
    }
  }

  if (!producer || producer === 'Produttore Sconosciuto') {
    return 'https://www.google.com/search?q=cantine+vinicole+italiane';
  }

  return `https://www.google.com/search?q=cantina+${encodeURIComponent(producer)}+sito+ufficiale`;
}

export function getWineryDisplayDomain(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('google.com')) {
      return 'Sito Cantina (Ricerca)';
    }
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Sito Cantina';
  }
}

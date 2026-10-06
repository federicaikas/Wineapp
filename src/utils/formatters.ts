/**
 * Formatta l'annata del vino.
 * Se l'annata è 2026, 0, nullo o non definita, viene mostrato "Sconosciuta".
 */
export function formatVintage(vintage: number | undefined | null): string {
  if (!vintage || vintage === 2026 || vintage === 0) {
    return 'Sconosciuta';
  }
  return vintage.toString();
}

/**
 * Formatta l'annata per l'etichetta estesa (es. "Annata Sconosciuta" o "2018")
 */
export function formatVintageExtended(vintage: number | undefined | null): string {
  if (!vintage || vintage === 2026 || vintage === 0) {
    return 'Annata Sconosciuta';
  }
  return vintage.toString();
}

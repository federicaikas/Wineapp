import type { WineCategory } from '../components/design-system/atoms/Badge';

export function calculateWineLocation(wine: {
  category: WineCategory | string;
  bottleSize?: string;
  notes?: string;
}): string {
  const size = (wine.bottleSize || '').toLowerCase();
  const notes = (wine.notes || '').toLowerCase();

  const isLargeFormat =
    size.includes('1.5') ||
    size.includes('1,5') ||
    size.includes('3l') ||
    size.includes('3 l') ||
    size.includes('3.0') ||
    size.includes('3,0') ||
    size.includes('5l') ||
    size.includes('magnum') ||
    size.includes('jeroboam') ||
    size.includes('mathusalem') ||
    size.includes('salmanazar') ||
    size.includes('balthazar') ||
    size.includes('nebuchadnezzar') ||
    size.includes('grande') ||
    notes.includes('3lt') ||
    notes.includes('3 lt') ||
    notes.includes('magnum') ||
    notes.includes('jeroboam') ||
    notes.includes('bottiglione') ||
    notes.includes('grande formato');

  if (isLargeFormat) {
    return 'Rack 4 (mobile)';
  }

  const cat = (wine.category || '').toLowerCase();
  if (cat === 'red' || cat.includes('ross')) {
    return 'Rack 1 (sx)';
  }
  if (cat === 'white' || cat.includes('bianc')) {
    return 'Rack 2 (centro)';
  }
  // Bolle (sparkling), Rosati (rose), Macerati (orange), Dolci (dessert)
  return 'Rack 3 (dx)';
}

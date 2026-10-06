import React, { useState, useMemo } from 'react';
import type { WineBottle } from '../../types/wine';
import { MapPin, ChevronRight, Award } from 'lucide-react';
import { formatVintage } from '../../utils/formatters';
import './ItalyRegionMap.css';

export interface ItalyRegionMapProps {
  wines: WineBottle[];
  onSelectWine?: (wine: WineBottle) => void;
}

export interface RegionData {
  id: string;
  name: string;
  count: number;
  uniqueLabels: number;
  totalValue: number;
  wines: WineBottle[];
}

// 20 Regioni d'Italia con coordinate SVG semplificate ed eleganti
const REGIONS_GEO_DATA: Array<{
  id: string;
  name: string;
  d: string; // SVG path d
  labelX: number;
  labelY: number;
}> = [
  {
    id: 'valle_aosta',
    name: 'Valle d\'Aosta',
    d: 'M 105,95 L 125,85 L 140,100 L 120,115 L 100,105 Z',
    labelX: 110,
    labelY: 90,
  },
  {
    id: 'piemonte',
    name: 'Piemonte',
    d: 'M 100,105 L 120,115 L 140,100 L 170,115 L 180,150 L 160,185 L 120,195 L 95,160 L 85,130 Z',
    labelX: 125,
    labelY: 150,
  },
  {
    id: 'liguria',
    name: 'Liguria',
    d: 'M 120,195 L 160,185 L 195,180 L 210,195 L 175,200 L 140,205 Z',
    labelX: 165,
    labelY: 200,
  },
  {
    id: 'lombardia',
    name: 'Lombardia',
    d: 'M 170,115 L 215,95 L 250,110 L 245,160 L 205,175 L 180,150 Z',
    labelX: 205,
    labelY: 135,
  },
  {
    id: 'trentino',
    name: 'Trentino-Alto Adige',
    d: 'M 215,95 L 250,65 L 285,85 L 270,120 L 250,110 Z',
    labelX: 250,
    labelY: 90,
  },
  {
    id: 'veneto',
    name: 'Veneto',
    d: 'M 270,120 L 285,85 L 320,105 L 325,145 L 290,165 L 250,140 Z',
    labelX: 290,
    labelY: 125,
  },
  {
    id: 'friuli',
    name: 'Friuli Venezia Giulia',
    d: 'M 320,105 L 355,100 L 360,135 L 330,145 L 325,145 Z',
    labelX: 340,
    labelY: 120,
  },
  {
    id: 'emilia',
    name: 'Emilia-Romagna',
    d: 'M 180,175 L 205,175 L 245,160 L 290,165 L 330,190 L 305,210 L 230,200 Z',
    labelX: 255,
    labelY: 185,
  },
  {
    id: 'toscana',
    name: 'Toscana',
    d: 'M 230,200 L 305,210 L 295,260 L 250,285 L 225,250 Z',
    labelX: 260,
    labelY: 245,
  },
  {
    id: 'umbria',
    name: 'Umbria',
    d: 'M 295,260 L 325,250 L 330,285 L 300,295 Z',
    labelX: 312,
    labelY: 275,
  },
  {
    id: 'marche',
    name: 'Marche',
    d: 'M 305,210 L 330,190 L 355,230 L 330,250 L 325,250 Z',
    labelX: 335,
    labelY: 225,
  },
  {
    id: 'lazio',
    name: 'Lazio',
    d: 'M 250,285 L 300,295 L 340,330 L 320,360 L 280,330 Z',
    labelX: 295,
    labelY: 325,
  },
  {
    id: 'abruzzo',
    name: 'Abruzzo',
    d: 'M 330,250 L 355,230 L 385,265 L 360,295 L 330,285 Z',
    labelX: 355,
    labelY: 265,
  },
  {
    id: 'molise',
    name: 'Molise',
    d: 'M 360,295 L 385,265 L 400,280 L 380,310 Z',
    labelX: 380,
    labelY: 290,
  },
  {
    id: 'campania',
    name: 'Campania',
    d: 'M 340,330 L 380,310 L 415,340 L 390,375 L 350,355 Z',
    labelX: 375,
    labelY: 345,
  },
  {
    id: 'puglia',
    name: 'Puglia',
    d: 'M 385,265 L 400,280 L 455,335 L 485,395 L 450,400 L 415,340 Z',
    labelX: 435,
    labelY: 330,
  },
  {
    id: 'basilicata',
    name: 'Basilicata',
    d: 'M 415,340 L 450,400 L 420,410 L 390,375 Z',
    labelX: 415,
    labelY: 380,
  },
  {
    id: 'calabria',
    name: 'Calabria',
    d: 'M 390,375 L 420,410 L 410,470 L 375,465 L 380,420 Z',
    labelX: 395,
    labelY: 430,
  },
  {
    id: 'sicilia',
    name: 'Sicilia',
    d: 'M 290,440 L 360,435 L 385,475 L 320,510 L 275,470 Z',
    labelX: 325,
    labelY: 470,
  },
  {
    id: 'sardegna',
    name: 'Sardegna',
    d: 'M 130,300 L 165,290 L 175,370 L 140,400 L 120,360 Z',
    labelX: 145,
    labelY: 345,
  },
];

export const ItalyRegionMap: React.FC<ItalyRegionMapProps> = ({ wines, onSelectWine }) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  // Mappatura ed elaborazione delle regioni
  const regionStats = useMemo(() => {
    const map: Record<string, RegionData> = {};

    REGIONS_GEO_DATA.forEach((reg) => {
      map[reg.id] = {
        id: reg.id,
        name: reg.name,
        count: 0,
        uniqueLabels: 0,
        totalValue: 0,
        wines: [],
      };
    });

    wines.forEach((w) => {
      const regText = `${w.region || ''} ${w.appellation || ''} ${w.name || ''}`.toLowerCase();

      let targetId: string | null = null;

      if (regText.includes('piemonte') || regText.includes('barolo') || regText.includes('barbaresco') || regText.includes('langhe') || regText.includes('ghemme') || regText.includes('gattinara')) {
        targetId = 'piemonte';
      } else if (regText.includes('toscana') || regText.includes('brunello') || regText.includes('chianti') || regText.includes('sassicaia') || regText.includes('bolgheri') || regText.includes('montalcino') || regText.includes('morellino')) {
        targetId = 'toscana';
      } else if (regText.includes('veneto') || regText.includes('amarone') || regText.includes('valpolicella') || regText.includes('soave') || regText.includes('bardolino') || regText.includes('prosecco')) {
        targetId = 'veneto';
      } else if (regText.includes('lombardia') || regText.includes('franciacorta') || regText.includes('valtellina') || regText.includes('lUGANA') || regText.includes('oltrepò')) {
        targetId = 'lombardia';
      } else if (regText.includes('trentino') || regText.includes('alto adige') || regText.includes('südtirol') || regText.includes('teroldego')) {
        targetId = 'trentino';
      } else if (regText.includes('friuli') || regText.includes('collio') || regText.includes('oslavia') || regText.includes('isonzo')) {
        targetId = 'friuli';
      } else if (regText.includes('sicilia') || regText.includes('etna') || regText.includes('nero d\'avola') || regText.includes('pantelleria')) {
        targetId = 'sicilia';
      } else if (regText.includes('puglia') || regText.includes('primitivo') || regText.includes('salento') || regText.includes('manduria') || regText.includes('troia')) {
        targetId = 'puglia';
      } else if (regText.includes('campania') || regText.includes('taurasi') || regText.includes('fiano') || regText.includes('greco di tufo') || regText.includes('aglianico')) {
        targetId = 'campania';
      } else if (regText.includes('sardegna') || regText.includes('cannonau') || regText.includes('vermentino di gallura') || regText.includes('carignano')) {
        targetId = 'sardegna';
      } else if (regText.includes('umbria') || regText.includes('sagrantino') || regText.includes('montefalco') || regText.includes('orvieto')) {
        targetId = 'umbria';
      } else if (regText.includes('emilia') || regText.includes('romagna') || regText.includes('lambrusco') || regText.includes('sangiovese di romagna')) {
        targetId = 'emilia';
      } else if (regText.includes('abruzzo') || regText.includes('montepulciano d\'abruzzo') || regText.includes('trebbiano d\'abruzzo')) {
        targetId = 'abruzzo';
      } else if (regText.includes('liguria') || regText.includes('cinque terre') || regText.includes('pigato')) {
        targetId = 'liguria';
      } else if (regText.includes('marche') || regText.includes('verdicchio') || regText.includes('rosso conero')) {
        targetId = 'marche';
      } else if (regText.includes('lazio') || regText.includes('frascati') || regText.includes('cesanese')) {
        targetId = 'lazio';
      } else if (regText.includes('valle d\'aosta') || regText.includes('aosta')) {
        targetId = 'valle_aosta';
      } else if (regText.includes('basilicata') || regText.includes('vulture')) {
        targetId = 'basilicata';
      } else if (regText.includes('calabria') || regText.includes('cirò')) {
        targetId = 'calabria';
      } else if (regText.includes('molise') || regText.includes('biferno')) {
        targetId = 'molise';
      } else {
        // Se non specificato ed è italiano, assegniamo di default a Piemonte o Toscana per coerenza
        targetId = 'piemonte';
      }

      if (targetId && map[targetId]) {
        map[targetId].count += w.stock;
        map[targetId].uniqueLabels += 1;
        map[targetId].totalValue += w.price * w.stock;
        map[targetId].wines.push(w);
      }
    });

    return map;
  }, [wines]);

  // Calcolo valore massimo bottiglie per la scala cromatico-termica
  const maxBottles = useMemo(() => {
    const counts = Object.values(regionStats).map((r) => r.count);
    return Math.max(1, ...counts);
  }, [regionStats]);

  // Funzione per calcolare il colore della regione in base al numero di bottiglie
  const getRegionColor = (count: number) => {
    if (count === 0) return '#F0ECE4'; // Neutro carta ecru per 0 bottiglie
    const ratio = count / maxBottles;
    if (ratio > 0.6) return '#6C1A24'; // Bordeaux intenso per alta concentrazione
    if (ratio > 0.3) return '#A83B4C'; // Rosso rubino medio
    if (ratio > 0.1) return '#C96E7E'; // Rosato satinato
    return '#E5A9B4'; // Rosa chiaro
  };

  const hoveredRegion = hoveredRegionId ? regionStats[hoveredRegionId] : null;
  const selectedRegion = selectedRegionId ? regionStats[selectedRegionId] : null;

  // Classifica delle prime 5 regioni per bottiglie
  const topRegions = useMemo(() => {
    return Object.values(regionStats)
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [regionStats]);

  return (
    <div className="cellar-italy-map-card">
      <div className="cellar-italy-map-card__header">
        <div>
          <div className="cellar-italy-map-card__eyebrow">
            <MapPin size={14} /> Terroir &amp; Regioni d'Italia
          </div>
          <h3 className="cellar-italy-map-card__title">Mappa Enologica Interattiva</h3>
          <p className="cellar-italy-map-card__subtitle">
            Passa sopra le regioni o clicca su una regione per esplorare le bottiglie nel tuo registro
          </p>
        </div>

        {/* Legenda Colori */}
        <div className="cellar-italy-map-card__legend">
          <span className="cellar-italy-map-card__legend-title">Densità Cantina:</span>
          <div className="cellar-italy-map-card__legend-bar">
            <span style={{ background: '#F0ECE4' }} title="0 bottiglie" />
            <span style={{ background: '#E5A9B4' }} title="1-5 bottiglie" />
            <span style={{ background: '#C96E7E' }} title="5-15 bottiglie" />
            <span style={{ background: '#A83B4C' }} title="15-30 bottiglie" />
            <span style={{ background: '#6C1A24' }} title="30+ bottiglie" />
          </div>
        </div>
      </div>

      <div className="cellar-italy-map-card__content">
        {/* SVG Mappa Italia */}
        <div className="cellar-italy-map-card__svg-wrapper">
          <svg viewBox="0 0 520 540" className="cellar-italy-svg">
            {REGIONS_GEO_DATA.map((reg) => {
              const data = regionStats[reg.id];
              const isHovered = hoveredRegionId === reg.id;
              const isSelected = selectedRegionId === reg.id;
              const fillColor = getRegionColor(data.count);

              return (
                <g key={reg.id} className="cellar-italy-svg__group">
                  <path
                    d={reg.d}
                    fill={isHovered ? '#D4AF37' : isSelected ? '#3B1B54' : fillColor}
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                    className={`cellar-italy-svg__path ${isHovered ? 'cellar-italy-svg__path--hover' : ''} ${isSelected ? 'cellar-italy-svg__path--selected' : ''}`}
                    onMouseEnter={() => setHoveredRegionId(reg.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    onClick={() => setSelectedRegionId(selectedRegionId === reg.id ? null : reg.id)}
                  />
                  {data.count > 0 && (
                    <g className="cellar-italy-svg__badge" pointerEvents="none">
                      <circle cx={reg.labelX} cy={reg.labelY} r="11" fill="#3B1B54" stroke="#FFFFFF" strokeWidth="1" />
                      <text x={reg.labelX} y={reg.labelY + 4} textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                        {data.count}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tooltip Fluttuante al passaggio del mouse */}
          {hoveredRegion && (
            <div className="cellar-italy-tooltip">
              <div className="cellar-italy-tooltip__name">{hoveredRegion.name}</div>
              <div className="cellar-italy-tooltip__stat">
                <span>Bottiglie in cantina:</span> <strong>{hoveredRegion.count} btg</strong>
              </div>
              <div className="cellar-italy-tooltip__stat">
                <span>Etichette uniche:</span> <strong>{hoveredRegion.uniqueLabels}</strong>
              </div>
              {hoveredRegion.totalValue > 0 && (
                <div className="cellar-italy-tooltip__stat">
                  <span>Valore stimato:</span> <strong>€ {hoveredRegion.totalValue}</strong>
                </div>
              )}
              {hoveredRegion.wines.length > 0 && (
                <div className="cellar-italy-tooltip__sample">
                  Esempio: <em>{hoveredRegion.wines[0].name}</em> ({hoveredRegion.wines[0].producer})
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Top Regioni & Dettagli Selezione */}
        <div className="cellar-italy-map-card__sidebar">
          <div className="cellar-italy-map-card__sidebar-title">
            <Award size={16} /> Regioni Più Rappresentate
          </div>

          <div className="cellar-italy-region-list">
            {topRegions.slice(0, 6).map((reg) => {
              const isSelected = selectedRegionId === reg.id;
              return (
                <button
                  key={reg.id}
                  type="button"
                  className={`cellar-italy-region-item ${isSelected ? 'cellar-italy-region-item--active' : ''}`}
                  onClick={() => setSelectedRegionId(isSelected ? null : reg.id)}
                >
                  <div className="cellar-italy-region-item__left">
                    <span className="cellar-italy-region-item__name">{reg.name}</span>
                    <span className="cellar-italy-region-item__labels">{reg.uniqueLabels} etichette</span>
                  </div>
                  <div className="cellar-italy-region-item__count">
                    <strong>{reg.count}</strong> btg
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRegion && selectedRegion.wines.length > 0 && (
            <div className="cellar-italy-detail-panel">
              <div className="cellar-italy-detail-panel__header">
                <div>
                  <h4 className="cellar-italy-detail-panel__title">{selectedRegion.name}</h4>
                  <span className="cellar-italy-detail-panel__sub">{selectedRegion.count} bottiglie in registro</span>
                </div>
                <button
                  type="button"
                  className="cellar-italy-detail-panel__close"
                  onClick={() => setSelectedRegionId(null)}
                >
                  ✕
                </button>
              </div>

              <div className="cellar-italy-detail-panel__wines-list">
                {selectedRegion.wines.map((wine) => (
                  <div
                    key={wine.id}
                    className="cellar-italy-wine-row"
                    onClick={() => onSelectWine?.(wine)}
                  >
                    <div className="cellar-italy-wine-row__info">
                      <span className="cellar-italy-wine-row__name">{wine.name} ({formatVintage(wine.vintage)})</span>
                      <span className="cellar-italy-wine-row__producer">{wine.producer} — {wine.appellation}</span>
                    </div>
                    <div className="cellar-italy-wine-row__badge">
                      {wine.stock} btg <ChevronRight size={14} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

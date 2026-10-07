import React from 'react';
import type { WineBottle, CellarStats } from '../../types/wine';
import { PieChart, type PieChartDataItem } from '../design-system/molecules/PieChart';
import { Button } from '../design-system';
import { ItalyRegionMap } from '../organisms/ItalyRegionMap';
import { getCountryFlag } from '../../utils/countryFlags';
import { ArrowLeft, Globe, Wine, Award, Landmark } from 'lucide-react';
import './CellarStatsPage.css';

export interface CellarStatsPageProps {
  wines: WineBottle[];
  stats: CellarStats;
  onBack: () => void;
  onSelectWine?: (wine: WineBottle) => void;
}

const CATEGORY_NAMES: Record<string, { label: string; color: string }> = {
  red: { label: 'Rossi', color: '#9F0000' },
  white: { label: 'Bianchi', color: '#FFCC79' },
  sparkling: { label: 'Bollicine', color: '#A0A738' },
  orange: { label: 'Orange', color: '#F2542D' },
  rose: { label: 'Rosati', color: '#E74D6F' },
  dessert: { label: 'Dolci', color: '#B85F00' },
};

const COUNTRY_COLORS = [
  '#008C45', // Italia Verde
  '#002395', // Francia Blu
  '#AA152B', // Spagna Rosso
  '#DD0000', // Germania Rosso
  '#3C3B6E', // USA Blu
  '#C8102E', // Austria Rosso
  '#D52B1E', // Svizzera
  '#8B2332', // Bordeaux
  '#96AB41', // Pistacchio
  '#F2542D', // Orange
  '#B8860B', // Oro
];

export const CellarStatsPage: React.FC<CellarStatsPageProps> = ({
  wines,
  stats,
  onBack,
  onSelectWine,
}) => {
  // 1. Dati Grafico Tipologia di Vino
  const categoryData: PieChartDataItem[] = Object.entries(CATEGORY_NAMES)
    .map(([catKey, { label, color }]) => {
      const count = stats.categoryBreakdown[catKey as keyof typeof stats.categoryBreakdown] || 0;
      return {
        label,
        value: count,
        color,
      };
    })
    .filter((item) => item.value > 0);

  // 2. Dati Grafico Provenienza (Nazionalità)
  const countryMap: Record<string, number> = {};
  wines.forEach((w) => {
    const c = (w.country || 'Italia').trim();
    countryMap[c] = (countryMap[c] || 0) + w.stock;
  });

  const sortedCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]);

  const countryData: PieChartDataItem[] = sortedCountries.map(([countryName, count], idx) => ({
    label: countryName,
    value: count,
    color: COUNTRY_COLORS[idx % COUNTRY_COLORS.length],
    icon: getCountryFlag(countryName),
  }));

  const topCountry = sortedCountries.length > 0 ? sortedCountries[0][0] : 'Nessuno';
  const topCountryFlag = sortedCountries.length > 0 ? getCountryFlag(sortedCountries[0][0]) : '🍷';

  const formattedTotalValue = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(stats.totalEstimatedValue);

  const avgPrice = stats.totalBottles > 0 ? Math.round(stats.totalEstimatedValue / stats.totalBottles) : 0;
  const formattedAvgPrice = new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(avgPrice);

  return (
    <div className="cellar-stats-page">
      <div className="cellar-stats-page__container">
        {/* Header di Pagina con Tasto Torna alla Cantina */}
        <div className="cellar-stats-page__header">
          <div>
            <div className="cellar-stats-page__eyebrow">Analisi Enologica</div>
            <h1 className="cellar-stats-page__title">Statistiche Cantina</h1>
            <p className="cellar-stats-page__subtitle">
              Visualizzazione grafica della ripartizione per tipologie di vino e nazione di provenienza
            </p>
          </div>

          <Button variant="primary" size="md" icon={<ArrowLeft size={16} />} onClick={onBack}>
            Torna alla Cantina
          </Button>
        </div>

        {/* Schede KPI di Sintesi */}
        <div className="cellar-stats-page__kpis">
          <div className="cellar-stats-kpi">
            <div className="cellar-stats-kpi__icon cellar-stats-kpi__icon--purple">
              <Wine size={20} />
            </div>
            <div>
              <span className="cellar-stats-kpi__label">Bottiglie Totali</span>
              <span className="cellar-stats-kpi__value">{stats.totalBottles}</span>
            </div>
          </div>

          <div className="cellar-stats-kpi">
            <div className="cellar-stats-kpi__icon cellar-stats-kpi__icon--green">
              <Landmark size={20} />
            </div>
            <div>
              <span className="cellar-stats-kpi__label">Patrimonio Totale</span>
              <span className="cellar-stats-kpi__value">{formattedTotalValue}</span>
            </div>
          </div>

          <div className="cellar-stats-kpi">
            <div className="cellar-stats-kpi__icon cellar-stats-kpi__icon--gold">
              <Award size={20} />
            </div>
            <div>
              <span className="cellar-stats-kpi__label">Valore Medio Bottiglia</span>
              <span className="cellar-stats-kpi__value">{formattedAvgPrice}</span>
            </div>
          </div>

          <div className="cellar-stats-kpi">
            <div className="cellar-stats-kpi__icon cellar-stats-kpi__icon--blue">
              <Globe size={20} />
            </div>
            <div>
              <span className="cellar-stats-kpi__label">Paese Principale</span>
              <span className="cellar-stats-kpi__value">
                {topCountryFlag} {topCountry}
              </span>
            </div>
          </div>
        </div>

        {/* Griglia Grafici a Torta */}
        <div className="cellar-stats-page__charts-grid">
          {/* Grafico 1: Tipologia di Vino */}
          <PieChart
            title="Tipologia di Vino"
            subtitle="Ripartizione percentuale delle bottiglie per colore e stili di vinificazione"
            data={categoryData}
            emptyText="Nessuna bottiglia presente per generare il grafico delle tipologie."
          />

          {/* Grafico 2: Provenienza (Nazionalità) */}
          <PieChart
            title="Provenienza (Nazionalità)"
            subtitle="Ripartizione delle bottiglie per nazione e terroir geografico d'origine"
            data={countryData}
            emptyText="Nessuna bottiglia presente per generare il grafico della provenienza."
          />
        </div>

        {/* Card Mappa dell'Italia Interattiva */}
        <ItalyRegionMap wines={wines} onSelectWine={onSelectWine} />
      </div>
    </div>
  );
};

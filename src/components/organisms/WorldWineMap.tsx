import React, { useState } from 'react';
import { WORLD_COUNTRIES, WORLD_VIEWBOX } from '../../data/worldMap';
import type { FlagKey } from '../../utils/countryFlags';
import { FlagCircle } from '../design-system/atoms/FlagCircle';
import './WorldWineMap.css';

export interface WorldMapNation {
  name: string;
  flag: FlagKey | null;
  count: number;
}

// Codice numerico ISO 3166-1 dei paesi gestiti dall'app
const ISO_BY_FLAG: Record<FlagKey, string> = {
  IT: '380', FR: '250', ES: '724', DE: '276', AT: '040', PT: '620',
  CH: '756', US: '840', SI: '705', HU: '348', AR: '032', CL: '152',
};

export const WorldWineMap: React.FC<{ nations: WorldMapNation[] }> = ({ nations }) => {
  const [active, setActive] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  const owned = new Map<string, WorldMapNation>();
  nations.forEach((n) => {
    if (n.flag) owned.set(ISO_BY_FLAG[n.flag], n);
  });
  const max = Math.max(1, ...nations.map((n) => n.count));
  const total = nations.reduce((s, n) => s + n.count, 0);
  const current = active ?? pinned;
  const currentNation = current ? owned.get(current) : undefined;

  return (
    <div className="cellar-worldmap">
      <div className="cellar-worldmap__stage">
        <svg viewBox={WORLD_VIEWBOX} role="img" aria-label="Planisfero con le nazioni presenti in cantina">
          {WORLD_COUNTRIES.map((c) => {
            const nation = owned.get(c.id);
            if (!nation) return <path key={c.id} d={c.d} className="cellar-worldmap__country" />;
            const strength = 0.4 + 0.6 * (nation.count / max);
            const isOn = current === c.id;
            return (
              <path
                key={c.id}
                d={c.d}
                className={`cellar-worldmap__country cellar-worldmap__country--owned ${isOn ? 'cellar-worldmap__country--on' : ''}`}
                style={{ fillOpacity: isOn ? 1 : strength }}
                tabIndex={0}
                role="button"
                aria-label={`${nation.name}: ${nation.count} bottiglie`}
                aria-pressed={pinned === c.id}
                onMouseEnter={() => setActive(c.id)}
                onMouseMove={(e) => {
                  const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                  if (box) setTip({ x: e.clientX - box.left, y: e.clientY - box.top });
                }}
                onMouseLeave={() => { setActive(null); setTip(null); }}
                onFocus={() => setActive(c.id)}
                onBlur={() => setActive(null)}
                onClick={() => setPinned(pinned === c.id ? null : c.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setPinned(pinned === c.id ? null : c.id);
                  }
                }}
              />
            );
          })}
        </svg>
        {currentNation && tip && active && (
          <div className="cellar-worldmap__tip" style={{ left: tip.x, top: tip.y }}>
            <strong>{currentNation.name}</strong>
            <span>{currentNation.count} {currentNation.count === 1 ? 'bottiglia' : 'bottiglie'}</span>
          </div>
        )}
      </div>

      <ul className="cellar-worldmap__list">
        {nations.map((n) => {
          const iso = n.flag ? ISO_BY_FLAG[n.flag] : null;
          const isOn = iso !== null && current === iso;
          return (
            <li key={n.name}>
              <button
                type="button"
                className={`cellar-worldmap__row ${isOn ? 'cellar-worldmap__row--on' : ''}`}
                onMouseEnter={() => iso && setActive(iso)}
                onMouseLeave={() => setActive(null)}
                onClick={() => iso && setPinned(pinned === iso ? null : iso)}
                disabled={!iso}
              >
                <FlagCircle flag={n.flag} size={18} />
                <span className="cellar-worldmap__row-name">{n.name}</span>
                <span className="cellar-worldmap__row-count">{n.count} btg</span>
                <span className="cellar-worldmap__row-pct">{total ? Math.round((n.count / total) * 100) : 0}%</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

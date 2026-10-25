import React from 'react';
import { Globe } from 'lucide-react';
import type { FlagKey } from '../../../utils/countryFlags';
import './FlagCircle.css';

const R = (x: number, y: number, w: number, h: number, fill: string) => (
  <rect x={x} y={y} width={w} height={h} fill={fill} />
);

const FLAGS: Record<FlagKey, React.ReactNode> = {
  IT: <>{R(0, 0, 10, 30, '#009246')}{R(10, 0, 10, 30, '#FFFFFF')}{R(20, 0, 10, 30, '#CE2B37')}</>,
  FR: <>{R(0, 0, 10, 30, '#0055A4')}{R(10, 0, 10, 30, '#FFFFFF')}{R(20, 0, 10, 30, '#EF4135')}</>,
  ES: <>{R(0, 0, 30, 8, '#AA151B')}{R(0, 8, 30, 14, '#F1BF00')}{R(0, 22, 30, 8, '#AA151B')}</>,
  DE: <>{R(0, 0, 30, 10, '#000000')}{R(0, 10, 30, 10, '#DD0000')}{R(0, 20, 30, 10, '#FFCE00')}</>,
  AT: <>{R(0, 0, 30, 10, '#ED2939')}{R(0, 10, 30, 10, '#FFFFFF')}{R(0, 20, 30, 10, '#ED2939')}</>,
  PT: <>{R(0, 0, 12, 30, '#006600')}{R(12, 0, 18, 30, '#FF0000')}<circle cx="12" cy="15" r="4" fill="#FFE000" /></>,
  CH: <>{R(0, 0, 30, 30, '#DA291C')}{R(12, 6, 6, 18, '#FFFFFF')}{R(6, 12, 18, 6, '#FFFFFF')}</>,
  US: (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => R(0, (i * 30) / 7, 30, 30 / 7 + 0.1, i % 2 === 0 ? '#B22234' : '#FFFFFF'))}
      {R(0, 0, 15, 17.2, '#3C3B6E')}
    </>
  ),
  SI: <>{R(0, 0, 30, 10, '#FFFFFF')}{R(0, 10, 30, 10, '#005DA4')}{R(0, 20, 30, 10, '#ED1C24')}</>,
  HU: <>{R(0, 0, 30, 10, '#CE2939')}{R(0, 10, 30, 10, '#FFFFFF')}{R(0, 20, 30, 10, '#477050')}</>,
  AR: <>{R(0, 0, 30, 10, '#74ACDF')}{R(0, 10, 30, 10, '#FFFFFF')}{R(0, 20, 30, 10, '#74ACDF')}<circle cx="15" cy="15" r="3" fill="#F6B40E" /></>,
  CL: <>{R(0, 0, 30, 15, '#FFFFFF')}{R(0, 15, 30, 15, '#D52B1E')}{R(0, 0, 15, 15, '#0039A6')}<circle cx="7.5" cy="7.5" r="2.5" fill="#FFFFFF" /></>,
};

export interface FlagCircleProps {
  flag: FlagKey | null;
  size?: number;
  className?: string;
}

/** Bandiera flat dentro un cerchio. Se il paese non è riconosciuto mostra un globo. */
export const FlagCircle: React.FC<FlagCircleProps> = ({ flag, size = 18, className = '' }) => (
  <span className={`cellar-flag ${className}`} style={{ width: size, height: size }} aria-hidden="true">
    {flag ? (
      <svg viewBox="0 0 30 30" width={size} height={size} focusable="false">
        {FLAGS[flag]}
      </svg>
    ) : (
      <Globe size={Math.round(size * 0.8)} />
    )}
  </span>
);

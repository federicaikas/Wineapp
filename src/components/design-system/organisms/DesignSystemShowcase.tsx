import React, { useState } from 'react';
import { Tag } from '../atoms/Tag';
import { Button } from '../atoms/Button';
import { TagEyebrow } from '../molecules/TagEyebrow';
import { MainTitleLockup } from '../molecules/MainTitleLockup';
import { ContentBlock } from '../molecules/ContentBlock';
import { HeroSection } from './HeroSection';
import { FeatureCard } from './FeatureCard';
import tokensJson from '../../../styles/tokens.json';
import './DesignSystemShowcase.css';

export const DesignSystemShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'atoms' | 'molecules' | 'organisms' | 'tokens'>('all');

  return (
    <div className="ag-showcase">
      {/* Header Libreria Design System */}
      <div className="ag-showcase__header">
        <TagEyebrow text="Antigravity Studio" overlap={false} />
        <MainTitleLockup
          primaryLine="ATOMIC DESIGN SYSTEM"
          accentFocusLine="CELLAR SPECIFICATION"
          size="lg"
        />
        <p className="ag-showcase__intro">
          Libreria completa dei Design Tokens, Atomi, Molecole e Organismi configurata secondo le specifiche sartoriali Antigravity.
        </p>

        {/* Tab Navigation */}
        <div className="ag-showcase__nav">
          <button
            className={`ag-showcase__tab ${activeTab === 'all' ? 'ag-showcase__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tutti i Componenti
          </button>
          <button
            className={`ag-showcase__tab ${activeTab === 'tokens' ? 'ag-showcase__tab--active' : ''}`}
            onClick={() => setActiveTab('tokens')}
          >
            1. Tokens & Primitive
          </button>
          <button
            className={`ag-showcase__tab ${activeTab === 'atoms' ? 'ag-showcase__tab--active' : ''}`}
            onClick={() => setActiveTab('atoms')}
          >
            2. Atoms
          </button>
          <button
            className={`ag-showcase__tab ${activeTab === 'molecules' ? 'ag-showcase__tab--active' : ''}`}
            onClick={() => setActiveTab('molecules')}
          >
            3. Molecules
          </button>
          <button
            className={`ag-showcase__tab ${activeTab === 'organisms' ? 'ag-showcase__tab--active' : ''}`}
            onClick={() => setActiveTab('organisms')}
          >
            4. Organisms
          </button>
        </div>
      </div>

      <div className="ag-showcase__content">
        {/* SEZIONE 1: TOKENS */}
        {(activeTab === 'all' || activeTab === 'tokens') && (
          <section className="ag-showcase__section">
            <div className="ag-showcase__section-title">
              <h2>1. ATOMS & DESIGN TOKENS</h2>
              <span className="ag-showcase__badge">Primitive</span>
            </div>

            {/* Palette Colori */}
            <div className="ag-showcase__card">
              <h3>Color Palette Tokens</h3>
              <div className="ag-tokens-grid">
                <div className="ag-token-swatch">
                  <div className="ag-swatch" style={{ backgroundColor: '#FFFDF9', border: '1px solid #EAE2D3' }} />
                  <div className="ag-swatch__info">
                    <strong>background-base</strong>
                    <code>#FFFDF9</code>
                    <span>Panna caldo</span>
                  </div>
                </div>

                <div className="ag-token-swatch">
                  <div className="ag-swatch" style={{ backgroundColor: '#2D234A' }} />
                  <div className="ag-swatch__info">
                    <strong>text-primary / brand</strong>
                    <code>#2D234A</code>
                    <span>Viola scuro profondo</span>
                  </div>
                </div>

                <div className="ag-token-swatch">
                  <div className="ag-swatch" style={{ backgroundColor: '#E5A823' }} />
                  <div className="ag-swatch__info">
                    <strong>accent-secondary</strong>
                    <code>#E5A823</code>
                    <span>Giallo senape / Ocra</span>
                  </div>
                </div>

                <div className="ag-token-swatch">
                  <div className="ag-swatch" style={{ backgroundColor: '#7A9A3B' }} />
                  <div className="ag-swatch__info">
                    <strong>accent-tertiary</strong>
                    <code>#7A9A3B</code>
                    <span>Verde oliva / Pistacchio</span>
                  </div>
                </div>

                <div className="ag-token-swatch">
                  <div className="ag-swatch" style={{ backgroundColor: '#706880' }} />
                  <div className="ag-swatch__info">
                    <strong>text-muted</strong>
                    <code>#706880</code>
                    <span>Grigio-viola desaturato</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Typography Tokens */}
            <div className="ag-showcase__card">
              <h3>Typography System Tokens</h3>
              <div className="ag-typo-demo">
                <div className="ag-typo-item">
                  <span className="ag-typo-label">Display / Headlines: "DIN Bold", sans-serif (ALL CAPS, line-height 0.95, letter-spacing -0.02em)</span>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 0.95, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                    CUSTODISCI L'ARCHIVIO
                  </div>
                </div>

                <div className="ag-typo-item">
                  <span className="ag-typo-label">Body Text: "Montserrat", sans-serif (Regular 400 & Bold 700, line-height 1.5)</span>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>Frasi chiave e titoli in evidenza</strong> <span style={{ color: 'var(--text-muted)' }}>con testo di supporto regolare per una leggibilità ottimale in ogni condizione di luce.</span>
                  </div>
                </div>

                <div className="ag-typo-item">
                  <span className="ag-typo-label">Eyebrow / Accent: "Caveat", cursive (italic, weight 600, rotazione -3deg)</span>
                  <div style={{ fontFamily: 'var(--font-eyebrow)', fontSize: '2rem', color: 'var(--accent-tertiary)', fontStyle: 'italic', transform: 'rotate(-3deg)', display: 'inline-block' }}>
                    Riserva Sartoriale 2018
                  </div>
                </div>
              </div>
            </div>

            {/* JSON Export */}
            <div className="ag-showcase__card">
              <h3>JSON Tokens Format</h3>
              <pre className="ag-json-code">
                {JSON.stringify(tokensJson, null, 2)}
              </pre>
            </div>
          </section>
        )}

        {/* SEZIONE 2: ATOMS */}
        {(activeTab === 'all' || activeTab === 'atoms') && (
          <section className="ag-showcase__section">
            <div className="ag-showcase__section-title">
              <h2>2. ATOMS (Componenti Primitive)</h2>
              <span className="ag-showcase__badge">Atomi</span>
            </div>

            <div className="ag-showcase__card">
              <h3>Primary & Secondary Buttons</h3>
              <div className="ag-demo-flex">
                <Button variant="primary">Primary Button (#2D234A)</Button>
                <Button variant="secondary">Secondary Button (1.5px border)</Button>
              </div>
              <p className="ag-demo-note">Hover su Primary attiva background senape #E5A823 (200ms). Hover su Secondary attiva testo senape #E5A823.</p>
            </div>

            <div className="ag-showcase__card">
              <h3>Tags & Eyebrow Badges</h3>
              <div className="ag-demo-flex">
                <Tag variant="eyebrow">Eyebrow Script Tag</Tag>
                <Tag variant="pill">Pill Tag (#7A9A3B)</Tag>
                <Tag variant="badge">Badge Tag</Tag>
              </div>
            </div>
          </section>
        )}

        {/* SEZIONE 3: MOLECULES */}
        {(activeTab === 'all' || activeTab === 'molecules') && (
          <section className="ag-showcase__section">
            <div className="ag-showcase__section-title">
              <h2>3. MOLECULES (Componenti Base)</h2>
              <span className="ag-showcase__badge">Molecole</span>
            </div>

            <div className="ag-showcase__card">
              <h3>Molecule: Tag / Eyebrow</h3>
              <div className="ag-demo-box">
                <TagEyebrow text="Selezione Sommelier" overlap={false} />
              </div>
            </div>

            <div className="ag-showcase__card">
              <h3>Molecule: Main Title Lockup</h3>
              <div className="ag-demo-box">
                <MainTitleLockup
                  primaryLine="CANTINA PRIVATA"
                  accentFocusLine="EDIZIONE LIMITATA"
                  subtitle="Titolo a blocchi DIN Bold con prima riga in viola e focus in senape"
                  size="md"
                />
              </div>
            </div>

            <div className="ag-showcase__card">
              <h3>Molecule: Content Block</h3>
              <div className="ag-demo-box">
                <ContentBlock
                  parts={[
                    { text: "Catalogazione professionale delle annate storiche ", isKeyPhrase: false },
                    { text: "con controllo costante delle temperature", isKeyPhrase: true },
                    { text: " e calcolo automatico della finestra di beva ideale.", isKeyPhrase: false }
                  ]}
                  size="md"
                />
              </div>
            </div>
          </section>
        )}

        {/* SEZIONE 4: ORGANISMS */}
        {(activeTab === 'all' || activeTab === 'organisms') && (
          <section className="ag-showcase__section">
            <div className="ag-showcase__section-title">
              <h2>4. ORGANISMS (Sezioni Composite)</h2>
              <span className="ag-showcase__badge">Organismi</span>
            </div>

            {/* Organismo 1: Hero Section */}
            <div className="ag-showcase__card">
              <h3>Organism 1: Hero Section</h3>
              <div className="ag-demo-preview">
                <HeroSection
                  eyebrowText="Edizione Sartoriale Antigravity"
                  titlePrimary="CUSTODISCI L'ECCELLENZA"
                  titleAccent="NEL TUO ARCHIVIO"
                  bodyParts={[
                    { text: "Architettura visiva a blocchi e tipografia sartoriale per ", isKeyPhrase: false },
                    { text: "la gestione avanzata e zero-latency della tua cantina.", isKeyPhrase: true },
                  ]}
                  primaryCtaText="Esplora la Cantina"
                  secondaryCtaText="Nuova Bottiglia"
                  badgeTagText="Nuova Release v0.1.0"
                />
              </div>
            </div>

            {/* Organismo 2: Feature Card Grid */}
            <div className="ag-showcase__card">
              <h3>Organism 2: Feature Cards</h3>
              <div className="ag-cards-grid">
                <FeatureCard
                  badgeText="Cru d'Eccellenza"
                  title="MONITORAGGIO FINISTRE BEVA"
                  highlightText="Algoritmo di maturazione"
                  description="che notifica il momento perfetto di stappatura per ogni annata."
                  actionText="Scopri Dettagli"
                  accentBorder={true}
                />

                <FeatureCard
                  badgeText="Valore Stmato"
                  title="VALORIZZAZIONE ARCHIVIO"
                  highlightText="Quotazioni aggiornate"
                  description="con metriche di stima complessiva e report statistici immediati."
                  actionText="Vedi Statistiche"
                  accentBorder={true}
                />

                <FeatureCard
                  badgeText="Zero Latency"
                  title="DATABASE LOCALE DEXIE"
                  highlightText="Persistenza Offline 100%"
                  description="per consultare la propria cantina anche in assenza di rete."
                  actionText="Verifica Sync"
                  accentBorder={true}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { TagEyebrow } from '../molecules/TagEyebrow';
import { MainTitleLockup } from '../molecules/MainTitleLockup';
import { ContentBlock, type HighlightTextPart } from '../molecules/ContentBlock';
import { Button } from '../atoms/Button';
import './HeroSection.css';

export interface HeroSectionProps {
  eyebrowText?: string;
  titlePrimary?: string;
  titleAccent?: string;
  bodyParts?: HighlightTextPart[];
  primaryCtaText?: string;
  primaryCtaOnClick?: () => void;
  secondaryCtaText?: string;
  secondaryCtaOnClick?: () => void;
  badgeTagText?: string;
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  eyebrowText = "Collezione Privata",
  titlePrimary = "CUSTODISCI L'ECCELLENZA",
  titleAccent = "NEL TUO ARCHIVIO",
  bodyParts = [
    { text: "Un'esperienza sartoriale disegnata per gli amanti del grande vino. ", isKeyPhrase: false },
    { text: "Catalogazione zero-latency, monitoraggio finestre di beva", isKeyPhrase: true },
    { text: " e valorizzazione delle tue bottiglie più pregiate.", isKeyPhrase: false }
  ],
  primaryCtaText = "Esplora Cantina",
  primaryCtaOnClick,
  secondaryCtaText = "Aggiungi Bottiglia",
  secondaryCtaOnClick,
  badgeTagText,
  className = '',
}) => {
  return (
    <section className={`ag-hero-section ${className}`}>
      <div className="ag-hero-section__container">
        {eyebrowText && (
          <TagEyebrow text={eyebrowText} overlap={true} />
        )}

        <MainTitleLockup
          primaryLine={titlePrimary}
          accentFocusLine={titleAccent}
          size="hero"
          className="ag-hero-section__title"
        />

        <ContentBlock
          parts={bodyParts}
          size="lg"
          className="ag-hero-section__body"
        />

        <div className="ag-hero-section__actions">
          {primaryCtaText && (
            <Button
              variant="primary"
              size="lg"
              onClick={primaryCtaOnClick}
            >
              {primaryCtaText}
            </Button>
          )}

          {secondaryCtaText && (
            <Button
              variant="secondary"
              size="lg"
              onClick={secondaryCtaOnClick}
            >
              {secondaryCtaText}
            </Button>
          )}
        </div>

        {badgeTagText && (
          <div className="ag-hero-section__badge">
            <span className="ag-tag ag-tag--pill">{badgeTagText}</span>
          </div>
        )}
      </div>
    </section>
  );
};

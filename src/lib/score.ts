import type { ColorTokens } from '@/theme/tokens';

export type ScoreBand = 'high' | 'mid' | 'low';

/**
 * Faixas do anel de nota (design-tokens.json → scoreRing):
 * >= 75 menta, 50–74 âmbar, < 50 índigo suave. Nunca coral para nota baixa.
 */
export function scoreBand(score: number): ScoreBand {
  if (score >= 75) return 'high';
  if (score >= 50) return 'mid';
  return 'low';
}

/** Cor do anel e cor do texto gentil que acompanha a nota. */
export function scoreColors(band: ScoreBand, c: ColorTokens) {
  switch (band) {
    case 'high':
      return { ring: c.success, ink: c.successInk };
    case 'mid':
      return { ring: c.warning, ink: c.warningInk };
    case 'low':
      return { ring: c.scoreLow, ink: c.primaryInk };
  }
}

/** Garante nota inteira entre 0 e max. */
export function clampScore(score: number, max = 100) {
  if (!Number.isFinite(score)) return 0;
  return Math.round(Math.min(max, Math.max(0, score)));
}

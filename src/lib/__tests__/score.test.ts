import { lightColors } from '@/theme/tokens';

import { clampScore, scoreBand, scoreColors } from '../score';

describe('scoreBand', () => {
  it('usa as faixas do design: >= 75 alta, 50–74 média, < 50 baixa', () => {
    expect(scoreBand(100)).toBe('high');
    expect(scoreBand(75)).toBe('high');
    expect(scoreBand(74)).toBe('mid');
    expect(scoreBand(50)).toBe('mid');
    expect(scoreBand(49)).toBe('low');
    expect(scoreBand(0)).toBe('low');
  });
});

describe('scoreColors', () => {
  it('nunca usa coral (erro) para nota baixa', () => {
    const low = scoreColors('low', lightColors);
    expect(low.ring).not.toBe(lightColors.error);
    expect(low.ring).toBe(lightColors.scoreLow);
  });

  it('usa menta para nota alta e âmbar para média', () => {
    expect(scoreColors('high', lightColors).ring).toBe(lightColors.success);
    expect(scoreColors('mid', lightColors).ring).toBe(lightColors.warning);
  });
});

describe('clampScore', () => {
  it('arredonda e limita entre 0 e 100', () => {
    expect(clampScore(72.6)).toBe(73);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(140)).toBe(100);
    expect(clampScore(Number.NaN)).toBe(0);
  });
});

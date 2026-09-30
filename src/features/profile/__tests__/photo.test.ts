import { centerCrop, COVER_RATIO, coverFit, coverSize, dragPosition } from '../photo';

describe('coverSize (capa guardada inteira)', () => {
  it('reduz até cobrir 1200×542, sem cortar', () => {
    expect(coverSize(4000, 3000)).toEqual({ width: 1200, height: 900 });
  });

  it('não aumenta imagem pequena', () => {
    expect(coverSize(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it('lado maior no máximo 2400', () => {
    expect(coverSize(1000, 5000)).toEqual({ width: 480, height: 2400 });
  });
});

describe('posição da capa', () => {
  it('imagem em pé: sobra só na altura', () => {
    const fit = coverFit(390, 176, 1080, 1920);
    expect(fit.width).toBe(390);
    expect(fit.ox).toBe(0);
    expect(fit.oy).toBeCloseTo(390 * (1920 / 1080) - 176);
  });

  it('arrastar para cima mostra mais da parte de baixo', () => {
    expect(dragPosition(50, -100, 200)).toBe(100);
    expect(dragPosition(50, -50, 200)).toBe(75);
    expect(dragPosition(50, 50, 200)).toBe(25);
  });

  it('fica entre 0 e 100 e não mexe sem sobra', () => {
    expect(dragPosition(10, 500, 200)).toBe(0);
    expect(dragPosition(40, 30, 0)).toBe(40);
  });
});

describe('centerCrop (recorte da foto e da capa)', () => {
  it('foto quadrada a partir de imagem em pé', () => {
    expect(centerCrop(1000, 1600, 1)).toEqual({ originX: 0, originY: 300, width: 1000, height: 1000 });
  });

  it('capa a partir de imagem em pé: usa toda a largura, corta em cima e embaixo', () => {
    const c = centerCrop(1080, 1920, COVER_RATIO);
    expect(c.width).toBe(1080);
    expect(c.height).toBe(Math.round(1080 / COVER_RATIO));
    expect(c.originY).toBe(Math.floor((1920 - c.height) / 2));
  });

  it('capa a partir de panorama largo: usa toda a altura, corta dos lados', () => {
    const c = centerCrop(4000, 1000, COVER_RATIO);
    expect(c.height).toBe(1000);
    expect(c.width).toBe(Math.round(1000 * COVER_RATIO));
    expect(c.originX).toBe(Math.floor((4000 - c.width) / 2));
  });
});

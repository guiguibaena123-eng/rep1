import { LANGUAGES, getLanguage, setLanguage, t } from '..';
import { formatDateBR } from '@/features/plan/logic';
import { shortDate } from '@/lib/dates';

// Atalho no topo do arquivo, como as telas fazem (`const h = t.home`).
const h = t.home;

afterEach(() => setLanguage('pt-BR'));

describe('idiomas', () => {
  it('abre em português nos testes', () => {
    expect(getLanguage()).toBe('pt-BR');
    expect(t.tabs.home).toBe('Início');
  });

  it('troca na hora, inclusive nos atalhos guardados antes', () => {
    setLanguage('en');
    expect(t.tabs.home).toBe('Home');
    expect(h.greetings.hello('Ana')).toBe('Hello, Ana!');
    setLanguage('de');
    expect(h.weekNames[0]).toBe('Montag');
  });

  it('lista os 5 idiomas com bandeira', () => {
    expect(LANGUAGES.map((l) => l.code)).toEqual(['pt-BR', 'en', 'es', 'fr', 'de']);
    expect(LANGUAGES.every((l) => l.flag.length > 0)).toBe(true);
  });

  it('percorre as chaves como um objeto comum', () => {
    setLanguage('es');
    expect(Object.keys(t.options.area)).toContain('tecnologia');
    expect(Object.values(t.options.area)).toContain('Tecnología');
  });

  it('formata datas no jeito de cada idioma', () => {
    expect(shortDate('2026-09-24T15:00:00Z')).toBe('24 set');
    expect(formatDateBR('2026-11-01T12:00:00Z')).toBe('01/11/2026');
    setLanguage('en');
    expect(shortDate('2026-09-24T15:00:00Z')).toBe('Sep 24');
    expect(formatDateBR('2026-11-01T12:00:00Z')).toBe('11/01/2026');
    setLanguage('de');
    expect(formatDateBR('2026-11-01T12:00:00Z')).toBe('01.11.2026');
  });
});

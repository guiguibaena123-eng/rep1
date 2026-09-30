// Etapa 3: Termos/Privacidade, competências, linha de apoio e e-mails no idioma do app.
import type { Session } from '@supabase/supabase-js';

import { emailLanguageData, needsEmailLanguageUpdate } from '@/features/auth/emailLanguage';
import { guessSkillType, skillSuggestions } from '@/features/profile/details';
import { SKILL_SUGGESTIONS, TECHNICAL_HINTS, BEHAVIORAL_HINTS } from '@/features/profile/skillSuggestions';
import { crisisUrl } from '@/lib/env';

import { getLanguage, LANGUAGES, setLanguage, t } from '..';
import { LEGAL, legalSections } from '../legal';

jest.mock('@/lib/supabase', () => ({ supabase: { auth: {} } }));

declare const __dirname: string;

const CODES = LANGUAGES.map((l) => l.code);

afterEach(() => setLanguage('pt-BR'));

describe('Termos e Privacidade', () => {
  it('cada idioma tem as mesmas seções do português, sem texto vazio', () => {
    for (const code of CODES) {
      for (const doc of ['terms', 'privacy'] as const) {
        expect(LEGAL[code][doc]).toHaveLength(LEGAL['pt-BR'][doc].length);
        for (const s of LEGAL[code][doc]) {
          expect(s.title.trim()).not.toBe('');
          expect(s.body.trim()).not.toBe('');
        }
      }
    }
  });

  it('segue o idioma atual', () => {
    expect(legalSections('terms')[0].title).toBe('O que é o app');
    setLanguage('de');
    expect(legalSections('terms')[0].title).toBe('Was die App ist');
  });

  it('fala da foto do perfil e do nome na sugestão de bio (como o app funciona hoje)', () => {
    expect(LEGAL['pt-BR'].privacy[0].body).toContain('foto');
    expect(LEGAL['pt-BR'].privacy[3].body).toContain('sugestão de bio');
    expect(LEGAL.en.terms[4].body).toContain('Brazilian reais');
  });
});

describe('sugestões de competências', () => {
  it('todas as áreas em todos os idiomas, sem nome repetido na mesma área', () => {
    const areas = Object.keys(SKILL_SUGGESTIONS['pt-BR']).sort();
    for (const code of CODES) {
      expect(Object.keys(SKILL_SUGGESTIONS[code]).sort()).toEqual(areas);
      for (const list of Object.values(SKILL_SUGGESTIONS[code])) {
        expect(new Set(list.map((s) => s.name)).size).toBe(list.length);
      }
      expect(TECHNICAL_HINTS[code].length).toBeGreaterThan(10);
      expect(BEHAVIORAL_HINTS[code].length).toBeGreaterThan(10);
    }
  });

  it('mostra as do idioma atual', () => {
    setLanguage('fr');
    expect(skillSuggestions('vendas', []).map((s) => s.name)).toContain('Négociation');
  });

  it('reconhece o tipo em qualquer idioma das sugestões e pelas palavras do idioma atual', () => {
    expect(guessSkillType('Teamwork')).toBe('comportamental');
    setLanguage('de');
    expect(guessSkillType('Führerschein Klasse B')).toBe('tecnica');
    expect(guessSkillType('Teamfähigkeit')).toBe('comportamental');
  });
});

describe('linha de apoio emocional', () => {
  it('CVV em português; linha do país nos outros idiomas', () => {
    expect(crisisUrl()).toBe('https://cvv.org.br');
    setLanguage('fr');
    expect(crisisUrl()).toBe('https://3114.fr');
  });

  it('o texto não manda para o CVV do Brasil fora do português', () => {
    for (const code of CODES.filter((c) => c !== 'pt-BR')) {
      setLanguage(code);
      expect(getLanguage()).toBe(code);
      expect(JSON.stringify(t.crisis)).not.toContain('cvv');
    }
  });
});

describe('e-mails da conta', () => {
  const session = (language?: string) => ({ user: { user_metadata: language ? { language } : {} } }) as unknown as Session;

  it('grava o idioma na conta só quando falta ou mudou', () => {
    expect(emailLanguageData('es')).toEqual({ language: 'es' });
    expect(needsEmailLanguageUpdate(null, 'en')).toBe(false);
    expect(needsEmailLanguageUpdate(session(), 'pt-BR')).toBe(true);
    expect(needsEmailLanguageUpdate(session('en'), 'en')).toBe(false);
    expect(needsEmailLanguageUpdate(session('en'), 'de')).toBe(true);
  });

  // Node só existe nos testes (o app não tem os tipos dele).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { readFileSync } = require('fs') as { readFileSync: (path: string, encoding: 'utf8') => string };
  const read = (name: string) => readFileSync(`${__dirname}/../../../supabase/templates/${name}`, 'utf8');

  it.each(['confirmation.html', 'recovery.html'])('%s tem os 5 idiomas e o link em todos', (name) => {
    const html = read(name);
    for (const code of ['en', 'es', 'fr', 'de']) expect(html).toContain(`eq .Data.language "${code}"`);
    expect(html.match(/\{\{ \.ConfirmationURL \}\}/g)).toHaveLength(5);
    // Blocos abertos e fechados certinhos (senão o Supabase não manda o e-mail).
    expect(html.match(/\{\{ if /g)).toHaveLength(1);
    expect(html.match(/\{\{ end \}\}/g)).toHaveLength(1);
  });
});

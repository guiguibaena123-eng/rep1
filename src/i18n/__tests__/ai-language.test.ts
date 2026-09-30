// Etapa 2: a IA e a página de pagamento respondem no idioma do app (cabeçalho x-app-lang).
import { buildBioPrompt, hasBannedWord, parseBio } from '../../../supabase/functions/_shared/bio-logic';
import { buildFeedbackPrompt, buildQuestionsPrompt } from '../../../supabase/functions/_shared/interview-logic';
import { langFromRequest, OUTPUT_LANGUAGE, parseLang } from '../../../supabase/functions/_shared/lang';
import { buildLinkedInPrompt } from '../../../supabase/functions/_shared/linkedin-logic';
import { buildCheckoutSession } from '../../../supabase/functions/_shared/payment-logic';
import { LANGUAGES } from '..';

describe('idioma do pedido', () => {
  it('as funções conhecem os mesmos 5 idiomas do app', () => {
    expect(Object.keys(OUTPUT_LANGUAGE).sort()).toEqual(LANGUAGES.map((l) => l.code).sort());
  });

  it('sem cabeçalho ou com valor estranho: português', () => {
    expect(parseLang(undefined)).toBe('pt-BR');
    expect(parseLang('klingon')).toBe('pt-BR');
    expect(parseLang('de')).toBe('de');
    const req = { headers: new Map([['x-app-lang', 'fr']]) } as unknown as Request;
    expect(langFromRequest(req)).toBe('fr');
  });
});

describe('prompts no idioma escolhido', () => {
  it('sem idioma, continuam em português (como antes)', () => {
    const { system } = buildQuestionsPrompt({ area: 'vendas', level: 'estagio', num: 3 });
    expect(system).toContain('português do Brasil');
    expect(system).toContain('mercado brasileiro');
  });

  it('perguntas e feedback pedem o idioma e o mercado certos', () => {
    const en = OUTPUT_LANGUAGE.en;
    const q = buildQuestionsPrompt({ area: 'vendas', level: 'jovem_aprendiz', num: 3, language: en });
    expect(q.system).toContain('em inglês');
    expect(q.system).toContain('Estados Unidos');
    expect(q.user).toContain('inglês');
    const f = buildFeedbackPrompt({ area: 'vendas', level: 'junior', questions: [], answers: [], language: OUTPUT_LANGUAGE.de });
    expect(f.system).toContain('em alemão');
    expect(f.system).toContain('"ähm"');
    expect(f.system).not.toContain('"né"');
  });

  it('LinkedIn: textos traduzidos, códigos fixos', () => {
    const { system } = buildLinkedInPrompt({ profileText: 'x', targetRole: null, language: OUTPUT_LANGUAGE.es });
    expect(system).toContain('em espanhol');
    expect(system).toContain('sem traduzir');
  });

  it('bio: idioma e palavras proibidas de cada língua', () => {
    const { system } = buildBioPrompt({ name: null, age: null, goal: null, area: null, experiences: [], education: [] }, OUTPUT_LANGUAGE.fr);
    expect(system).toContain('bio em francês');
    expect(system).toContain('dynamique');
    expect(hasBannedWord('Je suis très DYNAMIQUE', 'fr')).toBe(true);
    expect(hasBannedWord('I am a proactive person', 'en')).toBe(true);
    expect(hasBannedWord('Ich bin ergebnisorientiert', 'de')).toBe(true);
    const good =
      'I am 19 and I am finishing a business course at school. At the school fair I welcomed visitors and answered their questions. I want to start my career in customer service.';
    expect(parseBio({ bio: good }, 'en')).toBe(good);
    expect(parseBio({ bio: `${good.slice(0, -1)} and I am passionate.` }, 'en')).toBeNull();
  });
});

describe('página de pagamento', () => {
  const base = { subscriptionId: 's', userId: 'u', email: 'a@b.c', price: 14.9, returnUrl: 'https://x' };
  it('abre no idioma do app (padrão: pt-BR)', () => {
    expect(buildCheckoutSession(base).locale).toBe('pt-BR');
    expect(buildCheckoutSession({ ...base, locale: 'de' }).locale).toBe('de');
  });
});

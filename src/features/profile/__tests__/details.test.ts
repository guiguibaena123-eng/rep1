import { t } from '@/i18n';

import {
  addSkill,
  completeness,
  detailsToUpdate,
  guessSkillType,
  hasChanges,
  highlightSkills,
  instagramHandle,
  isValidLink,
  normalizeUsername,
  removeSkill,
  skillSuggestions,
  SKILLS_MAX,
  usernameProblem,
  validateDetails,
} from '../details';
import type { ProfileDetails, Skill } from '../types';

const empty: ProfileDetails = {
  photo_path: null,
  cover_path: null,
  cover_x: 50,
  cover_y: 50,
  name: 'Ana Souza',
  username: 'ana.souza',
  headline: '',
  city: '',
  bio: '',
  skills: [],
  goal: null,
  area: null,
  availability: [],
  work_format: null,
  experiences: [],
  education: [],
  courses: [],
  languages: [],
  linkedin_url: '',
  portfolio_url: '',
  instagram: '',
  is_public: false,
};

const full: ProfileDetails = {
  ...empty,
  photo_path: 'u1/avatar-1.jpg',
  headline: 'Estudante de Administração',
  city: 'São Paulo, SP',
  bio: 'Tenho 19 anos e estou terminando o técnico em Administração. Gosto de ajudar pessoas e resolver dúvidas.',
  skills: [
    { name: 'Comunicação', type: 'comportamental' },
    { name: 'Empatia', type: 'comportamental' },
    { name: 'Excel básico', type: 'tecnica' },
  ],
  goal: 'primeiro_emprego',
  area: 'atendimento',
  availability: ['manha', 'tarde'],
  experiences: [{ title: 'Voluntária', place: 'Feira', start: 'ago 2026', end: null, description: '' }],
  education: [{ course: 'Ensino médio', institution: 'ETEC', status: 'concluido', year: '2025' }],
  languages: [{ language: 'Português', level: 'nativo' }],
  linkedin_url: 'linkedin.com/in/anasouza',
};

describe('completeness (perfil completo)', () => {
  it('perfil vazio: 0% e falta a foto primeiro', () => {
    expect(completeness(empty)).toEqual({ pct: 0, missing: 'photo' });
  });

  it('perfil com tudo: 100% e nada faltando', () => {
    expect(completeness(full)).toEqual({ pct: 100, missing: null });
  });

  it('soma os pesos de cada item', () => {
    expect(completeness({ ...empty, photo_path: 'x.jpg' }).pct).toBe(10);
    expect(completeness({ ...empty, photo_path: 'x.jpg', headline: 'Estudante', city: 'Recife' }).pct).toBe(25);
    expect(completeness({ ...full, linkedin_url: '' })).toEqual({ pct: 95, missing: 'linkedin' });
  });

  it('bio só conta com 80+ caracteres', () => {
    expect(completeness({ ...full, bio: 'Curta demais.' })).toEqual({ pct: 85, missing: 'bio' });
  });

  it('competências contam a partir de 3', () => {
    expect(completeness({ ...full, skills: full.skills.slice(0, 2) }).missing).toBe('skills');
  });

  it('objetivo sem disponibilidade não conta', () => {
    expect(completeness({ ...full, availability: [] })).toEqual({ pct: 90, missing: 'goal' });
  });

  it('LinkedIn precisa ser um link válido do linkedin.com', () => {
    expect(completeness({ ...full, linkedin_url: 'meusite.com' }).missing).toBe('linkedin');
  });

  it('o que falta aparece em linguagem simples', () => {
    expect(t.myProfile.missing[completeness({ ...full, city: '' }).missing!]).toBe('Falta: dizer sua cidade.');
  });
});

describe('validateDetails (mensagens gentis)', () => {
  it('perfil certo: sem erros', () => {
    expect(validateDetails(full)).toEqual({});
  });

  it('nome vazio: "Como podemos te chamar?"', () => {
    expect(validateDetails({ ...full, name: '   ' }).name).toBe('Como podemos te chamar?');
  });

  it('nome com 1 letra ou longo demais', () => {
    expect(validateDetails({ ...full, name: 'A' }).name).toBe(t.editProfile.nameShort);
    expect(validateDetails({ ...full, name: 'A'.repeat(61) }).name).toBe(t.editProfile.tooLong(60));
  });

  it('limite de caracteres no título, cidade e bio', () => {
    const errors = validateDetails({ ...full, headline: 'x'.repeat(121), city: 'x'.repeat(81), bio: 'x'.repeat(401) });
    expect(errors.headline).toBe(t.editProfile.tooLong(120));
    expect(errors.city).toBe(t.editProfile.tooLong(80));
    expect(errors.bio).toBe(t.editProfile.tooLong(400));
  });

  it('link inválido: "Esse link não parece certo"', () => {
    expect(validateDetails({ ...full, linkedin_url: 'isso não é link' }).linkedin_url).toBe('Esse link não parece certo');
    expect(validateDetails({ ...full, linkedin_url: 'instagram.com/ana' }).linkedin_url).toBe('Esse link não parece certo');
    expect(validateDetails({ ...full, portfolio_url: 'ana@' }).portfolio_url).toBe('Esse link não parece certo');
  });

  it('links vazios são aceitos (são opcionais)', () => {
    expect(validateDetails({ ...full, linkedin_url: '', portfolio_url: '  ' })).toEqual({});
  });
});

describe('isValidLink', () => {
  it('aceita com ou sem https://', () => {
    expect(isValidLink('https://www.linkedin.com/in/ana', 'linkedin')).toBe(true);
    expect(isValidLink('linkedin.com/in/ana', 'linkedin')).toBe(true);
    expect(isValidLink('behance.net/ana')).toBe(true);
  });

  it('recusa endereço falso do LinkedIn', () => {
    expect(isValidLink('linkedin.com.golpe.xyz/in/ana', 'linkedin')).toBe(false);
  });
});

describe('Instagram', () => {
  it('reconhece @usuario, usuario e o link', () => {
    expect(instagramHandle('@ana.souza')).toBe('ana.souza');
    expect(instagramHandle('  ana_souza ')).toBe('ana_souza');
    expect(instagramHandle('https://www.instagram.com/ana.souza/')).toBe('ana.souza');
    expect(instagramHandle('instagram.com/ana.souza?igsh=abc')).toBe('ana.souza');
  });

  it('recusa o que não é usuário', () => {
    expect(instagramHandle('')).toBeNull();
    expect(instagramHandle('ana souza')).toBeNull();
    expect(instagramHandle('javascript:alert(1)')).toBeNull();
    expect(instagramHandle('site.com/ana')).toBeNull();
    expect(instagramHandle('a'.repeat(31))).toBeNull();
  });

  it('valida no formulário e salva só o usuário', () => {
    expect(validateDetails({ ...full, instagram: 'ana souza' }).instagram).toBe(t.editProfile.instagramInvalid);
    expect(validateDetails({ ...full, instagram: '@ana.souza' }).instagram).toBeUndefined();
    expect(detailsToUpdate({ ...full, instagram: '@ana.souza' }).instagram).toBe('ana.souza');
    expect(detailsToUpdate({ ...full, instagram: '' }).instagram).toBeNull();
  });

  it('não conta como mudança só por causa do @', () => {
    expect(hasChanges({ ...full, instagram: '@ana' }, { ...full, instagram: 'ana' })).toBe(false);
  });
});

describe('competências', () => {
  const skills: Skill[] = [{ name: 'Comunicação', type: 'comportamental' }];

  it('adiciona no fim, sem espaços a mais', () => {
    const r = addSkill(skills, '  Excel   básico ', 'tecnica');
    expect(r).toEqual({ ok: true, skills: [...skills, { name: 'Excel básico', type: 'tecnica' }] });
  });

  it('não duplica, sem diferenciar maiúsculas nem acentos', () => {
    expect(addSkill(skills, 'COMUNICAÇÃO', 'comportamental')).toEqual({ ok: false, reason: 'duplicate' });
    expect(addSkill(skills, 'comunicacao', 'comportamental')).toEqual({ ok: false, reason: 'duplicate' });
  });

  it('recusa vazia e acima de 15', () => {
    expect(addSkill(skills, '   ', 'tecnica')).toEqual({ ok: false, reason: 'empty' });
    const many = Array.from({ length: SKILLS_MAX }, (_, i) => ({ name: `Skill ${i}`, type: 'tecnica' as const }));
    expect(addSkill(many, 'Nova', 'tecnica')).toEqual({ ok: false, reason: 'full' });
  });

  it('remove sem diferenciar maiúsculas', () => {
    expect(removeSkill(skills, 'comunicação')).toEqual([]);
  });

  it('adicionar e remover não altera a lista original', () => {
    addSkill(skills, 'Nova', 'tecnica');
    removeSkill(skills, 'Comunicação');
    expect(skills).toEqual([{ name: 'Comunicação', type: 'comportamental' }]);
  });

  it('tipo óbvio vem das sugestões ou de palavras conhecidas; senão null (a tela pergunta)', () => {
    expect(guessSkillType('Pontualidade')).toBe('comportamental');
    expect(guessSkillType('excel avançado')).toBe('tecnica');
    expect(guessSkillType('Xadrez')).toBeNull();
  });

  it('até 4 sugestões da área, sem as que a pessoa já tem', () => {
    const list = skillSuggestions('atendimento', [{ name: 'pontualidade', type: 'comportamental' }]);
    expect(list).toHaveLength(4);
    expect(list.map((s) => s.name)).not.toContain('Pontualidade');
  });

  it('destacada: aparece nos pontos fortes das simulações', () => {
    const result = highlightSkills(skills.concat({ name: 'Excel', type: 'tecnica' }), ['Boa comunicação com o entrevistador.']);
    expect(result.map((s) => s.highlighted)).toEqual([true, false]);
    expect(highlightSkills(skills, []).every((s) => !s.highlighted)).toBe(true);
  });
});

describe('hasChanges (descartar alterações)', () => {
  it('sem mudanças: pode sair direto', () => {
    expect(hasChanges(full, { ...full })).toBe(false);
  });

  it('ignora espaços nas pontas e a ordem da disponibilidade', () => {
    expect(hasChanges(full, { ...full, city: ' São Paulo, SP  ', availability: ['tarde', 'manha'] })).toBe(false);
  });

  it('vazio e null são a mesma coisa', () => {
    expect(hasChanges({ ...full, portfolio_url: null }, { ...full, portfolio_url: '' })).toBe(false);
  });

  it('qualquer mudança real pede confirmação', () => {
    expect(hasChanges(full, { ...full, name: 'Ana S.' })).toBe(true);
    expect(hasChanges(full, { ...full, photo_path: null })).toBe(true);
    expect(hasChanges(full, { ...full, cover_path: 'u1/cover-1.jpg' })).toBe(true);
    expect(hasChanges(full, { ...full, cover_y: 20 })).toBe(true);
    expect(hasChanges(full, { ...full, skills: removeSkill(full.skills, 'Empatia') })).toBe(true);
    expect(hasChanges(full, { ...full, languages: [] })).toBe(true);
  });

  it('descartar = voltar ao que estava salvo: sem mudanças de novo', () => {
    const edited = { ...full, bio: 'Outra bio' };
    expect(hasChanges(full, edited)).toBe(true);
    const discarded = { ...full };
    expect(hasChanges(full, discarded)).toBe(false);
  });
});

describe('nome de usuário (@)', () => {
  it('normaliza o que a pessoa digitou: sem @, sem espaços e em minúsculas', () => {
    expect(normalizeUsername('  @Ana.Souza ')).toBe('ana.souza');
    expect(normalizeUsername('@@bia_1')).toBe('bia_1');
    expect(normalizeUsername(null)).toBe('');
  });

  it.each([
    ['', 'empty'],
    ['@', 'empty'],
    ['ab', 'short'],
    ['a'.repeat(21), 'long'],
    ['ana souza!', 'chars'],
    ['joão', 'chars'],
    ['.ana', 'edges'],
    ['ana_', 'edges'],
    ['ana..souza', 'dots'],
    ['admin', 'reserved'],
    ['Siwki', 'reserved'],
  ])('"%s" → %s', (value, problem) => {
    expect(usernameProblem(value)).toBe(problem);
  });

  it.each(['ana', 'ana.souza', 'bia_2026', '@Ana.Souza', 'a'.repeat(20)])('"%s" está certo', (value) => {
    expect(usernameProblem(value)).toBeNull();
  });

  it('validação mostra a mensagem do @', () => {
    expect(validateDetails({ ...empty, username: '' }).username).toBe(t.editProfile.usernameEmpty);
    expect(validateDetails({ ...empty, username: 'ana..s' }).username).toBe(t.editProfile.usernameDots);
    expect(validateDetails({ ...empty, username: '@Ana.Souza' }).username).toBeUndefined();
  });

  it('salva normalizado; vazio vira null (o banco gera um @ pelo nome)', () => {
    expect(detailsToUpdate({ ...empty, username: ' @Ana.Souza ' }).username).toBe('ana.souza');
    expect(detailsToUpdate({ ...empty, username: '  ' }).username).toBeNull();
  });

  it('trocar só maiúsculas ou o @ do começo não conta como mudança', () => {
    expect(hasChanges(empty, { ...empty, username: '@ANA.SOUZA' })).toBe(false);
    expect(hasChanges(empty, { ...empty, username: 'ana.souza2' })).toBe(true);
  });
});

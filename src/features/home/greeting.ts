/** Saudações da Início: as do horário do dia e algumas "livres", para a tela não receber sempre do mesmo jeito. */
export const GREETING_KEYS = ['morning', 'afternoon', 'evening', 'night', 'hello', 'niceToSee', 'ready', 'hey'] as const;
export type GreetingKey = (typeof GREETING_KEYS)[number];

const FREE: GreetingKey[] = ['hello', 'niceToSee', 'ready', 'hey'];

/** Saudação do horário: 5h–11h manhã, 12h–17h tarde, 18h–22h noite, de madrugada "noite" também (23h–4h). */
export function timeGreeting(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 23) return 'evening';
  return 'night';
}

/**
 * Escolhe a saudação: a do horário em cerca de metade das vezes, as outras no resto.
 * `roll` é um número de 0 a 1 (sorteado uma vez por abertura do app, para o texto não trocar sozinho).
 */
export function pickGreeting(hour: number, roll: number): GreetingKey {
  if (roll < 0.5) return timeGreeting(hour);
  const index = Math.min(FREE.length - 1, Math.floor(((roll - 0.5) / 0.5) * FREE.length));
  return FREE[index];
}

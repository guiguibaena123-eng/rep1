import { pickGreeting, timeGreeting } from '../greeting';

describe('timeGreeting', () => {
  it.each([
    [5, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [17, 'afternoon'],
    [18, 'evening'],
    [22, 'evening'],
    [23, 'night'],
    [3, 'night'],
  ])('%ih → %s', (hour, key) => {
    expect(timeGreeting(hour)).toBe(key);
  });
});

describe('pickGreeting', () => {
  it('na primeira metade do sorteio usa a saudação do horário', () => {
    expect(pickGreeting(9, 0)).toBe('morning');
    expect(pickGreeting(15, 0.49)).toBe('afternoon');
  });

  it('na segunda metade usa uma saudação livre, nunca fora da lista', () => {
    const keys = [0.5, 0.65, 0.8, 0.99, 1].map((roll) => pickGreeting(9, roll));
    expect(keys).toEqual(['hello', 'niceToSee', 'ready', 'hey', 'hey']);
  });
});

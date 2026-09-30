// Prepara o Reanimated para rodar nos testes (animações com relógio falso).
require('react-native-reanimated').setUpTests();

// Ícones não importam nos testes: cada ícone vira um componente vazio.
jest.mock('lucide-react-native', () => new Proxy({ __esModule: true }, { get: (target, name) => target[name] ?? (() => null) }));

// Os testes conferem os textos em português, qualquer que seja o idioma do computador.
jest.mock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'pt', languageTag: 'pt-BR' }] }));

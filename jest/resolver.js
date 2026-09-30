/**
 * Nos testes (Jest), usa a versão "web" do Reanimated e do Worklets em vez da nativa,
 * que precisa de um celular de verdade. Mesma ideia do react-native-worklets/jest/resolver.js,
 * estendida para o Reanimated (recomendado na documentação de testes do Reanimated 4).
 */
const PACKAGES = ['react-native-worklets', 'react-native-reanimated'];

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) => {
  const touches = PACKAGES.some((pkg) => options.basedir.includes(pkg) || request.includes(pkg));
  if (touches) {
    options = { ...options, extensions: options.extensions?.filter((ext) => !ext.includes('native')) };
  }
  return options.defaultResolver(request, options);
};

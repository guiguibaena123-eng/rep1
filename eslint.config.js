// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    // design/ é o pacote de referência; supabase/functions roda em Deno (verificado à parte).
    ignores: ["dist/*", "design/*", "supabase/functions/*"],
  }
]);

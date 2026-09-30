import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as aesjs from 'aes-js';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';

import { env } from './env';

/**
 * Guarda a sessão de forma segura.
 * O SecureStore só aceita valores de até 2048 bytes e a sessão é maior. Então:
 * uma chave AES-256 fica no SecureStore (cofre do aparelho) e a sessão criptografada
 * com ela fica no AsyncStorage. Padrão recomendado na documentação do Supabase.
 */
class LargeSecureStore {
  private async encrypt(key: string, value: string) {
    const encryptionKey = Crypto.getRandomValues(new Uint8Array(256 / 8));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(1));
    const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
    await SecureStore.setItemAsync(key, aesjs.utils.hex.fromBytes(encryptionKey));
    return aesjs.utils.hex.fromBytes(encryptedBytes);
  }

  private async decrypt(key: string, value: string) {
    const encryptionKeyHex = await SecureStore.getItemAsync(key);
    if (!encryptionKeyHex) return null;
    const cipher = new aesjs.ModeOfOperation.ctr(aesjs.utils.hex.toBytes(encryptionKeyHex), new aesjs.Counter(1));
    const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
    return aesjs.utils.utf8.fromBytes(decryptedBytes);
  }

  async getItem(key: string) {
    const encrypted = await AsyncStorage.getItem(key);
    if (!encrypted) return null;
    return this.decrypt(key, encrypted);
  }

  async removeItem(key: string) {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(key);
  }

  async setItem(key: string, value: string) {
    const encrypted = await this.encrypt(key, value);
    await AsyncStorage.setItem(key, encrypted);
  }
}

// Valores de exemplo evitam erro ao abrir o app sem .env; a tela de configuração avisa.
export const supabase = createClient(
  env.supabaseUrl || 'https://exemplo.supabase.co',
  env.supabaseKey || 'chave-ausente',
  {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : new LargeSecureStore(),
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      // PKCE: o link dos e-mails traz só um código de uso único, que só vale NESTE aparelho
      // (quem pediu o e-mail guarda um segredo aqui). Um link montado por outra pessoa não entra em conta nenhuma.
      flowType: 'pkce',
    },
  },
);

// Renova o token só com o app aberto na tela (economiza bateria e evita erros em segundo plano).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ProfileDetails } from './types';

/**
 * Edição do perfil feita sem internet: fica guardada no celular até conseguir enviar.
 * Uma por conta; uma edição nova substitui a anterior (ela já contém tudo).
 */
const key = (userId: string) => `pronto:profile-pending:${userId}`;

export async function readPending(userId: string): Promise<ProfileDetails | null> {
  try {
    const raw = await AsyncStorage.getItem(key(userId));
    return raw ? (JSON.parse(raw) as ProfileDetails) : null;
  } catch {
    return null;
  }
}

export async function writePending(userId: string, details: ProfileDetails) {
  await AsyncStorage.setItem(key(userId), JSON.stringify(details));
}

export async function clearPending(userId: string) {
  await AsyncStorage.removeItem(key(userId));
}

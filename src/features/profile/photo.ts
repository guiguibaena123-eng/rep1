import { useQuery } from '@tanstack/react-query';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { supabase } from '@/lib/supabase';

/**
 * Bucket privado (migrations 20261006000000 e 20261007000000).
 * Caminhos: {user_id}/avatar-{data}.jpg (foto) e {user_id}/cover-{data}.jpg (capa).
 */
const BUCKET = 'avatars';
export const PHOTO_SIZE = 512;
/** Proporção da capa da T18 (390 × 176 no design). */
export const COVER_RATIO = 390 / 176;
const COVER_WIDTH = 1200;

export type PhotoKind = 'avatar' | 'cover';

const COVER_HEIGHT = Math.round(COVER_WIDTH / COVER_RATIO);
/** A capa é guardada inteira (para poder mudar a posição depois), mas no máximo com este lado maior. */
const COVER_MAX_SIDE = 2400;

/**
 * Tamanho em que a capa é guardada: o menor que ainda cobre 1200×542, sem aumentar
 * imagem pequena e sem passar de 2400 no lado maior.
 */
export function coverSize(width: number, height: number) {
  const scale = Math.min(1, Math.max(COVER_WIDTH / width, COVER_HEIGHT / height), COVER_MAX_SIDE / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Meta de tamanho: ~300 KB. Começa com qualidade 0.8 e baixa se passar. */
const MAX_BYTES = 300 * 1024;
const QUALITIES = [0.8, 0.65, 0.5, 0.35];
/** Links assinados duram 1 hora; o cache pede um novo antes disso. */
const SIGNED_URL_SECONDS = 60 * 60;

export type PickSource = 'gallery' | 'camera';
export type PickResult = { status: 'ok'; uri: string } | { status: 'canceled' } | { status: 'denied' };

/**
 * Abre a galeria ou a câmera. Foto: recorte quadrado do próprio celular.
 * Capa: sem recorte; a pessoa escolhe a parte que aparece no app (CoverPositionEditor).
 */
export async function pickPhoto(source: PickSource, kind: PhotoKind = 'avatar'): Promise<PickResult> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const options: ImagePicker.ImagePickerOptions =
    kind === 'avatar'
      ? { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 }
      : { mediaTypes: ['images'], allowsEditing: false, quality: 1 };
  const result =
    source === 'camera' ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
  const asset = result.canceled ? null : result.assets?.[0];
  if (!asset) return { status: 'canceled' };
  return { status: 'ok', uri: asset.uri };
}

/**
 * Imagem "cobrindo" uma moldura (como contentFit="cover"): tamanho mostrado e quanto sobra
 * para cada lado (ox, oy). A posição em % escolhe qual parte da sobra fica escondida.
 */
export function coverFit(frameWidth: number, frameHeight: number, imageWidth: number, imageHeight: number) {
  const scale = Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { width, height, ox: Math.max(0, width - frameWidth), oy: Math.max(0, height - frameHeight) };
}

/** Nova posição (0–100) depois de arrastar `delta` pixels, com `overflow` pixels de sobra. */
export function dragPosition(start: number, delta: number, overflow: number) {
  if (overflow <= 0) return start;
  return Math.round(Math.min(100, Math.max(0, start - (delta / overflow) * 100)));
}

/** Maior recorte no centro da imagem com a proporção pedida. */
export function centerCrop(width: number, height: number, ratio: number) {
  let w = width;
  let h = Math.round(width / ratio);
  if (h > height) {
    h = height;
    w = Math.round(height * ratio);
  }
  return { originX: Math.floor((width - w) / 2), originY: Math.floor((height - h) / 2), width: w, height: h };
}

/**
 * Foto: recorta no centro (garante o quadrado, mesmo se o recorte do sistema não bater) e reduz para 512×512.
 * Capa: só reduz (coverSize), sem cortar. As duas são comprimidas em JPEG até ~300 KB.
 */
export async function preparePhoto(uri: string, kind: PhotoKind = 'avatar'): Promise<{ uri: string; bytes: ArrayBuffer }> {
  const base = await ImageManipulator.manipulate(uri).renderAsync();
  const edit = () =>
    kind === 'avatar'
      ? ImageManipulator.manipulate(uri)
          .crop(centerCrop(base.width, base.height, 1))
          .resize({ width: PHOTO_SIZE, height: PHOTO_SIZE })
      : ImageManipulator.manipulate(uri).resize(coverSize(base.width, base.height));

  let last: { uri: string; bytes: ArrayBuffer } | null = null;
  for (const compress of QUALITIES) {
    const image = await edit().renderAsync();
    const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress });
    const bytes = await (await fetch(saved.uri)).arrayBuffer();
    last = { uri: saved.uri, bytes };
    if (bytes.byteLength <= MAX_BYTES) break;
  }
  return last!;
}

/** Envia a imagem já preparada e devolve o caminho no bucket. */
export async function uploadPhoto(userId: string, bytes: ArrayBuffer, kind: PhotoKind = 'avatar'): Promise<string> {
  const path = `${userId}/${kind}-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, bytes, { contentType: 'image/jpeg', upsert: false });
  if (error) throw error;
  return path;
}

/**
 * Apaga as imagens da pasta que não estão em uso (troca, "Remover" ou edição descartada).
 * `keep`: os caminhos em uso (foto e capa). Falhar aqui não atrapalha a pessoa:
 * só deixa um arquivo a mais, que some ao apagar a conta.
 */
export async function cleanupPhotos(userId: string, keep: readonly (string | null)[]) {
  try {
    const { data } = await supabase.storage.from(BUCKET).list(userId, { limit: 100 });
    const extra = (data ?? []).map((f) => `${userId}/${f.name}`).filter((p) => !keep.includes(p));
    if (extra.length > 0) await supabase.storage.from(BUCKET).remove(extra);
  } catch {
    // sem internet ou sem permissão: tenta de novo na próxima troca
  }
}

/** Link temporário para mostrar a imagem (o bucket é privado). */
export function usePhotoUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ['profile-photo', path],
    enabled: !!path,
    staleTime: (SIGNED_URL_SECONDS - 5 * 60) * 1000,
    gcTime: SIGNED_URL_SECONDS * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path!, SIGNED_URL_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
  });
}

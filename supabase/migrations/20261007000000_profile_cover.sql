-- Foto de capa do "Meu perfil" (T18/T19), pedido do usuário depois do Prompt 3.
-- Fica no mesmo bucket privado "avatars": avatars/{user_id}/cover-{data}.jpg (mesmas políticas: só a própria pasta).

alter table public.profiles
  add column cover_path text check (char_length(cover_path) <= 200);

grant update (cover_path) on public.profiles to authenticated;

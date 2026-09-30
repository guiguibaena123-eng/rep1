-- Instagram no Meu perfil (pedido do usuário): guarda só o nome de usuário (sem @),
-- e o app monta o link https://instagram.com/<usuario>. Assim não entra link arbitrário.

alter table public.profiles
  add column instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$');

grant update (instagram) on public.profiles to authenticated;

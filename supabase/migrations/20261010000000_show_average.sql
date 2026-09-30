-- Nota média no "Meu perfil" (pedido do usuário): aparece por padrão, e a pessoa pode ocultá-la.

alter table public.profiles
  add column show_average boolean not null default true;

grant update (show_average) on public.profiles to authenticated;

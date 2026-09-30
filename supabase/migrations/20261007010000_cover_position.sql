-- Posição da foto de capa (pedido do usuário): a capa é guardada inteira e o app mostra
-- a parte escolhida. 0 = borda esquerda/de cima, 50 = centro, 100 = borda direita/de baixo.

alter table public.profiles
  add column cover_x smallint not null default 50 check (cover_x between 0 and 100),
  add column cover_y smallint not null default 50 check (cover_y between 0 and 100);

grant update (cover_x, cover_y) on public.profiles to authenticated;

-- Fase 5: análise do perfil do LinkedIn.
-- Relatórios (linkedin_reports), bucket privado para os PDFs e contador de uso do mês.
-- Quem grava os relatórios é a Edge Function analyze-linkedin (service role).
-- Única escrita do app: marcar as caixinhas do checklist (coluna checklist_state).

-- ---------- Relatórios ----------
create table public.linkedin_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null check (source in ('pdf', 'paste')),
  target_role text check (char_length(target_role) <= 80),
  is_full bool not null default false,
  report jsonb not null,
  overall_score int not null check (overall_score between 0 and 100),
  -- Ex.: {"c1": true, "c3": true}. Limite de tamanho: o app grava aqui direto.
  checklist_state jsonb not null default '{}' check (jsonb_typeof(checklist_state) = 'object' and pg_column_size(checklist_state) <= 4096)
);

create index linkedin_reports_user_created on public.linkedin_reports (user_id, created_at desc);

alter table public.linkedin_reports enable row level security;

create policy "linkedin_reports: ler os próprios"
  on public.linkedin_reports for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "linkedin_reports: marcar o próprio checklist"
  on public.linkedin_reports for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.linkedin_reports from anon;
revoke insert, update, delete on public.linkedin_reports from authenticated;
grant select on public.linkedin_reports to authenticated;
-- Só a coluna do checklist pode ser alterada pelo app.
grant update (checklist_state) on public.linkedin_reports to authenticated;

-- ---------- Bucket privado dos PDFs ----------
-- Caminho: linkedin-uploads/{user_id}/{uuid}.pdf. A Edge Function apaga o arquivo depois de ler.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('linkedin-uploads', 'linkedin-uploads', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;

-- O app só consegue ENVIAR arquivos para a própria pasta. Ler e apagar fica com o servidor.
create policy "linkedin-uploads: enviar para a própria pasta"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'linkedin-uploads'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ---------- Uso do mês (tela T10/T11) ----------
-- Grátis: 1 resumo por mês. Premium: 10 relatórios completos por mês.
-- O mês começa no dia 1, 00:00, fuso America/Sao_Paulo.
create function public.linkedin_usage()
returns json
language sql
stable
security invoker
set search_path = ''
as $$
  with month as (
    select date_trunc('month', now() at time zone 'America/Sao_Paulo') as start_local
  ),
  prof as (
    select plan = 'premium' and (premium_until is null or premium_until > now()) as premium
    from public.profiles
    where id = (select auth.uid())
  ),
  p as (
    select coalesce((select premium from prof), false) as premium
  )
  select json_build_object(
    'premium', (select premium from p),
    'used', coalesce((
      select count from public.usage_counters
      where user_id = (select auth.uid())
        and kind = case when (select premium from p) then 'linkedin_full' else 'linkedin_summary' end
        and period_start = (select start_local::date from month)
    ), 0),
    'limit', case when (select premium from p) then 10 else 1 end,
    'resets_at', (select (start_local + interval '1 month') at time zone 'America/Sao_Paulo' from month)
  );
$$;

revoke all on function public.linkedin_usage() from public, anon;
grant execute on function public.linkedin_usage() to authenticated;

-- Plano grátis passa de 20% para 35% das dicas (decisão do dono do app).
-- 21 dicas × 35% = 7,35 → 7 grátis (33%). Ao criar dicas, mantenha: grátis <= 35% do total.
--
-- As 3 liberadas agora cobrem objetivos que não tinham nenhuma dica grátis no "Para você":
--   conte-uma-historia            → primeiro emprego
--   titulo-do-linkedin            → estágio e novo emprego
--   por-que-quer-mudar-de-emprego → novo emprego

update public.tips set is_premium = false
where slug in ('conte-uma-historia', 'titulo-do-linkedin', 'por-que-quer-mudar-de-emprego');

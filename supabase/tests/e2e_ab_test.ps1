# Teste de ponta a ponta "usuário A × usuário B" (pela internet, igual ao app).
# Cria 2 contas de teste (e-mails .invalid, senha aleatória), roda e2e_ab_test.mjs e APAGA as contas no final.
# Como rodar (terminal do VS Code, dentro da pasta do projeto):
#   powershell -ExecutionPolicy Bypass -File supabase\tests\e2e_ab_test.ps1

$ErrorActionPreference = 'Stop'
$root = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $root

# Endereço e chave PÚBLICA do app (as mesmas que vão dentro do app).
$envFile = [IO.File]::ReadAllText((Join-Path $root '.env'), [Text.Encoding]::UTF8)
$url = ([regex]::Match($envFile, 'EXPO_PUBLIC_SUPABASE_URL=(.+)')).Groups[1].Value.Trim()
$anon = ([regex]::Match($envFile, 'EXPO_PUBLIC_SUPABASE_ANON_KEY=(.+)')).Groups[1].Value.Trim()

$run = [guid]::NewGuid().ToString('N').Substring(0, 8)
$aEmail = "e2e-a-$run@teste.invalid"
$bEmail = "e2e-b-$run@teste.invalid"
$password = 'Ab1-' + [guid]::NewGuid().ToString('N')
$session = [guid]::NewGuid().ToString()
$subscription = [guid]::NewGuid().ToString()
$tmp = Join-Path $env:TEMP "e2e_ab_$run.sql"
$utf8 = New-Object Text.UTF8Encoding $false

function Invoke-Sql([string]$sql) {
  [IO.File]::WriteAllText($tmp, $sql, $utf8)
  try { npx.cmd supabase db query --linked -f $tmp | Out-Null } finally { Remove-Item $tmp -ErrorAction SilentlyContinue }
}

$setup = @"
do `$`$
declare
  u record;
begin
  for u in select * from (values ('$aEmail'), ('$bEmail')) as t(email) loop
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', u.email,
      extensions.crypt('$password', extensions.gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', '', '', '', '');
    insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    select id::text, id, jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), 'email', now(), now(), now()
    from auth.users where email = u.email;
  end loop;
end `$`$;
insert into public.interview_sessions (id, user_id, area, level, num_questions, questions)
select '$session', id, 'vendas', 'junior', 3, '[{"id":"q1","text":"Fale sobre você.","hint":"-"}]' from auth.users where email = '$aEmail';
insert into public.subscriptions (id, user_id, amount, status, provider_subscription_id)
select '$subscription', id, 14.90, 'authorized', 'sub_teste_e2e_$run' from auth.users where email = '$aEmail';
"@

$cleanup = "delete from auth.users where email in ('$aEmail', '$bEmail');"

$code = 1
try {
  Write-Host 'Criando as contas de teste A e B...'
  Invoke-Sql $setup
  $env:SUPABASE_URL = $url; $env:ANON_KEY = $anon; $env:A_EMAIL = $aEmail; $env:B_EMAIL = $bEmail
  $env:TEST_PASSWORD = $password; $env:A_SESSION = $session; $env:A_SUBSCRIPTION = $subscription
  node (Join-Path $PSScriptRoot 'e2e_ab_test.mjs')
  $code = $LASTEXITCODE
} finally {
  Write-Host 'Apagando as contas de teste...'
  Invoke-Sql $cleanup
  Remove-Item Env:TEST_PASSWORD -ErrorAction SilentlyContinue
}
exit $code

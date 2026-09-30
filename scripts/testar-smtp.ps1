# Testa o login no SMTP do Brevo direto do seu computador (sem o Supabase).
# Uso (terminal do VS Code, na pasta do projeto):  powershell -ExecutionPolicy Bypass -File scripts\testar-smtp.ps1
# A chave é digitada escondida e não é salva em lugar nenhum. Nenhum e-mail é enviado.

$hostName = 'smtp-relay.brevo.com'
$port = 587

$login = (Read-Host 'Cole o LOGIN do Brevo (ex.: 9a1b2c001@smtp-brevo.com)').Trim()
$clip = "$(Get-Clipboard -Raw)".Trim()
if ($clip.StartsWith('xsmtpsib-')) {
  Write-Host 'Usando a SMTP key que está copiada (Ctrl+C) na área de transferência.'
  $key = $clip
} else {
  $secure = Read-Host 'Cole a SMTP KEY (fica escondida)' -AsSecureString
  $key = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)).Trim()
}
$key = $key -replace '\s', ''

Write-Host ''
Write-Host "Login tem $($login.Length) caracteres. Chave tem $($key.Length) caracteres e começa com '$($key.Substring(0, [Math]::Min(9, $key.Length)))'."
if (-not $key.StartsWith('xsmtpsib-')) { Write-Host 'ATENÇÃO: a SMTP key deveria começar com xsmtpsib- (a que começa com xkeysib- é a API key e não serve).' -ForegroundColor Yellow }

function Read-Reply($reader) {
  $lines = @()
  do { $line = $reader.ReadLine(); $lines += $line } while ($line -and $line.Length -ge 4 -and $line[3] -eq '-')
  return ($lines -join ' | ')
}

try {
  $client = New-Object Net.Sockets.TcpClient($hostName, $port)
  $stream = $client.GetStream()
  $reader = New-Object IO.StreamReader($stream)
  $writer = New-Object IO.StreamWriter($stream); $writer.NewLine = "`r`n"; $writer.AutoFlush = $true
  [void](Read-Reply $reader)
  $writer.WriteLine('EHLO teste'); [void](Read-Reply $reader)
  $writer.WriteLine('STARTTLS'); [void](Read-Reply $reader)

  $ssl = New-Object Net.Security.SslStream($stream, $false)
  $ssl.AuthenticateAsClient($hostName)
  $reader = New-Object IO.StreamReader($ssl)
  $writer = New-Object IO.StreamWriter($ssl); $writer.NewLine = "`r`n"; $writer.AutoFlush = $true
  $writer.WriteLine('EHLO teste'); [void](Read-Reply $reader)

  $b64 = { param($s) [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($s)) }
  $writer.WriteLine('AUTH LOGIN'); [void](Read-Reply $reader)
  $writer.WriteLine((& $b64 $login)); [void](Read-Reply $reader)
  $writer.WriteLine((& $b64 $key)); $result = Read-Reply $reader
  $writer.WriteLine('QUIT')
  $client.Close()

  Write-Host ''
  if ($result.StartsWith('235')) {
    Write-Host 'RESULTADO: LOGIN OK. O login e a chave estão certos.' -ForegroundColor Green
  } else {
    Write-Host "RESULTADO: LOGIN RECUSADO -> $result" -ForegroundColor Red
  }
} catch {
  Write-Host "RESULTADO: não conectou -> $($_.Exception.Message)" -ForegroundColor Red
}

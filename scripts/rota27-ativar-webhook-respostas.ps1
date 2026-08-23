$ErrorActionPreference = "Stop"

$GRAPH_VERSION = "v25.0"
$APP_ID = "1413695990673393"
$WABA_ID = "2184585049047021"
$CALLBACK_URL = "https://owkvwsiblbzlpxjwybrt.supabase.co/functions/v1/rota27-whatsapp-inbound"
$VERIFY_TOKEN = "rota27-whatsapp-inbound-verify-v1-20260823"

function Convert-SecureToPlain {
    param([Security.SecureString]$Secure)
    $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
}

function Invoke-GraphJson {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$CurlArgs
    )

    $stdoutFile = Join-Path $env:TEMP ("rota27-meta-out-" + [guid]::NewGuid().ToString("N") + ".txt")
    $stderrFile = Join-Path $env:TEMP ("rota27-meta-err-" + [guid]::NewGuid().ToString("N") + ".txt")

    try {
        & curl.exe @CurlArgs 1> $stdoutFile 2> $stderrFile
        $exitCode = $LASTEXITCODE

        $stdout = if (Test-Path $stdoutFile) { [IO.File]::ReadAllText($stdoutFile) } else { "" }
        $stderr = if (Test-Path $stderrFile) { [IO.File]::ReadAllText($stderrFile) } else { "" }
        $text = $stdout.Trim()

        if ($exitCode -ne 0 -and [string]::IsNullOrWhiteSpace($text)) {
            throw ("curl falhou (codigo {0}): {1}" -f $exitCode, $stderr.Trim())
        }

        $jsonStart = $text.IndexOf("{")
        if ($jsonStart -lt 0) {
            if ($stderr.Trim()) { throw "Resposta nao-JSON da Meta/curl: $($stderr.Trim())" }
            throw "Resposta nao-JSON da Meta/curl."
        }

        return ($text.Substring($jsonStart) | ConvertFrom-Json)
    }
    finally {
        Remove-Item $stdoutFile, $stderrFile -Force -ErrorAction SilentlyContinue
    }
}

$SecureAppSecret = $null
$SecureUserToken = $null
$APP_SECRET = $null
$USER_TOKEN = $null
$APP_ACCESS_TOKEN = $null

try {
    Write-Host ""
    Write-Host "Rota 27 - ativacao do webhook de respostas do WhatsApp" -ForegroundColor Cyan
    Write-Host "As credenciais ficam somente na memoria desta sessao." -ForegroundColor DarkGray
    Write-Host ""

    $SecureAppSecret = Read-Host "Cole o APP SECRET do app Meta Rota27" -AsSecureString
    $SecureUserToken = Read-Host "Cole o mesmo WHATSAPP_ACCESS_TOKEN usado nos templates" -AsSecureString

    $APP_SECRET = (Convert-SecureToPlain $SecureAppSecret).Trim().Trim('"').Trim("'")
    $USER_TOKEN = ((Convert-SecureToPlain $SecureUserToken).Trim().Trim('"').Trim("'") -replace '\s+', '')

    if ([string]::IsNullOrWhiteSpace($APP_SECRET) -or $APP_SECRET.Length -lt 16) {
        throw "APP SECRET vazio ou incompleto."
    }

    if ([string]::IsNullOrWhiteSpace($USER_TOKEN) -or $USER_TOKEN.Length -lt 50) {
        throw "WHATSAPP_ACCESS_TOKEN invalido ou incompleto."
    }

    Write-Host ""
    Write-Host "1/6 - Validando o token do WhatsApp e a WABA..." -ForegroundColor Cyan

    $wabaBefore = Invoke-GraphJson -CurlArgs @(
        "-sS", "-G",
        "https://graph.facebook.com/$GRAPH_VERSION/$WABA_ID/subscribed_apps",
        "-H", "Authorization: Bearer $USER_TOKEN"
    )

    if ($wabaBefore.error) {
        throw "Meta recusou o WHATSAPP_ACCESS_TOKEN: $($wabaBefore.error.message) (code $($wabaBefore.error.code))"
    }

    Write-Host "Token do WhatsApp aceito." -ForegroundColor Green

    Write-Host ""
    Write-Host "2/6 - Gerando App Access Token oficial do app Rota27..." -ForegroundColor Cyan

    $appTokenResponse = Invoke-GraphJson -CurlArgs @(
        "-sS", "-G",
        "https://graph.facebook.com/oauth/access_token",
        "--data-urlencode", "client_id=$APP_ID",
        "--data-urlencode", "client_secret=$APP_SECRET",
        "--data-urlencode", "grant_type=client_credentials"
    )

    if ($appTokenResponse.error) {
        throw (
            "A Meta nao aceitou o par APP ID + APP SECRET do app Rota27. " +
            "Confirme no Meta for Developers > app Rota27 > Configuracoes > Basico se o App Secret pertence ao App ID $APP_ID. " +
            "Erro Meta: $($appTokenResponse.error.message) (code $($appTokenResponse.error.code))"
        )
    }

    $APP_ACCESS_TOKEN = ([string]$appTokenResponse.access_token).Trim()
    if ([string]::IsNullOrWhiteSpace($APP_ACCESS_TOKEN)) {
        throw "A Meta nao retornou App Access Token."
    }

    Write-Host "App Access Token gerado e validado." -ForegroundColor Green

    Write-Host ""
    Write-Host "3/6 - Registrando callback do app para o campo messages..." -ForegroundColor Cyan

    $appSub = Invoke-GraphJson -CurlArgs @(
        "-sS", "-X", "POST",
        "https://graph.facebook.com/$GRAPH_VERSION/$APP_ID/subscriptions",
        "-H", "Authorization: Bearer $APP_ACCESS_TOKEN",
        "--data-urlencode", "object=whatsapp_business_account",
        "--data-urlencode", "callback_url=$CALLBACK_URL",
        "--data-urlencode", "verify_token=$VERIFY_TOKEN",
        "--data-urlencode", "fields=messages"
    )

    if ($appSub.error) {
        throw "Meta recusou a inscricao do app: $($appSub.error.message) (code $($appSub.error.code))"
    }

    Write-Host "Callback do app registrado." -ForegroundColor Green

    Write-Host ""
    Write-Host "4/6 - Inscrevendo a WABA no app Rota27..." -ForegroundColor Cyan

    $wabaSub = Invoke-GraphJson -CurlArgs @(
        "-sS", "-X", "POST",
        "https://graph.facebook.com/$GRAPH_VERSION/$WABA_ID/subscribed_apps",
        "-H", "Authorization: Bearer $USER_TOKEN"
    )

    if ($wabaSub.error) {
        throw "Meta recusou a inscricao da WABA: $($wabaSub.error.message) (code $($wabaSub.error.code))"
    }

    Write-Host "WABA inscrita." -ForegroundColor Green

    Write-Host ""
    Write-Host "5/6 - Fixando o callback desta WABA no Rota 27..." -ForegroundColor Cyan

    $override = Invoke-GraphJson -CurlArgs @(
        "-sS", "-X", "POST",
        "https://graph.facebook.com/$GRAPH_VERSION/$WABA_ID/subscribed_apps",
        "-H", "Authorization: Bearer $USER_TOKEN",
        "--data-urlencode", "override_callback_uri=$CALLBACK_URL",
        "--data-urlencode", "verify_token=$VERIFY_TOKEN"
    )

    if ($override.error) {
        throw "Meta recusou o callback da WABA: $($override.error.message) (code $($override.error.code))"
    }

    Write-Host "Callback da WABA registrado." -ForegroundColor Green

    Write-Host ""
    Write-Host "6/6 - Conferindo configuracao final..." -ForegroundColor Cyan

    $appCheck = Invoke-GraphJson -CurlArgs @(
        "-sS", "-G",
        "https://graph.facebook.com/$GRAPH_VERSION/$APP_ID/subscriptions",
        "-H", "Authorization: Bearer $APP_ACCESS_TOKEN"
    )

    $wabaCheck = Invoke-GraphJson -CurlArgs @(
        "-sS", "-G",
        "https://graph.facebook.com/$GRAPH_VERSION/$WABA_ID/subscribed_apps",
        "-H", "Authorization: Bearer $USER_TOKEN"
    )

    if ($appCheck.error) {
        throw "Falha ao conferir a inscricao do app: $($appCheck.error.message)"
    }

    if ($wabaCheck.error) {
        throw "Falha ao conferir a WABA: $($wabaCheck.error.message)"
    }

    $appRow = @($appCheck.data) |
        Where-Object { $_.object -eq "whatsapp_business_account" } |
        Select-Object -First 1

    $wabaRow = @($wabaCheck.data) |
        Where-Object {
            $_.whatsapp_business_api_data.id -eq $APP_ID -or
            $_.id -eq $APP_ID
        } |
        Select-Object -First 1

    $messagesSubscribed = $false
    if ($appRow) {
        $fields = @($appRow.fields)
        $messagesSubscribed = [bool]($fields -contains "messages")
    }

    Write-Host ""
    Write-Host "============================================================"
    Write-Host "ATIVACAO CONCLUIDA"
    Write-Host "============================================================"
    Write-Host "App: Rota27 ($APP_ID)"
    Write-Host "Campo messages inscrito: $messagesSubscribed"
    Write-Host "WABA inscrita no app: $([bool]$wabaRow)"
    Write-Host "Callback: $CALLBACK_URL"

    if ($wabaRow -and $wabaRow.override_callback_uri) {
        Write-Host "Override confirmado: $($wabaRow.override_callback_uri)"
    }

    Write-Host ""
    Write-Host "Agora responda, pelo WhatsApp do cliente, uma mensagem de comanda usando Responder." -ForegroundColor Green
}
finally {
    $APP_SECRET = $null
    $USER_TOKEN = $null
    $APP_ACCESS_TOKEN = $null
    Remove-Variable APP_SECRET,USER_TOKEN,APP_ACCESS_TOKEN,SecureAppSecret,SecureUserToken -ErrorAction SilentlyContinue
}

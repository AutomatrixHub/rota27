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
    param([string[]]$CurlArgs)
    $out = & curl.exe @CurlArgs 2>&1
    $text = ($out | Out-String).Trim()
    $start = $text.IndexOf("{")
    if ($start -lt 0) { throw "Resposta inválida da Meta: $text" }
    return ($text.Substring($start) | ConvertFrom-Json)
}

$SecureAppSecret = $null
$SecureUserToken = $null
$APP_SECRET = $null
$USER_TOKEN = $null

try {
    Write-Host ""
    Write-Host "Rota 27 - ativação do webhook de respostas do WhatsApp" -ForegroundColor Cyan
    Write-Host "Nenhuma credencial será gravada em arquivo ou exibida." -ForegroundColor DarkGray
    Write-Host ""

    $SecureAppSecret = Read-Host "Cole o APP SECRET do app Meta Rota27" -AsSecureString
    $SecureUserToken = Read-Host "Cole o mesmo WHATSAPP_ACCESS_TOKEN usado nos templates" -AsSecureString

    $APP_SECRET = (Convert-SecureToPlain $SecureAppSecret).Trim().Trim('"').Trim("'")
    $USER_TOKEN = ((Convert-SecureToPlain $SecureUserToken).Trim().Trim('"').Trim("'") -replace '\s+', '')

    if ([string]::IsNullOrWhiteSpace($APP_SECRET)) { throw "APP SECRET vazio." }
    if ([string]::IsNullOrWhiteSpace($USER_TOKEN) -or $USER_TOKEN.Length -lt 50) { throw "WHATSAPP_ACCESS_TOKEN inválido ou incompleto." }

    $APP_ACCESS_TOKEN = "$APP_ID|$APP_SECRET"

    Write-Host ""
    Write-Host "1/4 - Registrando o callback do app para o campo messages..." -ForegroundColor Cyan

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
        throw "Meta recusou a inscrição do app: $($appSub.error.message) (code $($appSub.error.code))"
    }
    Write-Host "Callback do app registrado." -ForegroundColor Green

    Write-Host ""
    Write-Host "2/4 - Inscrevendo a WABA no app Rota27..." -ForegroundColor Cyan

    $wabaSub = Invoke-GraphJson -CurlArgs @(
        "-sS", "-X", "POST",
        "https://graph.facebook.com/$GRAPH_VERSION/$WABA_ID/subscribed_apps",
        "-H", "Authorization: Bearer $USER_TOKEN"
    )

    if ($wabaSub.error) {
        throw "Meta recusou a inscrição da WABA: $($wabaSub.error.message) (code $($wabaSub.error.code))"
    }
    Write-Host "WABA inscrita." -ForegroundColor Green

    Write-Host ""
    Write-Host "3/4 - Fixando o callback desta WABA no Rota 27..." -ForegroundColor Cyan

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
    Write-Host "4/4 - Conferindo configuração..." -ForegroundColor Cyan

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

    if ($appCheck.error) { throw "Falha ao conferir o app: $($appCheck.error.message)" }
    if ($wabaCheck.error) { throw "Falha ao conferir a WABA: $($wabaCheck.error.message)" }

    $appRow = @($appCheck.data) | Where-Object { $_.object -eq "whatsapp_business_account" } | Select-Object -First 1
    $wabaRow = @($wabaCheck.data) | Where-Object {
        $_.whatsapp_business_api_data.id -eq $APP_ID -or $_.id -eq $APP_ID
    } | Select-Object -First 1

    Write-Host ""
    Write-Host "============================================================"
    Write-Host "ATIVAÇÃO CONCLUÍDA"
    Write-Host "============================================================"
    Write-Host "App: Rota27 ($APP_ID)"
    Write-Host "Campo messages inscrito: $([bool]($appRow.fields -contains 'messages'))"
    Write-Host "WABA inscrita no app: $([bool]$wabaRow)"
    Write-Host "Callback: $CALLBACK_URL"
    if ($wabaRow.override_callback_uri) {
        Write-Host "Override confirmado: $($wabaRow.override_callback_uri)"
    }
    Write-Host ""
    Write-Host "Agora responda, pelo WhatsApp do cliente, uma mensagem de comanda usando a função Responder." -ForegroundColor Green
}
finally {
    $APP_SECRET = $null
    $USER_TOKEN = $null
    $APP_ACCESS_TOKEN = $null
    Remove-Variable APP_SECRET,USER_TOKEN,APP_ACCESS_TOKEN,SecureAppSecret,SecureUserToken -ErrorAction SilentlyContinue
}

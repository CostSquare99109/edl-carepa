$ErrorActionPreference = 'Continue'
$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Location).Path }

$phpPath = 'C:\xampp\php\php.exe'
$backendPublic = Join-Path $Root 'backend\public'
$router = Join-Path $backendPublic 'router.php'
$frontendDir = Join-Path $Root 'frontend'

Write-Host '=== EDL Carepa - Desarrollo ===' -ForegroundColor Cyan
Write-Host "Repo: $Root"
Write-Host ''

if (-not (Test-Path $phpPath)) {
    Write-Error 'No se encontro php.exe en C:\xampp\php. Ajusta $phpPath.'
    exit 1
}
if (-not (Test-Path $router)) {
    Write-Error "No se encontro router.php: $router"
    exit 1
}
if (-not (Test-Path (Join-Path $frontendDir 'package.json'))) {
    Write-Error 'No se encontro frontend\package.json'
    exit 1
}

Write-Host '[1/2] Levantando backend PHP en http://localhost:8000 ...' -ForegroundColor Green
$backend = Start-Process -FilePath $phpPath -ArgumentList @('-S', 'localhost:8000', '-t', $backendPublic, $router) -PassThru

Start-Sleep -Seconds 2

Write-Host '[2/2] Levantando frontend Vite en http://localhost:5174 ...' -ForegroundColor Green
$frontendProc = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', 'cd /d "' + $frontendDir + '" && npm run dev') -PassThru

Write-Host ''
Write-Host 'Backend : http://localhost:8000' -ForegroundColor Yellow
Write-Host 'Frontend: http://localhost:5174' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Presiona Enter para detener ambos servidores...' -ForegroundColor Cyan
Read-Host | Out-Null

foreach ($proc in @($backend, $frontendProc)) {
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}
Get-Process -Name 'node' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host 'Servidores detenidos.' -ForegroundColor Green

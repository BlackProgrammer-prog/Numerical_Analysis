$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

if (-not (Test-Path -LiteralPath '.venv-desktop\Scripts\python.exe')) {
    if (Get-Command py -ErrorAction SilentlyContinue) {
        py -3 -m venv .venv-desktop
    } else {
        python -m venv .venv-desktop
    }
    if ($LASTEXITCODE -ne 0) { throw 'Could not create Python virtual environment.' }
}
$pythonExe = Join-Path $PSScriptRoot '.venv-desktop\Scripts\python.exe'
& $pythonExe -m pip install -r requirements-desktop.txt
if ($LASTEXITCODE -ne 0) { throw 'Desktop dependency installation failed.' }

Push-Location -LiteralPath 'frontend'
try {
    if (-not (Test-Path -LiteralPath 'node_modules\vite\bin\vite.js')) {
        npm ci
        if ($LASTEXITCODE -ne 0) { throw 'Frontend dependency installation failed.' }
    }
    npm run build:desktop
    if ($LASTEXITCODE -ne 0) { throw 'Desktop frontend build failed.' }
} finally {
    Pop-Location
}

& $pythonExe -m PyInstaller --noconfirm desktop/BaseConverter.spec
if ($LASTEXITCODE -ne 0) { throw 'EXE build failed.' }
foreach ($check in @('--smoke-test', '--ui-smoke-test')) {
    $checkProcess = Start-Process -FilePath (Join-Path $PSScriptRoot 'dist\BaseConverter.exe') -ArgumentList $check -WindowStyle Hidden -PassThru -Wait
    if ($checkProcess.ExitCode -ne 0) { throw "Packaged application check failed: $check" }
}
Write-Host 'Ready: dist\BaseConverter.exe'

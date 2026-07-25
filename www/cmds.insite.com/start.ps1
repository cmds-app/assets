#!/usr/bin/env pwsh
$ErrorActionPreference = 'Stop'

$port = 8080
$root = $PSScriptRoot

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "python not found on PATH. Install Python or use a different static server."
    exit 1
}

Set-Location $root
$url = "http://localhost:$port/"
Write-Host "Serving $root at $url"
Write-Host "Ctrl+C to stop."
Start-Process $url
python -m http.server $port

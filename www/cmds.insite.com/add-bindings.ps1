#!/usr/bin/env pwsh
#Requires -RunAsAdministrator
[CmdletBinding()]
param(
    [string]$SiteName = 'Default Web Site',
    [int]$Port = 80,
    [string]$Protocol = 'http',
    [string]$IPAddress = '*'
)

$ErrorActionPreference = 'Stop'

Import-Module WebAdministration

$hosts = @(
    'keyera.insite.com',
    'tourmaline.insite.com',
    'wolfmidstream.insite.com',
    'gibson.insite.com',
    'steelreef.insite.com',
    'btgenergy.insite.com',
    'cardinal.insite.com',
    'canlin.insite.com'
)

if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
    Write-Error "IIS site '$SiteName' not found."
    exit 1
}

foreach ($h in $hosts) {
    $existing = Get-WebBinding -Name $SiteName -Protocol $Protocol -HostHeader $h -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "skip  $Protocol://${h}:$Port  (already bound)" -ForegroundColor DarkGray
        continue
    }
    New-WebBinding -Name $SiteName -Protocol $Protocol -Port $Port -IPAddress $IPAddress -HostHeader $h | Out-Null
    Write-Host "added $Protocol://${h}:$Port" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done. Bindings on site '$SiteName':"
Get-WebBinding -Name $SiteName | Format-Table protocol, bindingInformation -AutoSize

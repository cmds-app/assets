#!/usr/bin/env pwsh
#Requires -RunAsAdministrator
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [string]$SiteName = 'E03.Production.Shift.UI',
    [string]$DomainSuffix = 'insite.com'
)

$ErrorActionPreference = 'Stop'

Import-Module WebAdministration

if (-not (Get-Website -Name $SiteName -ErrorAction SilentlyContinue)) {
    Write-Error "IIS site '$SiteName' not found."
    exit 1
}

$bindings = Get-WebBinding -Name $SiteName | ForEach-Object {
    $parts = $_.bindingInformation -split ':'
    [pscustomobject]@{
        Binding  = $_
        Protocol = $_.protocol
        IP       = $parts[0]
        Port     = $parts[1]
        Host     = $parts[2]
    }
} | Where-Object {
    $_.Host -and ($_.Host -eq $DomainSuffix -or $_.Host.EndsWith(".$DomainSuffix"))
} | Sort-Object Host, Protocol, Port

if (-not $bindings) {
    Write-Host "No bindings matching *.$DomainSuffix on '$SiteName'. Nothing to remove."
    exit 0
}

Write-Host "Bindings on '$SiteName' matching *.$DomainSuffix :"
$bindings | Format-Table Protocol, Host, Port, IP -AutoSize

$removed = 0
foreach ($b in $bindings) {
    $target = "$($b.Protocol)://$($b.Host):$($b.Port)"
    if ($PSCmdlet.ShouldProcess($target, "Remove IIS binding")) {
        Remove-WebBinding -Name $SiteName `
            -Protocol $b.Protocol `
            -IPAddress $b.IP `
            -Port $b.Port `
            -HostHeader $b.Host
        Write-Host "removed $target" -ForegroundColor Yellow
        $removed++
    }
}

Write-Host ""
Write-Host "Removed: $removed of $($bindings.Count)"

$leftover = Get-WebBinding -Name $SiteName | ForEach-Object {
    ($_.bindingInformation -split ':')[2]
} | Where-Object { $_ -and ($_ -eq $DomainSuffix -or $_.EndsWith(".$DomainSuffix")) }

if ($leftover) {
    Write-Warning "Still present: $($leftover -join ', ')"
}
else {
    Write-Host "Verified: no *.$DomainSuffix bindings remain on '$SiteName'." -ForegroundColor Green
}

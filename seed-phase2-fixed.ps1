param(
    [string]$BaseUrl = "http://localhost:5000/api/v1",
    [string]$Email = "owner@markq.local",
    [string]$Password = "ChangeMe!123",
    [int]$Target = 700
)

$ErrorActionPreference = "Stop"
Write-Host "`n=== Phase 2 (Bulletproof) ===" -ForegroundColor Cyan

# 1. Login
$login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post `
    -ContentType "application/json" `
    -Body (@{ email = $Email; password = $Password } | ConvertTo-Json)
$h = @{ Authorization = "Bearer $($login.accessToken)" }
Write-Host "Logged in: $($login.user.fullName)" -ForegroundColor Green

# 2. Ensure plan exists (defensive null handling)
Write-Host "`nChecking plans..." -ForegroundColor Yellow
$raw = Invoke-RestMethod -Uri "$BaseUrl/membership-plans" -Headers $h -Method Get
$plans = @()
if ($raw -is [array]) { $plans = @($raw | Where-Object { $_ -ne $null }) }
elseif ($null -ne $raw) { $plans = @($raw) }

Write-Host "  Existing plans: $($plans.Count)"

if ($plans.Count -eq 0) {
    Write-Host "  No plans found — creating 'Monthly Standard'..." -ForegroundColor Yellow
    $planBody = @{
        name = "Monthly Standard"
        durationDays = 30
        basePrice = 2000
        registrationFee = 0
        discount = 0
        gstPercent = 0
        gstIncluded = $false
        freezeEligible = $true
        maxFreezeDays = 15
    } | ConvertTo-Json
    $created = Invoke-RestMethod -Uri "$BaseUrl/membership-plans" -Method Post `
        -Body $planBody -ContentType "application/json" -Headers $h
    Write-Host "  Created: $($created.name)" -ForegroundColor Green
    $plans = @($created)
}

$plan = $plans[0]
$planId = [string]$plan.id

if ([string]::IsNullOrWhiteSpace($planId) -or $planId -match "^0{8}-") {
    Write-Host "`nFATAL: plan.id is not a valid GUID." -ForegroundColor Red
    $plan | ConvertTo-Json -Depth 5 | Write-Host
    return
}

Write-Host "  Using plan: $($plan.name) (id=$planId)" -ForegroundColor Green

# 3. Load members
Write-Host "`nLoading members..." -ForegroundColor Yellow
$allMembers = @()
$page = 1
do {
    $resp = Invoke-RestMethod -Uri "$BaseUrl/members?page=$page&pageSize=200" -Headers $h -Method Get
    $items = if ($resp.items) { $resp.items } else { @() }
    $allMembers += $items
    $page++
} while ($items.Count -eq 200 -and $allMembers.Count -lt 5000)
Write-Host "  Loaded $($allMembers.Count)" -ForegroundColor Green

if ($allMembers.Count -eq 0) { Write-Host "No members." -ForegroundColor Red; return }

$selected = @($allMembers | Get-Random -Count ([Math]::Min($Target, $allMembers.Count)))
Write-Host "`nProcessing $($selected.Count) members...`n" -ForegroundColor Yellow

$memb = 0; $pay = 0; $skip = 0; $errM = 0; $errP = 0
$startTime = Get-Date
$firstMErr = $false; $firstPErr = $false

for ($i = 0; $i -lt $selected.Count; $i++) {
    $m = $selected[$i]
    $memberId = [string]$m.id
    if ([string]::IsNullOrWhiteSpace($memberId)) { $skip++; continue }

    $startDate = (Get-Date).AddDays(-(Get-Random -Minimum 0 -Maximum 61)).ToString("yyyy-MM-dd")
    $membBody = @{ memberId = $memberId; planId = $planId; startDate = $startDate } | ConvertTo-Json

    try {
        $created = Invoke-RestMethod -Uri "$BaseUrl/memberships" -Method Post `
            -Body $membBody -ContentType "application/json" -Headers $h
        $memb++

        $roll = Get-Random -Minimum 0 -Maximum 100
        $total = [decimal]$created.totalPayable
        $payAmount = 0

        if ($roll -lt 50) { $payAmount = $total }
        elseif ($roll -lt 80) {
            $pct = Get-Random -Minimum 30 -Maximum 71
            $payAmount = [Math]::Round($total * $pct / 100, 2)
        }

        if ($payAmount -gt 0) {
            $mr = Get-Random -Minimum 0 -Maximum 100
            $method = "CASH"; $ref = $null
            if ($mr -lt 50) { $method = "CASH" }
            elseif ($mr -lt 80) { $method = "UPI"; $ref = "UPI" + (Get-Random -Minimum 100000000 -Maximum 999999999) }
            else { $method = "BANK_TRANSFER"; $ref = "NEFT" + (Get-Random -Minimum 100000 -Maximum 999999) }

            $payBody = @{
                membershipId = [string]$created.id
                amount = [double]$payAmount
                method = $method
                reference = $ref
            } | ConvertTo-Json

            try {
                Invoke-RestMethod -Uri "$BaseUrl/payments" -Method Post `
                    -Body $payBody -ContentType "application/json" -Headers $h | Out-Null
                $pay++
            } catch {
                $errP++
                if (-not $firstPErr) {
                    $firstPErr = $true
                    Write-Host "`n! Payment error on $($m.memberCode):" -ForegroundColor Red
                    Write-Host "  $payBody" -ForegroundColor DarkRed
                    try { $r = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host "  $($r.ReadToEnd())" -ForegroundColor DarkRed; $r.Close() } catch {}
                }
            }
        }
    } catch {
        $msg = $_.Exception.Message
        if ($msg -match "409|already has an active") { $skip++ }
        else {
            $errM++
            if (-not $firstMErr) {
                $firstMErr = $true
                Write-Host "`n! Membership error on $($m.memberCode):" -ForegroundColor Red
                Write-Host "  $membBody" -ForegroundColor DarkRed
                try { $r = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream()); Write-Host "  $($r.ReadToEnd())" -ForegroundColor DarkRed; $r.Close() } catch {}
            }
        }
    }

    if (($i + 1) % 50 -eq 0 -or ($i + 1) -eq $selected.Count) {
        $el = (Get-Date) - $startTime
        $rate = if ($el.TotalSeconds -gt 0) { [Math]::Round(($i + 1) / $el.TotalSeconds, 1) } else { 0 }
        Write-Host ("[{0,3}/{1}] memb={2} pay={3} errM={4} errP={5} skip={6} rate={7}/s" -f `
            ($i+1), $selected.Count, $memb, $pay, $errM, $errP, $skip, $rate) -ForegroundColor Cyan
    }
}

$tt = (Get-Date) - $startTime
Write-Host "`n=== COMPLETE ===" -ForegroundColor Green
Write-Host "Memberships : $memb"
Write-Host "Payments    : $pay"
Write-Host "Skipped     : $skip (already had active membership)"
Write-Host "Errors      : $errM memb / $errP pay"
Write-Host ("Time        : {0:N1} min" -f $tt.TotalMinutes)

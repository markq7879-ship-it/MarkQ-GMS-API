param(
    [string]$BaseUrl = "http://localhost:5000/api/v1",
    [string]$Email = "owner@markq.local",
    [string]$Password = "ChangeMe!123",
    [int]$MembershipTarget = 700,
    [int]$BatchSize = 50,
    [double]$FullPaidPct = 50.0,
    [double]$PartialPaidPct = 30.0
)

$ErrorActionPreference = "Stop"
Write-Host "`n=== Mark-Q GMS - Phase 2 (Memberships + Payments) ===" -ForegroundColor Cyan
Write-Host "Target: $MembershipTarget memberships, mix: $FullPaidPct% full / $PartialPaidPct% partial / rest unpaid`n" -ForegroundColor Cyan

# ---------- Login ----------
Write-Host "Logging in..." -ForegroundColor Yellow
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
Write-Host "  Logged in as $($login.user.fullName)" -ForegroundColor Green

# ---------- Branches ----------
$branches = @(Invoke-RestMethod -Uri "$BaseUrl/branches" -Headers $headers -Method Get)
if ($branches.Count -eq 0) {
    Write-Host "ERROR: No branches exist. Create one first." -ForegroundColor Red
    return
}
Write-Host "  Branches: $($branches.Count)" -ForegroundColor Green

# ---------- Plans (create default if none) ----------
$plans = @(Invoke-RestMethod -Uri "$BaseUrl/membership-plans" -Headers $headers -Method Get)
if ($plans.Count -eq 0) {
    Write-Host "  No plans exist. Creating 'Monthly Standard' plan..." -ForegroundColor Yellow
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
    $plan = Invoke-RestMethod -Uri "$BaseUrl/membership-plans" -Method Post -Body $planBody -ContentType "application/json" -Headers $headers
    $plans = @($plan)
}
Write-Host "  Plans: $($plans.Count) ($($plans.name -join ', '))" -ForegroundColor Green

# ---------- Fetch all members ----------
Write-Host "`nFetching members..." -ForegroundColor Yellow
$allMembers = @()
$page = 1
do {
    $resp = Invoke-RestMethod -Uri "$BaseUrl/members?page=$page&pageSize=200" -Headers $headers -Method Get
    $allMembers += $resp.items
    $page++
} while ($resp.items.Count -eq 200 -and $allMembers.Count -lt 5000)
Write-Host "  Loaded $($allMembers.Count) members" -ForegroundColor Green

if ($allMembers.Count -eq 0) {
    Write-Host "ERROR: No members exist. Run the member seeder first." -ForegroundColor Red
    return
}

# Pick random subset
$target = [Math]::Min($MembershipTarget, $allMembers.Count)
$selected = $allMembers | Get-Random -Count $target

Write-Host "`nCreating $target memberships + payments...`n" -ForegroundColor Yellow

$createdMemb = 0
$createdPay = 0
$membErr = 0
$payErr = 0
$errors = [System.Collections.Generic.List[string]]::new()
$startTime = Get-Date

for ($i = 0; $i -lt $target; $i++) {
    $member = $selected[$i]
    $plan = $plans[(Get-Random -Maximum $plans.Count)]
    
    # Random start date in last 60 days
    $daysAgo = Get-Random -Minimum 0 -Maximum 61
    $startDate = (Get-Date).AddDays(-$daysAgo).ToString("yyyy-MM-dd")
    
    $membBody = @{
        memberId = $member.id
        planId = $plan.id
        startDate = $startDate
        endDateOverride = $null
        endDateOverrideReason = $null
        registrationFeeOverride = $null
        discountOverride = $null
        discountReason = $null
        paymentDueDate = $null
        notes = "Load-test membership"
    } | ConvertTo-Json
    
    try {
        $memb = Invoke-RestMethod -Uri "$BaseUrl/memberships" -Method Post -Body $membBody -ContentType "application/json" -Headers $headers
        $createdMemb++
        
        # Decide payment scenario
        $roll = Get-Random -Minimum 0.0 -Maximum 100.0
        $total = [decimal]$memb.totalPayable
        
        if ($roll -lt $FullPaidPct) {
            $payAmount = $total
        } elseif ($roll -lt ($FullPaidPct + $PartialPaidPct)) {
            $pct = Get-Random -Minimum 30 -Maximum 71
            $payAmount = [Math]::Round($total * $pct / 100, 2)
        } else {
            $payAmount = 0
        }
        
        if ($payAmount -gt 0) {
            $methodRoll = Get-Random -Minimum 0 -Maximum 100
            if ($methodRoll -lt 50) {
                $method = "CASH"; $ref = $null
            } elseif ($methodRoll -lt 80) {
                $method = "UPI"; $ref = "UPI" + (Get-Random -Minimum 100000000 -Maximum 999999999)
            } else {
                $method = "BANK_TRANSFER"; $ref = "NEFT" + (Get-Random -Minimum 100000 -Maximum 999999)
            }
            
            $payBody = @{
                membershipId = $memb.id
                amount = $payAmount
                method = $method
                reference = $ref
                notes = $null
            } | ConvertTo-Json
            
            try {
                Invoke-RestMethod -Uri "$BaseUrl/payments" -Method Post -Body $payBody -ContentType "application/json" -Headers $headers | Out-Null
                $createdPay++
            } catch {
                $payErr++
                $msg = $_.Exception.Message
                try {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $msg = $reader.ReadToEnd(); $reader.Close()
                } catch {}
                if ($errors.Count -lt 10) { $errors.Add("Payment for $($member.memberCode): $msg") }
            }
        }
    } catch {
        $membErr++
        $msg = $_.Exception.Message
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $msg = $reader.ReadToEnd(); $reader.Close()
        } catch {}
        if ($errors.Count -lt 10) { $errors.Add("Membership for $($member.memberCode): $msg") }
    }
    
    if (($i + 1) % $BatchSize -eq 0 -or ($i + 1) -eq $target) {
        $elapsed = (Get-Date) - $startTime
        $rate = if ($elapsed.TotalSeconds -gt 0) { [math]::Round(($i + 1) / $elapsed.TotalSeconds, 1) } else { 0 }
        Write-Host ("[{0,4}/{1}] memb={2} pay={3} m_err={4} p_err={5} rate={6}/s" -f `
            ($i + 1), $target, $createdMemb, $createdPay, $membErr, $payErr, $rate) -ForegroundColor Yellow
    }
}

$totalTime = (Get-Date) - $startTime
Write-Host "`n=== COMPLETE ===" -ForegroundColor Green
Write-Host "Memberships : $createdMemb (errors: $membErr)"
Write-Host "Payments    : $createdPay (errors: $payErr)"
Write-Host ("Time        : {0:N1} min" -f $totalTime.TotalMinutes)

if ($errors.Count -gt 0) {
    Write-Host "`nFirst errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

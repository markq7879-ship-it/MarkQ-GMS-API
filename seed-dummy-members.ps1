param(
    [string]$BaseUrl  = "http://localhost:5000/api/v1",
    [string]$Email    = "owner@markq.local",
    [string]$Password = "ChangeMe!123",
    [int]   $Count    = 1000,
    [int]   $BatchSize = 50
)

$ErrorActionPreference = "Stop"
Write-Host "`n=== Mark-Q GMS Dummy Member Seeder ===" -ForegroundColor Cyan
Write-Host "Target: $BaseUrl  Count: $Count`n" -ForegroundColor Cyan

# Login
Write-Host "Logging in..." -ForegroundColor Yellow
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
    $login = Invoke-RestMethod -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
} catch {
    Write-Host "LOGIN FAILED: $($_.Exception.Message)" -ForegroundColor Red
    return
}
$headers = @{ Authorization = "Bearer $($login.accessToken)" }
Write-Host "  Logged in as $($login.user.fullName)" -ForegroundColor Green

# Branches
$branches = @(Invoke-RestMethod -Uri "$BaseUrl/branches" -Headers $headers -Method Get)
if ($branches.Count -eq 0) {
    Write-Host "ERROR: No branches exist. Create one at /branches first." -ForegroundColor Red
    return
}
Write-Host "  Branches: $($branches.Count)" -ForegroundColor Green

$firstNames    = @("Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan","Diya","Aadhya","Saanvi","Ananya","Pari","Anika","Navya","Angel","Myra","Sara","Rahul","Amit","Vijay","Suresh","Ravi","Anil","Sanjay","Manoj","Rajesh","Ashok")
$lastNames     = @("Sharma","Verma","Patel","Gupta","Reddy","Kumar","Singh","Yadav","Joshi","Mehta","Iyer","Nair","Khan","Ali","Shah","Desai","Rao","Kapoor","Malhotra","Bhatt")
$genders       = @("MALE","FEMALE","OTHER")
$bloodGroups   = @("A+","A-","B+","B-","AB+","AB-","O+","O-")
$maritalStatus = @("SINGLE","MARRIED","DIVORCED","WIDOWED","OTHER")
$cities        = @("Mumbai","Delhi","Bangalore","Hyderabad","Chennai","Kolkata","Pune","Ahmedabad","Jaipur","Surat")
$occupations   = @("Software Engineer","Business Owner","Teacher","Doctor","Accountant","Student","Freelancer","Sales Manager","Consultant","Engineer")
$referrers     = @("Walk-in","Friend","Google Search","Instagram","Facebook","Existing Member","Newspaper","Flyer")
$idProofTypes  = @("AADHAR","PAN","PASSPORT","DRIVING_LICENSE","VOTER_ID","OTHER")

$startTime = Get-Date
$created   = 0
$failed    = 0
$errors    = [System.Collections.Generic.List[string]]::new()

for ($i = 1; $i -le $Count; $i++) {
    $first = $firstNames[(Get-Random -Maximum $firstNames.Count)]
    $last  = $lastNames[(Get-Random -Maximum $lastNames.Count)]
    $fatherFirst = $firstNames[(Get-Random -Maximum $firstNames.Count)]

    $mobile   = "9" + $i.ToString("D9")
    $emergMob = "8" + $i.ToString("D9")
    $email    = "test$i@example.com"

    $dobYear  = Get-Random -Minimum 1974 -Maximum 2006
    $dobMonth = Get-Random -Minimum 1 -Maximum 13
    $dobDay   = Get-Random -Minimum 1 -Maximum 29
    $dob      = "{0}-{1:D2}-{2:D2}" -f $dobYear, $dobMonth, $dobDay

    $branch = $branches[($i - 1) % $branches.Count]

    $body = @{
        fullName              = "$first $last"
        fatherFullName        = "$fatherFirst $last"
        mobile                = $mobile
        whatsapp              = $mobile
        email                 = $email
        dateOfBirth           = $dob
        gender                = $genders[($i - 1) % $genders.Count]
        bloodGroup            = $bloodGroups[(Get-Random -Maximum $bloodGroups.Count)]
        maritalStatus         = $maritalStatus[(Get-Random -Maximum $maritalStatus.Count)]
        occupation            = $occupations[(Get-Random -Maximum $occupations.Count)]
        address               = "$i Test Street"
        city                  = $cities[($i - 1) % $cities.Count]
        pincode               = ("{0:D6}" -f (Get-Random -Minimum 100000 -Maximum 999999))
        idProofType           = $idProofTypes[(Get-Random -Maximum $idProofTypes.Count)]
        idProofNumber         = "ID" + $i.ToString("D8")
        emergencyContactName  = "$fatherFirst $last"
        emergencyContactRelation = "Father"
        emergencyContactPhone = $emergMob
        referredBy            = $referrers[(Get-Random -Maximum $referrers.Count)]
        notes                 = "Dummy member $i"
        branchId              = $branch.id
        photoBase64           = $null
        photoContentType      = $null
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$BaseUrl/members" -Method Post -Body $body -ContentType "application/json" -Headers $headers | Out-Null
        $created++
    } catch {
        $failed++
        $msg = $_.Exception.Message
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $msg = $reader.ReadToEnd()
            $reader.Close()
        } catch { }
        if ($errors.Count -lt 10) { $errors.Add("Member $i ($mobile): $msg") }
    }

    if ($i % $BatchSize -eq 0 -or $i -eq $Count) {
        $elapsed = (Get-Date) - $startTime
        $rate = if ($elapsed.TotalSeconds -gt 0) { [math]::Round($created / $elapsed.TotalSeconds, 1) } else { 0 }
        Write-Host ("[{0,4}/{1}] created={2} failed={3} rate={4}/s" -f $i, $Count, $created, $failed, $rate) -ForegroundColor Yellow
    }
}

$totalTime = (Get-Date) - $startTime
Write-Host "`n=== COMPLETE ===" -ForegroundColor Green
Write-Host "Created : $created" -ForegroundColor Green
Write-Host "Failed  : $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })
Write-Host ("Time    : {0:N1} min" -f $totalTime.TotalMinutes) -ForegroundColor Cyan

if ($errors.Count -gt 0) {
    Write-Host "`nFirst errors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

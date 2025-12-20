Write-Host "=== DispatchAI Compatibility Check ===" -ForegroundColor Cyan
Write-Host ""

# 1. OS Info
Write-Host "[1] Operating System" -ForegroundColor Green
Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, OSArchitecture | Format-List

# 2. CPU Info
Write-Host "[2] Processor (CPU)" -ForegroundColor Green
Get-CimInstance Win32_Processor | Select-Object Name, NumberOfCores, NumberOfLogicalProcessors | Format-List

# 3. RAM Info
Write-Host "[3] Memory (RAM)" -ForegroundColor Green
$ram = Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum
Write-Host "Total RAM: $([math]::round($ram.Sum / 1GB, 2)) GB" -ForegroundColor White
Write-Host ""

# 4. GPU Info (Important if they want to run local AI later)
Write-Host "[4] Graphics Card (GPU)" -ForegroundColor Green
Get-CimInstance Win32_VideoController | Select-Object Name, @{Name="VRAM (GB)"; Expression={[math]::round($_.AdapterRAM / 1GB, 2)}} | Format-List

# 5. Software Check
Write-Host "[5] Environment Check" -ForegroundColor Green
$software = @("python", "node", "npm", "git")
foreach ($app in $software) {
    if (Get-Command $app -ErrorAction SilentlyContinue) {
        $ver = & $app --version 2>&1
        if ($app -eq "python") { $ver = $ver -replace "Python ", "" }
        Write-Host "$app : INSTALLED ($ver)" -ForegroundColor White
    } else {
        Write-Host "$app : MISSING (Required)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== End of Report ===" -ForegroundColor Cyan
Write-Host "Please copy this entire output and send it to Antigravity."
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

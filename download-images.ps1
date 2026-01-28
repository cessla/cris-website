# Behance Portfolio Image Batch Downloader
# Downloads all responsive image sizes from Behance CDN for all portfolio projects
# 
# Usage: .\download-images.ps1
# 
# This script downloads images in multiple sizes:
# - max_808 or 808w (large desktop)
# - 404w (medium/tablet) 
# - 230w (small tablet)
# - 202w (small mobile)
# - 115w (thumbnail)
#
# Both JPEG and WebP formats are downloaded

param(
    [string]$ImageFolder = "C:\Users\Slawek\p\cr-website\images",
    [switch]$WebPOnly = $false,
    [switch]$JPEGOnly = $false
)

# Image IDs from Behance
$projects = @{
    "project-1-pfizer" = "a0b8b1219256293.Y3JvcCwyNzYxLDIxNjAsMTE2LDA"
    "project-2-mobil" = "7ac97e204762429.Y3JvcCwxMTMzLDg4NiwwLDIxOTA"
    "project-3-btl" = "c334ca70841851.6674e6539ea8c"
    "project-4-mobil-f1" = "55357d202009697.Y3JvcCw1NzYsNDUwLDYxLDQ3Mg"
    "project-5-nestle-boost" = "c5e5c5147730735.Y3JvcCw2NDEsNTAxLDQ5LDM4"
    "project-6-gerber" = "9d9d4f88855017.Y3JvcCw2NDEsNTAxLDAsMjA2"
    "project-7-aes" = "881d1975366725.6674e5c643482"
    "project-8-nestle-maternal" = "717e7c113063627.Y3JvcCw1MTgsNDA1LDM5OCwxMjE"
    "project-9-empaques" = "ee882455282151.Y3JvcCwxMTE3LDg3NCwyMjEsMjQ2"
    "project-10-metlife" = "22d41388852679.Y3JvcCwxMjAwLDkzOCwwLDE5Ng"
    "project-11-digital" = "851a5e55282551.Y3JvcCw0MDQsMzE2LDAsMA"
    "project-12-editorial" = "1a296855281889.Y3JvcCw3MzAsNTcyLDQ1MSw1MA"
    "project-13-insultos" = "2a812247893587.5a988a655ecfd"
    "project-14-lettering" = "347d9775028483.5c410272ee8cb"
    "project-15-misletras" = "d7027633896648.5c410193985f2"
    "project-16-logos" = "24f22455282329.Y3JvcCwxMDI1LDgwMiwxNTksMA"
}

# Image sizes available from Behance
# Note: Some projects may not have 808w, try max_808 as fallback
$sizes = @(
    @{ name = "lg"; widths = @("max_808", "808") },   # Large (desktop)
    @{ name = "md"; widths = @("404") },              # Medium (tablet)
    @{ name = "sm"; widths = @("230") },              # Small (mobile)
    @{ name = "xs"; widths = @("202") },              # Extra small
    @{ name = "th"; widths = @("115") }               # Thumbnail
)

# Behance CDN base URL
$cdnBase = "https://mir-s3-cdn-cf.behance.net/projects"

# Create output folder if it doesn't exist
if (-not (Test-Path $ImageFolder)) {
    New-Item -ItemType Directory -Path $ImageFolder -Force | Out-Null
    Write-Host "Created folder: $ImageFolder`n"
}

Write-Host "========================================================================"
Write-Host "  Behance Portfolio Image Downloader"
Write-Host "========================================================================"
Write-Host "  Downloading all responsive image sizes for 16 projects"
Write-Host "  Formats: JPEG + WebP | Sizes: 115w - 808w"
Write-Host "========================================================================"
Write-Host ""

$totalDownloads = 0
$failedDownloads = 0
$downloadLog = @()

foreach ($project in $projects.GetEnumerator()) {
    $projectName = $project.Key
    $imageId = $project.Value
    
    Write-Host "Processing: $projectName"
    
    foreach ($size in $sizes) {
        $sizeName = $size.name
        $widthsToTry = $size.widths
        $downloaded = $false
        
        foreach ($sizeNum in $widthsToTry) {
            if ($downloaded) { break }
            
            # Try JPEG version if not WebP-only
            if (-not $WebPOnly) {
                $jpegUrl = "$cdnBase/$sizeNum/$imageId.jpg"
                $jpegFile = Join-Path $ImageFolder "$projectName-$sizeName.jpg"
                
                try {
                    Write-Host "  Downloading: $projectName-$sizeName.jpg (${sizeNum}w)" -NoNewline
                    Invoke-WebRequest -Uri $jpegUrl -OutFile $jpegFile -ErrorAction Stop -TimeoutSec 10 | Out-Null
                    
                    $fileSize = [math]::Round((Get-Item $jpegFile).Length / 1KB, 1)
                    Write-Host " [OK] ($fileSize KB)"
                    $totalDownloads++
                    $downloadLog += "$projectName-$sizeName.jpg"
                    $downloaded = $true
                    Start-Sleep -Milliseconds 100
                }
                catch {
                    Write-Host " [SKIP]" -ForegroundColor DarkYellow
                }
            }
            
            # Try WebP version if not JPEG-only
            if (-not $JPEGOnly -and -not $downloaded) {
                $webpUrl = "$cdnBase/${sizeNum}_webp/$imageId.jpg"
                $webpFile = Join-Path $ImageFolder "$projectName-$sizeName.webp"
                
                try {
                    Write-Host "  Downloading: $projectName-$sizeName.webp (${sizeNum}w)" -NoNewline
                    Invoke-WebRequest -Uri $webpUrl -OutFile $webpFile -ErrorAction Stop -TimeoutSec 10 | Out-Null
                    
                    $fileSize = [math]::Round((Get-Item $webpFile).Length / 1KB, 1)
                    Write-Host " [OK] ($fileSize KB)"
                    $totalDownloads++
                    $downloadLog += "$projectName-$sizeName.webp"
                    $downloaded = $true
                    Start-Sleep -Milliseconds 100
                }
                catch {
                    Write-Host " [SKIP]" -ForegroundColor DarkYellow
                }
            }
        }
        
        if (-not $downloaded) {
            Write-Host "  ERROR: Could not download $projectName-$sizeName" -ForegroundColor Red
            $failedDownloads++
        }
    }
    
    Write-Host ""
}

Write-Host "========================================================================"
Write-Host "  Download Summary"
Write-Host "========================================================================"
Write-Host "  Total Downloaded: $totalDownloads files"
Write-Host "  Failed: $failedDownloads files"
Write-Host "  Location: $ImageFolder"
Write-Host "========================================================================"
Write-Host ""

# Show file statistics
$jpegCount = @(Get-ChildItem "$ImageFolder\*.jpg" -ErrorAction SilentlyContinue).Count
$webpCount = @(Get-ChildItem "$ImageFolder\*.webp" -ErrorAction SilentlyContinue).Count
$totalSize = ((Get-ChildItem "$ImageFolder\*" -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB)

Write-Host "File Statistics:"
Write-Host "  JPEG files: $jpegCount"
Write-Host "  WebP files: $webpCount"
Write-Host "  Total files: $($jpegCount + $webpCount)"
Write-Host "  Total size: $([math]::Round($totalSize, 2)) MB"
Write-Host ""

if ($failedDownloads -eq 0) {
    Write-Host "SUCCESS: All downloads completed!" -ForegroundColor Green
}
else {
    Write-Host "WARNING: $failedDownloads downloads failed" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Verify images in $ImageFolder"
Write-Host "2. Test the portfolio website: index.html"
Write-Host "3. Commit changes: git add images/ && git commit -m 'Add portfolio images'"

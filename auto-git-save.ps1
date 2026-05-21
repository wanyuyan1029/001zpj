$ErrorActionPreference = "Stop"

$repo = "E:\cpt"
$git = "E:\Program Files\git\Git\cmd\git.exe"
$log = Join-Path $repo "auto-git-save.log"

function Write-AutoSaveLog {
    param([string]$Message)
    $time = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $log -Value "[$time] $Message"
}

try {
    Set-Location $repo

    $status = & $git status --porcelain
    if ([string]::IsNullOrWhiteSpace($status)) {
        Write-AutoSaveLog "No changes."
        exit 0
    }

    & $git add -A

    $staged = & $git diff --cached --name-only
    if ([string]::IsNullOrWhiteSpace($staged)) {
        Write-AutoSaveLog "No staged changes after add."
        exit 0
    }

    $message = "auto save $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    & $git commit -m $message
    & $git push

    Write-AutoSaveLog "Saved and pushed: $message"
}
catch {
    Write-AutoSaveLog "ERROR: $($_.Exception.Message)"
    exit 1
}

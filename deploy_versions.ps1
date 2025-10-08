#!/usr/bin/env pwsh
param(
    [string]$Frontend,
    [string]$Backend
)

# Set error action preference to stop on errors
$ErrorActionPreference = "Stop"

# Check required parameters
if (-not $Frontend -or -not $Backend) {
    Write-Host "Usage: .\deploy_versions.ps1 -Frontend 1.2.3 -Backend 2.3.4"
    exit 1
}

Write-Host "Frontend Version: $Frontend"
Write-Host "Backend Version: $Backend"

# Check required environment variables
$SSH_HOST = $env:SSH_HOST
$SSH_USER = $env:SSH_USER
$REGISTRY = if ($env:REGISTRY) { $env:REGISTRY } else { "feelsthegame.com:5000" }

if (-not $SSH_HOST) {
    throw "SSH_HOST environment variable must be set"
}
if (-not $SSH_USER) {
    throw "SSH_USER environment variable must be set"
}

Write-Host "SSH Host: $SSH_HOST"
Write-Host "SSH User: $SSH_USER"
Write-Host "Registry: $REGISTRY"
Write-Host "Authentication: Using PuTTY Pageant"

# Create remote deployment script
$remoteScript = @"
set -euo pipefail
FRONT_VER="$Frontend"
BACK_VER="$Backend"
REGISTRY="$REGISTRY"

APP_ROOT="/var/www/app"                 # host Nginx serves from here
RELEASE_DIR="`${APP_ROOT}-releases"      # e.g., /var/www/app-releases/app-1.2.3
CURRENT_LINK="`${APP_ROOT}"              # symlink -> current

mkdir -p "`$RELEASE_DIR"

echo "== Backend `${BACK_VER} =="
docker login "`${REGISTRY}"
docker pull "`${REGISTRY}/backend:`${BACK_VER}"

# Compose file expected at /home/ubuntu/directsupport/docker-compose.yml (no Nginx service inside)
cd /home/ubuntu/directsupport
# Ensure .env runtime exists here (with secrets!)
docker compose pull api || true
# force image tag for api service (override file) then recreate
cat > docker-compose.override.yml <<EOF
services:
  api:
    image: `${REGISTRY}/backend:`${BACK_VER}
EOF
docker compose up -d api
docker image prune -f || true

echo "== Frontend `${FRONT_VER} =="
docker pull "`${REGISTRY}/frontend:`${FRONT_VER}"
CID=`$(docker create "`${REGISTRY}/frontend:`${FRONT_VER}")
TARGET="`${RELEASE_DIR}/app-`${FRONT_VER}"
rm -rf "`${TARGET}"
mkdir -p "`${TARGET}"
docker cp "`$CID":/artifact/. "`${TARGET}/"
docker rm "`$CID" >/dev/null

# flip symlink atomically
ln -sfn "`${TARGET}" "`${CURRENT_LINK}"

# sanity check index
test -f "`${CURRENT_LINK}/index.html"

# reload nginx
nginx -t && systemctl reload nginx
echo "Deployed frontend `${FRONT_VER} and backend `${BACK_VER}"
"@

# Write remote script to temporary file
$tempScript = ".remote_deploy.sh"
$remoteScript | Out-File -FilePath $tempScript -Encoding utf8

try {
    Write-Host "Connecting to remote server and executing deployment..."
    
    # Use plink (PuTTY's SSH client) which works with Pageant
    Write-Host "Using plink with Pageant authentication..."
    $plinkArgs = @(
        "-batch",  # Non-interactive mode
        "$SSH_USER@$SSH_HOST",
        "bash -s"
    )
    
    Get-Content $tempScript | plink @plinkArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Plink deployment failed with exit code $LASTEXITCODE"
    }
    
    Write-Host "Done."
    
} finally {
    # Clean up temporary script
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
    }
}
"@
#!/usr/bin/env pwsh
param(
    [string]$REGISTRY = "feelsthegame.com:5000",
    [string]$IMAGE_NAME = $null,
    [string]$VERSION_FILE = "VERSION",
    [string]$SRC_DIR = "."
)

# Set error action preference to stop on errors
$ErrorActionPreference = "Stop"

# Get image name from git repo if not provided
if (-not $IMAGE_NAME) {
    try {
        $gitRoot = git rev-parse --show-toplevel
        $IMAGE_NAME = Split-Path -Leaf $gitRoot
    } catch {
        $IMAGE_NAME = Split-Path -Leaf (Get-Location)
    }
}

Write-Host "Registry: $REGISTRY"
Write-Host "Image Name: $IMAGE_NAME"
Write-Host "Version File: $VERSION_FILE"
Write-Host "Source Directory: $SRC_DIR"

# 1) Version bump (semver patch)
if (-not (Test-Path $VERSION_FILE)) {
    "0.0.0" | Out-File -FilePath $VERSION_FILE -Encoding utf8 -NoNewline
}

$OLD_VER = Get-Content $VERSION_FILE -Raw
$OLD_VER = $OLD_VER.Trim()
$versionParts = $OLD_VER.Split('.')
$MAJ = [int]$versionParts[0]
$MIN = [int]$versionParts[1]
$PAT = [int]$versionParts[2]
$NEW_VER = "$MAJ.$MIN.$($PAT + 1)"

$NEW_VER | Out-File -FilePath $VERSION_FILE -Encoding utf8 -NoNewline
Write-Host "Version: $OLD_VER -> $NEW_VER"

# 2) Set APP_VERSION environment variable for build
Write-Host "Setting APP_VERSION environment variable to $NEW_VER"
$env:APP_VERSION = $NEW_VER

# 2.1) Compile embed script with version replacement
Write-Host "Compiling embed script with version $NEW_VER..."
if (Test-Path "scripts\compile-embed.mjs") {
    node "scripts\compile-embed.mjs" $NEW_VER
    if ($LASTEXITCODE -ne 0) {
        throw "Embed script compilation failed"
    }
} else {
    Write-Warning "Embed compilation script not found, skipping..."
}

# 3) Merge env (.env then prod.env overrides)
Write-Host "Processing environment files..."
if (Test-Path "build.env") {
    Remove-Item "build.env"
}
New-Item "build.env" -ItemType File | Out-Null

$envVars = @{}

# Read .env file
if (Test-Path ".env") {
    Write-Host "Reading .env file..."
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
}

# Read prod.env file (overrides .env)
if (Test-Path "prod.env") {
    Write-Host "Reading prod.env file..."
    Get-Content "prod.env" | ForEach-Object {
        if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $envVars[$matches[1]] = $matches[2]
        }
    }
}

# Add APP_VERSION to env vars
$envVars["APP_VERSION"] = $NEW_VER

# Write merged env vars to build.env
foreach ($key in $envVars.Keys) {
    "$key=$($envVars[$key])" | Out-File -FilePath "build.env" -Append -Encoding utf8
}

# 4) Docker login and build
Write-Host "Logging into Docker registry..."
docker login $REGISTRY
if ($LASTEXITCODE -ne 0) {
    throw "Docker login failed"
}

$TAG = "$REGISTRY/${IMAGE_NAME}:${NEW_VER}"

# Build args: create array of build arguments
$BUILD_ARGS = @()
if (Test-Path "build.env") {
    Get-Content "build.env" | ForEach-Object {
        if ($_ -match "^([A-Za-z_][A-Za-z0-9_]*)=(.*)$") {
            $BUILD_ARGS += "--build-arg"
            $BUILD_ARGS += "$($matches[1])=$($matches[2])"
        }
    }
}

Write-Host "Building $TAG"
$env:DOCKER_BUILDKIT = "1"
& docker build @BUILD_ARGS -t $TAG .
if ($LASTEXITCODE -ne 0) {
    throw "Docker build failed"
}

Write-Host "Pushing $TAG"
docker push $TAG
if ($LASTEXITCODE -ne 0) {
    throw "Docker push failed"
}

# 5) Output for CI
Write-Host "::set-output name=version::$NEW_VER"
Write-Host "Built and pushed $TAG"
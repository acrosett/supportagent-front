#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// google-closure-compiler is ESM; we'll import dynamically where needed

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get version and environment from command line arguments
const version = process.argv[2]
const env = process.argv[3] || 'dev'

if (!version) {
  console.error('[compile-embed] Usage: node compile-embed.mjs <version> [env=dev|prod]')
  process.exit(1)
}

console.log(`[compile-embed] Environment: ${env}`)

// Resolve inputs/outputs
const repoRoot = path.resolve(__dirname, '..')
const publicDir = path.join(repoRoot, 'public')
const sourceFile = path.join(repoRoot, 'embed_source.js')
const htmlSourceFile = path.join(publicDir, 'landing', 'index_source.html')

// Write to both .output/public and public directories to avoid confusion
const outputDirCandidates = [
  path.join(repoRoot, '.output', 'public'),
  publicDir
]

// Filter to existing directories
const outputDirs = (await Promise.all(outputDirCandidates.map(async d => {
  try { const stat = await fs.stat(d); return stat.isDirectory() ? d : null } catch { return null }
}))).filter(Boolean)

// If no directories exist, use public as fallback
if (outputDirs.length === 0) {
  outputDirs.push(publicDir)
}

console.log(`[compile-embed] Will write to ${outputDirs.length} location(s): ${outputDirs.map(d => path.relative(repoRoot, d)).join(', ')}`)

// Load environment variables
async function loadEnvVars(environment) {
  const envVars = {}
  
  // Read .env file first
  const envFile = path.join(repoRoot, '.env')
  try {
    const envContent = await fs.readFile(envFile, 'utf8')
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (match) {
        envVars[match[1]] = match[2]
      }
    })
    console.log(`[compile-embed] Loaded ${Object.keys(envVars).length} variables from .env`)
  } catch (error) {
    console.warn(`[compile-embed] Could not read .env file: ${error.message}`)
  }
  
  // If prod environment, read prod.env to override
  if (environment === 'prod') {
    const prodEnvFile = path.join(repoRoot, 'prod.env')
    try {
      const prodEnvContent = await fs.readFile(prodEnvFile, 'utf8')
      let overrideCount = 0
      prodEnvContent.split('\n').forEach(line => {
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
        if (match) {
          if (envVars[match[1]]) overrideCount++
          envVars[match[1]] = match[2]
        }
      })
      console.log(`[compile-embed] Loaded prod.env with ${overrideCount} overrides`)
    } catch (error) {
      console.warn(`[compile-embed] Could not read prod.env file: ${error.message}`)
    }
  }
  
  return envVars
}

// Replace environment variables in content
function replaceEnvVars(content, envVars) {
  let replacedContent = content
  let replacementCount = 0
  
  // Replace $ENV_<VARNAME> with actual values
  Object.keys(envVars).forEach(varName => {
    const pattern = new RegExp(`\\$ENV_${varName}`, 'g')
    const matches = replacedContent.match(pattern)
    if (matches) {
      replacedContent = replacedContent.replace(pattern, envVars[varName])
      replacementCount += matches.length
      console.log(`[compile-embed] Replaced $ENV_${varName} with "${envVars[varName]}" (${matches.length} occurrences)`)
    }
  })
  
  if (replacementCount === 0) {
    console.log(`[compile-embed] No $ENV_ variables found to replace`)
  }
  
  return replacedContent
}

async function ensureSourceExists() {
  try {
    await fs.access(sourceFile)
  } catch {
    console.error(`[compile-embed] JS source not found: ${path.relative(repoRoot, sourceFile)}`)
    process.exitCode = 1
    return false
  }
  return true
}

async function ensureHtmlSourceExists() {
  try {
    await fs.access(htmlSourceFile)
  } catch {
    console.error(`[compile-embed] HTML source not found: ${path.relative(repoRoot, htmlSourceFile)}`)
    process.exitCode = 1
    return false
  }
  return true
}

// Process HTML files with environment variables
async function processHtmlFiles() {
  if (!(await ensureHtmlSourceExists())) {
    console.warn(`[compile-embed] Skipping HTML processing - source file not found`)
    return
  }

  console.log(`[compile-embed] Processing HTML files...`)
  
  // Read HTML source
  const htmlContent = await fs.readFile(htmlSourceFile, 'utf8')
  
  // Process for dev environment (only .env)
  const devEnvVars = await loadEnvVars('dev')
  const devHtmlContent = replaceEnvVars(htmlContent, devEnvVars)
  
  // Process for prod environment (.env + prod.env)
  const prodEnvVars = await loadEnvVars('prod')
  const prodHtmlContent = replaceEnvVars(htmlContent, prodEnvVars)
  
  // Write to all output directories
  for (const outDir of outputDirs) {
    const htmlOutDir = path.join(outDir, 'landing')
    await fs.mkdir(htmlOutDir, { recursive: true })
    
    const htmlOutFileDev = path.join(htmlOutDir, 'index_dev.html')
    const htmlOutFileProd = path.join(htmlOutDir, 'index.html')
    
    await fs.writeFile(htmlOutFileDev, devHtmlContent, 'utf8')
    console.log(`[compile-embed] Created ${path.relative(repoRoot, htmlOutFileDev)}`)
    
    await fs.writeFile(htmlOutFileProd, prodHtmlContent, 'utf8')
    console.log(`[compile-embed] Created ${path.relative(repoRoot, htmlOutFileProd)}`)
  }
}

async function runClosure() {
  console.log(`[compile-embed] Compiling embed.js (SIMPLE_OPTIMIZATIONS) ...`)
  
  // Load environment variables
  const envVars = await loadEnvVars(env)
  
  // Read and preprocess the source file
  let sourceContent = await fs.readFile(sourceFile, 'utf8')
  
  // Replace environment variables first
  sourceContent = replaceEnvVars(sourceContent, envVars)
  
  // Write preprocessed source to a temporary file
  const tempSourceFile = path.join(repoRoot, 'temp_embed_source.js')
  await fs.writeFile(tempSourceFile, sourceContent, 'utf8')
  
  try {
    const { compiler: ClosureCompiler } = await import('google-closure-compiler')
    const cc = new ClosureCompiler({
      js: tempSourceFile,
      compilation_level: 'SIMPLE_OPTIMIZATIONS',
      language_in: 'ECMASCRIPT_NEXT',
      language_out: 'ECMASCRIPT_2019',
      warning_level: 'QUIET'
    })

    const result = await new Promise((resolve) => {
      cc.run((exitCode, stdOut, stdErr) => resolve({ exitCode, stdOut, stdErr }))
    })

    if (result.stdErr) process.stderr.write(result.stdErr)
    if (result.exitCode !== 0) {
      console.error(`[compile-embed] Closure compilation failed with code ${result.exitCode}.`)
      process.exitCode = result.exitCode || 1
      return
    }

    // Replace CURRENT_VERSION_STRING with actual version
    const finalOutput = result.stdOut.replace(/CURRENT_VERSION_STRING/g, version.replace(/"/g, '\\"'))
    
    // Write to all output directories
    for (const outDir of outputDirs) {
      const outFile = path.join(outDir, 'embed.js')
      await fs.mkdir(path.dirname(outFile), { recursive: true })
      await fs.writeFile(outFile, finalOutput, 'utf8')
      console.log(`[compile-embed] Created ${path.relative(repoRoot, outFile)}`)
    }
    
    console.log(`[compile-embed] Replaced CURRENT_VERSION_STRING with ${version}`)
    
    // Show size comparison using the source file
    const sourceStats = await fs.stat(sourceFile)
    const outputSizeKB = (finalOutput.length / 1024).toFixed(1)
    const sourceSizeKB = (sourceStats.size / 1024).toFixed(1)
    const savings = ((sourceStats.size - finalOutput.length) / 1024).toFixed(1)
    const savingsPercent = (((sourceStats.size - finalOutput.length) / sourceStats.size) * 100).toFixed(1)
    
    console.log(`[compile-embed] Size: ${sourceSizeKB}KB → ${outputSizeKB}KB (saved ${savings}KB, ${savingsPercent}%)`)
  } finally {
    // Clean up temporary file
    try {
      await fs.unlink(tempSourceFile)
    } catch (error) {
      console.warn(`[compile-embed] Could not delete temp file: ${error.message}`)
    }
  }
}

// Process HTML files first
await processHtmlFiles()

// Process JS embed file
if (await ensureSourceExists()) {
  await runClosure()
}

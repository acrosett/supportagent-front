#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
// google-closure-compiler is ESM; we'll import dynamically where needed

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Get version from command line argument
const version = process.argv[2]
if (!version) {
  console.error('[compile-embed] Usage: node compile-embed.mjs <version>')
  process.exit(1)
}

// Resolve inputs/outputs
const repoRoot = path.resolve(__dirname, '..')
const publicDir = path.join(repoRoot, 'public')
const sourceFile = path.join(publicDir, 'embed_source.js')

// Prefer writing to .output/public if it exists (after nuxt build/generate), else public
const outputDirCandidates = [
  path.join(repoRoot, '.output', 'public'),
  publicDir
]

const outDir = (await Promise.all(outputDirCandidates.map(async d => {
  try { const stat = await fs.stat(d); return stat.isDirectory() ? d : null } catch { return null }
}))).find(Boolean) || publicDir

const outFile = path.join(outDir, 'embed.js')

async function ensureSourceExists() {
  try {
    await fs.access(sourceFile)
  } catch {
    console.error(`[compile-embed] Source not found: ${path.relative(repoRoot, sourceFile)}`)
    process.exitCode = 1
    return false
  }
  return true
}

async function runClosure() {
  console.log(`[compile-embed] Compiling to ${path.relative(repoRoot, outFile)} (SIMPLE_OPTIMIZATIONS) ...`)
  const { compiler: ClosureCompiler } = await import('google-closure-compiler')
  const cc = new ClosureCompiler({
    js: sourceFile,
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

  await fs.mkdir(path.dirname(outFile), { recursive: true })
  
  // Replace CURRENT_VERSION_STRING with actual version
  const finalOutput = result.stdOut.replace(/CURRENT_VERSION_STRING/g, version)
  await fs.writeFile(outFile, finalOutput, 'utf8')
  
  console.log(`[compile-embed] Replaced CURRENT_VERSION_STRING with ${version}`)
  
  // Show size comparison
  const sourceStats = await fs.stat(sourceFile)
  const outputStats = await fs.stat(outFile)
  const sourceSizeKB = (sourceStats.size / 1024).toFixed(1)
  const outputSizeKB = (outputStats.size / 1024).toFixed(1)
  const savings = ((sourceStats.size - outputStats.size) / 1024).toFixed(1)
  const savingsPercent = (((sourceStats.size - outputStats.size) / sourceStats.size) * 100).toFixed(1)
  
  console.log(`[compile-embed] Size: ${sourceSizeKB}KB → ${outputSizeKB}KB (saved ${savings}KB, ${savingsPercent}%)`)
}

if (await ensureSourceExists()) {
  await runClosure()
}

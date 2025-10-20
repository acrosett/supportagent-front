#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

/**
 * Script to detect missing English translations in Vue files
 * 
 * This script:
 * 1. Scans all Vue files for useLocalNamespaceAsync calls to get namespace
 * 2. Finds all t('key') usage in each file  
 * 3. Checks if corresponding keys exist in i18n/locales/en/{namespace}.json
 * 4. Reports missing translation keys (assumes translation files exist)
 */

const PROJECT_ROOT = process.cwd()
const LOCALES_DIR = path.join(PROJECT_ROOT, 'i18n', 'locales', 'en')

// Regex patterns
const NAMESPACE_PATTERN = /useLocalNamespaceAsync\(['"`]([^'"`]+)['"`]\)/g
const T_CALL_PATTERN = /\bt\(['"`]([^'"`]+)['"`]\)/g

/**
 * Extract namespace from Vue file content
 */
function extractNamespace(content) {
  const matches = [...content.matchAll(NAMESPACE_PATTERN)]
  return matches.length > 0 ? matches[0][1] : null
}

/**
 * Extract all t() calls from Vue file content
 */
function extractTranslationKeys(content) {
  const keys = new Set()
  const matches = [...content.matchAll(T_CALL_PATTERN)]
  
  for (const match of matches) {
    keys.add(match[1])
  }
  
  return Array.from(keys)
}

/**
 * Check if a nested key exists in translation object
 */
function hasNestedKey(obj, keyPath) {
  const parts = keyPath.split('.')
  let current = obj
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part]
    } else {
      return false
    }
  }
  
  return true
}

/**
 * Load translation file for a namespace
 */
function loadTranslationFile(namespace) {
  const filePath = path.join(LOCALES_DIR, `${namespace}.json`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message)
    return null
  }
}

/**
 * Analyze a single Vue file
 */
function analyzeVueFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const namespace = extractNamespace(content)
  
  // Skip files without useLocalNamespaceAsync
  if (!namespace) {
    return null
  }
  
  const translationKeys = extractTranslationKeys(content)
  
  // Skip files without t() calls
  if (translationKeys.length === 0) {
    return null
  }
  
  const translations = loadTranslationFile(namespace)
  
  if (!translations) {
    return {
      file: filePath,
      namespace,
      translationKeys,
      missingKeys: translationKeys,
      error: `Translation file i18n/locales/en/${namespace}.json not found or invalid`
    }
  }
  
  const missingKeys = translationKeys.filter(key => !hasNestedKey(translations, key))
  
  // Only return results if there are missing keys
  if (missingKeys.length === 0) {
    return null
  }
  
  return {
    file: filePath,
    namespace,
    translationKeys,
    missingKeys
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Scanning for missing English translations...\n')
  
  // Find all Vue files
  const vueFiles = await glob('**/*.vue', {
    cwd: PROJECT_ROOT,
    ignore: ['node_modules/**', 'dist/**', '.nuxt/**', '.output/**']
  })
  
  const results = []
  let totalMissing = 0
  
  for (const file of vueFiles) {
    const filePath = path.join(PROJECT_ROOT, file)
    const result = analyzeVueFile(filePath)
    
    // Only add results with issues
    if (result) {
      results.push(result)
      totalMissing += result.missingKeys?.length || 0
    }
  }
  
  // Report results
  if (results.length === 0) {
    console.log('✅ All translations found! No missing keys detected.')
    return
  }
  
  console.log(`❌ Found ${totalMissing} missing translation keys in ${results.length} files:\n`)
  
  for (const result of results) {
    const relativePath = path.relative(PROJECT_ROOT, result.file)
    
    if (result.error) {
      console.log(`📄 ${relativePath}`)
      console.log(`   ❌ ${result.error}`)
      console.log(`   🔑 Keys that need translation: ${result.translationKeys.join(', ')}\n`)
      continue
    }
    
    console.log(`📄 ${relativePath}`)
    console.log(`   📦 Namespace: ${result.namespace}`)
    console.log(`   📁 Translation file: i18n/locales/en/${result.namespace}.json`)
    console.log(`   ❌ Missing keys (${result.missingKeys.length}):`)
    for (const key of result.missingKeys) {
      console.log(`      - "${key}"`)
    }
    console.log()
  }
  
  // Summary
  console.log(`📊 Summary:`)
  console.log(`   Files with missing keys: ${results.length}`)
  console.log(`   Total missing translation keys: ${totalMissing}`)
  
  if (totalMissing > 0) {
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Add the missing keys to their respective translation files`)
    console.log(`   2. Run the French translation script: node scripts/translate-pages.mjs locale fr`)
  }
}

// Run the script
main().catch(error => {
  console.error('Script error:', error)
  process.exit(1)
})
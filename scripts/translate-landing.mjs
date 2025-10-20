#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Load environment variables
config();



/**
 * Translate multiple texts using DeepL API (batch translation)
 * @param {string[]} texts 
 * @param {string} targetLang 
 * @returns {Promise<string[]>}
 */
async function translateBatchWithDeepL(texts, targetLang) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY not found in environment variables');
  }
  
  const url = 'https://api-free.deepl.com/v2/translate';
  
  const formData = new URLSearchParams();
  formData.append('auth_key', apiKey);
  
  // Add each text as a separate 'text' parameter
  texts.forEach(text => {
    formData.append('text', text);
  });
  
  formData.append('source_lang', 'EN');
  formData.append('target_lang', targetLang.toUpperCase());
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepL API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    return data.translations.map(t => t.text);
  } catch (error) {
    console.error(`❌ Batch translation failed:`, error.message);
    // Return original texts if translation fails
    return texts;
  }
}

/**
 * Create or update translation file for a specific locale
 * @param {string} locale 
 */
async function createTranslationFile(locale) {
  try {
    console.log(`🌍 Creating/updating translation file for locale: ${locale}`);
    
    // Read base key mappings
    const basePath = path.join(projectRoot, 'i18n', 'locales', 'index.base.json');
    const baseKeyMap = JSON.parse(await fs.readFile(basePath, 'utf-8'));
    
    // Read existing translation file if it exists
    const translationPath = path.join(projectRoot, 'i18n', 'locales', `index.${locale}.json`);
    let existingTranslations = {};
    
    try {
      const existingContent = await fs.readFile(translationPath, 'utf-8');
      existingTranslations = JSON.parse(existingContent);
      console.log(`📖 Found existing translations: ${Object.keys(existingTranslations).length}`);
    } catch (error) {
      console.log(`📝 Creating new translation file for ${locale}`);
    }
    
    const newTranslations = {};
    let translatedCount = 0;
    let skippedCount = 0;
    
    // Find strings that need translation
    const textsToTranslate = [];
    const keyToTextMap = {};
    
    Object.entries(baseKeyMap).forEach(([key, originalText]) => {
      if (existingTranslations[key]) {
        // Use existing translation
        newTranslations[key] = existingTranslations[key];
        skippedCount++;
      } else {
        // Mark for translation
        textsToTranslate.push(originalText);
        keyToTextMap[originalText] = key;
      }
    });
    
    // Batch translate all missing translations
    if (textsToTranslate.length > 0) {
      console.log(`🔄 Batch translating ${textsToTranslate.length} strings...`);
      
      // Split into smaller batches to avoid API limits (DeepL supports up to 50 texts per request)
      const batchSize = 50; // Use the full API limit
      const batches = [];
      
      for (let i = 0; i < textsToTranslate.length; i += batchSize) {
        batches.push(textsToTranslate.slice(i, i + batchSize));
      }
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} strings)`);
        
        const translations = await translateBatchWithDeepL(batch, locale);
        
        // Map translations back to keys
        batch.forEach((originalText, index) => {
          const key = keyToTextMap[originalText];
          newTranslations[key] = translations[index];
          translatedCount++;
        });
        
        // Add delay between batches to be respectful to the API
        if (batchIndex < batches.length - 1) {
          console.log('⏳ Waiting before next batch...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // Save updated translation file
    await fs.writeFile(translationPath, JSON.stringify(newTranslations, null, 2));
    
    console.log(`✅ Translation file updated:`);
    console.log(`   📊 New translations: ${translatedCount}`);
    console.log(`   📊 Existing translations: ${skippedCount}`);
    console.log(`   📂 File: ${translationPath}`);
    
  } catch (error) {
    console.error(`❌ Error creating translation file for ${locale}:`, error);
    throw error;
  }
}

/**
 * Generate localized HTML files from index_source.html template
 * NOTE: This function is deprecated. HTML generation moved to compile-embed.mjs
 */
async function generateLocalizedFiles() {
  console.log('⚠️  HTML generation has been moved to compile-embed.mjs');
  console.log('   Use: node scripts/compile-embed.mjs <version> [env]');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'translate':
        const locale = args[1];
        if (!locale) {
          console.error('❌ Please specify a locale (e.g., fr, es, de)');
          process.exit(1);
        }
        await createTranslationFile(locale);
        break;
        
      case 'all':
        const locales = args.slice(1);
        if (locales.length === 0) {
          console.error('❌ Please specify locales (e.g., fr es de)');
          process.exit(1);
        }
        
        for (const locale of locales) {
          await createTranslationFile(locale);
        }
        console.log('\n✅ All translations updated!');
        console.log('💡 Run compile-embed.mjs to generate localized HTML files');
        break;
        
      default:
        console.log(`
🌍 Landing Page Translation Tool

Usage:
  node scripts/translate-landing.mjs translate <locale>        # Create/update translation for locale
  node scripts/translate-landing.mjs all <locale1> <locale2>   # Translate all locales

Examples:
  node scripts/translate-landing.mjs translate fr
  node scripts/translate-landing.mjs all fr es de

Environment Variables:
  DEEPL_API_KEY - Required for translation

Note: 
  - HTML generation is now handled by compile-embed.mjs
  - Use: node scripts/compile-embed.mjs <version> [env] to generate localized HTML
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
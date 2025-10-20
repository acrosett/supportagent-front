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

async function translateBatchWithDeepL(textItems, targetLang) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPL_API_KEY not found in environment variables');
  }
  
  const url = 'https://api-free.deepl.com/v2/translate';
  
  const formData = new URLSearchParams();
  formData.append('auth_key', apiKey);
  
  // Add each text and its context as separate parameters
  textItems.forEach(item => {
    formData.append('text', item.text);
    if (item.context) {
      formData.append('context', item.context);
    }
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
    return textItems.map(item => item.text);
  }
}

function generateContextHint(keyPath) {
  return `UI text for: ${keyPath}`;
}

function extractTextsFromJson(obj, textItems, keyToTextMap, existingTranslations, prefix = '') {
  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'string') {
      // Check if translation already exists
      const existingValue = getNestedValue(existingTranslations, fullKey);
      if (!existingValue) {
        const context = generateContextHint(fullKey);
        textItems.push({
          text: value,
          context: context,
          keyPath: fullKey
        });
        keyToTextMap[value] = fullKey;
      }
    } else if (typeof value === 'object' && value !== null) {
      extractTextsFromJson(value, textItems, keyToTextMap, existingTranslations, fullKey);
    }
  });
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

function applyTranslationsToJson(obj, translationMap, existingTranslations = {}) {
  const result = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Use existing translation if available, otherwise use new translation or original
      result[key] = existingTranslations[key] || translationMap[value] || value;
    } else if (typeof value === 'object' && value !== null) {
      result[key] = applyTranslationsToJson(value, translationMap, existingTranslations[key] || {});
    } else {
      result[key] = value;
    }
  });
  
  return result;
}

async function translatePageFile(pageFile, locale) {
  const sourceFile = path.join(projectRoot, 'i18n', 'locales', 'en', pageFile);
  const targetFile = path.join(projectRoot, 'i18n', 'locales', locale, pageFile);
  
  try {
    console.log(`🌍 Translating ${pageFile} for locale: ${locale}`);
    
    // Read source English file
    const sourceContent = await fs.readFile(sourceFile, 'utf-8');
    const sourceData = JSON.parse(sourceContent);
    
    // Skip if source is empty
    if (Object.keys(sourceData).length === 0) {
      console.log(`⏭️  Skipping empty file: ${pageFile}`);
      await fs.writeFile(targetFile, '{}', 'utf-8');
      return;
    }
    
    // Check if target file exists and has content
    let existingTranslations = {};
    try {
      const existingContent = await fs.readFile(targetFile, 'utf-8');
      existingTranslations = JSON.parse(existingContent);
      console.log(`📖 Found existing translations for ${pageFile}`);
    } catch (error) {
      console.log(`📝 Creating new translation file: ${pageFile}`);
    }
    
    // Extract all text strings that need translation (skip existing ones)
    const textItemsToTranslate = [];
    const keyToTextMap = {};
    extractTextsFromJson(sourceData, textItemsToTranslate, keyToTextMap, existingTranslations);
    
    if (textItemsToTranslate.length === 0) {
      console.log(`⏭️  No new text to translate in ${pageFile} (all translations exist)`);
      // Still need to merge existing translations with source structure
      await fs.writeFile(targetFile, JSON.stringify(applyTranslationsToJson(sourceData, {}, existingTranslations), null, 2), 'utf-8');
      return;
    }
    
    // Show context examples for first few items
    console.log(`🔄 Translating ${textItemsToTranslate.length} strings with context...`);
    if (textItemsToTranslate.length > 0) {
      console.log(`📋 Example contexts:`);
      textItemsToTranslate.slice(0, 3).forEach(item => {
        console.log(`   "${item.text}" → ${item.context}`);
      });
    }
    
    // Split into smaller batches to avoid API limits
    const batchSize = 50;
    const batches = [];
    
    for (let i = 0; i < textItemsToTranslate.length; i += batchSize) {
      batches.push(textItemsToTranslate.slice(i, i + batchSize));
    }
    
    const allTranslations = [];
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} strings)`);
      
      const translations = await translateBatchWithDeepL(batch, locale);
      allTranslations.push(...translations);
      
      // Add delay between batches
      if (batchIndex < batches.length - 1) {
        console.log('⏳ Waiting before next batch...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Create translation map
    const translationMap = {};
    textItemsToTranslate.forEach((item, index) => {
      translationMap[item.text] = allTranslations[index];
    });
    
    // Apply translations to create target structure, preserving existing translations
    const translatedData = applyTranslationsToJson(sourceData, translationMap, existingTranslations);
    
    // Save translated file
    await fs.writeFile(targetFile, JSON.stringify(translatedData, null, 2), 'utf-8');
    
    console.log(`✅ Translation completed: ${pageFile} → ${locale}`);
    
  } catch (error) {
    console.error(`❌ Error translating ${pageFile} for ${locale}:`, error);
    throw error;
  }
}

async function translateAllPages(locale) {
  const englishDir = path.join(projectRoot, 'i18n', 'locales', 'en');
  
  try {
    const files = await fs.readdir(englishDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`🌍 Starting translation for locale: ${locale}`);
    console.log(`📄 Found ${jsonFiles.length} files to translate`);
    
    for (const file of jsonFiles) {
      await translatePageFile(file, locale);
    }
    
    console.log(`✅ All translations completed for locale: ${locale}`);
    
  } catch (error) {
    console.error(`❌ Error translating all pages for ${locale}:`, error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'page':
        const pageFile = args[1];
        const locale = args[2];
        
        if (!pageFile || !locale) {
          console.error('❌ Please specify page file and locale');
          console.error('Usage: node scripts/translate-pages.mjs page <file.json> <locale>');
          process.exit(1);
        }
        
        await translatePageFile(pageFile, locale);
        break;
        
      case 'locale':
        const targetLocale = args[1];
        
        if (!targetLocale) {
          console.error('❌ Please specify a locale');
          console.error('Usage: node scripts/translate-pages.mjs locale <locale>');
          process.exit(1);
        }
        
        await translateAllPages(targetLocale);
        break;
        
      case 'all':
        const locales = args.slice(1);
        
        if (locales.length === 0) {
          console.error('❌ Please specify locales');
          console.error('Usage: node scripts/translate-pages.mjs all <locale1> <locale2> ...');
          process.exit(1);
        }
        
        for (const locale of locales) {
          await translateAllPages(locale);
        }
        break;
        
      default:
        console.log(`
🌍 Page Translation Tool

Usage:
  node scripts/translate-pages.mjs page <file.json> <locale>    # Translate single page file
  node scripts/translate-pages.mjs locale <locale>             # Translate all pages for locale  
  node scripts/translate-pages.mjs all <locale1> <locale2>     # Translate all pages for multiple locales

Examples:
  node scripts/translate-pages.mjs page login.json fr
  node scripts/translate-pages.mjs locale fr
  node scripts/translate-pages.mjs all fr es de

Environment Variables:
  DEEPL_API_KEY - Required for translation

Note: 
  - Source files are read from i18n/locales/en/
  - Translations are written to i18n/locales/<locale>/
  - Existing translations are preserved and only missing ones are added
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

main();
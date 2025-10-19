# Landing Page Translation System

This system automatically extracts translatable strings from the landing page HTML and creates localized versions using DeepL API.

## Setup

1. **Get DeepL API Key**: Sign up at [DeepL](https://www.deepl.com/pro#developer) for a free API key
2. **Environment**: Add your API key to `.env` file:
   ```
   DEEPL_API_KEY=your_actual_api_key_here
   ```

## File Structure

```
translations/
├── index.base.json          # Extracted English strings (auto-generated)
├── index.fr.json           # French translations
├── index.es.json           # Spanish translations
└── index.de.json           # German translations

public/landing/
├── index.html              # Original English version
├── index_fr.html           # Generated French version
├── index_es.html           # Generated Spanish version
└── index_de.html           # Generated German version
```

## Usage

### 1. Extract Strings
Extract all translatable strings from `index.html`:
```bash
node scripts/translate-landing.mjs extract
```

### 2. Create Translation for a Locale
Create or update translations for a specific language:
```bash
node scripts/translate-landing.mjs translate fr     # French
node scripts/translate-landing.mjs translate es     # Spanish
node scripts/translate-landing.mjs translate de     # German
node scripts/translate-landing.mjs translate ja     # Japanese
```

### 3. Generate Localized HTML Files
Generate the localized HTML files from translations:
```bash
node scripts/translate-landing.mjs generate
```

### 4. Do Everything at Once
Extract, translate, and generate for multiple locales:
```bash
node scripts/translate-landing.mjs all fr es de ja
```

## How It Works

### String Extraction
The script extracts translatable content from:
- `<title>` tags
- Meta tag content (description, keywords)
- Text content between HTML tags
- Attributes: `alt`, `title`, `placeholder`, `value`, `aria-label`

### Smart Filtering
The system automatically excludes:
- Numbers and dates
- Email addresses
- URLs and domain names
- CSS classes and IDs
- Very short strings (< 2 characters)

### Translation Process
1. **Reads existing translations** to avoid re-translating
2. **Calls DeepL API** only for new strings
3. **Maintains translation mapping** (English → Target Language)
4. **Cleans up obsolete translations** not in base strings

### HTML Generation
- Replaces all strings using the translation mapping
- Updates `lang` attribute to match locale
- Preserves all HTML structure and formatting

## Supported Locales

Common DeepL language codes:
- `fr` - French
- `es` - Spanish  
- `de` - German
- `it` - Italian
- `pt` - Portuguese
- `ru` - Russian
- `ja` - Japanese
- `ko` - Korean
- `zh` - Chinese (simplified)
- `nl` - Dutch
- `pl` - Polish
- `sv` - Swedish
- `da` - Danish
- `fi` - Finnish
- `no` - Norwegian

## Example Workflow

```bash
# 1. Extract strings from HTML
node scripts/translate-landing.mjs extract

# 2. Create French translations  
node scripts/translate-landing.mjs translate fr

# 3. Create Spanish translations
node scripts/translate-landing.mjs translate es

# 4. Generate all localized HTML files
node scripts/translate-landing.mjs generate
```

Or do it all at once:
```bash
node scripts/translate-landing.mjs all fr es de
```

## Cost Optimization

- **Incremental**: Only translates new strings
- **Caching**: Existing translations are preserved
- **Cleanup**: Removes obsolete translations
- **Rate limiting**: Includes delays to respect API limits

## Notes

- The script preserves HTML structure completely
- Translations are stored as key-value maps for easy editing
- Manual translation edits in JSON files are preserved
- Failed translations fall back to original English text
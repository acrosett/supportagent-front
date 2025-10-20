# Internationalization Refactoring Plan

## File Review List (Groups of 7)

### Group 1 - Authentication & User Management ✅ COMPLETED
1. ✅ `pages/login.vue` - Login form and authentication messages
2. ✅ `pages/register.vue` - User registration form and validation
3. ✅ `pages/reset-password.vue` - Password reset functionality
4. ✅ `pages/verify-email.vue` - Email verification page
5. ✅ `pages/account.vue` - User account management and settings
6. ✅ `components/AppMenu.vue` - Navigation menu items and tooltips
7. ✅ `middleware/auth.global.ts` - Authentication middleware messages (no user-facing text)

### Group 2 - Chat & Communication ✅ COMPLETED
1. ✅ `pages/client-chat.vue` - Client chat interface
2. ✅ `pages/test-chat.vue` - Test chat functionality
3. ✅ `pages/conversations.vue` - Conversation list and management
4. ✅ `components/ChatInterface.vue` - Main chat component
5. ✅ `components/ChatMessage.vue` - Individual chat message display
6. ✅ `pages/widget.vue` - Widget configuration page
7. ✅ `components/TestClientSelector.vue` - Client selection for testing

### Group 3 - Content Management ✅ COMPLETED
1. ✅ `pages/faq.vue` - FAQ page and management
2. ✅ `pages/document-upload.vue` - Document upload interface
3. ✅ `pages/custom-tools.vue` - Custom tools configuration
4. ✅ `components/FaqManager.vue` - FAQ management component
5. ✅ `components/CustomToolForm.vue` - Custom tool creation form
6. ✅ `components/DigestFile.vue` - File digest component
7. ✅ `components/RichTextEditor.vue` - Rich text editing component

### Group 4 - Forms & Data Entry ✅ COMPLETED
1. ✅ `components/MegaForm.vue` - Universal form component
2. ✅ `components/ChecklistInput.vue` - Checklist input component (no user-facing strings)
3. ✅ `components/ToggleSwitch.vue` - Toggle switch component (no hardcoded strings)
4. ✅ `components/FieldTooltip.vue` - Form field tooltips (no user-facing strings)
5. ✅ `components/CheckBoxColumn.vue` - Checkbox column component (no user-facing strings)
6. N/A `components/TrainingDataPanel.vue` - Training data management (file not found)
7. ✅ `components/TagManager.vue` - Tag management component

### Group 5 - Issues & Support ✅ COMPLETED
1. ✅ `pages/issues.vue` - Issues list and overview (already completed)
2. ✅ `pages/issue.vue` - Individual issue page (already completed)
3. ✅ `pages/contact-priority.vue` - Contact priority settings (already completed)
4. ✅ `pages/notifications.vue` - Notifications management
5. ✅ `pages/edit-notifications.vue` - Notification editing
6. ✅ `components/Toast.vue` - Toast notification component (no user-facing strings)
7. ✅ `components/ConfirmPopup.vue` - Confirmation dialog component

### Group 6 - Admin & Utilities ✅ COMPLETED
1. ✅ `pages/logs.vue` - System logs and monitoring
2. ✅ `pages/debug.vue` - Debug information page
3. ✅ `pages/funds.vue` - Financial/funds management
4. ✅ `pages/edit-product.vue` - Product editing interface
5. ✅ `components/LlmLogsPopup.vue` - LLM logs popup
6. ✅ `components/AppPagination.vue` - Pagination component
7. ✅ `pages/coming-soon.vue` - Coming soon placeholder

### Group 7 - Miscellaneous & Testing
1. `pages/index.vue` - Home/dashboard page  
2. `pages/test-imagecard.vue` - Image card testing
3. `components/ImageCard.vue` - Image card component
4. `components/AppButton.vue` - Reusable button component
5. `components/AppIcon.vue` - Icon component
6. `components/AppPopup.vue` - Generic popup component
7. `layouts/default.vue` - Default page layout

### Group 8 - Layout & Structure  
1. `layouts/bare.vue` - Minimal layout
2. Additional components or files discovered during refactoring

---

## Agent Instructions for i18n Refactoring

### Overview
You are tasked with refactoring Vue.js pages and components to support internationalization using Nuxt i18n. Focus ONLY on English translations - other languages will be handled separately.

### Setup Information
- **i18n Module**: `@nuxtjs/i18n` is already configured
- **Translation Function**: Use `$t()` for translations
- **Key Format**: Use descriptive, hierarchical keys (e.g., `form.fields.email.label`)

### Your Tasks

#### 1. **Identify Translatable Content**
Extract all user-facing text strings including:
- Page titles and headings
- Form labels and placeholders
- Button text
- Error messages
- Success messages
- Tooltips and help text
- Navigation items
- Status messages
- Validation messages

#### 2. **Create Translation Keys**
Follow these naming conventions:
```javascript
{
  "page": {
    "title": "Page Title",
    "subtitle": "Page Subtitle"
  },
  "form": {
    "fields": {
      "email": {
        "label": "Email Address",
        "placeholder": "Enter your email",
        "validation": {
          "required": "Email is required",
          "invalid": "Please enter a valid email"
        }
      }
    },
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "messages": {
    "success": "Operation completed successfully",
    "error": "An error occurred"
  }
}
```

#### 3. **Replace Hardcoded Strings**
Transform code like this:
```vue
<!-- BEFORE -->
<h1>User Account</h1>
<button>Save Changes</button>
<p v-if="error">Something went wrong</p>

<!-- AFTER -->
<h1>{{ $t('account.title') }}</h1>
<button>{{ $t('account.buttons.save') }}</button>
<p v-if="error">{{ $t('account.messages.error') }}</p>
```

#### 4. **Handle Dynamic Content**
For pluralization:
```vue
<!-- Use plural forms -->
<p>{{ $t('messages.itemCount', { count: items.length }) }}</p>
```

For interpolation:
```vue
<!-- Include variables -->
<p>{{ $t('messages.welcome', { name: user.name }) }}</p>
```

#### 5. **Update Each File**
For each file in your assigned group:

1. **Analyze** the file for all translatable content
2. **Create** the corresponding JSON translation file in `public/translations/en/[filename].json`
3. **Replace** hardcoded strings with `$t()` calls
4. **Test** that the keys are properly structured
5. **Document** any complex cases or decisions made

#### 6. **Translation File Structure**
Each translation file should be organized logically:
```json
{
  "meta": {
    "title": "Page Title for <title> tag",
    "description": "Meta description"
  },
  "page": {
    "heading": "Main Page Heading",
    "subheading": "Subheading text"
  },
  "navigation": {
    "back": "Back",
    "next": "Next"  
  },
  "form": {
    "fields": { /* field-specific translations */ },
    "buttons": { /* button text */ },
    "validation": { /* validation messages */ }
  },
  "messages": {
    "success": { /* success messages */ },
    "error": { /* error messages */ },
    "info": { /* info messages */ }
  }
}
```

### Important Guidelines

#### ✅ DO:
- Use descriptive, hierarchical keys
- Extract ALL user-visible text
- Include aria-labels and accessibility text
- Use interpolation for dynamic content
- Group related translations logically
- Keep original functionality intact
- Add comments for complex cases

#### ❌ DON'T:
- Translate console.log messages
- Translate API endpoints or technical identifiers
- Change component logic or functionality  
- Create overly nested key structures
- Duplicate translation keys across files
- Translate variable names or code

### Expected Deliverables
For each file you refactor:

1. **Updated Vue file** with `$t()` calls replacing hardcoded strings
2. **Translation JSON file** in `public/translations/en/[filename].json`
3. **Brief summary** of changes made and any noteworthy decisions

### Example Refactoring

**Before** (`pages/login.vue`):
```vue
<template>
  <div class="login-page">
    <h1>Login to Your Account</h1>
    <form @submit="handleLogin">
      <input type="email" placeholder="Email address" v-model="email">
      <input type="password" placeholder="Password" v-model="password">
      <button type="submit">Sign In</button>
    </form>
    <p v-if="error">Invalid email or password</p>
  </div>
</template>
```

**After** (`pages/login.vue`):
```vue
<template>
  <div class="login-page">
    <h1>{{ $t('login.page.title') }}</h1>
    <form @submit="handleLogin">
      <input 
        type="email" 
        :placeholder="$t('login.form.fields.email.placeholder')" 
        v-model="email"
      >
      <input 
        type="password" 
        :placeholder="$t('login.form.fields.password.placeholder')" 
        v-model="password"
      >
      <button type="submit">{{ $t('login.form.buttons.submit') }}</button>
    </form>
    <p v-if="error">{{ $t('login.messages.error.invalidCredentials') }}</p>
  </div>
</template>
```

**Translation file** (`public/translations/en/login.json`):
```json
{
  "meta": {
    "title": "Login - Support Agent"
  },
  "page": {
    "title": "Login to Your Account"
  },
  "form": {
    "fields": {
      "email": {
        "placeholder": "Email address"
      },
      "password": {
        "placeholder": "Password"
      }
    },
    "buttons": {
      "submit": "Sign In"
    }
  },
  "messages": {
    "error": {
      "invalidCredentials": "Invalid email or password"
    }
  }
}
```

### Getting Started
1. Choose your assigned group of files
2. Start with the first file in the group
3. Follow the refactoring process systematically  
4. Move to the next file once complete
5. Report any issues or questions that arise

Good luck with the refactoring! Focus on thoroughness and consistency.
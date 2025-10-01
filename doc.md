# DirectSupport.ai - User Guide

## What is DirectSupport.ai

DirectSupport.ai is a SAAS that can provide your website with an embedded AI chat. This chat provide your visitor with a direct access to your extensive documentation and can answer any question the visitor has. If the chat agent cannot answer a vistor's issue, it can contact you directly on whatsapp (via the staff-facing agent) to get the missing information. Your documentation is automatically updated in the process.

In addition, the Chat AI Agent can call customs tools that you configured. This way it can perform tasks on behalf of the user, that impacts your application directly. Like a real support Agent.

## Getting Started

Welcome to DirectSupport.ai! This platform helps you create AI-powered customer support for your website. Follow these steps to get started:

### Quick Setup Flow

#### 0. **Enable subscription** on [Funds & Billing](/funds) page.
- Deposit funds if needed (add Funds button).
- Click on Activate subscription, this will use $5 from your balance (renewed each months) and activate your services.

#### 1. **Configure Your Product** - Set up basic product information on the [product](/edit-product) page. 

Your product configuration has the following **fields**:

a. **Product Name** should reflect your brand and what your clients are used to.

b. In **product description** you should put the following info:
--

1. What your product is and does.  
   *Example: Our app helps small businesses manage invoices quickly and securely.*  

2. A few marketing arguments to sell the product + your pricing model.  
   *Example: Save time, reduce errors, and scale your business — all for just $19/month.*  

3. A general overview on how to use your product.  
   *Example:  
   - Go to the **Sign Up** page and create your account.  
   - Verify your email through the confirmation link.  
   - Log in and head to the **Dashboard**.  
   - Navigate to the **Settings** page to connect your bank account.  
   - Go to the **Invoices** page to create your first invoice.  
   - Use the **Reports** page to track payments and business performance.*  

--

This information will always be available to the Client Facing Agent. Since this information is always available, its size also impact your AI Thinking costs directly. For that reason you should not put detailled documentation here, instead integrate your full documentation in the [FAQ](/faq) page.

If you want to tell the chat agent to behave a certain way, do it in the **Additional Instructions** field of the [custom tools](/custom-tools) page.

c. The **Webhook URL** input is for an optional webhook url that point to your application's server.

By default, the DirectSupport.ai chat will treat all users as "guests" with "lowest priority". For better integration and individually tailored support you can provide a webhook to help identify users.

To identify users you must first provide the embedded chat widget with a token identifier (for example an authentication JWT, or anything that can let you retreived the user from your DB).

```javascript
window['AISupportWidget'].setUserToken(token) // call this after page load / user login
```
This token will be sent back to your webhook for validation and user identification.

Our AI queries your **Webhook URL** with the following request:

```javascript
const validateUrl = `${webhookUrl}?userToken=${encodeURIComponent(token)}&sharedSecret=${encodeURIComponent(sharedSecret)}`;

const response = await fetch(validateUrl, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SupportAgent/1.0',
    },
});
```

Then, your webhook should return the following JSON structure:

```typescript
interface WebhookValidationResponse {
    valid: boolean;
    userInfo?: {
        name?: string; 
        email?: string;
        uniqueId: string; // Static unique identifier, sent back in custom tools calls
        priority?: 'lowest' | 'regular' | 'high';
    };
    tokenExpiresMin?: number; // Default 30 min (minimum 5)
}
```

valid indicates that the identification is successfull

name and email will help you identify the client when browsing conversations on DirectSupport.ai or when talking to the staff-facing AI agent.

The uniqueId should let you retreive the user in your database. Ex: id column in user table. If you configure custom tools, this uniqueId will be send back to you so you can identify who is the call for.

priority, defines the level of support this user should be assigned. In [contact & priority](/contact-priority) you can set up different quotas/ message limits for each level of priority, allowing great control over your costs. In addition you can provide different [custom tools](/custom-tools) to each priorities. Also the staff-facing AI agent will contact you on a different channel for each priority (allowing for easy prioritising of answering on your end).

tokenExpiresMin tell us how long we should cache this token on our end (how long it stays valid), this helps reduce the number of time we call your webhook.

d. The **Shared Secret** is a password of your choosing, that is sent along webhook URL requests so you can confirm that the query is coming from us.

e. The **AI Chat Feature** switch enable or disable the embedded chat globally.

#### 2. **Configure Your Contact & Priorities** on the [Contact & Priority](/contact-priority) page. 


Our AI Agents filters trivial support request and will be autonomous most of the time. However when documentation information is missing, or when a client issue cannot be resolved by the AI it will escalate and contact you via whatsapp. You will be talking with Staff-facing agents who oversee every Client-facing agent of their priority.

To enable communication with the staff-facing agent and receive whatsapp message first add and verify your number.
- First make sure you have an existing whatsapp account for this number, you can download it on the playstore or applestore.
- Add your number and click on confirm number -> send whatsapp code. Then on the same page enter the code received.
- Once your number is verified, associate it to each priority configuration (lowest, regular and high). 

Each of these priority can be edited with the following:

**AI Model Selection:**
- **Client-Facing AI**: Choose between Fast (standard) or Smart (2.5x cost, higher reasoning)
- **Staff-Facing AI**: Choose AI model for WhatsApp communication with your staff

**Message Limits:**

- **Daily Global**: Maximum total messages per day across all users
- **Weekly Global**: Maximum total messages per week across all users  
- **Daily Per User**: Maximum messages per day per individual user
- **Weekly Per User**: Maximum messages per week per individual user

These are essentials to control your costs, guest/non identified users are of the "lowest priority", so take notes of these limits to prevent abuse. When limit are reached the use of the embedded chat is disabled for users of that priority.

(We directsupport.ai runs security checks on guest users with google recaptcha V3 to minimize abuse, however we cannot completely stop ill-intentioned use of your embedded chat. 
You can run your own checks for better filtering:
- 1. Disable the Allow Guests proprety on /edit-product 
- 2. Enable your own verification (ex: captcha) on visitors of your site.
- 3. provide a token to our widget (like for identified users) which hold that verification proof
- 4. verify in your webhook the validity of the token, return priority: "lowest"
) 

**Notification Settings:**
- **Documentation Updates**: AI will contact you on whatsapp for documentation updates when needed
- **Issue Contacts**: AI will contact you on whatsapp for assistance on complex issues

**Advanced Settings:**
- **Max History Pages**: Number of chat history pages AI retains before summarizing. Increasing this will improve the memory of the AI, but it will increase your costs.

Once you assigned your verified whatsapp number to each priority you will receive messages from the staff-facing agent, and will be able to assists them whenever they are missing information. They will also alert you if high priority customers are in trouble.


#### 3. **Upload documents to populate your Q&A databse for the AIs to access** on the [Faq](/faq) page. 

The client-facing AIs (embedded chat AI Agents) will get extensive knowledge about your product from this Q&A database. To populate it effortlesly, click on "Upload Document" (/document-upload page), you can upload documents that will be processed by the AI (this have costs on your balance) to build the Q&A. Split it into smaller files, or use the Paste Text tab so you can copy paste relevent pages to be processed. 

You can also create/edit Q&As manually (/faq page). The quality of your Q&As will directly improve the quality of the AI chat support. You create as many Q&A as needed since it will not impact your AI Thinking costs.


#### 4. **Configure Widget** on the [Widget Builder](/widget) page. 
Here your can customize the embedded support widget and copy its code.

Customize your support widget's appearance and behavior before embedding it on your website.

Appearance Settings

- **Position**: Choose widget position (bottom-right, bottom-left, etc.)
- **Size**: Set width and height (default: 400px × 600px)
- **Colors**: 
  - Primary Color: Main accent color
  - Secondary Color: Secondary accent color
- **Icon**: Choose from available widget icons
- **Dark Mode**: Enable/disable dark theme

Behavior Settings

- **Welcome Message**: Customize the initial greeting (default: "👋 Welcome! How can I help you today?")
- **Start Open**: Widget opens automatically when page loads
- **Draggable**: Allow users to move the widget around
- **Sound**: Enable/disable notification sounds
- **Bounce Animation**: 
  - Bounce after init: Delay before initial bounce animation
  - Periodic bounce: Interval for periodic bounce reminders

Embedding the Widget

After configuration:
1. Copy the provided embed snippet
2. Paste it into your website's HTML
3. The widget will appear with your configured settings

##  Pricing
Complete AI Support
$5/month
Base subscription includes all core features

Service	Price
AI thinking (input)	$0.0005/1K tokens
AI thinking (output)	$0.004/1K tokens

$10 free credit awarded when verifying email address, limited stock (not garanteed).


## Other pages in Depth

### /account — Account Settings
The Account page is where individual users manage personal settings and profile details. Key features:
- Profile: Update email; enable 2FA.
- Password: Change your password securely (current password required).


### /conversations — Conversations List
The Conversations page lists all conversations across priorities and clients. Key features:
- Filters and search by client identifier, priority, date or status.
- Quick peek into last messages and conversation status (open/closed/awaiting-staff).
- Disable the AI on a conversation and take over to speak to the client.

---

### /custom-tools — Custom Tools Manager
Custom Tools let you extend the AI with application-specific actions (e.g., fetch order status, create invoices).
Features:
- Configure API/FETCH tools that the AI can call during conversations.
- Set which priority levels can access which tools.
- Add security checks (only allow tools for verified users, etc.).

---

### /edit-notifications — Notification Settings
Manage notification settings (that the system sends to you).


### /funds — Funds & Billing (/funds)
The Funds page manages your billing and subscription state. Core features:
- Add funds to your account using supported payment methods.
- View transaction history and usage summary (AI tokens used).
- Set auto-top-up thresholds and low-balance alerts.


### /login — Login (/login)
Authentication page for staff and admins. Supports:
- Email/password sign-in and password reset flows..


### /register — Register (/register)
Sign-up page for new admin or staff users.

---

### /reset-password — Reset Password (/reset-password)
Password reset flow for staff/users. Initiate a reset via email, then follow the confirmation link to set a new password.

# DirectSupport.ai - User Guide

## What is DirectSupport.ai

DirectSupport.ai is a SAAS that can provide your website with an embedded AI chat. This chat provide your visitor with a direct access to your extensive documentation and can answer any question the visitor has. If the chat agent cannot answer a vistor's issue, it can contact you directly on whatsapp (via the staff-facing agent) to get the missing information. Your documentation is automatically updated in the process.

In addition, the Chat AI Agent can call customs tools that you configured. This way it can perform tasks on behalf of the user, that impacts your application directly. Like a real support Agent.

## Getting Started

Welcome to DirectSupport.ai! This platform helps you create AI-powered customer support for your website. Follow these steps to get started:

### Quick Setup Flow

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


#### 2. **Configure Your Contact & Priorities** on the [Contact & Priority](/contact-priority) page. 


Our AI Agents filters trivial support request and will be autonomous most of the time. However when documentation information is missing, or when a client issue cannot be resolved by the AI it will escalate and contact you via whatsapp. You will be talking with Staff-facing agents who oversee every Client-facing agent of their priority.

To 








2. **Add WhatsApp Numbers** - Connect and verify WhatsApp numbers for customer communication
3. **Configure Client Priorities** - Assign WhatsApp numbers to different customer priority levels
4. **Upload Documentation** - Provide documentation files to auto-generate FAQ responses
5. **Configure Widget** - Customize and embed the support widget on your website

---

## Dashboard Overview

The dashboard provides a central view of your support operations:

- **Account Balance**: Monitor your current balance and usage
- **Message Activity**: View 14-day activity charts showing customer message volume by priority level
- **Quick Access**: Navigate to key features and settings

**Key Actions:**
- Go to Billing to manage funds
- Monitor message volume trends
- Track account balance and usage

---

## Product Configuration

Configure your product's core settings and AI behavior.

### Basic Information

- **Product Name**: Display name for your support service
- **Description**: Detailed product description including:
  - What your product does
  - Marketing arguments and pricing model
  - General usage overview
- **AI Chat Feature**: Enable/disable AI chat functionality

### Security Settings

- **Webhook URL**: Endpoint for validating user tokens (for authenticated users)
- **Shared Secret**: Secret key to secure webhook requests between systems

### Additional AI Instructions

Provide custom instructions that the AI should follow when assisting customers. This helps tailor the AI's responses to your specific business needs.

---

## WhatsApp Setup & Contact Priority

### WhatsApp Number Management

**Adding WhatsApp Numbers:**
1. Click "Add Number" in the WhatsApp Numbers section
2. Enter a display name and phone number (format: +1234567890)
3. Save the number

**Verifying WhatsApp Numbers:**
1. Click "Confirm Number" on an unverified number
2. Click "Send WhatsApp Code" to receive verification via WhatsApp
3. Enter the received code and click "Confirm Number"
4. Only verified numbers can be assigned to priority configurations

### Client Priority Configuration

Configure different service levels for different types of customers:

#### Priority Levels
- **⚪ Lowest Priority**: Basic service level
- **🔵 Regular Priority**: Standard service level  
- **🟡 High Priority**: Premium service level

#### Configuration Options

**WhatsApp Assignment:**
- Assign verified WhatsApp numbers to each priority level
- Each priority can use a different WhatsApp number for communication

**AI Model Selection:**
- **Client-Facing AI**: Choose between Fast (standard) or Smart (2.5x cost, higher reasoning)
- **Staff-Facing AI**: Choose AI model for WhatsApp communication with your staff

**Message Limits:**
- **Daily Global**: Maximum total messages per day across all users
- **Weekly Global**: Maximum total messages per week across all users  
- **Daily Per User**: Maximum messages per day per individual user
- **Weekly Per User**: Maximum messages per week per individual user

**Notification Settings:**
- **Documentation Updates**: AI asks for documentation updates when needed
- **Issue Contacts**: AI requests support assistance for complex issues

**Advanced Settings:**
- **Max History Pages**: Number of chat history pages AI retains before summarizing

---

## Documentation & FAQ Management

### Document Upload & Processing

Upload documentation files to automatically generate FAQ responses:

**Supported Formats:**
- PDF documents
- Word documents (.docx)
- Text files
- Images with text (OCR processing)

**Process:**
1. Navigate to FAQ Management page
2. Click on Document Upload
3. Upload your documentation files
4. The AI processes the content and extracts text
5. Use processed content to update FAQ responses

### FAQ Management

The FAQ system automatically generates responses based on your uploaded documentation:

- **Auto-Generated FAQs**: AI creates FAQ entries from your documentation
- **Manual Editing**: Edit and refine FAQ responses as needed
- **Content Updates**: Regular updates ensure FAQ stays current

---

## User Authentication & Priority Management

### Default Guest Behavior

By default, our chat system handles any new user as a **guest** with the **lowest priority** level. This ensures immediate support availability while maintaining resource management.

### Authenticated User Setup

To treat users with their assigned priority levels, you can implement user authentication using tokens:

#### Frontend Integration

After your page loads, call the widget API to set the user token:

```javascript
window['AISupportWidget'].setUserToken(token)
```

This token will be sent back to your webhook for validation and user identification.

#### Webhook Configuration

Set up authentication in the **Edit Product** page:

1. **Webhook URL**: Your endpoint for user token validation
2. **Shared Secret**: Security key for webhook authentication

#### Webhook Validation Process

Our AI queries your webhook with the following request:

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

#### Expected Webhook Response

Your webhook should return the following JSON structure:

```typescript
interface WebhookValidationResponse {
    valid: boolean;
    userInfo?: {
        name?: string; 
        email?: string;
        unique_id: string; // Static unique identifier, sent back in custom tools calls
        priority?: 'lowest' | 'regular' | 'high';
    };
    tokenExpiresMin?: number; // Default 30 min (minimum 5)
}
```

#### Priority Management

- **Priority Levels**: 'lowest', 'regular', 'high'
- **Quota Configuration**: Edit priority quotas and limits in the **Contact Priority** page
- **Resource Allocation**: Different priorities receive different service levels and message limits

---

## Widget Configuration

Customize your support widget's appearance and behavior before embedding it on your website.

### Appearance Settings

- **Position**: Choose widget position (bottom-right, bottom-left, etc.)
- **Size**: Set width and height (default: 400px × 600px)
- **Colors**: 
  - Primary Color: Main accent color
  - Secondary Color: Secondary accent color
- **Icon**: Choose from available widget icons
- **Dark Mode**: Enable/disable dark theme

### Behavior Settings

- **Welcome Message**: Customize the initial greeting (default: "👋 Welcome! How can I help you today?")
- **Start Open**: Widget opens automatically when page loads
- **Draggable**: Allow users to move the widget around
- **Sound**: Enable/disable notification sounds
- **Bounce Animation**: 
  - Bounce after init: Delay before initial bounce animation
  - Periodic bounce: Interval for periodic bounce reminders

### Embedding the Widget

After configuration:
1. Copy the provided embed snippet
2. Paste it into your website's HTML
3. The widget will appear with your configured settings

---

## Custom Tools & Integrations

### Domain Verification

Verify domains to enable custom tool integrations:

**Verification Methods:**
1. **DNS TXT Record**: Add TXT record with verification string
2. **Webhook Endpoint**: Create endpoint returning verification string

**Setup Process:**
1. Add domain in Custom Tools section
2. Choose verification method:
   - **DNS**: Add TXT record `direct-support-ai-verify=VERIFICATION_STRING`
   - **Webhook**: Create endpoint at `https://yourdomain.com/direct-support-ai-verify-domain`
3. Click "Verify Domain" to confirm setup

### Custom Tool Development

Once domains are verified, you can create custom tools that integrate with your existing systems, allowing the AI to:
- Fetch real-time data from your APIs
- Perform actions on behalf of customers
- Access customer-specific information

---

## Conversations Management

Monitor and manage all customer chat interactions.

### Conversation Overview

- **Real-time Chat Monitoring**: View all active customer conversations
- **Message History**: Access complete conversation histories
- **AI Status**: See whether AI is active or disabled for each conversation
- **Read Status**: Track which conversations have been reviewed

### Filtering Options

- **Read Status**: Filter by read/unread conversations
- **Conversation Status**: Active vs. resolved conversations
- **AI Status**: AI enabled vs. disabled conversations
- **Priority Levels**: Filter by customer priority (Lowest, Regular, High)
- **Search**: Text search across conversation content

### Conversation Actions

- **Mark as Read/Unread**: Manage conversation status
- **Enable/Disable AI**: Control AI participation in specific conversations
- **Archive Conversations**: Move resolved conversations to archive
- **Direct Messaging**: Join conversations to assist customers directly

---

## Issues Tracking

Track and manage support issues that require staff attention.

### Issue Management

- **Issue Status**: Open vs. Resolved issues
- **Tag System**: Organize issues with colored tags
- **Search & Filter**: Find issues quickly using filters and search
- **Archive System**: Keep resolved issues organized

### Issue Workflow

1. **AI Detection**: AI identifies complex issues requiring human attention
2. **Issue Creation**: Automatic or manual issue creation
3. **Staff Assignment**: Issues routed to appropriate staff members
4. **Resolution Tracking**: Track progress from open to resolved
5. **Archive Management**: Maintain historical issue records

---

## Notifications

Stay updated with important alerts and system messages.

### Notification Types

- **System Alerts**: Platform updates and maintenance notifications
- **Balance Warnings**: Low balance and payment alerts
- **Issue Notifications**: New issues requiring attention
- **Configuration Updates**: Changes to product or AI settings
- **Performance Alerts**: Usage and performance notifications

### Notification Management

- **Read Status**: Mark notifications as read
- **Preferences**: Configure which notifications to receive
- **Email Integration**: Receive notifications via email
- **Real-time Updates**: Instant notifications for critical events

---

## Funds & Billing

Manage your account balance and billing settings.

### Account Balance

- **Current Balance**: View real-time account balance
- **Low Balance Warnings**: Alerts when balance is low
- **Usage Tracking**: Monitor spending across different services
- **Balance History**: Track balance changes over time

### Adding Funds

- **Manual Top-up**: Add funds as needed
- **Auto Top-up**: Automatic balance replenishment
  - Set trigger threshold (default: 10% of top-up amount)
  - Configure auto top-up amount
  - Enable/disable auto top-up

### Subscription Management

- **Monthly Subscription**: $5/month base subscription
- **Activation**: Enable recurring monthly billing
- **Status Tracking**: Monitor subscription status
- **Automatic Renewal**: Hassle-free recurring payments

### Transaction History

- **Detailed Records**: Complete transaction history
- **Spending Analytics**: Breakdown of costs by service type
- **Receipt Management**: Download receipts and invoices
- **Usage Reports**: Detailed usage and cost analysis

---

## Account Settings

Manage your personal account settings and security.

### Email Management

- **Email Verification**: Verify your email address for security
- **Email Updates**: Change your account email address
- **Verification Status**: Track email verification status

### Security Settings

- **Password Management**: Update account password
- **Two-Factor Authentication**: Enhanced account security
- **Session Management**: Monitor active login sessions
- **Security Alerts**: Notifications for account security events

### Account Status

- **Deletion Warnings**: Notifications if account is scheduled for deletion
- **Account Recovery**: Options for account restoration
- **Data Export**: Download your account data
- **Support Contact**: Get help with account issues

---

## Best Practices

### Getting the Most from DirectSupport.ai

1. **Complete Setup**: Follow all setup steps for optimal performance
2. **Quality Documentation**: Upload comprehensive, well-organized documentation
3. **Regular Updates**: Keep FAQ and documentation current
4. **Monitor Conversations**: Regularly review AI interactions for improvement opportunities
5. **Balance Management**: Maintain adequate account balance for uninterrupted service
6. **Priority Configuration**: Set appropriate limits for different customer tiers
7. **Custom Instructions**: Provide clear, specific AI guidelines for your business

### Troubleshooting Common Issues

- **WhatsApp Verification Fails**: Ensure WhatsApp is properly configured on the number
- **Widget Not Appearing**: Check embed code placement and syntax
- **AI Not Responding**: Verify account balance and AI chat feature is enabled
- **Domain Verification Issues**: Confirm DNS records or webhook endpoints are correctly configured

---

## Support & Resources

- **Documentation Updates**: This documentation is regularly updated with new features
- **Issue Reporting**: Use the Issues section to report problems or request features
- **Community Support**: Connect with other users through the platform
- **Direct Support**: Contact support team for technical assistance

For additional help, please use the support widget on this platform or contact our support team directly.

---

*Last Updated: September 2025*
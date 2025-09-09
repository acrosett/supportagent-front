(function() {
  'use strict';
  
  // Configuration defaults
  const DEFAULT_CONFIG = {
    width: '400px',
    height: '600px',
    domain: window.location.origin, // Will be replaced with actual domain in production
    brandText: 'Powered by AI Support Agent',
    hideBranding: false,
    position: 'bottom-right',
    zIndex: 1000
  };

  // Find the script tag that loaded this embed
  const getCurrentScript = () => {
    return document.currentScript || 
           document.querySelector('script[src*="embed.js"]') ||
           document.scripts[document.scripts.length - 1];
  };

  // Parse configuration from data attributes
  const parseConfig = (script) => {
    const config = { ...DEFAULT_CONFIG };
    
    if (script && script.dataset) {
      config.width = script.dataset.width || config.width;
      config.height = script.dataset.height || config.height;
      config.domain = script.dataset.domain || config.domain;
      config.hideBranding = script.dataset.hideBranding === 'true';
      config.position = script.dataset.position || config.position;
      config.zIndex = parseInt(script.dataset.zIndex) || config.zIndex;
      config.apiToken = script.dataset.apiToken; // Required for chat functionality
      config.windowStore = script.dataset.setWindowStore; // Window object name for API access
      
      // New configuration options
      config.welcomeMessage = script.dataset.welcomeMessage; // Welcome message for new users
      config.icon = script.dataset.icon || 'robot'; // 'robot', 'message', or 'phone'
      config.primaryColor = script.dataset.primaryColor; // Primary color for chat
  config.secondaryColor = script.dataset.secondaryColor; // Secondary color for chat
    }
    
    return config;
  };


// Create chat widget container (everything in the HTML string)
const createWidget = (config) => {
  const {
    position,
    width = '400px',
    height = '600px',
    zIndex = 1000,
    domain,
    apiToken,
    hideBranding = false,
    primaryColor = '#764ba2',
  } = config || {};

  const footerHeight = '31px';

  const pos = getPositionStyles(position);

  const html = `
    <div id="ai-support-widget"
         style="
           --ai-brand-icon-size: 15px;
           position: fixed;
           ${pos}
           width: ${width};
           height: ${height};
           z-index: ${zIndex};
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
           border-radius: 12px;
           overflow: hidden;
           background: white;
           transition: transform 0.3s ease, opacity 0.3s ease;
           display: flex;
           flex-direction: column;
         "
    >
      <style>
        #ai-support-widget .ai-brand-link {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 100%;
          text-decoration: none;
          color: inherit;
          line-height: 1;
          cursor: pointer;
        }
        #ai-support-widget .ai-brand-link:hover { color: ${primaryColor}; }
        #ai-support-widget .ai-brand-icon,
        #ai-support-widget .ai-brand-text {
          display: flex;
          align-items: center;
          height: 100%;
        }
        #ai-support-widget .ai-brand-icon svg {
          width: var(--ai-brand-icon-size);
          height: var(--ai-brand-icon-size);
          display: block;
          fill: currentColor;
        }
      </style>

      <iframe
        id="ai-support-chat-iframe"
        src="${domain}/test-chat${apiToken ? `?token=${encodeURIComponent(apiToken)}` : ''}"
        loading="lazy"
        allow="camera; microphone; autoplay"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        style="
          display: block;
          width: 100%;
          height: ${hideBranding ? '100%' : 'calc(100% - ' + footerHeight + ')'};
          border: none;
          border-radius: 12px 12px ${hideBranding ? '12px 12px' : '0 0'};
          flex: 1 1 auto;
        ">
      </iframe>

      ${hideBranding ? '' : `
      <div class="ai-branding"
           style="
             height: ${footerHeight};
             background: #f8f9fa;
             border-top: 1px solid #e9ecef;
             display: flex;
             align-items: center;
             justify-content: center;
             padding: 0 10px;
             color: #6c757d;
             font-size: 12px;
             border-radius: 0 0 12px 12px;
             line-height: 1;
             flex: 0 0 auto;
           ">
        <a class="ai-brand-link"
           href="https://aisupportagent.com"
           target="_blank"
           rel="noopener noreferrer">
          <span class="ai-brand-icon">
            ${robotSvg}
          </span>
          <span class="ai-brand-text">Powered by DirectSupport.ai</span>
        </a>
      </div>`}
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html.trim();
  const container = wrapper.firstElementChild;
  const iframe = container.querySelector('#ai-support-chat-iframe');

  return { container, iframe };
};

  
  // Get position styles based on position setting
  const getPositionStyles = (position) => {
    const margin = '20px';
    switch (position) {
      case 'bottom-left':
        return `bottom: ${margin}; left: ${margin};`;
      case 'bottom-right':
        return `bottom: ${margin}; right: ${margin};`;
      case 'top-left':
        return `top: ${margin}; left: ${margin};`;
      case 'top-right':
        return `top: ${margin}; right: ${margin};`;
      case 'center':
        return `top: 50%; left: 50%; transform: translate(-50%, -50%);`;
      default:
        return `bottom: ${margin}; right: ${margin};`;
    }
  };

  // Send message to iframe
  const sendMessage = (data) => {
    const iframe = document.getElementById('ai-support-chat-iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(data, '*');
    }
  };

  // Generate MongoDB-like ObjectId
  const generateObjectId = (bytes = 16) => {
    const arr = new Uint8Array(bytes);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
  };

  // Get or create guest ID
  const getGuestId = () => {
    const GUEST_ID_KEY = 'ai-support-guest-id';
    let guestId = sessionStorage.getItem(GUEST_ID_KEY);
    let isNew = false;

    if (!guestId) {
      guestId = "guest_" + generateObjectId();
      isNew = true;
      
      // Don't store yet - wait for user interaction
    }

    // Send guest ID to iframe
    sendMessage({
      type: 'guest-id',
      guestId: guestId,
      isNew: isNew
    });

    return { guestId, isNew };
  };

  // Toggle widget visibility
  const toggleWidget = (show) => {
    const widget = document.getElementById('ai-support-widget');
    if (widget) {
      if (show === undefined) {
        // Toggle current state
        show = widget.style.opacity === '0' || widget.style.display === 'none';
      }
      
      widget.style.opacity = show ? '1' : '0';
      widget.style.transform = show ? 'scale(1)' : 'scale(0.8)';
      widget.style.pointerEvents = show ? 'auto' : 'none';
      
      // Notify iframe about visibility change
      sendMessage({
        type: 'widget-visibility-changed',
        visible: show
      });
      
      return show;
    }
    return false;
  };



  // Store guest ID permanently (called when user sends first message)
  const storeGuestId = () => {
    const GUEST_ID_KEY = 'ai-support-guest-id';
    const existingGuestId = sessionStorage.getItem(GUEST_ID_KEY);
    
    if (!existingGuestId) {
      // Generate and store the guest ID permanently
      const guestId = "guest_" + generateObjectId();
      sessionStorage.setItem(GUEST_ID_KEY, guestId);
      
      // Notify iframe of the stored guest ID
      sendMessage({
        type: 'guest-id-stored',
        guestId: guestId
      });
      
      return guestId;
    }
    
    return existingGuestId;
  };

  // Update chat token dynamically
  const updateChatToken = (token) => {
    // Send token update to iframe
    sendMessage({
      type: 'user-token',
      token: token
    });
  };

  // Global API
  const createGlobalAPI = (windowStoreName = 'AISupportWidget') => {
    const api = {
      show: () => toggleWidget(true),
      hide: () => toggleWidget(false),
      toggle: () => toggleWidget(),
      sendMessage: sendMessage,
      setUserToken: updateChatToken,
      getGuestId: getGuestId,
      isVisible: () => {
        const widget = document.getElementById('ai-support-widget');
        return widget && widget.style.opacity !== '0' && widget.style.display !== 'none';
      }
    };

    // Set the API on the specified window property
    window[windowStoreName] = api;
    return api;
  };

  // Initialize widget when DOM is ready
  const init = () => {
    const script = getCurrentScript();
    const config = parseConfig(script);
    
    // Clear any cached widget configuration to ensure fresh settings
    if (window.sessionStorage) {
      try {
        sessionStorage.removeItem('widget-config');
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    // Validate required config
    if (!config.apiToken) {
      console.warn('AI Support Widget: data-api-token is required for chat functionality');
    }

    // Create global API with custom window store name if specified
    const windowStoreName = config.windowStore || 'AISupportWidget';
    createGlobalAPI(windowStoreName);

    // Create and inject widget
    const { container, iframe } = createWidget(config);
    document.body.appendChild(container);

    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.source === iframe.contentWindow) {
        // Handle messages from chat widget
        const { type, data } = event.data || {};
        
        switch (type) {
          case 'widget-ready':
            console.log('AI Support Widget ready');
            // Send full configuration to iframe
            sendMessage({
              type: 'set-config',
              data: { config }
            });

            // Initialize guest ID when widget is ready (but don't store yet)
            getGuestId();
       
            break;
          case 'user-message':
            // User sent a message - store the guest ID permanently on first message
            storeGuestId();
            break;
          case 'request-guest-id':
            // Iframe requests guest ID for sending a message
            const guestInfo = getGuestId();
            sendMessage({
              type: 'guest-id-for-message',
              guestId: guestInfo.guestId,
              isNew: guestInfo.isNew
            });
            break;
          case 'widget-resize':
            if (data.height) {
              container.style.height = data.height + 'px';
            }
            break;
          case 'widget-close':
            toggleWidget(false);
            break;
        }
      }
    });

    // Initial show
    setTimeout(() => toggleWidget(true), 100);
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  const robotSvg = `<svg xmlns="http://www.w3.org/2000/svg"
                 viewBox="0 0 640 640"
                 aria-hidden="true" focusable="false">
              <path d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"/>
            </svg>`;

})();

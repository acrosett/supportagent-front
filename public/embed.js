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
      config.brandText = script.dataset.brandText || config.brandText;
      config.hideBranding = script.dataset.hideBranding === 'true';
      config.position = script.dataset.position || config.position;
      config.zIndex = parseInt(script.dataset.zIndex) || config.zIndex;
      config.apiToken = script.dataset.apiToken; // Required for chat functionality
      config.windowStore = script.dataset.setWindowStore; // Window object name for API access
    }
    
    return config;
  };

  // Create chat widget container
  const createWidget = (config) => {
    // Main container
    const container = document.createElement('div');
    container.id = 'ai-support-widget';
    container.style.cssText = `
      position: fixed;
      ${getPositionStyles(config.position)}
      width: ${config.width};
      height: ${config.height};
      z-index: ${config.zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      overflow: hidden;
      background: white;
      transition: transform 0.3s ease, opacity 0.3s ease;
    `;

    // Chat iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'ai-support-chat-iframe';
    iframe.src = `${config.domain}/test-chat${config.apiToken ? '?token=' + encodeURIComponent(config.apiToken) : ''}`;
    iframe.style.cssText = `
      width: 100%;
      height: ${config.hideBranding ? '100%' : 'calc(100% - 24px)'};
      border: none;
      border-radius: 12px 12px ${config.hideBranding ? '12px 12px' : '0 0'};
    `;
    iframe.allow = 'camera; microphone; autoplay';
    iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups';

    container.appendChild(iframe);

    // Branding/backlink
    if (!config.hideBranding) {
      const branding = document.createElement('div');
      branding.style.cssText = `
        height: 24px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #6c757d;
        text-decoration: none;
        border-radius: 0 0 12px 12px;
      `;
      
      const brandLink = document.createElement('a');
      brandLink.href = 'https://aisupportagent.com';
      brandLink.target = '_blank';
      brandLink.textContent = config.brandText;
      brandLink.style.cssText = `
        color: #6c757d;
        text-decoration: none;
        font-size: 11px;
      `;
      brandLink.addEventListener('mouseover', () => {
        brandLink.style.color = '#495057';
      });
      brandLink.addEventListener('mouseout', () => {
        brandLink.style.color = '#6c757d';
      });

      branding.appendChild(brandLink);
      container.appendChild(branding);
    }

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
      guestId = generateObjectId();
      sessionStorage.setItem(GUEST_ID_KEY, "guest_" + guestId);
      isNew = true;
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
            // Initialize guest ID when widget is ready
            getGuestId();
            // Send API token to iframe if available
            if (config.apiToken) {
              sendMessage({
                type: 'api-token',
                token: config.apiToken
              });
            }
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

})();

(function() {
  'use strict';
  
  // Configuration defaults
  const DEFAULT_CONFIG = {
    width: '400px',
    height: '600px',
    domain: window.location.origin, // Will be replaced with actual domain in production
    brandText: 'Powered by AI Support Agent',
    position: 'bottom-right',
    zIndex: 1000
  };
  // Icon SVG library
  const ICON_SVGS = {
    robot: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"/></svg>`,
    message: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M64 416L64 192C64 139 107 96 160 96L480 96C533 96 576 139 576 192L576 416C576 469 533 512 480 512L360 512C354.8 512 349.8 513.7 345.6 516.8L230.4 603.2C226.2 606.3 221.2 608 216 608C202.7 608 192 597.3 192 584L192 512L160 512C107 512 64 469 64 416z"/></svg>`,
    headset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M320 128C241 128 175.3 185.3 162.3 260.7C171.6 257.7 181.6 256 192 256L208 256C234.5 256 256 277.5 256 304L256 400C256 426.5 234.5 448 208 448L192 448C139 448 96 405 96 352L96 288C96 164.3 196.3 64 320 64C443.7 64 544 164.3 544 288L544 456.1C544 522.4 490.2 576.1 423.9 576.1L336 576L304 576C277.5 576 256 554.5 256 528C256 501.5 277.5 480 304 480L336 480C362.5 480 384 501.5 384 528L384 528L424 528C463.8 528 496 495.8 496 456L496 435.1C481.9 443.3 465.5 447.9 448 447.9L432 447.9C405.5 447.9 384 426.4 384 399.9L384 303.9C384 277.4 405.5 255.9 432 255.9L448 255.9C458.4 255.9 468.3 257.5 477.7 260.6C464.7 185.3 399.1 127.9 320 127.9z"/></svg>`
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

      config.position = script.dataset.position || config.position;
      config.zIndex = parseInt(script.dataset.zIndex) || config.zIndex;
      config.apiToken = script.dataset.apiToken; // Required for chat functionality
      config.windowStore = script.dataset.setWindowStore; // Window object name for API access
      
      // New configuration options
      config.welcomeMessage = script.dataset.welcomeMessage; // Welcome message for new users
      config.icon = script.dataset.icon || 'robot'; // 'robot', 'message', or 'phone'
      config.primaryColor = script.dataset.primaryColor; // Primary color for chat
  config.secondaryColor = script.dataset.secondaryColor; // Secondary color for chat
  config.draggable = script.dataset.draggable !== 'false'; // default true
  config.startOpen = script.dataset.startOpen === 'true'; // default false (start minimized)
  config.darkMode = script.dataset.darkMode === 'true'; // dark mode flag
  config.soundOn = script.dataset.soundOn !== 'false'; // sound enabled by default
  // Bounce timing (seconds)
  const parseSeconds = (v)=>{ if(!v) return undefined; const n=parseFloat(v); return isNaN(n)?undefined:n; };
  config.bounceAfterInit = parseSeconds(script.dataset.bounceAfterInit); // delay before first double bounce
  config.periodicBounce = parseSeconds(script.dataset.periodicBounce); // interval between periodic bounces
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
    primaryColor = '#764ba2',
  } = config || {};

  const footerHeight = '31px';
  const fullScreenMargin = '5%';
  const hbg = false; 
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
         class="${config.darkMode ? 'ai-dark-mode' : ''}"
    >
      <style>
        @keyframes aiSpin {0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
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
  #ai-support-widget.ai-dark-mode { background:#1f1f23; color:#f5f7fa; }
  #ai-support-widget.ai-dark-mode iframe { background:#1f1f23; }
  #ai-support-widget.ai-dark-mode .ai-branding { background:#26262b; border-top-color:#333; color:#a8b3cf; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button { background:rgba(255,255,255,0.08); border:1px solid #333; color:#ddd; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button:hover { background:${primaryColor}; color:#fff; border-color:${primaryColor}; }
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
  #ai-support-widget .ai-loading-overlay {position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#ffffff,#f5f7fa); z-index:5; transition:opacity .3s ease;}
        #ai-support-widget .ai-loading-overlay.hidden {opacity:0; pointer-events:none;}
        #ai-support-widget .ai-loader-ring {width:40px; height:40px; border:4px solid #dde1e5; border-top-color:${primaryColor}; border-radius:50%; animation: aiSpin .8s linear infinite; box-shadow:0 0 0 1px rgba(0,0,0,0.04) inset;}
  #ai-support-widget .ai-widget-controls {position:absolute; top:6px; right:6px; display:flex; gap:6px; z-index:20;}
  #ai-support-widget .ai-widget-controls button {background:rgba(255,255,255,0.9); border:1px solid #d0d7de; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; color:#444; padding:0; line-height:1;}
  #ai-support-widget .ai-widget-controls button:hover {background:${primaryColor}; color:#fff; border-color:${primaryColor};}
  /* Fullscreen with margins */
  #ai-support-widget.ai-fullscreen {top:${fullScreenMargin} !important; left:${fullScreenMargin} !important; right:${fullScreenMargin} !important; bottom:${fullScreenMargin} !important; width:auto !important; height:auto !important; border-radius:12px !important;}
  #ai-support-widget.ai-hidden {opacity:0; pointer-events:none; transform:scale(.9);}
        #ai-support-widget .ai-drag-handle {position:absolute; top:0; left:0; height:26px; width:100%; cursor:move; z-index:18; background:linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(0,0,0,0)); user-select:none;}
        #ai-support-widget.ai-fullscreen .ai-drag-handle {cursor:default;}
      </style>

      <div class="ai-drag-handle" aria-hidden="true"></div>

      <div class="ai-loading-overlay">
        <div class="ai-loader-ring"></div>
      </div>

      <div class="ai-widget-controls">
        <button type="button" data-action="minimize" title="Minimize" aria-label="Minimize">–</button>
        <button type="button" data-action="fullscreen" title="Fullscreen" aria-label="Fullscreen">⛶</button>
      </div>

      <iframe
        id="ai-support-chat-iframe"
        src="${domain}/test-chat${apiToken ? `?token=${encodeURIComponent(apiToken)}` : ''}"
        loading="lazy"
        allow="camera; microphone; autoplay"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        style="
          display: block;
          width: 100%;
          height: ${hbg ? '100%' : 'calc(100% - ' + footerHeight + ')'};
          border: none;
          border-radius: 12px 12px ${hbg ? '12px 12px' : '0 0'};
          flex: 1 1 auto;
        ">
      </iframe>

      ${hbg ? '' : `
      <div class="ai-branding"
           style="
             height: ${footerHeight};
             background: ${config.darkMode ? '#1f2125' : '#f8f9fa'};
             border-top: 1px solid ${config.darkMode ? '#2a2d33' : '#e9ecef'};
             display: flex;
             align-items: center;
             justify-content: center;
             padding: 0 10px;
             color: ${config.darkMode ? '#adb5bd' : '#6c757d'};
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
            ${(ICON_SVGS[config.icon] || ICON_SVGS.robot)}
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
  const loadingOverlay = container.querySelector('.ai-loading-overlay');

  const hideLoader = () => {
    if (loadingOverlay && !loadingOverlay.classList.contains('hidden')) {
      loadingOverlay.classList.add('hidden');
      setTimeout(()=> loadingOverlay.remove(), 400);
    }
  };
  iframe.addEventListener('load', hideLoader, { once: true });
  iframe.addEventListener('error', hideLoader, { once: true });
  setTimeout(hideLoader, 15000); // fallback

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

    // Bubble button setup (lazy create)
    let bubbleEl = null;
    let isFullscreen = false;

  const getBubble = () => {
      if (bubbleEl) return bubbleEl;
  const primary = config.primaryColor || '#764ba2';
  const secondary = config.secondaryColor || primary;
      const BUBBLE_SIZE = 72; // px
  const bubbleSvg = ICON_SVGS[config.icon] || ICON_SVGS.robot;
      bubbleEl = document.createElement('div');
      bubbleEl.id = 'ai-support-widget-bubble';
      bubbleEl.setAttribute('role','button');
      bubbleEl.setAttribute('aria-label','Open chat support');
  bubbleEl.style.cssText = `position:fixed; ${getPositionStyles(config.position)} width:${BUBBLE_SIZE}px; height:${BUBBLE_SIZE}px; border-radius:50%; background:linear-gradient(135deg, ${primary} 0%, ${secondary} 100%); box-shadow:0 4px 8px rgba(0,0,0,.20),0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.15) inset; display:none; align-items:center; justify-content:center; cursor:pointer; z-index:${(config.zIndex||1000)+1}; transition:box-shadow .25s, transform .25s; color:#fff;`;
  bubbleEl.innerHTML = '<div style="width:60%;height:60%;">'+ bubbleSvg +'</div>';
      const svg = bubbleEl.querySelector('svg');
      if (svg){ svg.style.width='100%'; svg.style.height='100%'; svg.style.fill='currentColor'; }
      // Dragging (optional)
      let dragging=false,moved=false,startX=0,startY=0,origX=0,origY=0; const clamp=(v,min,max)=>Math.min(Math.max(v,min),max); const MOVE_THRESHOLD=6;
      if (config.draggable) {
        bubbleEl.addEventListener('mousedown', (e)=>{ dragging=true; moved=false; startX=e.clientX; startY=e.clientY; const r=bubbleEl.getBoundingClientRect(); origX=r.left; origY=r.top; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); e.preventDefault(); });
        const move=(e)=>{ if(!dragging) return; const dx=e.clientX-startX, dy=e.clientY-startY; if (Math.abs(dx)>MOVE_THRESHOLD || Math.abs(dy)>MOVE_THRESHOLD) moved=true; const vw=window.innerWidth, vh=window.innerHeight, size=BUBBLE_SIZE; bubbleEl.style.left=clamp(origX+dx,4,vw-size-4)+'px'; bubbleEl.style.top=clamp(origY+dy,4,vh-size-4)+'px'; bubbleEl.style.right='auto'; bubbleEl.style.bottom='auto'; };
        const up=()=>{ dragging=false; setTimeout(()=>{moved=false;},0); document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); };
      }
      bubbleEl.addEventListener('click', (e)=>{ if(dragging || moved) return; restoreWidget(); });
      document.body.appendChild(bubbleEl);
      return bubbleEl;
    };

    const minimizeWidget = () => {
      container.classList.add('ai-hidden');
  const b = getBubble();
  // Position bubble near widget bottom-right corner at minimize time
  const rect = container.getBoundingClientRect();
  const BUBBLE_SIZE = 72;
  const left = rect.left + rect.width - BUBBLE_SIZE - 12;
  const top  = rect.top  + rect.height - BUBBLE_SIZE - 12;
  b.style.left = left + 'px';
  b.style.top  = top  + 'px';
  b.style.right = 'auto';
  b.style.bottom = 'auto';
  b.style.display='flex';
      sendMessage({ type:'widget-visibility-changed', visible:false });
    };
    const restoreWidget = () => {
      container.classList.remove('ai-hidden');
      if (bubbleEl && bubbleEl.style.display !== 'none') {
        // Position widget near bubble location
        const bRect = bubbleEl.getBoundingClientRect();
        const w = container.offsetWidth || parseInt(config.width) || 400;
        const h = container.offsetHeight || parseInt(config.height) || 600;
        const clamp = (v,min,max)=>Math.min(Math.max(v,min),max);
  const BUBBLE_SIZE = 72;
  // Place so bubble roughly maps to widget bottom-right corner
  const newLeft = clamp(bRect.left - (w - BUBBLE_SIZE), 8, window.innerWidth - w - 8);
  const newTop  = clamp(bRect.top  - (h - BUBBLE_SIZE), 8, window.innerHeight - h - 8);
        container.style.left = newLeft + 'px';
        container.style.top  = newTop + 'px';
        container.style.right = 'auto';
        container.style.bottom = 'auto';
      }
      if (bubbleEl) bubbleEl.style.display='none';
      sendMessage({ type:'widget-visibility-changed', visible:true });
    };
    const toggleFullscreen = () => {
      if (!isFullscreen) { container.classList.add('ai-fullscreen'); isFullscreen=true; }
      else { container.classList.remove('ai-fullscreen'); isFullscreen=false; }
    };

    // Control button events
    const controls = container.querySelector('.ai-widget-controls');
    if (controls) {
      controls.addEventListener('click', (e)=>{
        const btn = e.target.closest('button'); if(!btn) return; const action=btn.dataset.action; if(action==='minimize') minimizeWidget(); else if(action==='fullscreen') toggleFullscreen();
      });
    }

    // Widget dragging (when visible & not fullscreen)
    if (config.draggable) {
      const dragHandle = container.querySelector('.ai-drag-handle');
      if (dragHandle) {
        let dragging=false, startX=0, startY=0, origLeft=0, origTop=0;
        const onDown = (e)=>{
          if (isFullscreen) return; // disable in fullscreen
          dragging=true; startX=e.clientX; startY=e.clientY;
          const rect = container.getBoundingClientRect();
          if (!container.style.left && (rect.left || rect.top)) {
            container.style.left = rect.left + 'px';
            container.style.top  = rect.top  + 'px';
            container.style.right='auto';
            container.style.bottom='auto';
          }
            origLeft=parseFloat(container.style.left)||rect.left; 
            origTop=parseFloat(container.style.top)||rect.top;
          document.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp, true);
          window.addEventListener('blur', onUp, true);
          // If cursor enters iframe, cancel drag (iframe will capture subsequent events)
          if (iframe) iframe.addEventListener('mouseenter', onUp, { once:true });
          e.preventDefault();
        };
        const onMove = (e)=>{
          if(!dragging) return; 
          const dx=e.clientX-startX, dy=e.clientY-startY;
          const w = container.offsetWidth; 
          const h = container.offsetHeight; 
          const vw=window.innerWidth; 
          const vh=window.innerHeight;
          const clamp=(v,min,max)=>Math.min(Math.max(v,min),max);
          const newLeft = clamp(origLeft+dx, 4, vw - w - 4);
          const newTop  = clamp(origTop +dy, 4, vh - h - 4);
          container.style.left=newLeft+'px';
          container.style.top=newTop+'px';
          // Update bubble anchor position live so minimize feels natural
          if (bubbleEl) {
            const BUBBLE_SIZE = 72;
            bubbleEl.style.left = (newLeft + w - BUBBLE_SIZE - 12) + 'px';
            bubbleEl.style.top  = (newTop  + h - BUBBLE_SIZE - 12) + 'px';
            bubbleEl.style.right='auto';
            bubbleEl.style.bottom='auto';
          }
        };
        const onUp = ()=>{ 
          if(!dragging) return; 
          dragging=false; 
          document.removeEventListener('mousemove', onMove); 
          window.removeEventListener('mouseup', onUp, true);
          window.removeEventListener('blur', onUp, true);
        };
        dragHandle.addEventListener('mousedown', onDown);
      }
    }

    // Listen for messages from iframe
    window.addEventListener('message', (event) => {
      if (event.source === iframe.contentWindow) {
        // Handle messages from chat widget
        const { type, data } = event.data || {};
        
        switch (type) {
          case 'widget-ready':
            console.log('AI Support Widget ready');
            // Send full configuration to iframe
            // Pass icon map to iframe along with config
            sendMessage({
              type: 'set-config',
              data: { config: { ...config, icons: ICON_SVGS } }
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

    // Initial state
    if (config.startOpen) {
      // Ensure container visible shortly (allow CSS transition if class preset elsewhere)
      setTimeout(()=> container.classList.remove('ai-hidden'), 60);
    } else {
      // Start minimized: hide widget & show bubble
      container.classList.add('ai-hidden');
      const b = getBubble();
      b.style.display='flex';
    }

    console.log('Bounce config:', { bounceAfterInit: config.bounceAfterInit, periodicBounce: config.periodicBounce });
    // Prepare bubble early if bounce timers configured
    if (config.bounceAfterInit || config.periodicBounce) {
      getBubble();
    }

    // Inject bounce CSS once
    (function ensureBounceCSS(){
      if (document.getElementById('ai-bubble-bounce-style')) return;
      const style = document.createElement('style');
      style.id = 'ai-bubble-bounce-style';
  style.textContent = `@keyframes aiBubbleDoubleBounce {0%,100%{transform:translateY(0) scale(1);}20%{transform:translateY(-12px) scale(1.05);}40%{transform:translateY(0) scale(1);}60%{transform:translateY(-8px) scale(1.04);}80%{transform:translateY(0) scale(1);} } #ai-support-widget-bubble.ai-bounce {animation: aiBubbleDoubleBounce .9s ease;} `;
      document.head.appendChild(style);
    })();

    const triggerBounce = () => {
      if (!bubbleEl || bubbleEl.style.display === 'none') return; // only bounce when visible
      bubbleEl.classList.remove('ai-bounce');
      // Force reflow to restart animation
      void bubbleEl.offsetWidth; 
      bubbleEl.classList.add('ai-bounce');
      setTimeout(()=> bubbleEl && bubbleEl.classList.remove('ai-bounce'), 1200);
    };

    if (config.bounceAfterInit && !isNaN(config.bounceAfterInit)) {
      setTimeout(triggerBounce, config.bounceAfterInit * 1000);
    }
    if (config.periodicBounce && !isNaN(config.periodicBounce)) {
      setInterval(triggerBounce, config.periodicBounce * 1000);
    }
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

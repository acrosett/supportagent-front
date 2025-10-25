(function(){console.log("AI Support Widget: \"0.0.71\"");const S={width:"400px",height:"600px",domain:"https://app.directsupport.ai",position:"bottom-right",zIndex:1E3},F={robot:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"/></svg>',
message:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M64 416L64 192C64 139 107 96 160 96L480 96C533 96 576 139 576 192L576 416C576 469 533 512 480 512L360 512C354.8 512 349.8 513.7 345.6 516.8L230.4 603.2C226.2 606.3 221.2 608 216 608C202.7 608 192 597.3 192 584L192 512L160 512C107 512 64 469 64 416z"/></svg>',
headset:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M320 128C241 128 175.3 185.3 162.3 260.7C171.6 257.7 181.6 256 192 256L208 256C234.5 256 256 277.5 256 304L256 400C256 426.5 234.5 448 208 448L192 448C139 448 96 405 96 352L96 288C96 164.3 196.3 64 320 64C443.7 64 544 164.3 544 288L544 456.1C544 522.4 490.2 576.1 423.9 576.1L336 576L304 576C277.5 576 256 554.5 256 528C256 501.5 277.5 480 304 480L336 480C362.5 480 384 501.5 384 528L384 528L424 528C463.8 528 496 495.8 496 456L496 435.1C481.9 443.3 465.5 447.9 448 447.9L432 447.9C405.5 447.9 384 426.4 384 399.9L384 303.9C384 277.4 405.5 255.9 432 255.9L448 255.9C458.4 255.9 468.3 257.5 477.7 260.6C464.7 185.3 399.1 127.9 320 127.9z"/></svg>'},
T=a=>{const b={...S};if(a&&a.dataset){b.width=a.dataset.width||b.width;b.height=a.dataset.height||b.height;b.domain=a.dataset.domain||b.domain;b.position=a.dataset.position||b.position;b.zIndex=parseInt(a.dataset.zIndex)||b.zIndex;b.apiToken=a.dataset.apiToken;b.windowStore=a.dataset.setWindowStore;b.welcomeMessage=a.dataset.welcomeMessage;b.faqs=a.dataset.faqs;b.icon=a.dataset.icon||"robot";b.primaryColor=a.dataset.primaryColor;b.secondaryColor=a.dataset.secondaryColor;b.draggable=a.dataset.draggable!==
"false";b.startOpen=a.dataset.startOpen==="true";b.darkMode=a.dataset.darkMode==="true";b.soundOn=a.dataset.soundOn!=="false";b.debug=a.dataset.debug==="true";const f=c=>{if(c)return c=parseFloat(c),isNaN(c)?void 0:c};b.bounceAfterInit=f(a.dataset.bounceAfterInit);b.periodicBounce=f(a.dataset.periodicBounce)}if(b.faqs)try{b.faqs=JSON.parse(b.faqs)}catch(f){b.faqs=b.faqs.split(",").map(c=>c.trim()).filter(c=>c)}else b.faqs=[];return b},U=a=>{const {position:b,width:f="400px",height:c="600px",zIndex:r=
1E3,domain:e,apiToken:q,primaryColor:w="#764ba2"}=a||{};a=`
    <div id="ai-support-widget"
         style="
           --ai-brand-icon-size: 15px;
           position: fixed;
           ${N(b)}
           width: ${f};
           height: ${c};
           z-index: ${r};
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
           border-radius: 12px;
           overflow: hidden;
           transition: transform 0.3s ease, opacity 0.3s ease;
           display: flex;
           flex-direction: column;
         "
         class="${a.darkMode?"ai-dark-mode":""}"
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
  #ai-support-widget .ai-brand-link:hover { color: ${w}; }
  #ai-support-widget.ai-dark-mode { background:#1f1f23; color:#f5f7fa; }
  #ai-support-widget.ai-dark-mode iframe { background:#1f1f23; }
  #ai-support-widget.ai-dark-mode .ai-branding { background:#26262b; border-top-color:#333; color:#a8b3cf; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button { background:rgba(255,255,255,0.08); border:1px solid #333; color:#ddd; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button:hover { background:${w}; color:#fff; border-color:${w}; }
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
        #ai-support-widget .ai-loader-ring {width:40px; height:40px; border:4px solid #dde1e5; border-top-color:${w}; border-radius:50%; animation: aiSpin .8s linear infinite; box-shadow:0 0 0 1px rgba(0,0,0,0.04) inset;}
  #ai-support-widget .ai-widget-controls {position:absolute; top:6px; right:6px; display:flex; gap:6px; z-index:20;}
  #ai-support-widget .ai-widget-controls button {background:rgba(255,255,255,0.9); border:1px solid #d0d7de; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; color:#444; padding:0; line-height:1;}
  #ai-support-widget .ai-widget-controls button:hover {background:${w}; color:#fff; border-color:${w};}
  /* Fullscreen with margins */
  #ai-support-widget.ai-fullscreen {top:${"1%"} !important; left:${"1%"} !important; right:${"1%"} !important; bottom:${"1%"} !important; width:auto !important; height:auto !important; border-radius:12px !important;}
  #ai-support-widget.ai-hidden {opacity:0; pointer-events:none; transform:scale(.9);}
        #ai-support-widget .ai-drag-handle {position:absolute; top:0; left:0; height:26px; width:100%; cursor:move; z-index:18; background:linear-gradient(to bottom,rgba(0,0,0,0.05),rgba(0,0,0,0)); user-select:none;}
        #ai-support-widget.ai-fullscreen .ai-drag-handle {cursor:default;}
      </style>

      <div class="ai-drag-handle" aria-hidden="true"></div>

      <div class="ai-loading-overlay">
        <div class="ai-loader-ring"></div>
      </div>

      <div class="ai-widget-controls">
        <button type="button" data-action="mute" title="Mute/Unmute" aria-label="Mute/Unmute">\ud83d\udd08</button>
        <button type="button" data-action="minimize" title="Minimize" aria-label="Minimize">\u2013</button>
        <button type="button" data-action="fullscreen" title="Fullscreen" aria-label="Fullscreen">\u26f6</button>
      </div>

      <iframe
        id="ai-support-chat-iframe"
        src="${e}/test-chat${q?`?token=${encodeURIComponent(q)}`:""}"
        loading="lazy"
        allow="camera; microphone; autoplay"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        style="
          display: block;
          width: 100%;
          height: ${"calc(100% - 31px)"};
          border: none;
          border-radius: 12px 12px ${"0 0"};
          flex: 1 1 auto;
        ">
      </iframe>

      ${`
      <div class="ai-branding"
           style="
             height: ${"31px"};
             background: ${a.darkMode?"#1f2125":"#f8f9fa"};
             border-top: 1px solid ${a.darkMode?"#2a2d33":"#e9ecef"};
             display: flex;
             align-items: center;
             justify-content: center;
             padding: 0 10px;
             color: ${a.darkMode?"#adb5bd":"#6c757d"};
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
            ${F[a.icon]||F.robot}
          </span>
          <span class="ai-brand-text">Powered by DirectSupport.ai</span>
        </a>
      </div>`}
    </div>
  `;var x=document.createElement("div");x.innerHTML=a.trim();a=x.firstElementChild;x=a.querySelector("#ai-support-chat-iframe");const D=a.querySelector(".ai-loading-overlay"),E=()=>{D&&!D.classList.contains("hidden")&&(D.classList.add("hidden"),setTimeout(()=>D.remove(),400))};x.addEventListener("load",E,{once:!0});x.addEventListener("error",E,{once:!0});setTimeout(E,15E3);return{container:a,iframe:x}},N=a=>{switch(a){case "bottom-left":return"bottom: 20px; left: 20px;";case "bottom-right":return"bottom: 20px; right: 20px;";
default:return"bottom: 20px; right: 20px;"}},u=a=>{const b=document.getElementById("ai-support-chat-iframe");b&&b.contentWindow&&b.contentWindow.postMessage(a,"*")},V=async(a,b)=>{const f=`direct-support-ai-cache-product-info-${b}`;try{var c=sessionStorage.getItem(f);if(c){const {data:r,timestamp:e}=JSON.parse(c),q=Date.now();if(q-e<6E4)return console.log(`Using cached product info for ${b} (${Math.round((6E4-(q-e))/1E3)}s remaining)`),r;sessionStorage.removeItem(f);console.log(`Product info cache expired for ${b}, fetching fresh data`)}}catch(r){console.warn("Failed to read product info cache:",
r)}a=`${a}/crud/s/product/cmd/get_public_info`;c=encodeURIComponent(JSON.stringify({productId:b}));a=await fetch(`${a}?query=${c}`,{method:"GET",headers:{"Content-Type":"application/json"}});if(!a.ok)throw Error(`Error ${a.status}: ${await a.text()}`);a=await a.json();try{const r={data:a,timestamp:Date.now()};sessionStorage.setItem(f,JSON.stringify(r));console.log(`Cached product info for ${b} (TTL: 60s)`)}catch(r){console.warn("Failed to cache product info:",r)}return a},W=(a=16)=>{a=new Uint8Array(a);
window.crypto.getRandomValues(a);return Array.from(a,b=>b.toString(16).padStart(2,"0")).join("")},L=()=>{let a=sessionStorage.getItem("ai-support-guest-id"),b=!1;a||(a="guest_"+W(),b=!0);u({type:"guest-id",guestId:a,isNew:b});return{guestId:a,isNew:b}},G=a=>{const b=document.getElementById("ai-support-widget");return b?(a===void 0&&(a=b.style.opacity==="0"||b.style.display==="none"),b.style.opacity=a?"1":"0",b.style.transform=a?"scale(1)":"scale(0.8)",b.style.pointerEvents=a?"auto":"none",u({type:"widget-visibility-changed",
visible:a}),a):!1},H=()=>{try{return localStorage.getItem("ai-support-widget-muted")==="true"}catch(a){return console.warn("Failed to read mute state from localStorage:",a),!1}},I=a=>{try{localStorage.setItem("ai-support-widget-muted",a.toString());const b=document.querySelector('#ai-support-widget .ai-widget-controls button[data-action="mute"]');b&&(b.textContent=a?"\ud83d\udd07":"\ud83d\udd08",b.title=a?"Unmute":"Mute",b.setAttribute("aria-label",a?"Unmute":"Mute"));u({type:"mute-state-changed",
muted:a});return a}catch(b){return console.warn("Failed to save mute state to localStorage:",b),!1}},O=()=>{const a=H();return I(!a)},X=a=>{const b=sessionStorage.getItem("ai-support-guest-id");return b?b:(sessionStorage.setItem("ai-support-guest-id",a),u({type:"guest-id-stored",guestId:a}),a)};let P=!1,J=null;const Q=a=>{J&&(clearTimeout(J),J=null);P?u({type:"user-token",token:a}):J=setTimeout(()=>{Q(a)},100)},Y=(a="AISupportWidget")=>{const b={show:()=>G(!0),hide:()=>G(!1),toggle:()=>G(),sendMessage:u,
setUserToken:Q,getGuestId:L,mute:()=>I(!0),unmute:()=>I(!1),toggleMute:O,isMuted:H,isVisible:()=>{const f=document.getElementById("ai-support-widget");return f&&f.style.opacity!=="0"&&f.style.display!=="none"}};return window[a]=b},R=async()=>{var a=document.currentScript||document.querySelector('script[src*="embed.js"]')||document.scripts[document.scripts.length-1];const b=T(a);if(window.sessionStorage)try{sessionStorage.removeItem("widget-config")}catch(d){}if(b.apiToken){a=b.apiToken;try{var f=
await V("https://api.directsupport.ai",a);b.debug&&console.log("Product Info:",f);if(!b.debug&&(!f.chatOn||f.quotasExceeded||f.productDeleted)){f.chatOn||console.warn(`AI Support Widget: Chat functionality is disabled for product ${a}. Widget will not be displayed. Please enable AI chat in your product settings.`);f.quotasExceeded&&console.warn(`AI Support Widget: Usage quotas have been exceeded for product ${a}. Widget will not be displayed. Please check your billing and usage limits.`);f.productDeleted&&
console.warn(`AI Support Widget: The product ${a} has been flagged for deletion. Widget will not be displayed.`);return}b.debug&&(f.chatOn||console.log(`AI Support Widget: Debug mode enabled - showing widget despite chat being disabled for product ${a}.`),f.quotasExceeded&&console.log(`AI Support Widget: Debug mode enabled - showing widget despite quotas being exceeded for product ${a}.`));b.productInfo=f}catch(d){console.error("AI Support Widget: Failed to get product info:",d);return}Y(b.windowStore||
"AISupportWidget");var {container:c,iframe:r}=U(b);document.body.appendChild(c);var e=null,q=!1,w=()=>{if(!q){var d=window.innerWidth,n=window.innerHeight;if(!(d>768)){var h=Math.floor(d*.96),l=Math.floor(n*.98);c.style.maxWidth=h+"px";c.style.maxHeight=l+"px";var m=c.getBoundingClientRect();m.width>h&&(c.style.width=h+"px");m.height>l&&(c.style.height=l+"px");h=c.getBoundingClientRect();l=h.left;m=h.top;var t=!1;l+h.width>d-4&&(l=Math.max(4,d-h.width-4),t=!0);m+h.height>n-4&&(m=Math.max(4,n-h.height-
4),t=!0);l<4&&(l=4,t=!0);m<4&&(m=4,t=!0);t&&(c.style.left=l+"px",c.style.top=m+"px",c.style.right="auto",c.style.bottom="auto")}}},x=()=>{if(e)return e;var d=b.primaryColor||"#764ba2";const n=b.secondaryColor||d,h=F[b.icon]||F.robot;e=document.createElement("div");e.id="ai-support-widget-bubble";e.setAttribute("role","button");e.setAttribute("aria-label","Open chat support");e.style.cssText=`position:fixed; ${N(b.position)} width:${72}px; height:${72}px; border-radius:50%; background:linear-gradient(135deg, ${d} 0%, ${n} 100%); box-shadow:0 4px 8px rgba(0,0,0,.20),0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.15) inset; display:none; align-items:center; justify-content:center; cursor:pointer; z-index:${(b.zIndex||
1E3)+1}; transition:box-shadow .25s, transform .25s; color:#fff;`;e.innerHTML='<div style="width:60%;height:60%;">'+h+"</div>";if(d=e.querySelector("svg"))d.style.width="100%",d.style.height="100%",d.style.fill="currentColor";let l=!1,m=!1,t=0,y=0,B=0,C=0;if(b.draggable){e.addEventListener("mousedown",k=>{l=!0;m=!1;t=k.clientX;y=k.clientY;const v=e.getBoundingClientRect();B=v.left;C=v.top;document.addEventListener("mousemove",g);document.addEventListener("mouseup",p);k.preventDefault()});const g=
k=>{if(l){var v=k.clientX-t;k=k.clientY-y;if(Math.abs(v)>6||Math.abs(k)>6)m=!0;var K=window.innerHeight;e.style.left=Math.min(Math.max(B+v,4),window.innerWidth-72-4)+"px";e.style.top=Math.min(Math.max(C+k,4),K-72-4)+"px";e.style.right="auto";e.style.bottom="auto"}},p=()=>{l=!1;setTimeout(()=>{m=!1},0);document.removeEventListener("mousemove",g);document.removeEventListener("mouseup",p)};e.addEventListener("touchstart",k=>{k.touches.length===1&&(k=k.touches[0],l=!0,m=!1,t=k.clientX,y=k.clientY,k=e.getBoundingClientRect(),
B=k.left,C=k.top,document.addEventListener("touchmove",z,{passive:!1}),document.addEventListener("touchend",A))},{passive:!0});const z=k=>{if(l){var v=k.touches[0],K=v.clientX-t;v=v.clientY-y;if(Math.abs(K)>6||Math.abs(v)>6)m=!0;var Z=window.innerHeight;e.style.left=Math.min(Math.max(B+K,4),window.innerWidth-72-4)+"px";e.style.top=Math.min(Math.max(C+v,4),Z-72-4)+"px";e.style.right="auto";e.style.bottom="auto";k.preventDefault()}},A=()=>{l&&(l=!1,setTimeout(()=>{m=!1},0),document.removeEventListener("touchmove",
z),document.removeEventListener("touchend",A))}}e.addEventListener("click",g=>{l||m||D()});document.body.appendChild(e);return e},D=()=>{c.classList.remove("ai-hidden");if(e&&e.style.display!=="none"){const n=e.getBoundingClientRect(),h=c.offsetWidth||parseInt(b.width)||400;var d=c.offsetHeight||parseInt(b.height)||600;d=Math.min(Math.max(n.top-(d-72),8),window.innerHeight-d-8);c.style.left=Math.min(Math.max(n.left-(h-72),8),window.innerWidth-h-8)+"px";c.style.top=d+"px";c.style.right="auto";c.style.bottom=
"auto"}e&&(e.style.display="none");u({type:"widget-visibility-changed",visible:!0})},E=()=>{q?(c.classList.remove("ai-fullscreen"),q=!1):(c.classList.add("ai-fullscreen"),q=!0);const d=c.querySelector('.ai-widget-controls button[data-action="fullscreen"]');d&&(q?(d.title="Exit fullscreen",d.setAttribute("aria-label","Exit fullscreen")):(d.title="Fullscreen",d.setAttribute("aria-label","Fullscreen")));q||w()};(f=c.querySelector(".ai-widget-controls"))&&f.addEventListener("click",d=>{if(d=d.target.closest("button"))if(d=
d.dataset.action,d==="minimize")if(q)E();else{c.classList.add("ai-hidden");d=x();const n=c.getBoundingClientRect(),h=n.top+n.height-72-12;d.style.left=n.left+n.width-72-12+"px";d.style.top=h+"px";d.style.right="auto";d.style.bottom="auto";d.style.display="flex";u({type:"widget-visibility-changed",visible:!1})}else d==="fullscreen"?E():d==="mute"&&O()});if(b.draggable&&(f=c.querySelector(".ai-drag-handle"))){let d=!1,n=0,h=0,l=0,m=0;const t=g=>{if(d){var p=c.offsetWidth,z=c.offsetHeight,A=Math.min(Math.max(l+
(g.clientX-n),4),window.innerWidth-p-4);g=Math.min(Math.max(m+(g.clientY-h),4),window.innerHeight-z-4);c.style.left=A+"px";c.style.top=g+"px";e&&(e.style.left=A+p-72-12+"px",e.style.top=g+z-72-12+"px",e.style.right="auto",e.style.bottom="auto")}},y=()=>{d&&(d=!1,document.removeEventListener("mousemove",t),window.removeEventListener("mouseup",y,!0),window.removeEventListener("blur",y,!0))};f.addEventListener("mousedown",g=>{if(!q){d=!0;n=g.clientX;h=g.clientY;var p=c.getBoundingClientRect();c.style.left||
!p.left&&!p.top||(c.style.left=p.left+"px",c.style.top=p.top+"px",c.style.right="auto",c.style.bottom="auto");l=parseFloat(c.style.left)||p.left;m=parseFloat(c.style.top)||p.top;document.addEventListener("mousemove",t);window.addEventListener("mouseup",y,!0);window.addEventListener("blur",y,!0);r&&r.addEventListener("mouseenter",y,{once:!0});g.preventDefault()}});const B=g=>{if(d){var p=g.touches[0],z=c.offsetWidth,A=c.offsetHeight,k=Math.min(Math.max(l+(p.clientX-n),4),window.innerWidth-z-4);p=Math.min(Math.max(m+
(p.clientY-h),4),window.innerHeight-A-4);c.style.left=k+"px";c.style.top=p+"px";e&&(e.style.left=k+z-72-12+"px",e.style.top=p+A-72-12+"px",e.style.right="auto",e.style.bottom="auto");g.preventDefault()}},C=()=>{d&&(d=!1,document.removeEventListener("touchmove",B),document.removeEventListener("touchend",C))};f.addEventListener("touchstart",g=>{q||g.touches.length!==1||(g=g.touches[0],d=!0,n=g.clientX,h=g.clientY,g=c.getBoundingClientRect(),c.style.left||!g.left&&!g.top||(c.style.left=g.left+"px",c.style.top=
g.top+"px",c.style.right="auto",c.style.bottom="auto"),l=parseFloat(c.style.left)||g.left,m=parseFloat(c.style.top)||g.top,document.addEventListener("touchmove",B,{passive:!1}),document.addEventListener("touchend",C,{passive:!0}))},{passive:!0})}window.addEventListener("message",d=>{if(d.source===r.contentWindow){const {type:n,data:h}=d.data||{};switch(n){case "widget-ready":console.log("AI Support Widget ready");d=H();u({type:"set-config",data:{config:{...b,icons:F,soundOn:!d}}});P=!0;L();setInterval(()=>
{u({type:"parent-page-url",data:{url:window.location.hostname+window.location.pathname}})},150);break;case "user-message":X(h==null?void 0:h.identifier);break;case "request-guest-id":d=L();u({type:"guest-id-for-message",guestId:d.guestId,isNew:d.isNew});break;case "widget-resize":h.height&&(c.style.height=h.height+"px");break;case "widget-close":G(!1)}}});b.startOpen?setTimeout(()=>c.classList.remove("ai-hidden"),60):(c.classList.add("ai-hidden"),x().style.display="flex");f=H();I(f);b.debug&&console.log("Bounce config:",
{bounceAfterInit:b.bounceAfterInit,periodicBounce:b.periodicBounce});(b.bounceAfterInit||b.periodicBounce)&&x();w();var M=null;window.addEventListener("resize",()=>{M&&cancelAnimationFrame(M);M=requestAnimationFrame(()=>{w()})});(function(){if(!document.getElementById("ai-bubble-bounce-style")){var d=document.createElement("style");d.id="ai-bubble-bounce-style";d.textContent="@keyframes aiBubbleDoubleBounce {0%,100%{transform:translateY(0) scale(1);}20%{transform:translateY(-12px) scale(1.05);}40%{transform:translateY(0) scale(1);}60%{transform:translateY(-8px) scale(1.04);}80%{transform:translateY(0) scale(1);} } #ai-support-widget-bubble.ai-bounce {animation: aiBubbleDoubleBounce .9s ease;} ";
document.head.appendChild(d)}})();f=()=>{e&&e.style.display!=="none"&&(e.classList.remove("ai-bounce"),e.classList.add("ai-bounce"),setTimeout(()=>e&&e.classList.remove("ai-bounce"),1200))};b.bounceAfterInit&&!isNaN(b.bounceAfterInit)&&setTimeout(f,b.bounceAfterInit*1E3);b.periodicBounce&&!isNaN(b.periodicBounce)&&setInterval(f,b.periodicBounce*1E3)}else console.warn("AI Support Widget: data-api-token is required for chat functionality")};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",
R):R().catch(a=>{console.error("AI Support Widget initialization failed:",a)})})();

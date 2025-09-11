(function(){const K={width:"400px",height:"600px",domain:window.location.origin,position:"bottom-right",zIndex:1E3},D={robot:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M352 64C352 46.3 337.7 32 320 32C302.3 32 288 46.3 288 64L288 128L192 128C139 128 96 171 96 224L96 448C96 501 139 544 192 544L448 544C501 544 544 501 544 448L544 224C544 171 501 128 448 128L352 128L352 64zM160 432C160 418.7 170.7 408 184 408L216 408C229.3 408 240 418.7 240 432C240 445.3 229.3 456 216 456L184 456C170.7 456 160 445.3 160 432zM280 432C280 418.7 290.7 408 304 408L336 408C349.3 408 360 418.7 360 432C360 445.3 349.3 456 336 456L304 456C290.7 456 280 445.3 280 432zM400 432C400 418.7 410.7 408 424 408L456 408C469.3 408 480 418.7 480 432C480 445.3 469.3 456 456 456L424 456C410.7 456 400 445.3 400 432zM224 240C250.5 240 272 261.5 272 288C272 314.5 250.5 336 224 336C197.5 336 176 314.5 176 288C176 261.5 197.5 240 224 240zM368 288C368 261.5 389.5 240 416 240C442.5 240 464 261.5 464 288C464 314.5 442.5 336 416 336C389.5 336 368 314.5 368 288zM64 288C64 270.3 49.7 256 32 256C14.3 256 0 270.3 0 288L0 384C0 401.7 14.3 416 32 416C49.7 416 64 401.7 64 384L64 288zM608 256C590.3 256 576 270.3 576 288L576 384C576 401.7 590.3 416 608 416C625.7 416 640 401.7 640 384L640 288C640 270.3 625.7 256 608 256z"/></svg>',
message:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" aria-hidden="true" focusable="false">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M64 416L64 192C64 139 107 96 160 96L480 96C533 96 576 139 576 192L576 416C576 469 533 512 480 512L360 512C354.8 512 349.8 513.7 345.6 516.8L230.4 603.2C226.2 606.3 221.2 608 216 608C202.7 608 192 597.3 192 584L192 512L160 512C107 512 64 469 64 416z"/></svg>',
headset:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">\x3c!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--\x3e<path d="M320 128C241 128 175.3 185.3 162.3 260.7C171.6 257.7 181.6 256 192 256L208 256C234.5 256 256 277.5 256 304L256 400C256 426.5 234.5 448 208 448L192 448C139 448 96 405 96 352L96 288C96 164.3 196.3 64 320 64C443.7 64 544 164.3 544 288L544 456.1C544 522.4 490.2 576.1 423.9 576.1L336 576L304 576C277.5 576 256 554.5 256 528C256 501.5 277.5 480 304 480L336 480C362.5 480 384 501.5 384 528L384 528L424 528C463.8 528 496 495.8 496 456L496 435.1C481.9 443.3 465.5 447.9 448 447.9L432 447.9C405.5 447.9 384 426.4 384 399.9L384 303.9C384 277.4 405.5 255.9 432 255.9L448 255.9C458.4 255.9 468.3 257.5 477.7 260.6C464.7 185.3 399.1 127.9 320 127.9z"/></svg>'},
L=b=>{const a={...K};if(b&&b.dataset){a.width=b.dataset.width||a.width;a.height=b.dataset.height||a.height;a.domain=b.dataset.domain||a.domain;a.position=b.dataset.position||a.position;a.zIndex=parseInt(b.dataset.zIndex)||a.zIndex;a.apiToken=b.dataset.apiToken;a.windowStore=b.dataset.setWindowStore;a.welcomeMessage=b.dataset.welcomeMessage;a.icon=b.dataset.icon||"robot";a.primaryColor=b.dataset.primaryColor;a.secondaryColor=b.dataset.secondaryColor;a.draggable=b.dataset.draggable!=="false";a.startOpen=
b.dataset.startOpen==="true";a.darkMode=b.dataset.darkMode==="true";a.soundOn=b.dataset.soundOn!=="false";const c=q=>{if(q)return q=parseFloat(q),isNaN(q)?void 0:q};a.bounceAfterInit=c(b.dataset.bounceAfterInit);a.periodicBounce=c(b.dataset.periodicBounce)}return a},M=b=>{const {position:a,width:c="400px",height:q="600px",zIndex:e=1E3,domain:u,apiToken:C,primaryColor:v="#764ba2"}=b||{};b=`
    <div id="ai-support-widget"
         style="
           --ai-brand-icon-size: 15px;
           position: fixed;
           ${H(a)}
           width: ${c};
           height: ${q};
           z-index: ${e};
           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
           box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
           border-radius: 12px;
           overflow: hidden;
           background: white;
           transition: transform 0.3s ease, opacity 0.3s ease;
           display: flex;
           flex-direction: column;
         "
         class="${b.darkMode?"ai-dark-mode":""}"
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
  #ai-support-widget .ai-brand-link:hover { color: ${v}; }
  #ai-support-widget.ai-dark-mode { background:#1f1f23; color:#f5f7fa; }
  #ai-support-widget.ai-dark-mode iframe { background:#1f1f23; }
  #ai-support-widget.ai-dark-mode .ai-branding { background:#26262b; border-top-color:#333; color:#a8b3cf; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button { background:rgba(255,255,255,0.08); border:1px solid #333; color:#ddd; }
  #ai-support-widget.ai-dark-mode .ai-widget-controls button:hover { background:${v}; color:#fff; border-color:${v}; }
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
        #ai-support-widget .ai-loader-ring {width:40px; height:40px; border:4px solid #dde1e5; border-top-color:${v}; border-radius:50%; animation: aiSpin .8s linear infinite; box-shadow:0 0 0 1px rgba(0,0,0,0.04) inset;}
  #ai-support-widget .ai-widget-controls {position:absolute; top:6px; right:6px; display:flex; gap:6px; z-index:20;}
  #ai-support-widget .ai-widget-controls button {background:rgba(255,255,255,0.9); border:1px solid #d0d7de; width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; color:#444; padding:0; line-height:1;}
  #ai-support-widget .ai-widget-controls button:hover {background:${v}; color:#fff; border-color:${v};}
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
        <button type="button" data-action="minimize" title="Minimize" aria-label="Minimize">\u2013</button>
        <button type="button" data-action="fullscreen" title="Fullscreen" aria-label="Fullscreen">\u26f6</button>
      </div>

      <iframe
        id="ai-support-chat-iframe"
        src="${u}/test-chat${C?`?token=${encodeURIComponent(C)}`:""}"
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
             background: ${b.darkMode?"#1f2125":"#f8f9fa"};
             border-top: 1px solid ${b.darkMode?"#2a2d33":"#e9ecef"};
             display: flex;
             align-items: center;
             justify-content: center;
             padding: 0 10px;
             color: ${b.darkMode?"#adb5bd":"#6c757d"};
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
            ${D[b.icon]||D.robot}
          </span>
          <span class="ai-brand-text">Powered by DirectSupport.ai</span>
        </a>
      </div>`}
    </div>
  `;var w=document.createElement("div");w.innerHTML=b.trim();b=w.firstElementChild;w=b.querySelector("#ai-support-chat-iframe");const d=b.querySelector(".ai-loading-overlay"),m=()=>{d&&!d.classList.contains("hidden")&&(d.classList.add("hidden"),setTimeout(()=>d.remove(),400))};w.addEventListener("load",m,{once:!0});w.addEventListener("error",m,{once:!0});setTimeout(m,15E3);return{container:b,iframe:w}},H=b=>{switch(b){case "bottom-left":return"bottom: 20px; left: 20px;";case "bottom-right":return"bottom: 20px; right: 20px;";
default:return"bottom: 20px; right: 20px;"}},y=b=>{const a=document.getElementById("ai-support-chat-iframe");a&&a.contentWindow&&a.contentWindow.postMessage(b,"*")},I=(b=16)=>{b=new Uint8Array(b);window.crypto.getRandomValues(b);return Array.from(b,a=>a.toString(16).padStart(2,"0")).join("")},G=()=>{let b=sessionStorage.getItem("ai-support-guest-id"),a=!1;b||(b="guest_"+I(),a=!0);y({type:"guest-id",guestId:b,isNew:a});return{guestId:b,isNew:a}},E=b=>{const a=document.getElementById("ai-support-widget");
return a?(b===void 0&&(b=a.style.opacity==="0"||a.style.display==="none"),a.style.opacity=b?"1":"0",a.style.transform=b?"scale(1)":"scale(0.8)",a.style.pointerEvents=b?"auto":"none",y({type:"widget-visibility-changed",visible:b}),b):!1},N=b=>{y({type:"user-token",token:b})},O=(b="AISupportWidget")=>{const a={show:()=>E(!0),hide:()=>E(!1),toggle:()=>E(),sendMessage:y,setUserToken:N,getGuestId:G,isVisible:()=>{const c=document.getElementById("ai-support-widget");return c&&c.style.opacity!=="0"&&c.style.display!==
"none"}};return window[b]=a},J=()=>{var b=document.currentScript||document.querySelector('script[src*="embed.js"]')||document.scripts[document.scripts.length-1];const a=L(b);if(window.sessionStorage)try{sessionStorage.removeItem("widget-config")}catch(d){}a.apiToken||console.warn("AI Support Widget: data-api-token is required for chat functionality");O(a.windowStore||"AISupportWidget");const {container:c,iframe:q}=M(a);document.body.appendChild(c);let e=null,u=!1;const C=()=>{if(!u){var d=window.innerWidth,
m=window.innerHeight;if(!(d>768)){var l=Math.floor(d*.96),h=Math.floor(m*.98);c.style.maxWidth=l+"px";c.style.maxHeight=h+"px";var n=c.getBoundingClientRect();n.width>l&&(c.style.width=l+"px");n.height>h&&(c.style.height=h+"px");l=c.getBoundingClientRect();h=l.left;n=l.top;var p=!1;h+l.width>d-4&&(h=Math.max(4,d-l.width-4),p=!0);n+l.height>m-4&&(n=Math.max(4,m-l.height-4),p=!0);h<4&&(h=4,p=!0);n<4&&(n=4,p=!0);p&&(c.style.left=h+"px",c.style.top=n+"px",c.style.right="auto",c.style.bottom="auto")}}},
v=()=>{if(e)return e;var d=a.primaryColor||"#764ba2";const m=a.secondaryColor||d,l=D[a.icon]||D.robot;e=document.createElement("div");e.id="ai-support-widget-bubble";e.setAttribute("role","button");e.setAttribute("aria-label","Open chat support");e.style.cssText=`position:fixed; ${H(a.position)} width:${72}px; height:${72}px; border-radius:50%; background:linear-gradient(135deg, ${d} 0%, ${m} 100%); box-shadow:0 4px 8px rgba(0,0,0,.20),0 10px 30px rgba(0,0,0,.35),0 0 0 1px rgba(255,255,255,.15) inset; display:none; align-items:center; justify-content:center; cursor:pointer; z-index:${(a.zIndex||
1E3)+1}; transition:box-shadow .25s, transform .25s; color:#fff;`;e.innerHTML='<div style="width:60%;height:60%;">'+l+"</div>";if(d=e.querySelector("svg"))d.style.width="100%",d.style.height="100%",d.style.fill="currentColor";let h=!1,n=!1,p=0,x=0,A=0,B=0;if(a.draggable){e.addEventListener("mousedown",g=>{h=!0;n=!1;p=g.clientX;x=g.clientY;const r=e.getBoundingClientRect();A=r.left;B=r.top;document.addEventListener("mousemove",f);document.addEventListener("mouseup",k);g.preventDefault()});const f=
g=>{if(h){var r=g.clientX-p;g=g.clientY-x;if(Math.abs(r)>6||Math.abs(g)>6)n=!0;var F=window.innerHeight;e.style.left=Math.min(Math.max(A+r,4),window.innerWidth-72-4)+"px";e.style.top=Math.min(Math.max(B+g,4),F-72-4)+"px";e.style.right="auto";e.style.bottom="auto"}},k=()=>{h=!1;setTimeout(()=>{n=!1},0);document.removeEventListener("mousemove",f);document.removeEventListener("mouseup",k)};e.addEventListener("touchstart",g=>{g.touches.length===1&&(g=g.touches[0],h=!0,n=!1,p=g.clientX,x=g.clientY,g=e.getBoundingClientRect(),
A=g.left,B=g.top,document.addEventListener("touchmove",t,{passive:!1}),document.addEventListener("touchend",z))},{passive:!0});const t=g=>{if(h){var r=g.touches[0],F=r.clientX-p;r=r.clientY-x;if(Math.abs(F)>6||Math.abs(r)>6)n=!0;var P=window.innerHeight;e.style.left=Math.min(Math.max(A+F,4),window.innerWidth-72-4)+"px";e.style.top=Math.min(Math.max(B+r,4),P-72-4)+"px";e.style.right="auto";e.style.bottom="auto";g.preventDefault()}},z=()=>{h&&(h=!1,setTimeout(()=>{n=!1},0),document.removeEventListener("touchmove",
t),document.removeEventListener("touchend",z))}}e.addEventListener("click",f=>{if(!h&&!n){c.classList.remove("ai-hidden");if(e&&e.style.display!=="none"){f=e.getBoundingClientRect();const t=c.offsetWidth||parseInt(a.width)||400;var k=c.offsetHeight||parseInt(a.height)||600;k=Math.min(Math.max(f.top-(k-72),8),window.innerHeight-k-8);c.style.left=Math.min(Math.max(f.left-(t-72),8),window.innerWidth-t-8)+"px";c.style.top=k+"px";c.style.right="auto";c.style.bottom="auto"}e&&(e.style.display="none");y({type:"widget-visibility-changed",
visible:!0})}});document.body.appendChild(e);return e};(b=c.querySelector(".ai-widget-controls"))&&b.addEventListener("click",d=>{if(d=d.target.closest("button"))if(d=d.dataset.action,d==="minimize"){c.classList.add("ai-hidden");d=v();const m=c.getBoundingClientRect(),l=m.top+m.height-72-12;d.style.left=m.left+m.width-72-12+"px";d.style.top=l+"px";d.style.right="auto";d.style.bottom="auto";d.style.display="flex";y({type:"widget-visibility-changed",visible:!1})}else if(d==="fullscreen"){u?(c.classList.remove("ai-fullscreen"),
u=!1):(c.classList.add("ai-fullscreen"),u=!0);if(d=c.querySelector('.ai-widget-controls button[data-action="fullscreen"]'))u?(d.title="Exit fullscreen",d.setAttribute("aria-label","Exit fullscreen")):(d.title="Fullscreen",d.setAttribute("aria-label","Fullscreen"));u||C()}});if(a.draggable&&(b=c.querySelector(".ai-drag-handle"))){let d=!1,m=0,l=0,h=0,n=0;const p=f=>{if(d){var k=c.offsetWidth,t=c.offsetHeight,z=Math.min(Math.max(h+(f.clientX-m),4),window.innerWidth-k-4);f=Math.min(Math.max(n+(f.clientY-
l),4),window.innerHeight-t-4);c.style.left=z+"px";c.style.top=f+"px";e&&(e.style.left=z+k-72-12+"px",e.style.top=f+t-72-12+"px",e.style.right="auto",e.style.bottom="auto")}},x=()=>{d&&(d=!1,document.removeEventListener("mousemove",p),window.removeEventListener("mouseup",x,!0),window.removeEventListener("blur",x,!0))};b.addEventListener("mousedown",f=>{if(!u){d=!0;m=f.clientX;l=f.clientY;var k=c.getBoundingClientRect();c.style.left||!k.left&&!k.top||(c.style.left=k.left+"px",c.style.top=k.top+"px",
c.style.right="auto",c.style.bottom="auto");h=parseFloat(c.style.left)||k.left;n=parseFloat(c.style.top)||k.top;document.addEventListener("mousemove",p);window.addEventListener("mouseup",x,!0);window.addEventListener("blur",x,!0);q&&q.addEventListener("mouseenter",x,{once:!0});f.preventDefault()}});const A=f=>{if(d){var k=f.touches[0],t=c.offsetWidth,z=c.offsetHeight,g=Math.min(Math.max(h+(k.clientX-m),4),window.innerWidth-t-4);k=Math.min(Math.max(n+(k.clientY-l),4),window.innerHeight-z-4);c.style.left=
g+"px";c.style.top=k+"px";e&&(e.style.left=g+t-72-12+"px",e.style.top=k+z-72-12+"px",e.style.right="auto",e.style.bottom="auto");f.preventDefault()}},B=()=>{d&&(d=!1,document.removeEventListener("touchmove",A),document.removeEventListener("touchend",B))};b.addEventListener("touchstart",f=>{u||f.touches.length!==1||(f=f.touches[0],d=!0,m=f.clientX,l=f.clientY,f=c.getBoundingClientRect(),c.style.left||!f.left&&!f.top||(c.style.left=f.left+"px",c.style.top=f.top+"px",c.style.right="auto",c.style.bottom=
"auto"),h=parseFloat(c.style.left)||f.left,n=parseFloat(c.style.top)||f.top,document.addEventListener("touchmove",A,{passive:!1}),document.addEventListener("touchend",B,{passive:!0}))},{passive:!0})}window.addEventListener("message",d=>{if(d.source===q.contentWindow){const {type:m,data:l}=d.data||{};switch(m){case "widget-ready":console.log("AI Support Widget ready");y({type:"set-config",data:{config:{...a,icons:D}}});G();break;case "user-message":sessionStorage.getItem("ai-support-guest-id")||(d=
"guest_"+I(),sessionStorage.setItem("ai-support-guest-id",d),y({type:"guest-id-stored",guestId:d}));break;case "request-guest-id":d=G();y({type:"guest-id-for-message",guestId:d.guestId,isNew:d.isNew});break;case "widget-resize":l.height&&(c.style.height=l.height+"px");break;case "widget-close":E(!1)}}});a.startOpen?setTimeout(()=>c.classList.remove("ai-hidden"),60):(c.classList.add("ai-hidden"),v().style.display="flex");console.log("Bounce config:",{bounceAfterInit:a.bounceAfterInit,periodicBounce:a.periodicBounce});
(a.bounceAfterInit||a.periodicBounce)&&v();C();let w=null;window.addEventListener("resize",()=>{w&&cancelAnimationFrame(w);w=requestAnimationFrame(()=>{C()})});(function(){if(!document.getElementById("ai-bubble-bounce-style")){var d=document.createElement("style");d.id="ai-bubble-bounce-style";d.textContent="@keyframes aiBubbleDoubleBounce {0%,100%{transform:translateY(0) scale(1);}20%{transform:translateY(-12px) scale(1.05);}40%{transform:translateY(0) scale(1);}60%{transform:translateY(-8px) scale(1.04);}80%{transform:translateY(0) scale(1);} } #ai-support-widget-bubble.ai-bounce {animation: aiBubbleDoubleBounce .9s ease;} ";
document.head.appendChild(d)}})();b=()=>{e&&e.style.display!=="none"&&(e.classList.remove("ai-bounce"),e.classList.add("ai-bounce"),setTimeout(()=>e&&e.classList.remove("ai-bounce"),1200))};a.bounceAfterInit&&!isNaN(a.bounceAfterInit)&&setTimeout(b,a.bounceAfterInit*1E3);a.periodicBounce&&!isNaN(a.periodicBounce)&&setInterval(b,a.periodicBounce*1E3)};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",J):J()})();

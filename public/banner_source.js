/**
 * Cookie Consent Banner
 * Shared script for cookie consent across the application
 */

(function() {
    'use strict';

    // Configuration
    const COOKIE_NAME = 'cookie_consent_accepted';
    const COOKIE_EXPIRY_DAYS = 365; // 1 year - standard for cookie consent
    
    // Check if consent already given
    function hasConsent() {
        return document.cookie.split(';').some(cookie => 
            cookie.trim().startsWith(COOKIE_NAME + '=')
        );
    }
    
    // Set consent cookie
    function setConsent() {
        const expiryDate = new Date();
        expiryDate.setTime(expiryDate.getTime() + (COOKIE_EXPIRY_DAYS * 24 * 60 * 60 * 1000));
        document.cookie = `${COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    }
    
    // Create and show banner
    function showCookieBanner() {
        if (hasConsent()) {
            return; // Already accepted
        }
        
        // Create banner HTML
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.innerHTML = `
            <div class="cookie-banner-content">
                <div class="cookie-text">
                    <p>We use cookies to enhance your experience and analyze our website traffic. By continuing to use our site, you consent to our use of cookies. 
                    <a href="/privacy-policy" target="_blank" class="privacy-link">Learn more in our Privacy Policy</a></p>
                </div>
                <div class="cookie-actions">
                    <button id="cookie-accept-btn" class="accept-btn">Accept</button>
                </div>
            </div>
        `;
        
        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            #cookie-consent-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem;
                box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
                z-index: 10000;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.5;
                animation: slideUp 0.3s ease-out;
            }
            
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            .cookie-banner-content {
                max-width: 1200px;
                margin: 0 auto;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 1rem;
                flex-wrap: wrap;
            }
            
            .cookie-text {
                flex: 1;
                min-width: 250px;
            }
            
            .cookie-text p {
                margin: 0;
                font-size: 0.9rem;
            }
            
            .privacy-link {
                color: rgba(255, 255, 255, 0.9);
                text-decoration: underline;
                font-weight: 500;
            }
            
            .privacy-link:hover {
                color: white;
                text-decoration: none;
            }
            
            .cookie-actions {
                flex-shrink: 0;
            }
            
            .accept-btn {
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid rgba(255, 255, 255, 0.3);
                padding: 10px 24px;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            
            .accept-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                border-color: rgba(255, 255, 255, 0.5);
                transform: translateY(-1px);
            }
            
            .accept-btn:active {
                transform: translateY(0);
            }
            
            /* Mobile responsive */
            @media (max-width: 768px) {
                #cookie-consent-banner {
                    padding: 1rem 0.75rem;
                }
                
                .cookie-banner-content {
                    flex-direction: column;
                    text-align: center;
                    gap: 0.75rem;
                }
                
                .cookie-text p {
                    font-size: 0.85rem;
                }
                
                .accept-btn {
                    padding: 12px 32px;
                    font-size: 1rem;
                }
            }
            
            @media (max-width: 480px) {
                .cookie-text p {
                    font-size: 0.8rem;
                    line-height: 1.4;
                }
            }
        `;
        
        // Add to page
        document.head.appendChild(styles);
        document.body.appendChild(banner);
        
        // Add event listener
        document.getElementById('cookie-accept-btn').addEventListener('click', function() {
            setConsent();
            hideBanner();
        });
    }
    
    // Hide banner with animation
    function hideBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.animation = 'slideDown 0.3s ease-out forwards';
            banner.addEventListener('animationend', () => {
                banner.remove();
            });
        }
    }
    
    // Add slide down animation
    function addHideAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize when DOM is ready
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                addHideAnimation();
                showCookieBanner();
            });
        } else {
            addHideAnimation();
            showCookieBanner();
        }
    }
    
    // Start the banner
    init();
    
    // Expose functions for manual control if needed
    window.CookieBanner = {
        show: showCookieBanner,
        hide: hideBanner,
        hasConsent: hasConsent,
        setConsent: setConsent
    };
})();
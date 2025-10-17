const html = `data-welcome-message="👋 Welcome! How can I help you today?" data-faqs='["What is DirectSupport.ai?"]'`;

// Test welcome message pattern
const welcomePattern = /data-welcome-message=["']([^"']+)["']/gi;
const welcomeMatch = welcomePattern.exec(html);
console.log('Welcome match:', welcomeMatch ? welcomeMatch[1] : 'No match');

// Test FAQs pattern
const faqPattern = /data-faqs=["'](\[[^\]]*\])["']/gi;
const faqMatch = faqPattern.exec(html);
console.log('FAQ match:', faqMatch ? faqMatch[1] : 'No match');

if (faqMatch) {
  try {
    const faqArray = JSON.parse(faqMatch[1]);
    console.log('Parsed FAQs:', faqArray);
  } catch (e) {
    console.log('JSON parse error:', e.message);
  }
}
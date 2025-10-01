import { nextTick } from 'vue'
import hljs from 'highlight.js'
import { marked, Renderer } from 'marked'
import DOMPurify from 'dompurify'

export const useMarkdown = () => {
  // Configure marked with custom renderer for code highlighting
  const renderer = new Renderer()
  const originalCode = renderer.code.bind(renderer)
  
  renderer.code = (code: string, infostring: string | undefined, escaped: boolean) => {
    const lang = (infostring || '').match(/^[^\s]+/)?.[0]
    let highlighted = code
    if (lang && hljs.getLanguage(lang)) {
      try { highlighted = hljs.highlight(code, { language: lang }).value } catch {}
    } else {
      try { highlighted = hljs.highlightAuto(code).value } catch {}
    }
    return `<pre><code class="hljs language-${lang || 'plaintext'}">${highlighted}</code></pre>`
  }

  // Override link rendering to force new tab + security rel
  const escapeAttr = (s: string) => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  renderer.link = (href: string | null, title: string | null, text: string) => {
    const safeHref = escapeAttr(href || '')
    const titleAttr = title ? ` title="${escapeAttr(title)}"` : ''
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`
  }

  marked.setOptions({ gfm: true, breaks: true, renderer })

  /**
   * Render markdown string to sanitized HTML
   * @param raw - Raw markdown string
   * @returns Sanitized HTML string
   */
  const renderMarkdown = (raw: string): string => {
    if (!raw) return ''
    const dirty = marked.parse(raw) as string
    // Sanitize HTML output
    return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true }, ADD_ATTR: ['target','rel'] })
  }

  /**
   * Apply syntax highlighting and copy buttons to code blocks
   * @param selector - CSS selector for the container to search within (default: '.message-content pre')
   */
  const highlightCodeBlocks = (selector: string = '.message-content pre') => {
    nextTick(() => {
      document.querySelectorAll(selector).forEach(pre => {
        const code = pre.querySelector('code') as HTMLElement | null
        if (code) {
          try { hljs.highlightElement(code) } catch { /* ignore */ }
        }
        // Add copy button if not present
        if (!pre.querySelector('.code-copy-btn')) {
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'code-copy-btn'
          btn.setAttribute('aria-label', 'Copy code to clipboard')
          btn.textContent = 'Copy'
          btn.addEventListener('click', () => {
            const raw = code?.textContent || ''
              ;(navigator.clipboard?.writeText(raw) || Promise.reject()).then(() => {
                const orig = btn.textContent
                btn.textContent = 'Copied!'
                btn.classList.add('copied')
                setTimeout(() => { btn.textContent = orig || 'Copy'; btn.classList.remove('copied') }, 1600)
              }).catch(() => {
                btn.textContent = 'Failed'
                setTimeout(() => { btn.textContent = 'Copy' }, 1600)
              })
          })
          pre.appendChild(btn)
        }
      })
    })
  }

  return {
    renderMarkdown,
    highlightCodeBlocks
  }
}
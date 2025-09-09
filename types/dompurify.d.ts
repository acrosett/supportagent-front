declare module 'dompurify' {
  interface SanitizeConfig {
    USE_PROFILES?: { html?: boolean; svg?: boolean; svgFilters?: boolean; mathMl?: boolean }
    [key: string]: any
  }
  interface DOMPurifyI {
    sanitize(dirty: string, config?: SanitizeConfig): string
  }
  const DOMPurify: DOMPurifyI
  export default DOMPurify
}
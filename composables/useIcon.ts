// composables/useIcon.ts
const svgCache = new Map<string, string>()

// Grab every SVG in assets/icons (recursively), as RAW strings (not URLs)
const iconLoaders = import.meta.glob<string>('~/assets/icons/**/*.svg', { query: '?raw', import: 'default' })

// Build a name → loader map:
//  - "edit" for assets/icons/edit.svg
//  - "users/list" for assets/icons/users/list.svg
const byName: Record<string, () => Promise<string>> = {}
for (const fullPath in iconLoaders) {
  const file = fullPath.split('/assets/icons/')[1]!
  const key = file.replace(/\.svg$/,'') // "edit" or "users/list"
  byName[key] = iconLoaders[fullPath] as () => Promise<string>
}

export async function loadSvg(name: string): Promise<string> {
  // Normalize: allow "edit", "edit.svg", "./edit"
  const clean = name.replace(/^\.?\//,'').replace(/\.svg$/,'')
  if (svgCache.has(clean)) return svgCache.get(clean)!

  try {
    const loader = byName[clean]
    if (!loader) throw new Error('not found')
    const content = await loader()
    svgCache.set(clean, content)
    return content
  } catch {
    const fallback =
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>`
    svgCache.set(clean, fallback)
    return fallback
  }
}

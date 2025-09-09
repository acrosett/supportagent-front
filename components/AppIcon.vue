<template>
  <div 
    :class="['icon', `icon-${size}`, { 'icon-clickable': clickable }]"
    :style="customStyle"
    v-html="svgContent"
    @click="handleClick"
  />
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: string
  width?: string
  height?: string
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  clickable: false
})

const emit = defineEmits<{
  click: []
}>()

const customStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color) style.color = props.color
  if (props.width) style.width = props.width
  if (props.height) style.height = props.height
  
  return style
})

const svgContent = ref('')

// Cache for loaded SVGs to avoid repeated network requests
const svgCache = new Map<string, string>()

const loadSvg = async () => {
  if (svgCache.has(props.name)) {
    svgContent.value = svgCache.get(props.name)!
    return
  }

  try {
    const svgModule = await import(`~/assets/icons/${props.name}.svg?raw`)
    const content = svgModule.default
    svgCache.set(props.name, content)
    svgContent.value = content
  } catch (error) {
    console.warn(`Icon "${props.name}" not found`)
    const fallback = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/></svg>`
    svgCache.set(props.name, fallback)
    svgContent.value = fallback
  }
}

const handleClick = () => props.clickable && emit('click')

onMounted(loadSvg)
watch(() => props.name, loadSvg)
</script>

<style scoped lang="scss">
@use '~/assets/variables' as *;

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  
  :deep(svg) {
    width: 100%;
    height: 100%;
    stroke: currentColor;
  }
  
  &.icon-xs {
    width: 12px;
    height: 12px;
  }
  
  &.icon-sm {
    width: 16px;
    height: 16px;
  }
  
  &.icon-md {
    width: 20px;
    height: 20px;
  }
  
  &.icon-lg {
    width: 24px;
    height: 24px;
  }
  
  &.icon-xl {
    width: 32px;
    height: 32px;
  }
  
  &.icon-clickable {
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
  }
}
</style>

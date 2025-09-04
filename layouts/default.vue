<template>
  <div class="app-layout">
    <AppMenu />
    <main class="main-content">
      <slot />
    </main>
  </div>
  <Toast />
</template>

<style lang="scss">
@use '~/assets/variables' as *;

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.0)), $panel;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: $radius;
  margin: 1rem;
  box-shadow: $shadow;
  backdrop-filter: blur(10px);
  overflow-y: auto;
  max-height: 100vh;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;
    height: 100vh;
  }
  
  .main-content {
    margin: 60px 1rem 1rem; /* Account for mobile header */
    padding: 1.5rem;
  }
}

/* Desktop adjustments */
@media (min-width: 769px) {
  .main-content {
    margin-left: 280px; /* Account for sidebar width */
    margin-top: 0;
    margin-right: 0;
    margin-bottom: 0;
  }
}

/* Default styles - can be overridden by component styles */
:where(.main-content h1) {
  color: $brand;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  margin-top: 0;
  background: linear-gradient(135deg, $brand 0%, $brand-2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

:where(.main-content h2) {
  color: $brand;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

:where(.main-content p) {
  color: $muted;
  line-height: 1.6;
  margin-bottom: 1rem;
}
</style>
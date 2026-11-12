<template>
  <div class="notfound-page">
    <div class="notfound-panel">
      <span class="notfound-code">404 · not found</span>
      <h1>Page not found</h1>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <RouterLink to="/" class="btn-primary">Go home</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notfound-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  background: var(--ink-0);
}

.notfound-panel {
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 28px 24px;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  background: var(--ink-1);
}

.notfound-code {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--signal);
}

.notfound-panel h1 {
  font-size: 22px;
  font-weight: 600;
}

.notfound-panel p {
  font-size: 14px;
  color: var(--fg-2);
  margin-bottom: 10px;
}
</style>

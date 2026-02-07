<script setup lang="ts">
defineProps<{
  requiredTier: 'starter' | 'professional'
  featureName: string
}>()

const tierLabels: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
}
</script>

<template>
  <div class="locked-feature">
    <div class="locked-content">
      <slot />
    </div>
    <div class="locked-overlay">
      <div class="locked-badge">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" class="lock-icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span class="locked-title">{{ featureName }}</span>
        <span class="locked-subtitle">Upgrade to {{ tierLabels[requiredTier] }} to unlock</span>
        <RouterLink to="/app/billing" class="locked-cta">
          Upgrade Plan
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.locked-feature {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.locked-content {
  filter: blur(4px);
  opacity: 0.4;
  pointer-events: none;
  user-select: none;
}

.locked-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.locked-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  text-align: center;
}

.lock-icon {
  width: 32px;
  height: 32px;
  color: var(--muted);
}

.locked-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.locked-subtitle {
  font-size: 13px;
  color: var(--muted);
}

.locked-cta {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  padding: 8px 20px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, var(--accent), var(--cyan));
  border-radius: var(--radius-md);
  color: white;
  text-decoration: none;
  transition: opacity 0.15s;
}

.locked-cta:hover {
  opacity: 0.9;
}
</style>

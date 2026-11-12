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
  border-radius: var(--radius-md);
  overflow: hidden;
}

.locked-content {
  filter: blur(4px);
  opacity: 0.35;
  pointer-events: none;
  user-select: none;
}

.locked-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 13, 15, 0.4);
  z-index: 10;
}

.locked-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 24px;
  text-align: center;
  background: var(--ink-1);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-md);
  margin: 16px;
}

.lock-icon {
  width: 22px;
  height: 22px;
  color: var(--signal);
}

.locked-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.locked-subtitle {
  font-size: 13px;
  color: var(--fg-2);
}

.locked-cta {
  display: inline-flex;
  align-items: center;
  margin-top: 4px;
  padding: 7px 16px;
  font-size: 13px;
  font-weight: 500;
  background: var(--text);
  border: 1px solid var(--text);
  border-radius: var(--radius-sm);
  color: var(--ink-0);
  text-decoration: none;
  transition: background-color 0.15s;
}

.locked-cta:hover {
  background: #ffffff;
}
</style>

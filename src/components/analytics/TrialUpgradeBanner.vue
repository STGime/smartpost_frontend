<script setup lang="ts">
</script>

<template>
  <div class="trial-banner">
    <div class="trial-banner-content">
      <div class="trial-banner-icon">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div class="trial-banner-text">
        <p>
          <strong>You're viewing a 7-day analytics preview.</strong>
          Upgrade to Starter for full analytics with 90-day history, best time to post, and more.
        </p>
      </div>
      <RouterLink to="/app/billing" class="trial-banner-cta">
        Upgrade to Starter
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.trial-banner {
  background: var(--signal-soft);
  border: 1px solid rgba(242, 169, 59, 0.35);
  border-radius: var(--radius-md);
  padding: 12px 16px;
  margin-bottom: 24px;
}

.trial-banner-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trial-banner-icon {
  display: flex;
  color: var(--signal);
  flex-shrink: 0;
}

.trial-banner-icon svg {
  width: 20px;
  height: 20px;
}

.trial-banner-text {
  flex: 1;
}

.trial-banner-text p {
  font-size: 13px;
  color: var(--fg-2);
  line-height: 1.5;
}

.trial-banner-text strong {
  color: var(--signal);
  font-weight: 600;
}

.trial-banner-cta {
  flex-shrink: 0;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  background: var(--text);
  border: 1px solid var(--text);
  border-radius: var(--radius-sm);
  color: var(--ink-0);
  text-decoration: none;
  transition: background-color 0.15s;
  white-space: nowrap;
}

.trial-banner-cta:hover {
  background: #ffffff;
}

@media (max-width: 600px) {
  .trial-banner-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

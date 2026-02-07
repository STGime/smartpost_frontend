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
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.1));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  margin-bottom: 24px;
}

.trial-banner-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.trial-banner-icon {
  width: 36px;
  height: 36px;
  background: rgba(245, 158, 11, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fcd34d;
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
  color: var(--muted);
  line-height: 1.5;
}

.trial-banner-text strong {
  color: #fcd34d;
}

.trial-banner-cta {
  flex-shrink: 0;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  background: linear-gradient(135deg, #f59e0b, #ea580c);
  border-radius: var(--radius-md);
  color: white;
  text-decoration: none;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.trial-banner-cta:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .trial-banner-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .trial-banner-cta {
    align-self: flex-start;
  }
}
</style>

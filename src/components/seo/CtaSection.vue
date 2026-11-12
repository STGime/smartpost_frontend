<script setup lang="ts">
import { isSignupEnabled } from '@/config/featureFlags'
import type { WaitingListSource } from '@/services'

defineProps<{
  heading?: string
  subtext?: string
  source: WaitingListSource
}>()

const emit = defineEmits<{
  openWaitingList: [source: WaitingListSource]
}>()

const signupEnabled = isSignupEnabled()
</script>

<template>
  <section class="cta-section">
    <h2 class="cta-heading">{{ heading || 'Ready to simplify your social media workflow?' }}</h2>
    <p class="cta-subtext">{{ subtext || 'Join creators and teams who save hours every week with Posta.' }}</p>
    <div class="cta-actions">
      <RouterLink v-if="signupEnabled" to="/signup" class="btn-primary">
        <span>Start free trial</span>
        <span class="arrow">→</span>
      </RouterLink>
      <button v-else class="btn-primary" @click="emit('openWaitingList', source)">
        <span>Join waiting list</span>
        <span class="arrow">→</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px 32px;
  padding: 28px;
  margin: 56px 0 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
}

.cta-heading {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
}

.cta-subtext {
  grid-column: 1;
  font-size: 15px;
  color: var(--fg-2);
  max-width: 60ch;
}

.cta-actions {
  grid-column: 2;
  grid-row: 1 / span 2;
  display: flex;
  gap: 12px;
}

.arrow {
  font-size: 15px;
}

@media (max-width: 640px) {
  .cta-section {
    grid-template-columns: 1fr;
    padding: 22px;
  }
  .cta-actions {
    grid-column: 1;
    grid-row: auto;
  }
}
</style>

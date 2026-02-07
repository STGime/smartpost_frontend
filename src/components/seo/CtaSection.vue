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
  text-align: center;
  padding: 48px 24px;
  margin: 40px 0 0;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.2), rgba(15, 23, 42, 0.98));
}

.cta-heading {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.cta-subtext {
  font-size: 14px;
  color: var(--muted);
  max-width: 480px;
  margin: 0 auto 24px;
}

.cta-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.btn-primary {
  border: none;
  cursor: pointer;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  background: radial-gradient(circle at top left, #6366f1, #4f46e5);
  color: #e5e7eb;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.8);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.arrow {
  font-size: 15px;
  transform: translateY(0.5px);
}
</style>

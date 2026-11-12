<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { paymentsService } from '@/services'
import type { PricingPlan, BillingInterval } from '@/types'

const emit = defineEmits<{
  select: [planType: string, billingInterval: BillingInterval]
}>()

const plansData = ref<Record<string, { monthly: PricingPlan; yearly: PricingPlan }>>({})
const isLoading = ref(true)
const error = ref<string | null>(null)
const billingInterval = ref<BillingInterval>('year')

onMounted(async () => {
  try {
    const response = await paymentsService.getPlans()
    plansData.value = response.plans
  } catch (err) {
    console.error('Failed to fetch plans:', err)
    error.value = 'Failed to load plans. Please try again.'
  } finally {
    isLoading.value = false
  }
})

const intervalKey = computed(() => billingInterval.value === 'year' ? 'yearly' : 'monthly')

const starterPlan = computed<PricingPlan | null>(() => plansData.value.starter?.[intervalKey.value] ?? null)
const professionalPlan = computed<PricingPlan | null>(() => plansData.value.professional?.[intervalKey.value] ?? null)
const hasPlans = computed(() => starterPlan.value || professionalPlan.value)

const formatPrice = (plan: PricingPlan | null) => {
  if (!plan) return ''
  const symbol = plan.currency === 'eur' ? '€' : '$'
  if (plan.billingInterval === 'year') {
    return `${symbol}${Math.round(plan.priceCents / 12 / 100)}`
  }
  return `${symbol}${Math.round(plan.priceCents / 100)}`
}

const handleSelect = (planType: string) => {
  emit('select', planType, billingInterval.value)
}

const isUnlimited = (value: number | null | undefined) => value == null || value >= 100000
const formatLimit = (value: number | null | undefined) => isUnlimited(value) ? 'Unlimited*' : (value ?? 0)

const getFilteredFeatures = (plan: PricingPlan) => {
  const excludePatterns = [
    /social account/i,
    /posts?\s*\/\s*month/i,
    /posts?\/month/i,
    /scheduled post/i,
  ]
  return (plan.features || []).filter(feature =>
    !excludePatterns.some(pattern => pattern.test(feature))
  )
}
</script>

<template>
  <div class="plan-selection">
    <div class="step-header">
      <h1>Choose your plan</h1>
      <p>Start with a 14-day free trial. No credit card required.</p>
    </div>

    <!-- Billing Toggle -->
    <div class="toggle-wrapper">
      <div class="interval-toggle">
        <button
          :class="['toggle-btn', { active: billingInterval === 'month' }]"
          @click="billingInterval = 'month'"
        >
          Monthly
        </button>
        <button
          :class="['toggle-btn', { active: billingInterval === 'year' }]"
          @click="billingInterval = 'year'"
        >
          Yearly
          <span class="save-badge">Save 20%</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="!hasPlans" class="error-state">
      <p>No plans available. Please try again later.</p>
    </div>

    <div v-else class="plans-grid">
      <!-- Starter -->
      <div v-if="starterPlan" class="plan-card">
        <div class="trial-badge">14 days free</div>

        <div class="plan-header">
          <h2 class="plan-name">Starter</h2>
          <div class="plan-price">
            <span class="price-amount">{{ formatPrice(starterPlan) }}</span>
            <span class="price-period">/mo</span>
          </div>
          <p v-if="billingInterval === 'year'" class="billed-note">billed yearly</p>
        </div>

        <div class="plan-limits">
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(starterPlan.maxSocialAccounts) }}</span>
            <span class="limit-label">social accounts</span>
          </div>
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(starterPlan.maxPostsPerMonth) }}</span>
            <span class="limit-label">posts / month</span>
          </div>
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(starterPlan.maxScheduledPosts) }}</span>
            <span class="limit-label">scheduled posts</span>
          </div>
        </div>

        <ul class="plan-features">
          <li v-for="feature in getFilteredFeatures(starterPlan)" :key="feature">
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button class="btn-select btn-secondary" @click="handleSelect('starter')">
          Start free trial
        </button>
      </div>

      <!-- Professional -->
      <div v-if="professionalPlan" class="plan-card featured">
        <div class="popular-badge">Most Popular</div>

        <div class="plan-header">
          <h2 class="plan-name">Professional</h2>
          <div class="plan-price">
            <span class="price-amount">{{ formatPrice(professionalPlan) }}</span>
            <span class="price-period">/mo</span>
          </div>
          <p v-if="billingInterval === 'year'" class="billed-note">billed yearly</p>
        </div>

        <div class="plan-limits">
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(professionalPlan.maxSocialAccounts) }}</span>
            <span class="limit-label">social accounts</span>
          </div>
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(professionalPlan.maxPostsPerMonth) }}</span>
            <span class="limit-label">posts / month</span>
          </div>
          <div class="limit-row">
            <span class="limit-value">{{ formatLimit(professionalPlan.maxScheduledPosts) }}</span>
            <span class="limit-label">scheduled posts</span>
          </div>
        </div>

        <ul class="plan-features">
          <li v-for="feature in getFilteredFeatures(professionalPlan)" :key="feature">
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            {{ feature }}
          </li>
        </ul>

        <button class="btn-select btn-primary" @click="handleSelect('professional')">
          Get started
        </button>
      </div>
    </div>
    <p class="pricing-footnote">* Unlimited is subject to fair use. Plans are designed for normal business usage.</p>
  </div>
</template>

<style scoped>
.plan-selection {
  width: 100%;
}

.pricing-footnote {
  margin-top: 16px;
  font-size: 12px;
  color: var(--fg-3);
  text-align: center;
}

.step-header {
  text-align: center;
  margin-bottom: 24px;
}

.step-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 6px;
}

.step-header p {
  color: var(--fg-2);
  font-size: 15px;
}

/* Billing Toggle */
.toggle-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 28px;
}

.interval-toggle {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--ink-1);
  border: 1px solid var(--line);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 3px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-2);
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.toggle-btn:hover {
  color: var(--text);
}

.toggle-btn.active {
  background: var(--ink-3);
  color: var(--text);
}

.save-badge {
  padding: 1px 5px;
  border-radius: 2px;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  color: var(--success);
  border: 1px solid rgba(95, 191, 138, 0.5);
}

/* Loading / Error */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px 16px;
}

.error-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--error);
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.plan-card {
  padding: 22px;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s;
}

.plan-card:hover {
  border-color: var(--line-strong);
}

.plan-card.featured {
  border-color: var(--signal);
}

.trial-badge,
.popular-badge {
  align-self: flex-start;
  padding: 3px 7px;
  border-radius: 2px;
  border: 1px solid;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.trial-badge {
  color: var(--success);
  border-color: rgba(95, 191, 138, 0.5);
}

.popular-badge {
  color: var(--signal);
  border-color: rgba(242, 169, 59, 0.5);
  background: var(--signal-soft);
}

/* Plan Header */
.plan-header {
  margin-bottom: 16px;
  padding-top: 14px;
}

.plan-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 8px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-amount {
  font-family: var(--font-mono);
  font-size: 32px;
  font-weight: 500;
  color: var(--text);
  letter-spacing: -0.02em;
}

.price-period {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
}

.billed-note {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-3);
  margin-top: 2px;
}

/* Limits */
.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  margin-bottom: 14px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.limit-value {
  font-family: var(--font-mono);
  font-weight: 500;
  min-width: 28px;
  color: var(--text);
}

.limit-label {
  color: var(--fg-2);
}

/* Features */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 22px 0;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-secondary);
}

.check-icon {
  width: 14px;
  height: 14px;
  color: var(--success);
  flex-shrink: 0;
}

/* Buttons: global .btn-primary / .btn-secondary supply the look */
.btn-select {
  width: 100%;
}

@media (max-width: 640px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>

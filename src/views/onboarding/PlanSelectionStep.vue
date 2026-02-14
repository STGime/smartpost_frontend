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
  color: var(--muted);
  text-align: center;
}

.step-header {
  text-align: center;
  margin-bottom: 24px;
}

.step-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.step-header p {
  color: var(--muted);
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
  padding: 4px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}

.toggle-btn.active {
  background: var(--accent);
  color: white;
}

.save-badge {
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 600;
  background: rgba(22, 163, 74, 0.2);
  color: #86efac;
  border: 1px solid rgba(22, 163, 74, 0.4);
}

/* Loading / Error */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 64px;
}

.error-state {
  text-align: center;
  padding: 32px;
  color: var(--error);
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.plan-card {
  position: relative;
  padding: 24px;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  flex-direction: column;
  transition: border-color 0.2s, transform 0.2s;
}

.plan-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-2px);
}

.plan-card.featured {
  border-color: var(--accent);
  background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.15), rgba(15, 23, 42, 0.8));
}

.trial-badge,
.popular-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

.trial-badge {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.popular-badge {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

/* Plan Header */
.plan-header {
  text-align: center;
  margin-bottom: 16px;
  padding-top: 8px;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
}

.price-amount {
  font-size: 36px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.price-period {
  font-size: 14px;
  color: var(--muted);
}

.billed-note {
  font-size: 12px;
  color: var(--muted);
  margin-top: 2px;
}

/* Limits */
.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
  margin-bottom: 12px;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.limit-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.limit-value {
  font-weight: 600;
  min-width: 28px;
  color: var(--text);
}

.limit-label {
  color: var(--muted);
}

/* Features */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  width: 16px;
  height: 16px;
  color: var(--success);
  flex-shrink: 0;
}

/* Buttons */
.btn-select {
  width: 100%;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}

.btn-select.btn-primary {
  background: var(--accent);
  color: white;
  border: none;
}

.btn-select.btn-primary:hover {
  background: var(--accent-hover);
}

.btn-select.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-select.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--border-hover);
}

.btn-select:active {
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { paymentsService, userService } from '@/services'
import type { Subscription, Plan, PricingPlan } from '@/types'

const plans = ref<PricingPlan[]>([])
const subscription = ref<Subscription | null>(null)
const currentPlan = ref<Plan | null>(null)
const isLoading = ref(true)
const billingInterval = ref<'month' | 'year'>('month')

onMounted(async () => {
  try {
    const [plansData, subData, planData] = await Promise.all([
      paymentsService.getPlans(),
      paymentsService.getSubscription(),
      userService.getPlan()
    ])
    plans.value = plansData.allPlans
    subscription.value = subData.subscription
    currentPlan.value = planData
  } catch {
    // Handle error
  } finally {
    isLoading.value = false
  }
})

// Get plans filtered by billing interval, excluding trial
const filteredPlans = computed(() => {
  return plans.value.filter(p => p.billingInterval === billingInterval.value && (p.planType as string) !== 'trial')
})

// Check if a plan is the user's current PAID plan.
// A trial is NOT a paid plan, so trial users (including expired trials) can
// purchase either Starter or Professional — neither card is "current".
const isCurrentPlan = (planType: string) => {
  const userType = currentPlan.value?.plan?.type
  if (userType === 'trial') return false
  return userType === planType
}

// Get display name for a plan type
const getPlanDisplayName = (planType: string) => {
  if (planType === 'trial') return 'Starter (Trial)'
  return planType.charAt(0).toUpperCase() + planType.slice(1)
}

// Filter out features that duplicate the limit displays
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

// Get currency symbol
const getCurrencySymbol = (currency: string) => {
  return currency === 'eur' ? '€' : '$'
}

// Monthly-equivalent price from the DB (yearly plans divide the annual total by 12)
const monthlyPrice = (plan: PricingPlan) => {
  const cents = plan.billingInterval === 'year' ? plan.priceCents / 12 : plan.priceCents
  return Math.round(cents / 100)
}

const isUnlimited = (value: number | null | undefined) => value == null || value >= 100000
const formatLimit = (value: number | null | undefined) => isUnlimited(value) ? 'Unlimited*' : (value ?? 0)

// Format the current plan display name
const currentPlanDisplayName = computed(() => {
  const type = currentPlan.value?.plan?.type
  if (!type) return 'No Plan'
  if (type === 'trial') return 'Starter (Trial)'
  return type.charAt(0).toUpperCase() + type.slice(1)
})

// Check if user is on trial
const isOnTrial = computed(() => {
  return currentPlan.value?.plan?.type === 'trial'
})

// Get days remaining
const daysRemaining = computed(() => {
  return currentPlan.value?.plan?.days_remaining ?? null
})

const handleSubscribe = async (planType: string) => {
  try {
    const { url } = await paymentsService.createCheckout(
      planType as 'starter' | 'professional',
      billingInterval.value,
      `${window.location.origin}/app/billing?success=true`,
      `${window.location.origin}/app/billing?cancelled=true`
    )
    window.location.href = url
  } catch {
    // Handle error
  }
}

const handleManageSubscription = async () => {
  try {
    const { url } = await paymentsService.createPortalSession()
    window.location.href = url
  } catch {
    // Handle error
  }
}
</script>

<template>
  <div class="billing-page">
    <div class="page-header">
      <h1>Billing</h1>
      <p>Manage your subscription and payment methods</p>
    </div>

    <!-- Current Plan -->
    <div v-if="currentPlan" class="subscription-card card">
      <div class="subscription-header">
        <div class="subscription-icon" :class="{ 'trial-icon': isOnTrial }">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2>Current Plan</h2>
          <p>Your active plan details</p>
        </div>
      </div>
      <div class="subscription-content">
        <div class="subscription-details">
          <p class="subscription-plan">{{ currentPlanDisplayName }}</p>
          <p v-if="isOnTrial && daysRemaining !== null" class="subscription-trial">
            {{ daysRemaining }} days remaining
          </p>
          <p v-else-if="subscription" class="subscription-billing">
            {{ subscription.billingInterval === 'year' ? 'Yearly' : 'Monthly' }} billing
          </p>
          <p v-if="subscription?.cancelAtPeriodEnd" class="subscription-warning">
            Cancels at end of period
          </p>
          <div class="current-limits">
            <span>{{ formatLimit(currentPlan.plan?.limits?.max_social_accounts) }} accounts</span>
            <span class="dot">·</span>
            <span>{{ formatLimit(currentPlan.plan?.limits?.max_posts_per_month) }} posts/mo</span>
          </div>
          <div class="current-usage">
            <span>{{ currentPlan.usage?.connected_accounts }}/{{ formatLimit(currentPlan.plan?.limits?.max_social_accounts) }} accounts used</span>
            <span class="dot">·</span>
            <span>{{ currentPlan.usage?.posts_this_month }}/{{ formatLimit(currentPlan.plan?.limits?.max_posts_per_month) }} posts this month</span>
          </div>
        </div>
        <button v-if="subscription" @click="handleManageSubscription" class="btn-secondary">
          Manage Subscription
        </button>
      </div>
    </div>

    <!-- Plans -->
    <div class="plans-section card">
      <div class="plans-header">
        <h2>Available Plans</h2>
        <div class="interval-toggle">
          <button
            @click="billingInterval = 'month'"
            :class="['toggle-btn', { active: billingInterval === 'month' }]"
          >
            Monthly
          </button>
          <button
            @click="billingInterval = 'year'"
            :class="['toggle-btn', { active: billingInterval === 'year' }]"
          >
            Yearly
            <span class="save-badge">Save 20%</span>
          </button>
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
      </div>

      <div v-else-if="filteredPlans.length === 0" class="empty-state">
        <p>No plans available</p>
      </div>

      <div v-else class="plans-grid">
        <div
          v-for="plan in filteredPlans"
          :key="plan.id"
          class="plan-card"
          :class="{
            'plan-card-featured': plan.planType === 'professional',
            'plan-card-current': isCurrentPlan(plan.planType)
          }"
        >
          <div v-if="plan.planType === 'professional'" class="featured-badge">Recommended</div>
          <div v-if="isCurrentPlan(plan.planType)" class="current-badge">Current</div>
          <div class="plan-header">
            <h3>{{ getPlanDisplayName(plan.planType) }}</h3>
            <div class="plan-price">
              <span class="price-amount">{{ getCurrencySymbol(plan.currency) }}{{ monthlyPrice(plan) }}</span>
              <span class="price-period">/mo</span>
            </div>
            <p v-if="plan.billingInterval === 'year'" class="price-billed">
              billed {{ getCurrencySymbol(plan.currency) }}{{ (plan.priceCents / 100).toFixed(0) }}/year
            </p>
          </div>
          <ul class="plan-features">
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ formatLimit(plan.maxSocialAccounts) }} social accounts
            </li>
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ formatLimit(plan.maxPostsPerMonth) }} posts/month
            </li>
            <li v-for="feature in getFilteredFeatures(plan)" :key="feature">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>
          <button
            v-if="isCurrentPlan(plan.planType)"
            disabled
            class="plan-btn plan-btn-current"
          >
            Current Plan
          </button>
          <button
            v-else
            @click="handleSubscribe(plan.planType)"
            class="plan-btn btn-primary"
          >
            {{ plan.planType === 'professional' ? 'Upgrade' : 'Subscribe' }}
          </button>
        </div>
      </div>
      <p class="pricing-footnote">* Unlimited is subject to fair use. Plans are designed for normal business usage.</p>
    </div>
  </div>
</template>

<style scoped>
.billing-page {
  max-width: 900px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 4px;
}

.page-header p {
  font-size: 14px;
  color: var(--fg-2);
}

/* Subscription Card */
.subscription-card {
  padding: 18px 20px;
  margin-bottom: 20px;
}

.subscription-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: -18px -20px 16px;
  padding: 14px 20px;
  border-bottom: 1px solid var(--line);
}

.subscription-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  background: var(--ink-2);
  border: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
  flex-shrink: 0;
}

.subscription-icon svg {
  width: 16px;
  height: 16px;
}

.trial-icon {
  color: var(--signal);
}

.subscription-header h2 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 1px;
}

.subscription-header p {
  font-size: 13px;
  color: var(--fg-3);
}

.subscription-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.subscription-details {
  min-width: 0;
}

.subscription-plan {
  font-size: 18px;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.subscription-billing,
.subscription-trial,
.subscription-warning {
  font-family: var(--font-mono);
  font-size: 12px;
}

.subscription-billing {
  color: var(--fg-2);
}

.subscription-trial,
.subscription-warning {
  color: var(--signal);
}

.subscription-warning {
  margin-top: 6px;
}

.current-limits,
.current-usage {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin-top: 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--fg-2);
}

.current-usage {
  margin-top: 4px;
  font-size: 11px;
  color: var(--fg-3);
}

.dot {
  color: var(--fg-3);
}

/* Plans Section */
.plans-section {
  padding: 20px;
}

.plans-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.plans-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.interval-toggle {
  display: inline-flex;
  border: 1px solid var(--line-strong);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-2);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.toggle-btn + .toggle-btn {
  border-left: 1px solid var(--line-strong);
}

.toggle-btn:hover {
  color: var(--text);
}

.toggle-btn.active {
  background: var(--ink-2);
  color: var(--text);
}

.save-badge {
  font-size: 11px;
  color: var(--signal);
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 48px;
}

/* Plans Grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(260px, 100%), 1fr));
  gap: 16px;
}

.pricing-footnote {
  margin-top: 16px;
  font-size: 12px;
  color: var(--fg-3);
  text-align: center;
}

.plan-card {
  position: relative;
  border-radius: var(--radius-md);
  border: 1px solid var(--line);
  background: var(--ink-1);
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.plan-card-featured {
  border-color: var(--line-strong);
}

.plan-card-current {
  border-color: rgba(95, 191, 138, 0.5);
}

.featured-badge,
.current-badge {
  position: absolute;
  top: 24px;
  right: 24px;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 7px;
  border: 1px solid var(--signal);
  border-radius: 2px;
  color: var(--signal);
  white-space: nowrap;
}

.current-badge {
  border-color: rgba(95, 191, 138, 0.5);
  color: var(--success);
}

.plan-card-featured .current-badge {
  top: 52px;
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--fg-3);
}

.plan-header {
  margin-bottom: 20px;
}

.plan-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-right: 110px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-amount {
  font-size: 40px;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.price-period,
.price-billed {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
}

.price-billed {
  margin-top: 6px;
  font-size: 12px;
}

.plan-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: var(--fg-2);
}

.plan-features svg {
  width: 14px;
  height: 14px;
  color: var(--success);
  flex-shrink: 0;
  margin-top: 4px;
}

.plan-btn {
  width: 100%;
}

.plan-btn-current {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  background: transparent;
  border: 1px solid var(--line-strong);
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--fg-3);
  cursor: not-allowed;
}
</style>

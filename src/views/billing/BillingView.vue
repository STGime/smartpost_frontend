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

// Check if a plan is the user's current plan (trial counts as starter)
const isCurrentPlan = (planType: string) => {
  const userType = currentPlan.value?.plan?.type
  if (userType === 'trial' && planType === 'starter') return true
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
            <span>{{ currentPlan.plan?.limits?.max_social_accounts }} accounts</span>
            <span class="dot">·</span>
            <span>{{ currentPlan.plan?.limits?.max_posts_per_month }} posts/mo</span>
          </div>
          <div class="current-usage">
            <span>{{ currentPlan.usage?.connected_accounts }}/{{ currentPlan.plan?.limits?.max_social_accounts }} accounts used</span>
            <span class="dot">·</span>
            <span>{{ currentPlan.usage?.posts_this_month }}/{{ currentPlan.plan?.limits?.max_posts_per_month }} posts this month</span>
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
              <span class="price-amount">{{ getCurrencySymbol(plan.currency) }}{{ (plan.priceCents / 100).toFixed(0) }}</span>
              <span class="price-period">/{{ plan.billingInterval === 'year' ? 'yr' : 'mo' }}</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ plan.maxSocialAccounts }} social accounts
            </li>
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ plan.maxPostsPerMonth }} posts/month
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
            {{ isOnTrial ? 'Upgrade' : 'Subscribe' }}
          </button>
        </div>
      </div>
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
  color: var(--muted);
}

/* Subscription Card */
.subscription-card {
  padding: 20px;
  margin-bottom: 20px;
}

.subscription-header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.subscription-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--success-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86efac;
  flex-shrink: 0;
}

.subscription-icon svg {
  width: 20px;
  height: 20px;
}

.subscription-header h2 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 2px;
}

.subscription-header p {
  font-size: 13px;
  color: var(--muted);
}

.subscription-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.subscription-plan {
  font-size: 16px;
  font-weight: 600;
  text-transform: capitalize;
  margin-bottom: 4px;
}

.subscription-billing {
  font-size: 13px;
  color: var(--muted);
}

.subscription-warning {
  font-size: 12px;
  color: var(--warning);
  margin-top: 6px;
}

.subscription-trial {
  font-size: 13px;
  color: var(--accent-light);
}

.trial-icon {
  background: var(--accent-soft) !important;
  color: var(--accent-light) !important;
}

.current-limits,
.current-usage {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
}

.current-limits .dot,
.current-usage .dot {
  opacity: 0.5;
}

.current-usage {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.8;
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
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.plans-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.interval-toggle {
  display: flex;
  padding: 4px;
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border);
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
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
  background: var(--success-soft);
  color: #86efac;
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
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.plan-card {
  position: relative;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.6);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.plan-card-featured {
  border-color: var(--accent);
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(15, 23, 42, 0.8));
}

.featured-badge,
.current-badge {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 500;
  background: var(--accent);
  color: white;
}

.current-badge {
  background: var(--success);
}

.plan-card-current {
  border-color: var(--success);
}

.empty-state {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

.plan-header {
  margin-bottom: 20px;
}

.plan-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.price-amount {
  font-size: 32px;
  font-weight: 700;
}

.price-period {
  font-size: 14px;
  color: var(--muted);
}

.plan-features {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
  flex: 1;
}

.plan-features li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.plan-features svg {
  width: 16px;
  height: 16px;
  color: var(--green);
  flex-shrink: 0;
  margin-top: 1px;
}

.plan-btn {
  width: 100%;
  padding: 10px 16px;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.plan-btn-current {
  background: rgba(100, 116, 139, 0.2);
  border: 1px solid var(--border);
  color: var(--muted);
  cursor: not-allowed;
}
</style>

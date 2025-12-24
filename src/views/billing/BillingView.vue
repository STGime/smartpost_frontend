<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { paymentsService } from '@/services'
import { useUserStore } from '@/stores'
import type { PricingPlan, Subscription } from '@/types'

const userStore = useUserStore()

const plans = ref<PricingPlan[]>([])
const subscription = ref<Subscription | null>(null)
const isLoading = ref(true)
const billingInterval = ref<'month' | 'year'>('month')

onMounted(async () => {
  try {
    const [plansData, subData] = await Promise.all([
      paymentsService.getPlans(),
      paymentsService.getSubscription()
    ])
    plans.value = plansData.allPlans
    subscription.value = subData.subscription
  } catch {
    // Handle error
  } finally {
    isLoading.value = false
  }
})

const filteredPlans = () => {
  return plans.value.filter(p => p.interval === billingInterval.value)
}

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
    const { url } = await paymentsService.createPortalSession(
      `${window.location.origin}/app/billing`
    )
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

    <!-- Current subscription -->
    <div v-if="subscription" class="subscription-card card">
      <div class="subscription-header">
        <div class="subscription-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div>
          <h2>Current Subscription</h2>
          <p>Your active plan details</p>
        </div>
      </div>
      <div class="subscription-content">
        <div class="subscription-details">
          <p class="subscription-plan">{{ subscription.planType }} Plan</p>
          <p class="subscription-billing">
            {{ subscription.billingInterval === 'year' ? 'Yearly' : 'Monthly' }} billing
          </p>
          <p v-if="subscription.cancelAtPeriodEnd" class="subscription-warning">
            Cancels at end of period
          </p>
        </div>
        <button @click="handleManageSubscription" class="btn-secondary">
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

      <div v-else class="plans-grid">
        <!-- Free plan -->
        <div class="plan-card">
          <div class="plan-header">
            <h3>Free</h3>
            <div class="plan-price">
              <span class="price-amount">$0</span>
              <span class="price-period">/month</span>
            </div>
          </div>
          <ul class="plan-features">
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ userStore.plan?.limits?.posts_per_month || 10 }} posts/month
            </li>
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ userStore.plan?.limits?.connected_accounts || 2 }} connected accounts
            </li>
            <li>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Basic support
            </li>
          </ul>
          <button disabled class="plan-btn plan-btn-current">
            Current Plan
          </button>
        </div>

        <!-- Paid plans -->
        <div
          v-for="plan in filteredPlans()"
          :key="plan.id"
          class="plan-card plan-card-featured"
        >
          <div class="featured-badge">Recommended</div>
          <div class="plan-header">
            <h3>{{ plan.displayName }}</h3>
            <div class="plan-price">
              <span class="price-amount">${{ plan.price / 100 }}</span>
              <span class="price-period">/{{ plan.interval }}</span>
            </div>
          </div>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ feature }}
            </li>
          </ul>
          <button
            @click="handleSubscribe(plan.name)"
            class="plan-btn btn-primary"
          >
            Subscribe
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

.featured-badge {
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

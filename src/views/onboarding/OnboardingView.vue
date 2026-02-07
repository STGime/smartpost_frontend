<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PlanSelectionStep from './PlanSelectionStep.vue'
import ConnectAccountStep from './ConnectAccountStep.vue'
import { userService, paymentsService } from '@/services'
import { resetOnboardingStatus } from '@/router'
import type { BillingInterval } from '@/types'

const router = useRouter()
const route = useRoute()

type OnboardingStep = 'plan' | 'connect'

const currentStep = ref<OnboardingStep>('plan')
const selectedPlan = ref<string | null>(null)
const selectedBillingInterval = ref<BillingInterval>('year')
const isCompleting = ref(false)
const isRedirecting = ref(false)
const error = ref<string | null>(null)

const stepNumber = computed(() => (currentStep.value === 'plan' ? 1 : 2))

const handlePlanSelected = async (planType: string, billingInterval: BillingInterval) => {
  selectedPlan.value = planType
  selectedBillingInterval.value = billingInterval

  if (planType === 'starter') {
    currentStep.value = 'connect'
    return
  }

  // Professional plan: redirect to LemonSqueezy checkout
  isRedirecting.value = true
  error.value = null

  try {
    localStorage.setItem('onboarding_checkout', JSON.stringify({ planType, billingInterval }))

    const successUrl = `${window.location.origin}/app/onboarding?checkout=success`
    const cancelUrl = `${window.location.origin}/app/onboarding?checkout=cancelled`

    const { url } = await paymentsService.createCheckout(
      planType as 'professional',
      billingInterval,
      successUrl,
      cancelUrl
    )

    window.location.href = url
  } catch (err) {
    console.error('Failed to create checkout:', err)
    localStorage.removeItem('onboarding_checkout')
    isRedirecting.value = false
    error.value = 'Failed to start checkout. Please try again.'
  }
}

const handleAccountConnected = async () => {
  await completeOnboarding()
}

const handleSkip = async () => {
  await completeOnboarding()
}

const completeOnboarding = async () => {
  isCompleting.value = true
  error.value = null

  try {
    await userService.completeOnboarding(selectedPlan.value || 'trial')
    // Mark onboarding as complete in router cache
    resetOnboardingStatus()
    router.push({ name: 'dashboard' })
  } catch (err) {
    console.error('Failed to complete onboarding:', err)
    error.value = 'Failed to complete setup. Please try again.'
    isCompleting.value = false
  }
}

// Check if user already completed onboarding
onMounted(async () => {
  // Check if user is authenticated
  const token = localStorage.getItem('access_token')
  if (!token) {
    router.push({ name: 'login' })
    return
  }

  try {
    const profile = await userService.getProfile()
    if (profile.onboarding_completed) {
      router.push({ name: 'dashboard' })
      return
    }
  } catch (err) {
    // If 401, user needs to login again
    const e = err as { response?: { status?: number } }
    if (e.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      router.push({ name: 'login' })
      return
    }
    // Otherwise stay on onboarding - plans will still load
  }

  // Handle return from LemonSqueezy checkout
  const checkoutStatus = route.query.checkout as string | undefined
  if (checkoutStatus === 'success') {
    const stored = localStorage.getItem('onboarding_checkout')
    if (stored) {
      const { planType, billingInterval } = JSON.parse(stored) as { planType: string; billingInterval: BillingInterval }
      selectedPlan.value = planType
      selectedBillingInterval.value = billingInterval
    }
    localStorage.removeItem('onboarding_checkout')
    router.replace({ name: 'onboarding', query: {} })
    currentStep.value = 'connect'
  } else if (checkoutStatus === 'cancelled') {
    localStorage.removeItem('onboarding_checkout')
    router.replace({ name: 'onboarding', query: {} })
  }
})
</script>

<template>
  <div class="onboarding-page">
    <div class="onboarding-container">
      <!-- Logo -->
      <div class="onboarding-logo">
        <div class="logo-mark">
          <div class="logo-inner">P</div>
        </div>
        <span class="logo-text">Posta</span>
      </div>

      <!-- Progress indicator -->
      <div class="progress-indicator">
        <div class="progress-step" :class="{ active: stepNumber >= 1, completed: stepNumber > 1 }">
          <span class="step-number">1</span>
          <span class="step-label">Choose plan</span>
        </div>
        <div class="progress-line" :class="{ active: stepNumber > 1 }"></div>
        <div class="progress-step" :class="{ active: stepNumber >= 2 }">
          <span class="step-number">2</span>
          <span class="step-label">Connect account</span>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="alert-error">
        {{ error }}
      </div>

      <!-- Loading overlay -->
      <div v-if="isCompleting || isRedirecting" class="completing-overlay">
        <div class="spinner"></div>
        <p>{{ isRedirecting ? 'Redirecting to payment...' : 'Setting up your account...' }}</p>
      </div>

      <!-- Step content -->
      <div v-else class="step-content">
        <PlanSelectionStep
          v-if="currentStep === 'plan'"
          @select="handlePlanSelected"
        />
        <ConnectAccountStep
          v-else-if="currentStep === 'connect'"
          @connected="handleAccountConnected"
          @skip="handleSkip"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px;
}

.onboarding-container {
  width: 100%;
  max-width: 800px;
}

.onboarding-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 32px;
}

.logo-text {
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Progress Indicator */
.progress-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 32px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.progress-step.active {
  opacity: 1;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(79, 70, 229, 0.2);
  border: 2px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent-light);
  transition: background 0.2s;
}

.progress-step.completed .step-number {
  background: var(--accent);
  color: white;
}

.step-label {
  font-size: 13px;
  color: var(--muted);
}

.progress-step.active .step-label {
  color: var(--text);
}

.progress-line {
  width: 60px;
  height: 2px;
  background: var(--border);
  transition: background 0.2s;
}

.progress-line.active {
  background: var(--accent);
}

/* Completing overlay */
.completing-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
}

.completing-overlay p {
  color: var(--muted);
  font-size: 14px;
}

/* Alert */
.alert-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 640px) {
  .progress-indicator {
    flex-direction: column;
    gap: 12px;
  }

  .progress-line {
    width: 2px;
    height: 20px;
  }
}
</style>

export const featureFlags = {
  signupEnabled: import.meta.env.VITE_FEATURE_SIGNUP_ENABLED === 'true',
}

export const isSignupEnabled = () => featureFlags.signupEnabled

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <!-- Header -->
      <header class="header">
        <div class="logo">
          <div class="logo-mark">
            <div class="logo-inner">P</div>
          </div>
          <div>
            <div class="logo-text">Posta</div>
            <div class="logo-tagline">Create once. Post everywhere.</div>
          </div>
        </div>
        <div class="header-actions">
          <span class="beta-tag">Private beta</span>
          <RouterLink v-if="!isAuthenticated" to="/login" class="btn-secondary">
            Log in
          </RouterLink>
          <RouterLink v-else to="/app" class="btn-primary">
            Dashboard
          </RouterLink>
        </div>
      </header>

      <!-- Hero -->
      <main>
        <section class="hero">
          <div class="hero-content">
            <div class="eyebrow">
              <span class="eyebrow-pill">Multi-channel</span>
              <span>One workflow for all your socials</span>
            </div>
            <h1>
              Create once, <span class="gradient-text">ship everywhere</span>.
            </h1>
            <p class="hero-sub">
              Posta turns one piece of content into platform-ready posts for TikTok, Instagram, YouTube & more –
              with face-aware cropping, smart compression and simple scheduling built-in.
            </p>

            <div class="hero-bullets">
              <div class="chip">
                <span class="chip-dot"></span>
                Face-aware framing & smart crops
              </div>
              <div class="chip">
                Auto-format for Reels, Shorts & feed
              </div>
              <div class="chip">
                Creator-friendly pricing
              </div>
            </div>

            <div class="hero-actions">
              <RouterLink v-if="!isAuthenticated" to="/signup" class="btn-primary">
                Get Started <span class="arrow">→</span>
              </RouterLink>
              <RouterLink v-if="!isAuthenticated" to="/login" class="btn-ghost">
                Sign in to your account
              </RouterLink>
              <RouterLink v-if="isAuthenticated" to="/app" class="btn-primary">
                Go to Dashboard <span class="arrow">→</span>
              </RouterLink>
            </div>
            <p class="small-note">
              Built for indie creators, small teams and lean marketing setups.
            </p>
          </div>

          <div class="hero-card-wrapper">
            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-label">Sample campaign · Weekly highlights</div>
                  <div class="card-title">1 asset → 6 posts scheduled</div>
                </div>
                <span class="badge badge-success">Smart automation</span>
              </div>

              <div class="timeline">
                <div class="timeline-row">
                  <span class="timeline-label">Source video</span>
                  <span class="timeline-value">Square · 1080×1080</span>
                </div>
                <div class="timeline-row">
                  <span class="timeline-label">Outputs</span>
                  <span class="timeline-value">Reels, Shorts, TikTok, feed</span>
                </div>
                <div class="timeline-bar">
                  <div class="timeline-fill"></div>
                </div>
              </div>

              <div class="mini-grid">
                <div class="mini-card">
                  <div class="mini-title">Face-aware crops</div>
                  <div class="mini-main">Keeps faces centered in 9:16 & 16:9</div>
                  <div class="mini-sub">No more manual reframing for every platform.</div>
                </div>
                <div class="mini-card">
                  <div class="mini-title">Smart compression</div>
                  <div class="mini-main">Optimized for quality & size</div>
                  <div class="mini-sub">Ideal for mobile uploads and slower networks.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="section">
          <h2 class="section-title">Why Posta?</h2>
          <p class="section-sub">
            Existing social tools are either too simple or too expensive. Posta focuses on what solo builders and lean
            teams actually need: smart media handling, simple workflows and predictable pricing.
          </p>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-tag">Media intelligence</div>
              <div class="feature-title">Face detection & smart cropping</div>
              <div class="feature-body">
                Automatically detects faces in your photos and videos and keeps them in frame when converting to
                portrait, landscape or square formats.
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-tag">Format once</div>
              <div class="feature-title">Auto layouts for every platform</div>
              <div class="feature-body">
                Generate variants tailored for TikTok, Instagram, YouTube Shorts and more – without exporting ten
                different versions by hand.
              </div>
            </div>
            <div class="feature-card">
              <div class="feature-tag">Performance</div>
              <div class="feature-title">Smart compression engine</div>
              <div class="feature-body">
                Compress images and video so they upload fast and still look good. Keep quality where it matters, save
                bytes where it doesn't.
              </div>
            </div>
          </div>
        </section>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div>© {{ new Date().getFullYear() }} Posta. All rights reserved.</div>
        <div class="footer-links">
          <a href="mailto:hello@getposta.app">Contact</a>
          <a href="/terms.html">Terms</a>
          <a href="/privacy.html">Privacy</a>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.wrapper {
  max-width: 1040px;
  margin: 0 auto;
  padding: 32px 20px 60px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-text {
  font-weight: 600;
  letter-spacing: 0.02em;
  font-size: 18px;
}

.logo-tagline {
  font-size: 11px;
  color: var(--muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.beta-tag {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--muted);
  padding: 4px 9px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.7);
}

/* Hero */
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 32px;
  align-items: center;
  margin-bottom: 64px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  background: rgba(15, 23, 42, 0.8);
  color: var(--muted);
  font-size: 12px;
  margin-bottom: 14px;
}

.eyebrow-pill {
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: var(--accent-soft);
  color: #e0e7ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

h1 {
  font-size: clamp(2.3rem, 3.3vw, 3rem);
  line-height: 1.04;
  letter-spacing: -0.04em;
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 15px;
  color: var(--muted);
  max-width: 520px;
  margin-bottom: 22px;
}

.hero-bullets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 26px;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--green);
  box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.3);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.arrow {
  font-size: 15px;
}

.small-note {
  font-size: 11px;
  color: var(--muted);
}

/* Card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-label {
  font-size: 12px;
  color: var(--muted);
}

.card-title {
  font-size: 13px;
  font-weight: 500;
}

.timeline {
  font-size: 12px;
  border-radius: var(--radius-md);
  padding: 10px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid var(--border);
  margin-bottom: 10px;
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-row:last-of-type {
  margin-bottom: 0;
}

.timeline-label {
  color: var(--muted);
}

.timeline-value {
  font-weight: 500;
  font-size: 12px;
}

.timeline-bar {
  margin-top: 8px;
  height: 4px;
  border-radius: var(--radius-full);
  background: rgba(31, 41, 55, 0.9);
  overflow: hidden;
}

.timeline-fill {
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--green));
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.mini-card {
  border-radius: var(--radius-md);
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid var(--border);
  padding: 8px 9px;
}

.mini-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--muted);
  margin-bottom: 4px;
}

.mini-main {
  font-size: 12px;
  margin-bottom: 2px;
}

.mini-sub {
  font-size: 11px;
  color: var(--muted);
}

/* Section */
.section {
  margin-bottom: 48px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 10px;
}

.section-sub {
  font-size: 13px;
  color: var(--muted);
  max-width: 620px;
  margin-bottom: 18px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.feature-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background: linear-gradient(to bottom right, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  padding: 14px 13px 13px;
  font-size: 13px;
}

.feature-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: #a5b4fc;
  margin-bottom: 6px;
}

.feature-title {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.feature-body {
  color: var(--muted);
  font-size: 12px;
}

/* Footer */
.footer {
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  padding-top: 16px;
  margin-top: auto;
  font-size: 11px;
  color: var(--muted);
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.footer-links {
  display: flex;
  gap: 10px;
}

.footer-links a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

/* Responsive */
@media (max-width: 860px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
  }
  .hero-card-wrapper {
    order: -1;
  }
}

@media (max-width: 720px) {
  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .header {
    flex-wrap: wrap;
  }
}
</style>

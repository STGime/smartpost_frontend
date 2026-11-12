<script setup lang="ts">
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import { legalStrings as L } from '@/data/legalStrings'

defineProps<{
  title: string
}>()
</script>

<template>
  <SeoPageLayout waiting-list-source="header">
    <div class="legal-shell">
      <aside class="legal-aside">
        <div class="legal-aside-label">Legal</div>
        <nav class="legal-nav" aria-label="Legal documents">
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/legal-notice">Legal Notice</RouterLink>
        </nav>
        <dl class="legal-meta">
          <dt>Operator</dt>
          <dd>{{ L.legalEntity }}</dd>
          <dt>Version</dt>
          <dd>{{ L.documentVersion }}</dd>
          <dt>Effective</dt>
          <dd>{{ L.effectiveDate }}</dd>
        </dl>
      </aside>

      <article class="legal">
        <h1>{{ title }}</h1>
        <slot />
      </article>
    </div>
  </SeoPageLayout>
</template>

<!-- Unscoped on purpose: styles slot content rendered by the three legal views.
     Every selector is namespaced under .legal-shell. -->
<style>
.legal-shell {
  display: grid;
  grid-template-columns: 200px minmax(0, 1fr);
  gap: 56px;
  padding-block: 56px 88px;
}

.legal-aside {
  position: sticky;
  top: 88px;
  align-self: start;
}

.legal-aside-label,
.legal-shell .legal-meta dt {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
}

.legal-nav {
  display: flex;
  flex-direction: column;
  margin: 12px 0 28px;
  border-left: 1px solid var(--line);
}

.legal-nav a {
  padding: 6px 0 6px 14px;
  margin-left: -1px;
  border-left: 1px solid transparent;
  color: var(--fg-2);
  font-size: 14px;
  text-decoration: none;
}

.legal-nav a:hover {
  color: var(--text);
}

.legal-nav a.router-link-active {
  color: var(--text);
  border-left-color: var(--signal);
}

.legal-shell .legal-meta {
  margin: 0;
  display: grid;
  gap: 4px;
}

.legal-shell .legal-meta dd {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--fg-2);
}

.legal {
  max-width: 720px;
  color: var(--fg-2);
  font-size: 15px;
  line-height: 1.7;
}

.legal h1 {
  margin: 0 0 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--line);
  color: var(--text);
  font-size: clamp(28px, 4vw, 36px);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.legal h2 {
  margin: 44px 0 12px;
  color: var(--text);
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.legal h3 {
  margin: 28px 0 8px;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
}

.legal p,
.legal address {
  margin: 0 0 14px;
  font-style: normal;
}

.legal ul,
.legal ol {
  margin: 0 0 16px;
  padding-left: 20px;
}

.legal li {
  margin-bottom: 6px;
}

.legal li::marker {
  color: var(--fg-3);
}

.legal strong {
  color: var(--text);
  font-weight: 500;
}

.legal a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
}

.legal a:hover {
  text-decoration-color: var(--signal);
}

.legal code {
  font-size: 13px;
  padding: 1px 5px;
  border: 1px solid var(--line);
  border-radius: 2px;
  background: var(--ink-1);
  color: var(--text);
}

.legal .section {
  padding-top: 4px;
}

.legal table {
  width: 100%;
  margin: 8px 0 20px;
  border-collapse: collapse;
  font-size: 14px;
}

.legal th,
.legal td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--line);
  text-align: left;
  vertical-align: top;
}

.legal th {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--fg-3);
  border-bottom-color: var(--line-strong);
}

@media (max-width: 860px) {
  .legal-shell {
    grid-template-columns: 1fr;
    gap: 28px;
    padding-block: 32px 64px;
  }

  .legal-aside {
    position: static;
  }

  .legal-nav {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 4px 20px;
    margin-bottom: 0;
    border-left: 0;
  }

  .legal-nav a {
    padding: 4px 0;
    margin-left: 0;
    border-left: 0;
    border-bottom: 1px solid transparent;
  }

  .legal-nav a.router-link-active {
    border-bottom-color: var(--signal);
  }

  .legal-shell .legal-meta {
    grid-template-columns: auto 1fr;
    gap: 2px 12px;
    margin-top: 16px;
  }

  .legal-shell .legal-meta dd {
    margin: 0;
  }

  .legal {
    font-size: 15px;
  }

  .legal table {
    display: block;
    overflow-x: auto;
  }
}
</style>

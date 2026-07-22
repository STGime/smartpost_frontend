<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { legalStrings as L } from '@/data/legalStrings'

useHead({
  title: 'Legal Notice',
  meta: [
    {
      name: 'description',
      content: `Legal notice for Posta, operated by ${L.legalEntity}, an Estonian private limited company. Registered ${L.registeredAddress}. Registry code ${L.registryNumber}.`,
    },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/legal-notice' },
  ],
})
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <RouterLink to="/" class="back-link">&larr; Back to home</RouterLink>

      <h1>Legal Notice</h1>
      <p class="last-updated">Effective {{ L.effectiveDate }} · Version {{ L.documentVersion }}</p>

      <p>
        The website <a href="https://getposta.app">getposta.app</a> and the Posta
        service are operated by an Estonian private limited company. The
        information on this page is published as required by the Estonian
        <a
          href="https://www.riigiteataja.ee/en/eli/504042014002/consolide"
          target="_blank"
          rel="noopener"
        >Information Society Services Act (ISTS)</a>
        and the Estonian Commercial Code.
      </p>

      <div class="section">
        <h2>Company details</h2>
        <address>
          <strong>{{ L.legalEntity }}</strong><br />
          {{ L.entityType }}<br />
          {{ L.registeredAddress }}
        </address>
      </div>

      <div class="section">
        <h2>Registration &amp; taxation</h2>
        <p>
          <strong>Estonian commercial register code:</strong> {{ L.registryNumber }}<br />
          <strong>VAT identification:</strong> {{ L.vatNumber }}<br />
          <strong>Share capital:</strong> {{ L.shareCapital }}<br />
          <strong>Financial year:</strong> {{ L.financialYear }}
        </p>
        <p>
          The register entry can be verified free of charge on the Estonian
          e-Business Register:
          <a
            :href="`https://ariregister.rik.ee/eng/company/${L.registryNumber}`"
            target="_blank"
            rel="noopener"
            class="contact-link"
          >
            ariregister.rik.ee/eng/company/{{ L.registryNumber }}
          </a>.
        </p>
      </div>

      <div class="section">
        <h2>Principal activity</h2>
        <p>{{ L.principalActivity }}.</p>
      </div>

      <div class="section">
        <h2>Local contact person</h2>
        <p>
          As required by Estonian Commercial Code §631 for companies whose board
          members are not resident in Estonia, the designated local contact
          person is <strong>{{ L.contactPerson }}</strong>, reachable at the
          registered address above.
        </p>
      </div>

      <div class="section">
        <h2>Contact</h2>
        <p>
          <strong>General enquiries:</strong>
          <a :href="`mailto:${L.supportEmail}`" class="contact-link">{{ L.supportEmail }}</a><br />
          <strong>Data-protection matters:</strong>
          <a :href="`mailto:${L.dpoEmail}`" class="contact-link">{{ L.dpoEmail }}</a><br />
          <strong>Legal notices:</strong>
          <a :href="`mailto:${L.noticesEmail}`" class="contact-link">{{ L.noticesEmail }}</a>
        </p>
      </div>

      <div class="section">
        <h2>Consumer dispute resolution</h2>
        <p>
          The European Commission provides an online dispute-resolution
          platform for consumer disputes concluded online, available at
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener"
            class="contact-link"
          >ec.europa.eu/consumers/odr</a>.
          We are not obliged to, and do not participate in, alternative
          dispute-resolution proceedings before a consumer arbitration board.
        </p>
      </div>

      <div class="section">
        <h2>Governing law &amp; jurisdiction</h2>
        <p>
          The legal relationships arising from use of the Posta service are
          governed by the laws of {{ L.governingLaw }}. The competent forum for
          disputes is {{ L.courtOfJurisdiction }}, subject to any mandatory
          consumer-protection provisions in the user's country of residence.
        </p>
      </div>

      <div class="section">
        <h2>Liability for links</h2>
        <p>
          getposta.app may contain links to external websites operated by third
          parties. Their content is the sole responsibility of the respective
          operators. We reviewed linked pages for legality at the time of
          linking but do not continuously monitor third-party content.
        </p>
      </div>

      <div class="section">
        <h2>Copyright</h2>
        <p>
          Unless otherwise stated, all content published on getposta.app —
          including text, graphics, logos, and software — is the property of
          {{ L.legalEntity }} or its licensors and is protected by Estonian
          copyright law (autoriõiguse seadus). Reproduction, distribution, or
          commercial use beyond what the law permits requires prior written
          consent.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  background: radial-gradient(circle at top, #111827 0, #020617 45%, #000 100%);
}

.wrapper {
  max-width: 720px;
  margin: 0 auto;
  padding: 48px 20px 80px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
  text-decoration: none;
  margin-bottom: 32px;
}

.back-link:hover {
  color: var(--text);
}

h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.last-updated {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 24px;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 12px;
  color: var(--text);
}

p,
address {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 12px;
  font-style: normal;
  line-height: 1.65;
}

address {
  line-height: 1.8;
}

.contact-link,
a {
  color: #a5b4fc;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.section {
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.section:last-child {
  border-bottom: none;
}

strong {
  color: var(--text);
  font-weight: 600;
}
</style>

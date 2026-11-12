<script setup lang="ts">
import { useHead } from '@unhead/vue'
import LegalLayout from '@/components/legal/LegalLayout.vue'
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
  <LegalLayout title="Legal Notice">
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
        <a :href="`mailto:${L.supportEmail}`">{{ L.supportEmail }}</a><br />
        <strong>Data-protection matters:</strong>
        <a :href="`mailto:${L.dpoEmail}`">{{ L.dpoEmail }}</a><br />
        <strong>Legal notices:</strong>
        <a :href="`mailto:${L.noticesEmail}`">{{ L.noticesEmail }}</a>
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

  </LegalLayout>
</template>

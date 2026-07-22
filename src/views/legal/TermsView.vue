<script setup lang="ts">
import { useHead } from '@unhead/vue'
import { legalStrings as L } from '@/data/legalStrings'

useHead({
  title: 'Posta - Create once. Post everywhere. - Terms of Service',
  meta: [
    { name: 'description', content: 'Terms of Service for Posta – the social media scheduling and smart cropping platform for creators and teams.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/terms' },
  ],
})

const currentYear = new Date().getFullYear()
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <header class="header">
        <RouterLink to="/" class="logo">
          <div class="logo-mark">
            <div class="logo-inner">P</div>
          </div>
          <div>
            <div class="logo-text">Posta</div>
            <div class="logo-tagline">Create once. Post everywhere.</div>
          </div>
        </RouterLink>
        <RouterLink to="/" class="back-link">
          <span>&larr;</span>
          <span>Back to home</span>
        </RouterLink>
      </header>

      <main class="content">
        <h1>Posta &mdash; Create once. Post everywhere. &mdash; Terms of Service</h1>
        <p class="last-updated">Effective {{ L.effectiveDate }} · Version {{ L.documentVersion }}</p>

        <p>
          These Terms of Service ("Terms") govern your access to and use of the
          Posta platform, website, and services available at getposta.app
          (collectively, the "Service"). The Service is operated by
          <strong>{{ L.legalEntity }}</strong>, a {{ L.entityType }}
          registered at {{ L.registeredAddress }}, Estonian commercial-register
          code {{ L.registryNumber }} ("we", "us", or "our"). Full company
          details are on our <RouterLink to="/legal-notice">Legal Notice</RouterLink>.
        </p>
        <p>
          By accessing or using our Service, you agree to be bound by these Terms. If you do not agree to
          these Terms, please do not use our Service.
        </p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account or using the Service, you confirm that you are at least 18 years old
          (or the age of majority in your jurisdiction) and have the legal capacity to enter into these Terms.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Posta is a social media management platform that enables users to:
        </p>
        <ul>
          <li>Upload and manage media content (images and videos)</li>
          <li>Automatically optimize and crop media for different social media platforms</li>
          <li>Connect social media accounts via OAuth</li>
          <li>Schedule and publish posts to multiple platforms</li>
        </ul>

        <h2>3. Account Registration</h2>
        <p>
          To use certain features of the Service, you must create an account. You agree to:
        </p>
        <ul>
          <li>Provide accurate, current, and complete information during registration</li>
          <li>Maintain and promptly update your account information</li>
          <li>Keep your password secure and confidential</li>
          <li>Accept responsibility for all activities that occur under your account</li>
          <li>Notify us immediately of any unauthorized use of your account</li>
        </ul>

        <h2>4. Subscription and Payment</h2>
        <p>
          Posta offers subscription-based plans. By subscribing to a paid plan:
        </p>
        <ul>
          <li>You authorize us to charge your payment method on a recurring basis</li>
          <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
          <li>Refunds are provided in accordance with our refund policy</li>
          <li>We reserve the right to change pricing with reasonable notice</li>
        </ul>

        <h2>5. User Content</h2>
        <p>
          You retain ownership of any content you upload to the Service ("User Content"). By uploading
          User Content, you grant us a limited license to:
        </p>
        <ul>
          <li>Store, process, and display your content as necessary to provide the Service</li>
          <li>Create derivative works (such as cropped or compressed versions) for platform optimization</li>
          <li>Transmit your content to third-party social media platforms you have connected</li>
        </ul>
        <p>
          You represent and warrant that you have all necessary rights to your User Content and that
          it does not violate any third-party rights or applicable laws.
        </p>

        <h2>6. Prohibited Uses</h2>
        <p>You agree not to use the Service to:</p>
        <ul>
          <li>Upload content that is illegal, harmful, threatening, abusive, or otherwise objectionable</li>
          <li>Infringe on intellectual property rights of others</li>
          <li>Distribute malware, spam, or other harmful content</li>
          <li>Attempt to gain unauthorized access to the Service or its systems</li>
          <li>Interfere with or disrupt the Service or servers</li>
          <li>Violate any applicable laws or regulations</li>
          <li>Resell or redistribute the Service without authorization</li>
        </ul>

        <h2>7. Fair Use Policy</h2>
        <p>
          Certain Posta plans include unlimited or high-volume posting capabilities. These are provided
          under a fair use policy intended to support normal, reasonable usage by individuals and teams.
        </p>
        <p>You agree not to:</p>
        <ul>
          <li>Use the Service for automated bulk posting, spamming, or any activity that places an unreasonable load on our infrastructure</li>
          <li>Exploit unlimited features in a way that degrades the experience for other users</li>
          <li>Use the Service through bots, scripts, or other automated means that exceed normal human usage patterns, unless explicitly permitted by your plan</li>
        </ul>
        <p>
          We reserve the right to monitor usage patterns and, at our sole discretion, throttle, limit, or
          suspend access for any account that we determine is abusing the Service or operating outside
          the spirit of fair use. We will make reasonable efforts to notify affected users before taking action,
          except in cases where immediate action is necessary to protect the Service or other users.
        </p>

        <h2>8. Third-Party Integrations</h2>
        <p>
          The Service integrates with third-party social media platforms. Your use of these integrations
          is subject to the respective platforms' terms of service and privacy policies. We are not
          responsible for the actions or policies of third-party platforms.
        </p>

        <h2>9. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by Posta and are
          protected by international copyright, trademark, and other intellectual property laws. You may
          not copy, modify, distribute, or create derivative works based on our Service without our
          express written permission.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE,
          OR COMPLETELY SECURE.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, POSTA SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER
          INCURRED DIRECTLY OR INDIRECTLY.
        </p>

        <h2>12. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service at our sole discretion,
          without prior notice, for conduct that we believe violates these Terms or is harmful to other
          users, us, or third parties, or for any other reason.
        </p>

        <h2>13. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of material
          changes via email or through the Service. Your continued use of the Service after such
          modifications constitutes acceptance of the updated Terms.
        </p>

        <h2>14. Governing Law and Jurisdiction</h2>
        <p>
          These Terms are governed by the laws of {{ L.governingLaw }}, without
          regard to conflict-of-law rules. The competent forum for disputes
          arising from these Terms is {{ L.courtOfJurisdiction }}, subject to
          any mandatory consumer-protection provisions of the user's country of
          residence within the European Union.
        </p>

        <h2>15. Hosting and Data Location</h2>
        <p>
          The Service is hosted on Google Cloud Platform (Iowa, United States)
          with the database on Supabase (AWS eu-west-1, Ireland). Media assets
          are stored on Google Cloud Storage. Posta is <strong>not</strong> an
          EU-sovereign-hosted service — parts of the infrastructure are
          operated by US-parent companies and may be subject to US legislation
          in addition to EU law. Personal data is processed in accordance with
          our <RouterLink to="/privacy">Privacy Policy</RouterLink>.
        </p>

        <h2>16. Contact Us</h2>
        <p>
          {{ L.legalEntity }}<br />
          {{ L.registeredAddress }}<br />
          Estonian register code: {{ L.registryNumber }}
        </p>
        <p>
          <strong>Support:</strong> <a :href="`mailto:${L.supportEmail}`" class="contact-link">{{ L.supportEmail }}</a><br />
          <strong>Legal notices:</strong> <a :href="`mailto:${L.noticesEmail}`" class="contact-link">{{ L.noticesEmail }}</a><br />
          <strong>Data-protection matters:</strong> <a :href="`mailto:${L.dpoEmail}`" class="contact-link">{{ L.dpoEmail }}</a>
        </p>
      </main>
    </div>

    <footer class="footer">
      <div class="footer-inner">
        <div>&copy; {{ currentYear }} Posta. All rights reserved.</div>
        <div class="footer-links">
          <a href="mailto:hello@getposta.app">Contact</a>
          <RouterLink to="/terms">Terms of Service</RouterLink>
          <RouterLink to="/privacy">Privacy Policy</RouterLink>
          <RouterLink to="/legal-notice">Legal Notice</RouterLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, #111827 0, #020617 45%, #000 100%);
}

.wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-mark {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: conic-gradient(from 210deg, #4f46e5, #22c55e, #06b6d4, #4f46e5);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.6);
}

.logo-inner {
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: #020617;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #e5e7eb;
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

.back-link {
  font-size: 13px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.7);
  transition: border-color 0.2s;
  text-decoration: none;
}

.back-link:hover {
  border-color: rgba(148, 163, 184, 0.7);
}

.content {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 32px;
  backdrop-filter: blur(18px);
}

h1 {
  font-size: clamp(1.8rem, 3vw, 2.2rem);
  line-height: 1.2;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.last-updated {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 32px;
}

h2 {
  font-size: 17px;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 12px;
  color: var(--text);
}

p, ul, ol {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 14px;
}

ul, ol {
  padding-left: 20px;
}

li {
  margin-bottom: 6px;
}

strong {
  color: var(--text);
  font-weight: 500;
}

.contact-link {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.footer {
  border-top: 1px solid rgba(31, 41, 55, 0.9);
  margin-top: auto;
}

.footer-inner {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px 20px 24px;
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
  flex-wrap: wrap;
}

.footer-links a {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  color: var(--muted);
}

@media (max-width: 720px) {
  .wrapper {
    padding-inline: 16px;
  }
  .content {
    padding: 24px 20px;
  }
}
</style>

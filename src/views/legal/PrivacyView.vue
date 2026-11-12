<script setup lang="ts">
import { useHead } from '@unhead/vue'
import LegalLayout from '@/components/legal/LegalLayout.vue'
import { legalStrings as L } from '@/data/legalStrings'

useHead({
  title: 'Posta - Create once. Post everywhere. - Privacy Policy',
  meta: [
    { name: 'description', content: 'Privacy Policy for Posta – learn how we collect, use, and protect your data on our social media scheduling platform.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://getposta.app/privacy' },
  ],
})

</script>

<template>
  <LegalLayout title="Posta Privacy Policy">
    <p>
      This Privacy Policy explains how <strong>{{ L.legalEntity }}</strong>,
      a {{ L.entityType }} registered at {{ L.registeredAddress }} (Estonian
      commercial-register code {{ L.registryNumber }}) ("we", "us", or
      "our"), collects, uses, discloses, and safeguards your information
      when you use the Posta platform and services available at
      getposta.app (the "Service").
    </p>
    <p>
      {{ L.legalEntity }} is the <strong>data controller</strong> for the
      personal data described here, within the meaning of the EU General
      Data Protection Regulation (Regulation 2016/679, "GDPR") and the
      Estonian Personal Data Protection Act. Please read this Privacy
      Policy carefully. By using the Service, you consent to the practices
      described in this policy.
    </p>

    <h2>1. Information We Collect</h2>

    <h3>1.1 Information You Provide</h3>
    <p>We collect information you directly provide to us, including:</p>
    <ul>
      <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
      <li><strong>Profile Information:</strong> Display name, avatar, and preferences</li>
      <li><strong>Payment Information:</strong> Billing details processed securely through LemonSqueezy</li>
      <li><strong>User Content:</strong> Images, videos, captions, and other content you upload</li>
      <li><strong>Communications:</strong> Messages you send to us for support or feedback</li>
    </ul>

    <h3>1.2 Information from Third-Party Services</h3>
    <p>When you connect social media accounts, we receive:</p>
    <ul>
      <li>Platform user ID and username</li>
      <li>Profile name and profile picture</li>
      <li>OAuth access tokens (stored securely and encrypted)</li>
      <li>Permissions granted for posting and account access</li>
    </ul>

    <h3>1.3 Automatically Collected Information</h3>
    <p>We automatically collect certain information when you use the Service:</p>
    <ul>
      <li>Device information (browser type, operating system)</li>
      <li>IP address and approximate location</li>
      <li>Usage data (features used, actions taken)</li>
      <li>Log data (access times, pages viewed, errors)</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the collected information to:</p>
    <table class="data-table">
      <thead>
        <tr>
          <th>Purpose</th>
          <th>Legal Basis</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Provide and maintain the Service</td>
          <td>Contract performance</td>
        </tr>
        <tr>
          <td>Process media (cropping, compression, face detection)</td>
          <td>Contract performance</td>
        </tr>
        <tr>
          <td>Publish content to connected social platforms</td>
          <td>Contract performance</td>
        </tr>
        <tr>
          <td>Process payments and manage subscriptions</td>
          <td>Contract performance</td>
        </tr>
        <tr>
          <td>Send service-related communications</td>
          <td>Legitimate interest</td>
        </tr>
        <tr>
          <td>Improve and optimize the Service</td>
          <td>Legitimate interest</td>
        </tr>
        <tr>
          <td>Detect and prevent fraud or abuse</td>
          <td>Legitimate interest</td>
        </tr>
        <tr>
          <td>Comply with legal obligations</td>
          <td>Legal obligation</td>
        </tr>
      </tbody>
    </table>

    <h2>3. Data Storage, Security, and Hosting</h2>

    <h3>3.1 Where We Store Your Data</h3>
    <ul>
      <li><strong>User data and metadata:</strong> Supabase-managed PostgreSQL, region AWS <code>eu-west-1</code> (Dublin, Ireland).</li>
      <li><strong>Media files:</strong> Google Cloud Storage, region <code>us-central1</code> (Iowa, United States), encrypted at rest.</li>
      <li><strong>Application servers:</strong> Google Compute Engine, region <code>us-central1</code> (Iowa, United States).</li>
      <li><strong>OAuth tokens:</strong> Encrypted using AES-256 before storage.</li>
      <li><strong>Payment data:</strong> Processed and stored by LemonSqueezy (Ireland). We do not store card details.</li>
    </ul>

    <h3>3.2 Security Measures</h3>
    <p>We implement appropriate technical and organizational measures to protect your data:</p>
    <ul>
      <li>Encryption in transit (TLS/HTTPS) and at rest</li>
      <li>Secure authentication with JWT tokens</li>
      <li>Row-level security policies in our database</li>
      <li>Regular security audits and updates</li>
      <li>Access controls and audit logging</li>
    </ul>

    <h2>4. Data Sharing and Disclosure</h2>
    <p>We do not sell your personal information. We may share your data with:</p>
    <ul>
      <li><strong>Social Media Platforms:</strong> To publish content on your behalf (TikTok, Instagram, etc.)</li>
      <li><strong>Service Providers:</strong> Cloud hosting (Google Cloud), payment processing (LemonSqueezy), authentication (Supabase)</li>
      <li><strong>Legal Requirements:</strong> When required by law, legal process, or to protect our rights</li>
      <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
    </ul>

    <h2>5. Data Retention</h2>
    <p>We retain your data for as long as necessary to provide the Service and fulfill the purposes described in this policy:</p>
    <ul>
      <li><strong>Account data:</strong> Retained while your account is active, deleted upon account deletion</li>
      <li><strong>Media files:</strong> Retained while your account is active, deleted within 30 days of account deletion</li>
      <li><strong>Usage logs:</strong> Retained for up to 90 days for security and debugging purposes</li>
      <li><strong>Payment records:</strong> Retained as required by tax and legal obligations</li>
    </ul>

    <h2>6. Your Rights</h2>
    <p>Depending on your location, you may have the following rights:</p>
    <ul>
      <li><strong>Access:</strong> Request a copy of your personal data</li>
      <li><strong>Correction:</strong> Request correction of inaccurate data</li>
      <li><strong>Deletion:</strong> Request deletion of your personal data</li>
      <li><strong>Portability:</strong> Request your data in a portable format</li>
      <li><strong>Restriction:</strong> Request restriction of processing</li>
      <li><strong>Objection:</strong> Object to certain types of processing</li>
      <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
    </ul>
    <p>
      To exercise these rights, please contact
      <a :href="`mailto:${L.dpoEmail}`">{{ L.dpoEmail }}</a>.
      You also have the right to lodge a complaint with the Estonian Data
      Protection Inspectorate
      (<a href="https://www.aki.ee/en" target="_blank" rel="noopener">Andmekaitse Inspektsioon</a>)
      or the supervisory authority in your EU country of residence.
    </p>

    <h2>7. Cookies and Tracking</h2>
    <p>We use essential cookies to:</p>
    <ul>
      <li>Maintain your session and authentication state</li>
      <li>Remember your preferences</li>
      <li>Ensure security and prevent fraud</li>
    </ul>
    <p>We do not use third-party advertising or tracking cookies.</p>

    <h2>8. International Data Transfers</h2>
    <p>
      As disclosed in Section 3, Posta processes personal data in Google
      Cloud's <code>us-central1</code> region (Iowa, USA) in addition to
      the EU. Google Cloud Platform is certified under the EU-U.S. Data
      Privacy Framework (DPF) and, where the DPF does not apply, transfers
      rely on the European Commission's Standard Contractual Clauses (SCCs)
      plus technical safeguards (encryption in transit and at rest,
      access controls, audit logging).
    </p>
    <p>
      You have the right, under Articles 13 and 15 GDPR, to receive
      information about the specific safeguards in place — please contact
      our data-protection address below.
    </p>

    <h2>9. Children's Privacy</h2>
    <p>
      The Service is not intended for users under 18 years of age. We do not knowingly collect
      personal information from children. If you believe we have collected information from a child,
      please contact us immediately.
    </p>

    <h2>10. Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. We will notify you of material changes
      by posting the new policy on this page and updating the "Last updated" date. Your continued
      use of the Service after such changes constitutes acceptance of the updated policy.
    </p>

    <h2>11. Contact Us</h2>
    <p>
      <strong>Data controller:</strong> {{ L.legalEntity }}<br />
      <strong>Address:</strong> {{ L.registeredAddress }}<br />
      <strong>Estonian register code:</strong> {{ L.registryNumber }}
    </p>
    <p>
      <strong>Data-protection matters, subject-access requests, and breach reports:</strong>
      <a :href="`mailto:${L.dpoEmail}`">{{ L.dpoEmail }}</a><br />
      <strong>General enquiries:</strong>
      <a :href="`mailto:${L.supportEmail}`">{{ L.supportEmail }}</a>
    </p>

  </LegalLayout>
</template>

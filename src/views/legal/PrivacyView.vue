<script setup lang="ts">
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
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last updated: December 2024</p>

        <p>
          At Posta ("we", "us", or "our"), we are committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, disclose, and safeguard your information when you use our platform
          and services (the "Service").
        </p>
        <p>
          Please read this Privacy Policy carefully. By using the Service, you consent to the practices
          described in this policy.
        </p>

        <h2>1. Information We Collect</h2>

        <h3>1.1 Information You Provide</h3>
        <p>We collect information you directly provide to us, including:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address, name, and password when you create an account</li>
          <li><strong>Profile Information:</strong> Display name, avatar, and preferences</li>
          <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
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
          <tr>
            <th>Purpose</th>
            <th>Legal Basis</th>
          </tr>
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
        </table>

        <h2>3. Data Storage and Security</h2>

        <h3>3.1 Where We Store Your Data</h3>
        <ul>
          <li><strong>User data and metadata:</strong> Stored in Supabase (PostgreSQL databases)</li>
          <li><strong>Media files:</strong> Stored in Google Cloud Storage with encryption at rest</li>
          <li><strong>OAuth tokens:</strong> Encrypted using AES-256 before storage</li>
          <li><strong>Payment data:</strong> Processed and stored by Stripe (we do not store card details)</li>
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
          <li><strong>Service Providers:</strong> Cloud hosting (Google Cloud), payment processing (Stripe), authentication (Supabase)</li>
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
        <p>To exercise these rights, please contact us at <a href="mailto:hello@getposta.app" class="contact-link">hello@getposta.app</a>.</p>

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
          Your data may be transferred to and processed in countries other than your own. We ensure
          appropriate safeguards are in place for such transfers, including standard contractual clauses
          where required.
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
        <p>If you have questions about this Privacy Policy or our data practices, please contact us:</p>
        <p>
          <strong>Email:</strong> <a href="mailto:hello@getposta.app" class="contact-link">hello@getposta.app</a>
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
          <RouterLink to="/impressum">Impressum</RouterLink>
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

h3 {
  font-size: 15px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 8px;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 16px 0;
  font-size: 13px;
}

.data-table th,
.data-table td {
  text-align: left;
  padding: 10px 12px;
  border: 1px solid var(--border);
}

.data-table th {
  background: rgba(15, 23, 42, 0.8);
  color: var(--text);
  font-weight: 500;
}

.data-table td {
  color: var(--muted);
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
  .data-table {
    font-size: 12px;
  }
  .data-table th,
  .data-table td {
    padding: 8px;
  }
}
</style>

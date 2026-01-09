<script setup lang="ts">
// Impressum is in German as required by German law
</script>

<template>
  <div class="page">
    <div class="wrapper">
      <RouterLink to="/" class="back-link">&larr; Zurück zur Startseite</RouterLink>

      <h1>Impressum</h1>

      <div class="section">
        <h2>Angaben gemäß § 5 TMG</h2>
        <address>
          Stefan Gimeson<br />
          Postfach 37 03 29<br />
          14133 Berlin<br />
          Deutschland
        </address>
      </div>

      <div class="section">
        <h2>Kontakt</h2>
        <p>
          Telefon: <a href="tel:+493040783108" class="contact-link">+49 30 40783108</a><br />
          E-Mail: <a href="mailto:hello@getposta.app" class="contact-link">hello@getposta.app</a>
        </p>
      </div>

      <div class="section">
        <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
        <address>
          Stefan Gimeson<br />
          Postfach 37 03 29<br />
          14133 Berlin
        </address>
      </div>

      <div class="section">
        <h2>Haftungsausschluss</h2>

        <h3>Haftung für Inhalte</h3>
        <p>
          Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        </p>

        <h3>Haftung für Links</h3>
        <p>
          Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        </p>

        <h3>Urheberrecht</h3>
        <p>
          Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
  max-width: 680px;
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
  margin-bottom: 32px;
  letter-spacing: -0.02em;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  margin-top: 28px;
  margin-bottom: 12px;
  color: var(--text);
}

h3 {
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
  margin-bottom: 8px;
  color: var(--text);
}

p, address {
  font-size: 14px;
  color: var(--muted);
  margin-bottom: 12px;
  font-style: normal;
}

address {
  line-height: 1.8;
}

.contact-link {
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
</style>

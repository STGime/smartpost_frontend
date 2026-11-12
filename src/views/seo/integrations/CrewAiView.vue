<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import { breadcrumbJsonLd } from '@/composables/breadcrumbJsonLd'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const description =
  'Give a CrewAI crew the power to post to social media. Use the Posta MCP server via crewai-tools MCP adapter, or hand-roll a Tool that calls the Posta REST API. Eight networks, every CrewAI agent.'

useHead({
  title: 'CrewAI Social Media: Give a Crew the Power to Post via Posta | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'crewai social media, crewai post social media, crewai mcp, crewai agent social media, crewai tool social media, crewai linkedin, crewai twitter, crewai integration, posta crewai',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/integrations/crewai' },
    { property: 'og:title', content: 'CrewAI + Posta: Social Media for a CrewAI Crew | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'CrewAI + Posta: Social Media | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations/crewai' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I let a CrewAI crew post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Load the Posta MCP server via crewai-tools\' MCPServerAdapter and pass the resulting tools to an Agent\'s tools list. Alternatively, decorate a function with @tool to wrap the Posta REST API into a CrewAI Tool by hand.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can different agents in a crew post to different platforms?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — give each agent the same Posta tool set and let the crew\'s Process orchestrate which agent posts where. A LinkedIn specialist, a Bluesky specialist, a YouTube Shorts specialist can each call Posta with their own per-platform voice.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Posta work with CrewAI Flows?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Posta is just a tool the agents can call, so it fits into CrewAI Flows the same way it fits into sequential or hierarchical crews.',
            },
          },
          {
            '@type': 'Question',
            name: 'Is the integration free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Posta MCP server and CrewAI are both free and open source. You pay for the Posta plan that covers your post volume, with a 14-day free trial to start.',
            },
          },
        ],
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Integrations', url: 'https://getposta.app/integrations' },
      { name: 'CrewAI', url: 'https://getposta.app/integrations/crewai' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>CrewAI Social Media: Give a Crew the Power to Post</h1>
      <p class="hero-sub">
        Give a CrewAI crew the power to post to social media. Use the Posta MCP server via the
        <code>crewai-tools</code> MCP adapter, or hand-roll a Tool that calls the Posta REST API.
        Eight networks, every CrewAI agent.
      </p>
    </section>

    <section class="content-section">
      <h2>Why Posta + CrewAI?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">A shared tool surface for every agent in the crew</div>
          <div class="feature-body">Add Posta to one agent's tools, or to all of them. CrewAI's Process picks which agent calls it; Posta does the rest.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Per-platform specialist agents</div>
          <div class="feature-body">Run a LinkedIn specialist with a long-form voice and a Bluesky specialist with a short-form voice — same Posta tool, different prompts.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Hierarchical or sequential</div>
          <div class="feature-body">Posta-as-tool works in any CrewAI Process — sequential, hierarchical, or Flow.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Closed loop via webhooks</div>
          <div class="feature-body">HMAC webhooks fire on publish/fail. Pipe them into a follow-up crew that handles comments or branches the next campaign step.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Path 1 — Posta MCP via the crewai-tools MCP adapter (recommended)</h2>
      <p>
        <code>crewai-tools</code> ships an <code>MCPServerAdapter</code> that loads any MCP server's
        tools into a Crew. Point it at the Posta MCP server and every Posta capability is a tool the
        agents can call.
      </p>
      <pre class="code-block" v-pre><code>pip install crewai crewai-tools

# crew.py
import os
from crewai import Agent, Task, Crew
from crewai_tools import MCPServerAdapter

posta_params = {
    "command": "npx",
    "args": ["-y", "posta-mcp"],
    "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
}

with MCPServerAdapter(posta_params) as posta_tools:
    publisher = Agent(
        role="Social Media Publisher",
        goal="Draft and schedule launch posts per platform",
        backstory="An experienced multi-platform social media strategist.",
        tools=posta_tools,
        verbose=True,
    )

    task = Task(
        description="Draft and schedule a LinkedIn post and a Bluesky post about our v2 launch.",
        agent=publisher,
        expected_output="Two scheduled posts (LinkedIn, Bluesky) confirmed by the Posta tool.",
    )

    crew = Crew(agents=[publisher], tasks=[task])
    result = crew.kickoff()
    print(result)</code></pre>
    </section>

    <section class="content-section">
      <h2>Path 2 — Wrap the REST API with @tool</h2>
      <p>
        Simpler when you want a single typed call and don't need the model to discover Posta's full
        tool surface.
      </p>
      <pre class="code-block" v-pre><code>from crewai.tools import tool
import os, requests

POSTA = "https://api.getposta.app"
HEADERS = {"Authorization": f"Bearer {os.environ['POSTA_API_TOKEN']}"}

@tool("Schedule social media post")
def schedule_post(
    caption: str,
    social_account_ids: list[int],
    scheduled_at: str,
    media_ids: list[str] | None = None,
) -> str:
    """Create a Posta draft on the given accounts and schedule it.
    scheduled_at is ISO 8601. media_ids are Posta media IDs."""
    # Step 1 — create the draft
    r = requests.post(
        f"{POSTA}/v1/posts", headers=HEADERS, timeout=30,
        json={
            "caption": caption,
            "socialAccountIds": social_account_ids,
            **({"mediaIds": media_ids} if media_ids else {}),
        },
    )
    r.raise_for_status()
    post_id = r.json()["id"]
    # Step 2 — schedule it
    r = requests.post(
        f"{POSTA}/v1/posts/{post_id}/schedule", headers=HEADERS, timeout=30,
        json={"scheduledAt": scheduled_at},
    )
    r.raise_for_status()
    return f"Scheduled post {post_id} for {scheduled_at}"</code></pre>
    </section>

    <section class="content-section">
      <h2>Common patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Researcher → Drafter → Publisher</div>
          <div class="feature-body">A 3-agent sequential crew: the researcher gathers context, the drafter writes per-platform captions, the publisher calls Posta to schedule.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Per-platform specialist crew</div>
          <div class="feature-body">One agent per network — each tuned to its platform's voice — all calling Posta with the same tool surface.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Hierarchical campaign manager</div>
          <div class="feature-body">A manager agent delegates per-platform sub-tasks to specialist agents. Each specialist schedules through Posta.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Webhook-triggered follow-up crew</div>
          <div class="feature-body">Posta fires a webhook on publish; a separate crew is woken up to handle replies and engagement.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How do I let a CrewAI crew post to social media?</div>
          <div class="faq-a">
            Load the <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink> via
            <code>crewai-tools</code>' <code>MCPServerAdapter</code> and pass the result to an
            Agent's tools list, or wrap the REST API into a tool with <code>@tool</code>.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Can each agent post to a different platform?</div>
          <div class="faq-a">
            Yes — give each agent the same Posta tool set and let the Process decide who posts where.
            A LinkedIn specialist, a Bluesky specialist, a YouTube Shorts specialist can each call
            Posta with their own per-platform voice.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Does it work with CrewAI Flows?</div>
          <div class="faq-a">
            Yes. Posta is just a tool the agents can call, so it composes the same way in Flows.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Is it free?</div>
          <div class="faq-a">
            The Posta MCP server and CrewAI are both free and open source. You pay for the Posta
            plan that covers your post volume; 14-day free trial.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Wire Posta into your next CrewAI crew"
      subtext="14-day free trial. MCP server, Claude Code skill, and n8n node are free and open source."
      :source="waitingListSource"
    />
  </SeoPageLayout>
</template>

<style scoped>
.hero {
  padding-bottom: 40px;
}

h1 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.025em;
  color: var(--text);
  margin-bottom: 16px;
}

.hero-sub {
  font-size: 16px;
  color: var(--fg-2);
  max-width: 68ch;
  line-height: 1.65;
}

.content-section,
.faq-section {
  border-top: 1px solid var(--line);
  padding: 36px 0;
}

.content-section h2,
.faq-section h2 {
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.015em;
  color: var(--text);
  margin-bottom: 14px;
}

.content-section p {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
  max-width: 68ch;
  margin-bottom: 14px;
}

.content-section p:last-child {
  margin-bottom: 0;
}

.hero-sub a,
.content-section p a,
.content-section li a,
.faq-a a {
  color: var(--text);
  text-decoration: underline;
  text-decoration-color: var(--line-strong);
  text-underline-offset: 3px;
  transition: color 0.15s, text-decoration-color 0.15s;
}

.hero-sub a:hover,
.content-section p a:hover,
.content-section li a:hover,
.faq-a a:hover {
  color: var(--signal);
  text-decoration-color: var(--signal);
}

.hero-sub code,
.content-section p code,
.feature-body code,
.faq-a code {
  font-family: var(--font-mono);
  font-size: 0.86em;
  color: var(--text);
  background: var(--ink-2);
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 1px 5px;
  overflow-wrap: anywhere;
}

.code-block {
  margin: 16px 0 4px;
  padding: 16px;
  background: var(--ink-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
}

.code-block code {
  font-family: inherit;
  white-space: pre;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin-top: 16px;
  background: var(--line);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.feature-card {
  background: var(--ink-0);
  padding: 20px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.feature-body {
  font-size: 14px;
  color: var(--fg-2);
  line-height: 1.6;
}

.faq-grid {
  max-width: 68ch;
  border-top: 1px solid var(--line);
}

.faq-item {
  padding: 18px 0;
  border-bottom: 1px solid var(--line);
}

.faq-q {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--text);
  margin-bottom: 6px;
}

.faq-a {
  font-size: 15px;
  color: var(--fg-2);
  line-height: 1.65;
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>

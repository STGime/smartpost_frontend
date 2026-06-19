<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
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

@tool("Schedule social media post")
def schedule_post(caption: str, platforms: list[str], schedule_for: str) -> str:
    """Schedule a post on one or many platforms via Posta. schedule_for is ISO 8601."""
    r = requests.post(
        "https://api.getposta.app/v1/posts",
        headers={"Authorization": f"Bearer {os.environ['POSTA_API_TOKEN']}"},
        json={"caption": caption, "platforms": platforms, "scheduleFor": schedule_for},
        timeout=30,
    )
    r.raise_for_status()
    return f"Scheduled: {r.json()['id']}"</code></pre>
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
.hero { margin-bottom: 40px; }
h1 { font-size: clamp(2rem, 3.3vw, 2.8rem); line-height: 1.08; letter-spacing: -0.04em; margin-bottom: 16px; }
.hero-sub { font-size: 16px; color: var(--muted); max-width: 720px; line-height: 1.6; }
.hero-sub code, .feature-body code, .faq-a code, .content-section p code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em; background: rgba(148, 163, 184, 0.12); padding: 1px 4px; border-radius: 4px; }
.content-section { margin-bottom: 36px; }
.content-section h2 { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.content-section p { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 760px; margin-bottom: 14px; }
.code-block { margin: 12px 0 18px; padding: 14px; border-radius: 10px; background: rgba(2, 6, 23, 0.85); border: 1px solid rgba(148, 163, 184, 0.25); overflow-x: auto; font-size: 12px; line-height: 1.55; color: #cbd5e1; }
.code-block code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre; }
.features-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.feature-card { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.4); background: rgba(15, 23, 42, 0.85); padding: 14px; }
.feature-title { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
.feature-body { font-size: 12px; color: var(--muted); line-height: 1.5; }
.faq-grid { display: grid; gap: 16px; margin-top: 14px; }
.faq-item { border-radius: 14px; border: 1px solid rgba(148, 163, 184, 0.4); background: rgba(15, 23, 42, 0.85); padding: 14px; }
.faq-q { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
.faq-a { font-size: 12px; color: var(--muted); line-height: 1.6; }
.faq-a a { color: var(--text); text-decoration: underline; text-underline-offset: 2px; }
@media (max-width: 600px) { .features-grid { grid-template-columns: minmax(0, 1fr); } }
</style>

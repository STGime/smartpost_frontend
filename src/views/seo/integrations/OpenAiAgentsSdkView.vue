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
  'Hand an OpenAI Agents SDK agent the Posta MCP server and let it post to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads. Native MCP support, function-tool fallback for the REST API.'

useHead({
  title: 'OpenAI Agents SDK Social Media: Posta MCP + Function Tools | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'openai agents sdk social media, openai agents social media, openai agents mcp, openai social media post, openai function tool social, openai linkedin agent, openai social media integration, posta openai agents',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/integrations/openai-agents-sdk' },
    { property: 'og:title', content: 'OpenAI Agents SDK + Posta: Social Media for Your Agent | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'OpenAI Agents SDK + Posta | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations/openai-agents-sdk' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I let an OpenAI Agents SDK agent post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Two paths: (1) Add the Posta MCP server via MCPServerStdio in the Agents SDK — Posta\'s tools appear in the agent\'s tool list automatically; (2) Decorate a Python function with @function_tool and call the Posta REST API for a deterministic single-call shape.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does it work with handoffs?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — make Posta available on the agent the handoff lands on. Common pattern: a router agent reads the request, hands off to a "social publisher" agent that has the Posta MCP server attached.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I use the Responses API directly instead?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — the Responses API supports tool calls, so you can register a function tool that wraps the Posta REST API. The Agents SDK is mostly ergonomic sugar on top.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does the Posta MCP server work with the Assistants API too?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'The Assistants API doesn\'t speak MCP natively. Wrap the Posta REST API as an Assistants tool, or use the newer Agents SDK / Responses API where MCP is supported.',
            },
          },
        ],
      }),
    },
    breadcrumbJsonLd([
      { name: 'Home', url: 'https://getposta.app/' },
      { name: 'Integrations', url: 'https://getposta.app/integrations' },
      { name: 'OpenAI Agents SDK', url: 'https://getposta.app/integrations/openai-agents-sdk' },
    ]),
  ],
})
</script>

<template>
  <SeoPageLayout :waiting-list-source="waitingListSource">
    <section class="hero">
      <h1>OpenAI Agents SDK Social Media: Posta MCP + Function Tools</h1>
      <p class="hero-sub">
        Hand an OpenAI Agents SDK agent the Posta MCP server and let it post to eight social
        networks. Native MCP support; function-tool fallback for the REST API when you want a
        deterministic single-call shape.
      </p>
    </section>

    <section class="content-section">
      <h2>Why Posta + OpenAI Agents SDK?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Native MCP support</div>
          <div class="feature-body">The Agents SDK has first-class MCP — <code>MCPServerStdio</code> auto-exposes the Posta tools to your agent.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Handoff-friendly</div>
          <div class="feature-body">Attach the Posta MCP server to the agent that receives the handoff — a "social publisher" agent that the router agent reaches for.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Function tools when you want determinism</div>
          <div class="feature-body">When you'd rather not let the model pick between five Posta tools, wrap one REST call with <code>@function_tool</code>.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Closed-loop via webhooks</div>
          <div class="feature-body">HMAC callbacks fire on publish/fail. Wire them into a follow-up agent run to handle replies or branch a campaign.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Path 1 — Posta MCP via MCPServerStdio (recommended)</h2>
      <p>
        The Agents SDK loads MCP servers natively. Point it at the Posta server and the agent
        introspects every tool it needs.
      </p>
      <pre class="code-block" v-pre><code>pip install openai-agents

# agent.py
import os, asyncio
from agents import Agent, Runner
from agents.mcp import MCPServerStdio

async def main():
    async with MCPServerStdio(
        params={
            "command": "npx",
            "args": ["-y", "posta-mcp"],
            "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
        }
    ) as posta_mcp:
        agent = Agent(
            name="Social Publisher",
            instructions="Draft and schedule social posts. Match each platform's voice.",
            mcp_servers=[posta_mcp],
        )
        result = await Runner.run(agent, input=(
            "Draft a LinkedIn post and a Bluesky post about our v2 launch "
            "and schedule both for tomorrow 9am CET."
        ))
        print(result.final_output)

asyncio.run(main())</code></pre>
    </section>

    <section class="content-section">
      <h2>Path 2 — Wrap the REST API with @function_tool</h2>
      <p>
        Useful when you want a single typed call exposed to the agent — no MCP transport, no tool
        discovery.
      </p>
      <pre class="code-block" v-pre><code>import os, requests
from agents import Agent, Runner, function_tool

POSTA = "https://api.getposta.app"
HEADERS = {"Authorization": f"Bearer {os.environ['POSTA_API_TOKEN']}"}

@function_tool
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
    return f"Scheduled post {post_id} for {scheduled_at}"

agent = Agent(
    name="Social Publisher",
    instructions="Schedule social posts.",
    tools=[schedule_post],
)</code></pre>
    </section>

    <section class="content-section">
      <h2>Common patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Router → Publisher handoff</div>
          <div class="feature-body">A router agent triages the request and hands off to a Publisher agent that owns the Posta MCP server.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Per-platform specialist agents</div>
          <div class="feature-body">A LinkedIn specialist with a long-form voice, a Bluesky specialist with a short-form voice — each holding Posta as a tool.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Sessions for multi-turn campaigns</div>
          <div class="feature-body">Use the Agents SDK Session feature to keep context across multiple posting turns — "now schedule the day-2 post."</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Webhook → follow-up run</div>
          <div class="feature-body">A small webhook receiver kicks off a new Agents Run when Posta fires "post.published" — to reply, branch, or notify.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How do I let an OpenAI Agents SDK agent post to social media?</div>
          <div class="faq-a">
            Add the <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink> via
            <code>MCPServerStdio</code> (recommended) or wrap the REST API with
            <code>@function_tool</code>. Code for both above.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Does it work with handoffs?</div>
          <div class="faq-a">
            Yes. Attach Posta to the agent receiving the handoff — a "Publisher" agent the router
            hands off to.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Can I use the Responses API instead?</div>
          <div class="faq-a">
            Yes — register a function tool that wraps the Posta REST API. The Agents SDK is
            ergonomic sugar; the underlying tool-calling contract is the same.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">What about the Assistants API?</div>
          <div class="faq-a">
            Assistants doesn't speak MCP natively. Wrap Posta REST as an Assistants tool, or use the
            newer Agents SDK / Responses API.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Wire Posta into your next OpenAI Agents Run"
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

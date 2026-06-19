<script setup lang="ts">
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import SeoPageLayout from '@/components/seo/SeoPageLayout.vue'
import CtaSection from '@/components/seo/CtaSection.vue'
import InternalLinks from '@/components/seo/InternalLinks.vue'
import type { WaitingListSource } from '@/services'

const waitingListSource = ref<WaitingListSource>('seo-api')

const description =
  'Wire Posta into a LangChain agent in minutes. Use the Posta MCP server through langchain-mcp-adapters, or wrap the REST API as a LangChain Tool. Post to LinkedIn, TikTok, Instagram, YouTube, Pinterest, Facebook, Bluesky, and Threads from any LangChain workflow.'

useHead({
  title: 'LangChain Social Media: Post from a LangChain Agent via Posta MCP or REST | Posta',
  meta: [
    { name: 'description', content: description },
    {
      name: 'keywords',
      content:
        'langchain social media, langchain post social media, langchain mcp social, langchain agent social media, langchain tool social media, langchain twitter, langchain linkedin, langchain integration, posta langchain',
    },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:type', content: 'article' },
    { property: 'og:url', content: 'https://getposta.app/integrations/langchain' },
    { property: 'og:title', content: 'LangChain + Posta: Social Media from a LangChain Agent | Posta' },
    { property: 'og:description', content: description },
    { property: 'og:image', content: 'https://getposta.app/assets/posta_og_image.png' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'LangChain + Posta: Social Media | Posta' },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: 'https://getposta.app/assets/posta_og_image.png' },
  ],
  link: [{ rel: 'canonical', href: 'https://getposta.app/integrations/langchain' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'How do I let a LangChain agent post to social media?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Two paths: (1) Use langchain-mcp-adapters to load the Posta MCP server\'s tools directly into your LangChain agent — recommended; (2) Wrap the Posta REST API as a LangChain Tool with the requests library — useful when you want a single typed call without an MCP layer.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which Posta surface should a LangChain agent use?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'For interactive LLM agents (chat-style, multi-step), the MCP server gives you typed tools the model introspects. For deterministic posting steps inside a fixed chain or graph, the REST API is simpler and avoids the MCP transport overhead.',
            },
          },
          {
            '@type': 'Question',
            name: 'Does Posta work with LangGraph?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes — the same MCP-adapter and Tool approaches work for LangGraph nodes. Posta becomes a tool that any LangGraph state-machine step can invoke.',
            },
          },
          {
            '@type': 'Question',
            name: 'Which languages does this work in?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'LangChain Python and LangChain JavaScript both work — the Posta MCP server speaks the protocol, not a specific language. Examples on this page are Python.',
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
      <h1>LangChain Social Media: Post from a LangChain Agent</h1>
      <p class="hero-sub">
        Wire Posta into a LangChain agent in minutes. Use the Posta MCP server through
        <code>langchain-mcp-adapters</code>, or wrap the REST API as a LangChain Tool. Post to
        eight social networks from any LangChain workflow.
      </p>
    </section>

    <section class="content-section">
      <h2>Why Posta + LangChain?</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Typed tools for LangChain agents</div>
          <div class="feature-body">The Posta MCP server exposes <code>createPost</code>, <code>schedulePost</code>, <code>listAccounts</code> as introspectable tools — LangChain's agent loop picks the right call automatically.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">No social API plumbing</div>
          <div class="feature-body">Skip the per-platform OAuth, rate limit, and media-format handling. Posta does it once for every supported network.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Closed-loop with webhooks</div>
          <div class="feature-body">HMAC-signed callbacks fire on publish/fail. Wire them into a LangGraph node and your agent reacts to platform feedback.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Works in Python and JS</div>
          <div class="feature-body">LangChain Python and LangChain JavaScript both interoperate with the MCP server. Posta-as-tool ships once, runs everywhere.</div>
        </div>
      </div>
    </section>

    <section class="content-section">
      <h2>Path 1 — Posta MCP via langchain-mcp-adapters (recommended)</h2>
      <p>
        The <code>langchain-mcp-adapters</code> package converts MCP servers into LangChain tools.
        Load the Posta server once and every Posta capability is available to your agent.
      </p>
      <pre class="code-block" v-pre><code>pip install langchain-anthropic langchain-mcp-adapters langgraph

# agent.py
import os
from langchain_anthropic import ChatAnthropic
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent

async def main():
    client = MultiServerMCPClient({
        "posta": {
            "command": "npx",
            "args": ["-y", "posta-mcp"],
            "env": {"POSTA_API_TOKEN": os.environ["POSTA_API_TOKEN"]},
            "transport": "stdio",
        }
    })
    tools = await client.get_tools()
    agent = create_react_agent(ChatAnthropic(model="claude-sonnet-4-6"), tools)

    result = await agent.ainvoke({"messages": [
        ("user", "Draft and schedule a LinkedIn post about our new release for tomorrow 9am CET.")
    ]})
    print(result)</code></pre>
    </section>

    <section class="content-section">
      <h2>Path 2 — Wrap the REST API as a LangChain Tool</h2>
      <p>
        For deterministic chain steps where you don't need the agent to choose between tools, the
        REST API is simpler. One Tool, one POST.
      </p>
      <pre class="code-block" v-pre><code>from langchain.tools import tool
import os, requests

@tool
def schedule_post(caption: str, platforms: list[str], schedule_for: str) -> dict:
    """Schedule a social media post to one or many platforms via Posta."""
    r = requests.post(
        "https://api.getposta.app/v1/posts",
        headers={"Authorization": f"Bearer {os.environ['POSTA_API_TOKEN']}"},
        json={"caption": caption, "platforms": platforms, "scheduleFor": schedule_for},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()</code></pre>
    </section>

    <section class="content-section">
      <h2>Common patterns</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-title">Research → Draft → Schedule chain</div>
          <div class="feature-body">A LangChain SequentialChain pulls source material, drafts per-platform captions, and Posta schedules the result.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">LangGraph closed-loop</div>
          <div class="feature-body">A LangGraph state machine where one node calls Posta, another node listens for the webhook and decides the next state.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Multi-platform fan-out with branching</div>
          <div class="feature-body">A router agent decides which subset of platforms get the post; each branch tunes the caption for that platform before calling Posta.</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">Retrieval-augmented posts</div>
          <div class="feature-body">Pull context from a vector store, feed it to the LLM as part of the prompt, draft a post grounded in your knowledge base, and ship via Posta.</div>
        </div>
      </div>
    </section>

    <section class="content-section faq-section">
      <h2>Frequently asked questions</h2>
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-q">How do I let a LangChain agent post to social media?</div>
          <div class="faq-a">
            Either load the <RouterLink to="/mcp-social-media-server">Posta MCP server</RouterLink>
            with <code>langchain-mcp-adapters</code> (recommended), or wrap the REST API as a
            LangChain Tool. Code for both above.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Which Posta surface should I use?</div>
          <div class="faq-a">
            MCP for interactive agents (chat-style, multi-step). REST for deterministic chain steps
            where you don't need the agent to pick between tools.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Does it work with LangGraph?</div>
          <div class="faq-a">
            Yes — the MCP-adapter and Tool approaches both work inside LangGraph nodes.
          </div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Python or JavaScript?</div>
          <div class="faq-a">
            Both. The MCP server is language-agnostic; examples here are Python.
          </div>
        </div>
      </div>
    </section>

    <InternalLinks />

    <CtaSection
      heading="Try Posta in your next LangChain agent"
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

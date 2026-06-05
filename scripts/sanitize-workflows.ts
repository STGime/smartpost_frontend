/**
 * sanitize-workflows.ts — copy n8n example workflows into public/ as
 * import-ready templates.
 *
 * Source workflows live in the sibling backend repo (`smartpost_backend/examples`).
 * n8n exports reference credentials by id + name (NO secret values), but for
 * clean public templates we strip:
 *   - `meta.instanceId` (the exporting n8n instance id)
 *   - each node's `credentials.<type>.id` (keep `name` so importers know what to
 *     connect; n8n prompts them to pick their own credential)
 *
 * Run manually whenever a workflow is re-exported:
 *   npx tsx scripts/sanitize-workflows.ts
 * NOT part of the build. Requires smartpost_backend checked out as a sibling dir.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

const SRC = resolve(process.cwd(), '../smartpost_backend/examples')
const OUT = resolve(process.cwd(), 'public/assets/workflows')

// Source filename -> public slug (must match slugs in src/data/workflows.ts)
const MAP: Record<string, string> = {
  'Blog post shared to social media.json': 'blog-to-social-media',
  'Create LinkedIn carousel post from blog post.json': 'blog-to-linkedin-carousel',
  'E-commerce product launch campaign.json': 'product-launch-campaign',
  'YouTube video to social media promotion.json': 'youtube-to-social-media',
}

mkdirSync(OUT, { recursive: true })

for (const [file, slug] of Object.entries(MAP)) {
  const wf = JSON.parse(readFileSync(resolve(SRC, file), 'utf-8'))

  if (wf.meta && typeof wf.meta === 'object') delete wf.meta.instanceId

  for (const node of wf.nodes ?? []) {
    if (node.credentials && typeof node.credentials === 'object') {
      for (const type of Object.keys(node.credentials)) {
        const cred = node.credentials[type]
        if (cred && typeof cred === 'object') delete cred.id
      }
    }
  }

  writeFileSync(resolve(OUT, `${slug}.json`), `${JSON.stringify(wf, null, 2)}\n`, 'utf-8')
  console.log(`[sanitize-workflows] ${file} -> ${slug}.json`)
}

console.log('[sanitize-workflows] Done.')

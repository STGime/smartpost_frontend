/**
 * Produce a BreadcrumbList JSON-LD entry suitable for the `script[]` array of
 * `useHead({ script: [...] })`.
 *
 * BreadcrumbList is what gives a page breadcrumb rich results in Google SERPs,
 * and tells crawlers how the page sits in the site hierarchy. Every marketing
 * page deeper than the homepage should emit one.
 *
 * Usage:
 *   useHead({
 *     script: [
 *       ...,
 *       breadcrumbJsonLd([
 *         { name: 'Home', url: 'https://getposta.app/' },
 *         { name: 'Integrations', url: 'https://getposta.app/integrations' },
 *         { name: 'LangChain', url: 'https://getposta.app/integrations/langchain' },
 *       ]),
 *     ],
 *   })
 */
export interface BreadcrumbItem {
  name: string
  url: string
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: item.name,
        item: item.url,
      })),
    }),
  }
}

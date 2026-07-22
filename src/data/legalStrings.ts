// Single source of truth for company/legal data on the Posta site.
//
// Posta is operated by Eurobase OÜ, an Estonian private limited company
// (osaühing). The legal-notice, terms, and privacy pages all render from
// this module — update here and every legal surface stays in sync.
//
// Company data mirrors what appears on the sister property eurobase.app;
// see /Users/stefangimeson/eurobase/src/data/legalStrings.ts.
//
// IMPORTANT: Eurobase OÜ operates BOTH Eurobase (an EU-sovereign BaaS)
// AND Posta (this product). The two have very different data-sovereignty
// profiles:
//
//   - Eurobase.app is EU-hosted (Scaleway) and markets EU sovereignty.
//   - Posta.app runs on Google Cloud + Supabase (both US-owned), so Posta
//     is NOT EU data-sovereign despite the Estonian operator.
//
// The pages in this project must not claim EU sovereignty for Posta. The
// Estonian operating entity and Estonian governing law are honest facts;
// EU-only hosting is not.

export interface LegalStrings {
  /** Legal entity name (Estonian OÜ). */
  legalEntity: string
  /** Type of legal entity — private limited company (osaühing / OÜ). */
  entityType: string
  /** Registered address of the entity. */
  registeredAddress: string
  /** Estonian commercial-register code (äriregistri kood). */
  registryNumber: string
  /** EU VAT identification number, or a plain marker when unregistered. */
  vatNumber: string
  /** ISO date these v2 documents came into effect. */
  effectiveDate: string
  /** Locked: Estonia. */
  governingLaw: string
  /** Locked: Harju County Court in Tallinn. */
  courtOfJurisdiction: string
  /** Documents version tag rendered in headers. */
  documentVersion: string
  /** Contact addresses referenced from the pages. */
  supportEmail: string
  noticesEmail: string
  dpoEmail: string
  /** ISTS §4 / good-practice fields — B2B reviewers look for them. */
  principalActivity: string
  shareCapital: string
  financialYear: string
  /** Local contact person — Estonian Commercial Code §631 requires one
   *  for OÜs whose board members are non-resident. */
  contactPerson: string
}

export const legalStrings: LegalStrings = {
  legalEntity: 'Eurobase OÜ',
  entityType: 'Private limited company (osaühing / OÜ)',
  registeredAddress: 'Ahtri 12, Tallinn 15551, Estonia',
  registryNumber: '17557586',
  vatNumber: 'Not VAT-registered (below Estonian €40,000 threshold)',
  effectiveDate: '22 July 2026',

  governingLaw: 'the Republic of Estonia',
  courtOfJurisdiction: 'Harju County Court (Harju Maakohus), Tallinn',
  documentVersion: '2.0',

  supportEmail: 'hello@getposta.app',
  noticesEmail: 'hello@getposta.app',
  dpoEmail: 'privacy@getposta.app',

  principalActivity: 'Software as a Service (SaaS) — social media publishing platform',
  shareCapital: '€1',
  financialYear: '1 January – 31 December',
  contactPerson: 'E-Residency Hub OÜ',
}

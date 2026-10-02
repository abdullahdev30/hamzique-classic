# AGENTS.md — Page / Category / Product Flow + Stock Rules

## Context
Extends the existing `ecommerce-store` project (Next.js App Router + Payload CMS 3, single app, `src/app/(app)` = storefront, `src/app/(payload)` = admin/API). Read `src/payload.config.ts`, `src/collections/*`, and `src/blocks/RenderBlocks.tsx` before starting — this spec builds on that architecture, it doesn't replace it.

## Objective
Implement, in order:
1. **Hybrid pages** — created in Payload, then customizable either by hand-coding a template or by editing Payload's layout blocks.
2. **Page-scoped categories** with a hover dropdown in the header nav.
3. **Reordered product-creation flow**: details → variants (color/size/stock) → pages (multi-select) → categories (multi-select, filtered by selected pages) → publish.
4. **Stock-aware UI**: out-of-stock variants become non-selectable; a fully out-of-stock product shows an "Out of Stock" badge.

Work phase by phase. Do not start a phase until the previous one's Definition of Done is met. Stop and flag me if a design decision below conflicts with something already in the codebase.

## Non-Negotiables
- Don't break any currently-published page, product, or route.
- Follow the existing access-control pattern (`user` + `overrideAccess: false` on any query acting on behalf of a logged-in user).
- Any Payload schema change → run `pnpm generate:types` and commit the updated `src/payload-types.ts` in the same commit as the schema change.
- Any change that affects cached content → add or extend a revalidation hook (see `src/collections/Pages/hooks/revalidatePage.ts` and `src/collections/Categories/hooks/revalidateCategories.ts` as reference) — don't rely on default caching alone.
- No new npm dependency without first checking whether the ecommerce plugin, Payload core, or an existing package already covers it.
- Never delete a file in Phase 5 without listing it for human review first (see that phase).

---

## Phase 0 — Audit (do this before writing any feature code)

- Confirm the installed Payload version (`package.json`) and pull up the relationship-field `filterOptions` docs for that exact version — the dynamic sibling-filtering behavior needed in Phase 3 can vary slightly by version. Note the confirmed syntax in your working notes.
- List every file under `src/components/` and `src/blocks/` with zero imports anywhere in `src/` (grep for the component name across the repo, or use an unused-exports tool if one's already in the project).
- Separately, check these specific pairs by actually reading both files (don't assume from the names) and note whether each pair is genuinely distinct or should be merged:
  - `src/components/ProductItem/` vs `src/components/ProductGridItem/`
  - `src/components/CollectionArchive/` vs `src/blocks/ArchiveBlock/`
- **Deliverable:** `audit-report.md` — a short table of unused-file candidates and duplicate-candidates, one line of reasoning each. No deletions yet.

---

## Phase 1 — Pages: Payload-driven + code-customizable

### Design
- Default path stays as-is: a Payload page's `layout` blocks render through `RenderBlocks.tsx` — this must keep working for every page that doesn't opt into a custom template.
- Add a **template override registry**: `src/templates/pageTemplates.ts` exporting a map of `slug → React component`.
- In `src/app/(app)/[slug]/page.tsx`, after fetching the page from Payload: check the registry for `page.slug`.
  - **Match found** → render that custom component instead of `RenderHero` + `RenderBlocks`. Still pull `<title>`/meta from the Payload page's SEO fields, and still respect `_status === 'published'` / draft-mode rules exactly as today.
  - **No match** → fall through to the current block-based rendering, unchanged.
- Result for the editor: create the page in `/admin` first (slug, SEO, nav flag) exactly like today. A developer then either leaves it as pure Payload blocks, or adds one entry to the registry to hand-code that slug's body.

### Files
- NEW `src/templates/pageTemplates.ts`
- NEW `src/templates/<slug>.tsx` (one example custom template, e.g. a lookbook or landing page, to prove the pattern end-to-end)
- MODIFY `src/app/(app)/[slug]/page.tsx`

### Definition of Done
- [ ] A CMS-only page with no registry entry renders exactly as it did before this change.
- [ ] A registered slug renders the custom component, and still shows correct SEO title/description from Payload.
- [ ] `revalidatePage.ts` still fires correctly on publish for both page types.

---

## Phase 2 — Categories: page-scoped + header hover dropdown

### Design
- `Categories.ts` already has a `mainPage` relationship — make it `required: true` if it isn't already, so a category cannot be saved without picking a page.
- The header already resolves published pages + their linked categories (existing `Header/index.tsx` logic). Add a hover-triggered dropdown that reveals that page's category list on top-level nav items that have categories.
- Clicking a category in the dropdown links to the existing `/[pageSlug]/[categorySlug]` route — no backend change needed there, it already filters products to that page+category combination.

### Files
- MODIFY `src/collections/Categories.ts` (`mainPage` → `required: true`, if not already)
- NEW `src/components/Header/NavDropdown.tsx` — hover-triggered, one instance per top-level page nav item
- MODIFY `src/components/Header/index.client.tsx` to mount `NavDropdown` per applicable item

### Definition of Done
- [ ] Creating a category in `/admin` without selecting a page is blocked with a clear validation message.
- [ ] Hovering a page's nav item shows only that page's own categories, not others.
- [ ] Clicking a category navigates to `/[slug]/[category]` and shows that category's products only.

---

## Phase 3 — Products: reordered creation flow

### Design
Reorder `src/collections/Products/index.ts` fields into this sequence (use tabs if the collection is already tabbed, otherwise straight field order):

1. **Details** — existing fields, unchanged (title, slug, description, gallery, price in PKR, discount, sizes, color chart, SEO, etc.)
2. **Variants** — existing ecommerce-plugin variant system (`variantTypes` / `variantOptions` / `variants`, e.g. Color × Size). Confirm the exact inventory field name on a variant (likely `inventory`) and make sure every variant combination the admin adds requires a stock number — don't allow a variant to be saved with an empty stock value.
3. **Pages** — NEW relationship field `pages`, `hasMany: true`, `relationTo: 'pages'`.
4. **Categories** — existing `categories` relationship field, `hasMany: true`. Add a `filterOptions` function that restricts selectable categories to ones whose `mainPage` is among the currently-selected `pages` (read `siblingData.pages`). Confirm against the Phase 0 version notes whether this filters reactively as the admin edits the Pages field pre-save; if the installed version doesn't support that, add a `beforeValidate` hook that rejects any category whose `mainPage` isn't in the product's selected `pages`.
5. **Publish** — existing draft/publish status field, unchanged, stays last in the form.

### Files
- MODIFY `src/collections/Products/index.ts`
- Run `pnpm generate:types` after the schema change

### Definition of Done
- [ ] The admin form walks through Details → Variants → Pages → Categories → Publish in that order.
- [ ] With 0 pages selected, the Categories field has nothing to offer (empty or disabled — your call, note which).
- [ ] With 2 pages selected, Categories shows the union of both pages' categories.
- [ ] A product saves correctly with 2+ pages and 2+ categories attached.
- [ ] Decide and document a migration default for existing products that have no `pages` value yet — e.g. backfill `pages` from each product's current categories' `mainPage`, deduplicated — and note whether this runs as a one-off script or a Payload migration.

---

## Phase 4 — Stock-aware UI

### Design
- Shared helper `src/utilities/getStockStatus.ts`: given a product, returns per-variant availability plus one `isOutOfStock` boolean for the whole product — `true` when the product has variants and every variant's inventory is ≤ 0, or when it has no variants and its own stock is ≤ 0.
- `VariantSelector.tsx`: for each variant option, look up its inventory via the helper. If ≤ 0, render it disabled/greyed and non-clickable — keep it **visible but disabled**, don't hide it, so the shopper can see the option exists but is unavailable.
- `ProductGridItem` and the product detail page: when `isOutOfStock` is true, render an "Out of Stock" badge — reuse `StockIndicator.tsx` if it already accepts a boolean, extend it if not.

### Files
- NEW `src/utilities/getStockStatus.ts`
- MODIFY `src/components/product/VariantSelector.tsx`
- MODIFY `src/components/product/StockIndicator.tsx`
- MODIFY `src/components/ProductGridItem/index.tsx`

### Definition of Done
- [ ] A variant with 0 inventory renders disabled and cannot be clicked/selected.
- [ ] A product where every variant is 0 shows the badge on both the grid card and the detail page.
- [ ] A product with at least one in-stock variant does NOT show the badge, even if other variants are out.
- [ ] A product with no variants at all still respects its own stock field for the badge.

---

## Phase 5 — Folder cleanup

- Using the Phase 0 `audit-report.md`: for each confirmed-unused file, list it for my review before deleting anything.
- For confirmed genuine duplicates, merge into whichever component has the clearer name/location, update every import, and note the merge in the PR description.
- Re-run the full verification checklist (below) after cleanup — a green build and test suite is the only acceptable evidence that nothing load-bearing was removed.

### Definition of Done
- [ ] `pnpm build` succeeds.
- [ ] `pnpm test` (int + e2e) passes.
- [ ] Final folder tree pasted into the PR description.

---

## Verification Checkpoint (run after every phase, not just at the end)
```bash
pnpm generate:types   # only if a Payload schema changed this phase
pnpm build
pnpm test:int
```
Then manually walk the relevant flow once in `/admin` and once on the storefront before starting the next phase.

## Out of Scope — do not touch
- Payment/checkout logic (`src/payments/cashOnDelivery.ts`), currency/country settings.
- Theme tokens or visual design system (`globals.css`, `tailwind.config.mjs`).
- Existing auth flow.

---

## Folder Structure — Consolidated Changes

```
src/
├── collections/
│   ├── Categories.ts                 MODIFY — mainPage: required: true
│   └── Products/index.ts             MODIFY — reorder fields, add `pages` (hasMany → pages),
│                                                add filterOptions/hook on `categories`
├── templates/                        NEW
│   ├── pageTemplates.ts              NEW — slug → component registry
│   └── <slug>.tsx                    NEW — one example custom-coded page
├── app/(app)/[slug]/page.tsx         MODIFY — check registry before falling back to RenderBlocks
├── components/
│   ├── Header/
│   │   ├── NavDropdown.tsx           NEW — hover dropdown of a page's categories
│   │   └── index.client.tsx          MODIFY — mount NavDropdown per nav item
│   ├── product/
│   │   ├── VariantSelector.tsx       MODIFY — disable out-of-stock options
│   │   └── StockIndicator.tsx        MODIFY — accept isOutOfStock, render badge
│   └── ProductGridItem/index.tsx     MODIFY — render badge on card
├── utilities/
│   └── getStockStatus.ts             NEW — shared per-variant + per-product stock logic
└── payload-types.ts                  REGENERATE after Phase 3
```

Files flagged in Phase 0 for possible removal/merge are intentionally **not** listed here — they go in `audit-report.md` for review, not straight into this tree.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

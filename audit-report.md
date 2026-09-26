# Phase 0 Audit Report

## Payload Version And Relationship Filter Notes

| Item | Finding | Reasoning |
| --- | --- | --- |
| Installed Payload version | `payload@3.88.0` | Confirmed from `package.json` and `node_modules/payload/package.json`. |
| Relationship `filterOptions` docs | Official docs: `https://payloadcms.com/docs/fields/relationship` | Docs state `filterOptions` can be a `Where` query or a function. Function args include `blockData`, `data`, `id`, `relationTo`, `req`, `siblingData`, and `user`; return value can be `true`, `false`, or a `Where` query. |
| Installed type syntax | `FilterOptionsFunc<TData> = (options: FilterOptionsProps<TData>) => boolean \| Promise<boolean \| Where> \| Where` | Confirmed in `node_modules/payload/dist/fields/config/types.d.ts`; `siblingData` is present but typed as `unknown`, so Phase 3 should normalize selected relationship IDs carefully. |

## Unused-File Candidates

These files are under `src/components/` or `src/blocks/` and had zero resolved static imports from anywhere in `src/` during the Phase 0 import-resolution scan. No deletion is recommended yet; this is only a review list for Phase 5.

| File | Candidate Type | Reasoning |
| --- | --- | --- |
| `src/blocks/Code/config.ts` | Possibly unused block config | The Code block component is used by `RichText`, but this block config is not registered in the current Pages/Product block arrays. |
| `src/components/AdminBar/index.tsx` | Possibly unused component | Exports an admin bar wrapper, but no `src/` import references this component. |
| `src/components/Cart/CloseCart.tsx` | Possibly unused component | Exports a cart close icon component, but current cart sheet imports and renders other controls instead. |
| `src/components/CategoryTabs/index.tsx` | Possibly unused component | Exports a category tab nav, but `shop/page.tsx` and category pages use their own filtering/list UI. |
| `src/components/Logo/Logo.tsx` | Possibly unused component | Wraps `LogoIcon`, but Header/Footer import `LogoIcon` directly. |
| `src/components/ui/card.tsx` | Possibly unused UI primitive | Defines shadcn-style Card primitives, but no current component imports them. |
| `src/components/ui/pagination.tsx` | Possibly unused UI primitive | Defines pagination primitives, but no current route/component imports them. |
| `src/components/ui/sonner.tsx` | Possibly unused UI primitive | Defines a next-themes based Toaster wrapper, but `src/providers/Sonner.tsx` imports `Toaster` directly from `sonner`. |

## Duplicate-Candidate Review

| Pair | Finding | Reasoning |
| --- | --- | --- |
| `src/components/ProductItem/` vs `src/components/ProductGridItem/` | Genuinely distinct | `ProductItem` renders a horizontal row with optional variant, quantity, and subtotal for orders/cart-like contexts. `ProductGridItem` renders a clickable product card for listing grids with image badges and price summary. They should not be merged as-is. |
| `src/components/CollectionArchive/` vs `src/blocks/ArchiveBlock/` | Not a true duplicate; composition relationship | `ArchiveBlock` is the Payload block renderer that fetches or resolves products and optional intro content. `CollectionArchive` is the presentational grid used by `ArchiveBlock`. They overlap in naming, but the files currently have separate responsibilities. |

## Phase 0 Notes

- I did not find a conflict between `AGENTS.md` and the current code during this audit.
- `src/collections/Categories.ts` already blocks saving without `mainPage` through a custom `validate`, but it does not yet set `required: true`; that belongs to Phase 2, not Phase 0.
- Phase 3 should re-check Payload relationship `filterOptions` behavior before implementing category filtering, as requested in `AGENTS.md`.

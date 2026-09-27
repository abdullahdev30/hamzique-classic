# Phase 0 Audit Report

## Payload Version And Relationship Filter Notes

| Item                              | Finding                                                                                                            | Reasoning                                                                                                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Installed Payload version         | `payload@3.88.0`                                                                                                   | Confirmed from `package.json` and `node_modules/payload/package.json`.                                                                                                                                                     |
| Relationship `filterOptions` docs | Official docs: `https://payloadcms.com/docs/fields/relationship`                                                   | Docs state `filterOptions` can be a `Where` query or a function. Function args include `blockData`, `data`, `id`, `relationTo`, `req`, `siblingData`, and `user`; return value can be `true`, `false`, or a `Where` query. |
| Installed type syntax             | `FilterOptionsFunc<TData> = (options: FilterOptionsProps<TData>) => boolean \| Promise<boolean \| Where> \| Where` | Confirmed in `node_modules/payload/dist/fields/config/types.d.ts`; `siblingData` is present but typed as `unknown`, so Phase 3 should normalize selected relationship IDs carefully.                                       |

## Unused-File Candidates

These files were under `src/components/` or `src/blocks/` and had zero resolved static imports from anywhere in `src/`. They were reviewed and removed in the cleanup pass.

| File                                    | Candidate Type | Reasoning                                                          |
| --------------------------------------- | -------------- | ------------------------------------------------------------------ |
| `src/blocks/Code/config.ts`             | Removed        | Not registered in a Pages/Product block array.                     |
| `src/components/AdminBar/index.tsx`     | Removed        | No static import or Payload admin registration.                    |
| `src/components/Cart/CloseCart.tsx`     | Removed        | The cart uses other close controls.                                |
| `src/components/CategoryTabs/index.tsx` | Removed        | No route imports it.                                               |
| `src/components/Logo/Logo.tsx`          | Removed        | Header/Footer use `LogoIcon` directly.                             |
| `src/components/ui/card.tsx`            | Removed        | No consumer imports these primitives.                              |
| `src/components/ui/pagination.tsx`      | Removed        | No consumer imports these primitives.                              |
| `src/components/ui/sonner.tsx`          | Removed        | The app uses `sonner` directly through `src/providers/Sonner.tsx`. |

## Duplicate-Candidate Review

| Pair                                                               | Finding                                        | Reasoning                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ProductItem/` vs `src/components/ProductGridItem/` | Genuinely distinct                             | `ProductItem` renders a horizontal row with optional variant, quantity, and subtotal for orders/cart-like contexts. `ProductGridItem` renders a clickable product card for listing grids with image badges and price summary. They should not be merged as-is.    |
| `src/components/CollectionArchive/` vs `src/blocks/ArchiveBlock/`  | Not a true duplicate; composition relationship | `ArchiveBlock` is the Payload block renderer that fetches or resolves products and optional intro content. `CollectionArchive` is the presentational grid used by `ArchiveBlock`. They overlap in naming, but the files currently have separate responsibilities. |

## Phase 0 Notes

- I did not find a conflict between `AGENTS.md` and the current code during this audit.
- `src/collections/Categories.ts` already blocks saving without `mainPage` through a custom `validate`, but it does not yet set `required: true`; that belongs to Phase 2, not Phase 0.
- Phase 3 should re-check Payload relationship `filterOptions` behavior before implementing category filtering, as requested in `AGENTS.md`.
- Existing products with category assignments and no `pages` value are backfilled from each category's `mainPage` by the Products `beforeValidate` hook on their next save. A production one-off data migration should run that same deduplicated mapping before making `pages` required in a future release.

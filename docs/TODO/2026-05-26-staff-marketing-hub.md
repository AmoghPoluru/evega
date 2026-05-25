# Staff marketing hub — Digital Marketing & Potential Vendors

**Date:** 2026-05-26  
**Status:** Not started  
**Entry URL:** `http://localhost:3000/staff/tasks` (extend with 2 new modes)  
**Audience:** Staff / BDO (`staffProcedure`, `requireAppAdmin`)

---

## Goal

On the staff console, add **two workflows** beside existing **Vendor Tasks**:

| # | Mode | Purpose |
|---|------|---------|
| 1 | **Digital Marketing** | Pick a vendor → view/edit the same marketing UI vendors see on `/vendor/dashboard` (social URLs + last posted dates + community channels) |
| 2 | **Potential Vendors** | Maintain a staff-only list: **Region** + **names** (multi-line / multiple names per region) for prospecting |

---

## Current state

| Area | Today |
|------|--------|
| `/staff/tasks` | Vendor support tasks only (`vendor-tasks` collection) |
| Staff sidebar | Tasks, Products, Orders, Customers — **no** marketing links |
| Vendor marketing UI | `DigitalMarketingForm.tsx`, `VendorLogoCard.tsx` on `/vendor/dashboard` |
| Vendor API | `vendor.dashboard.getMarketingProfile`, `updateMarketingProfile` (session vendor only) |
| Staff vendor picker pattern | `admin.vendors.listOptions` in `src/modules/admin/server/procedures.ts` (used on staff product create) |
| Potential vendors | **No** collection or UI |

**Reference files**

- Staff layout: `src/app/(app)/staff/layout.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`
- Staff tasks: `src/app/(app)/staff/tasks/page.tsx`
- Vendor form: `src/app/(app)/vendor/dashboard/components/DigitalMarketingForm.tsx`
- Marketing save logic: `src/lib/vendor-marketing-profile.ts`
- Vendor fields: `src/collections/Vendors.ts` (`socialChannels`, `marketingChannels`)
- Prior doc: `docs/TODO/2026-05-25-vendor-digital-marketing.md` (vendor-side done; staff UI outstanding)

---

## Target UX

```mermaid
flowchart TB
  subgraph StaffTasksHub["/staff/tasks"]
    T2[Digital Marketing]
    T3[Potential Vendors]
  end
  VT[/staff/vendor-tasks]
  T2 --> DD[Vendor dropdown]
  DD --> FM[DigitalMarketingForm staff mode]
  FM --> API[admin.marketing.*]
  API --> V[(vendors collection)]
  T3 --> PV[Region + names table]
  PV --> API2[admin.potentialVendors.*]
  API2 --> P[(potential-vendor-regions)]
```

### Left sidebar navigation (not tabs on `/staff/tasks`)

- [x] **Vendor Tasks** → `/staff/tasks` (unchanged)
- [x] **Digital Marketing** → `/staff/digital-marketing`
- [x] **Potential Vendors** → `/staff/potential-vendors`

---

## Data model — Potential Vendors (new)

New collection `potential-vendor-regions` (or `potential-vendors`):

| Field | Type | Notes |
|-------|------|--------|
| `region` | `text` | Required, e.g. `Charlotte`, `Raleigh`, `Triad` |
| `potentialVendors` | `array` of `text` (`name`) | Staff UI: textarea, one name per line → stored as array |
| `order` | `number` | Optional sort in UI |
| `isActive` | `checkbox` | Hide inactive regions from default list |

**Access:** `create/read/update/delete` → staff / super-admin only (no public read).

**Alternative (v1 skip):** Single global JSON on a `site-settings` global — only use if you never need more than one doc.

---

## Phase 1 — Staff hub navigation

- [x] **1.1** Sidebar nav: **Vendor Tasks**, **Digital Marketing**, **Potential Vendors**
- [x] **1.2** Placeholder pages for digital marketing + potential vendors
- [ ] **1.3** Remove tab UI from `/staff/tasks` if reintroduced (use sidebar only)

---

## Phase 2 — Digital Marketing (staff edits any vendor)

### API — `admin.marketing` (or extend `admin` router)

- [x] **2.1** `admin.marketing.getProfile` — input `{ vendorId: string }`, `staffProcedure`
  - `findByID` vendors + depth 1 for logo if needed
  - Return same shape as `vendor.dashboard.getMarketingProfile` (socialChannels + marketingChannels + optional logoId/logoUrl)
- [x] **2.2** `admin.marketing.updateProfile` — input `{ vendorId, ...same body as vendor update }`, `staffProcedure`
  - Reuse `buildSocialChannelsUpdate`, `buildMarketingChannelsUpdate` from `src/lib/vendor-marketing-profile.ts`
  - `ctx.db.update({ collection: 'vendors', id: vendorId, data: { ... }, overrideAccess: true })`
- [x] **2.3** Vendor dropdown on `/staff/digital-marketing` via `admin.vendors.listOptions`

### UI — reuse vendor form in staff mode

- [ ] **2.4** Refactor `DigitalMarketingForm.tsx`:
  - Props: `mode: 'vendor' | 'staff'`, `vendorId?: string` (required when staff)
  - Vendor mode: existing `trpc.vendor.dashboard.*`
  - Staff mode: `trpc.admin.marketing.*` + invalidate on `vendorId` change
- [ ] **2.5** (Optional) `VendorLogoCard` staff variant on same page — staff can set vendor logo
- [ ] **2.6** New `StaffDigitalMarketingPanel.tsx`:
  - Vendor `<Select>` / combobox at top (search by name)
  - Empty state: “Select a vendor to manage digital marketing”
  - When selected → render `DigitalMarketingForm mode="staff" vendorId={...}`
  - Card header copy matches vendor dashboard: *“Your store's social accounts and community groups…”* (adjust pronoun: “This vendor’s …” for staff)
- [ ] **2.7** Wire panel into `/staff/tasks` tab **Digital Marketing**

### Acceptance (Digital Marketing)

- [ ] Staff can select any approved vendor from dropdown
- [ ] Staff sees and edits Instagram, Facebook, WhatsApp URLs, last posted dates, community channels
- [ ] Save updates the **vendor record** (vendor sees changes on their dashboard)
- [ ] Staff cannot access without `requireAppAdmin` / `staffProcedure`

---

## Phase 3 — Potential Vendors (region + names list)

### API — `admin.potentialVendors`

- [x] **3.1** `src/collections/PotentialVendorRegions.ts` — `region` + `potentialVendors[]` (multi text)
- [x] **3.2** Registered in `payload.config.ts`; staff-only access
- [x] **3.3**–**3.6** `list` / `create` / `update` / `delete`
- [x] **3.7** `npm run generate:types`

### UI — two-column editable list

- [x] **3.8** `StaffPotentialVendorsPanel.tsx` on `/staff/potential-vendors`
- [x] **3.9** Table layout:

  | Region | Names |
  |--------|--------|
  | `<Input>` | `<Textarea rows={4}>` placeholder="One name per line" |

- [ ] **3.10** **Add row** button (append empty region)
- [ ] **3.11** Per row: **Save** (if existing id) / **Create** (new), **Delete**
- [ ] **3.12** (Stretch) Inline edit all + single **Save all** mutation
- [ ] **3.13** Show `names` in UI as newline-separated text; split/join on save

### Acceptance (Potential Vendors)

- [ ] Staff can add Charlotte + 10 names, Raleigh + 5 names, etc.
- [ ] Data persists in Payload (not localStorage)
- [ ] List reloads correctly after refresh

---

## Phase 4 — Polish & docs

- [ ] **4.1** Loading / error states on vendor dropdown and both panels
- [ ] **4.2** Confirm staff marketing edits appear on `/vendor/dashboard` for that vendor
- [ ] **4.3** Update `docs/TODO/2026-05-25-vendor-digital-marketing.md` — mark Phase 3 staff UI items done
- [ ] **4.4** (Future) Link potential vendor name → “invite to become vendor” / CRM — out of scope

---

## Files to create / touch (checklist)

| File | Action |
|------|--------|
| `docs/TODO/2026-05-26-staff-marketing-hub.md` | This file |
| `src/app/(app)/staff/tasks/page.tsx` | Tab hub + compose panels |
| `src/app/(app)/staff/tasks/components/StaffVendorTasksPanel.tsx` | Extract tasks |
| `src/app/(app)/staff/tasks/components/StaffDigitalMarketingPanel.tsx` | New |
| `src/app/(app)/staff/tasks/components/StaffPotentialVendorsPanel.tsx` | New |
| `src/app/(app)/vendor/dashboard/components/DigitalMarketingForm.tsx` | `mode` + `vendorId` |
| `src/modules/admin/server/procedures.ts` | `marketing.*`, `potentialVendors.*` |
| `src/collections/PotentialVendorRegions.ts` | New collection |
| `src/payload.config.ts` | Register collection |
| `src/app/(app)/staff/components/AdminSidebar.tsx` | Optional nav links |

---

## Open questions (decide before Phase 2)

1. **Tabs on `/staff/tasks` vs separate URLs?** (Recommendation: tabs + `?tab=` for shareable links.)
2. **Potential vendor `names`:** textarea (one per line) vs Payload `array` of text fields? (Recommendation: textarea + parse lines.)
3. **Digital Marketing:** include **Store logo** card for staff on same view? (Recommendation: yes, same as vendor dashboard.)
4. **Filter vendor dropdown** to `status: approved` only? (Recommendation: yes, with optional “show all”.)

---

## Suggested implementation order

1. Phase 1 — tab shell on `/staff/tasks`  
2. Phase 2 — admin marketing API + refactor form + staff panel  
3. Phase 3 — potential vendors collection + panel  
4. Phase 4 — polish  

---

## Out of scope (this TODO)

- Auto-posting to Facebook / Instagram / WhatsApp  
- `vendor-marketing-posts` post log collection (see `2026-05-25-vendor-digital-marketing.md` Phase 2–3)  
- Converting potential vendor names into `vendors` records automatically  

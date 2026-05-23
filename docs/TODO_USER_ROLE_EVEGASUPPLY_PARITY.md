# Todo: User `role` — EvegaSupply parity

**Goal:** Align Evega `users` with EvegaSupply: a **single required `role` select** (`user` | `vendor` | `buyer` | `admin` | `bdo`), **Payload Admin only for `admin`**, and access checks based on **`user.role`**.

**Reference:** `evegasupply/src/collections/Users.ts` (`role` field + `access.admin`).

---

## 1. Schema & data model (`users` collection)

- [ ] Add **`role`** field: **select**, options matching EvegaSupply:
  - `user` (User), `vendor` (Vendor), `buyer` (Buyer), `admin` (Admin), `bdo` (BDO)
  - **`defaultValue: 'user'`**, **`required: true`**
- [ ] Define **migration mapping** from current Evega data:
  - [ ] `appRole.slug === 'app-admin'` → `role: 'admin'`
  - [ ] `appRole.slug === 'bdo'` (if used) → `role: 'bdo'`
  - [ ] Legacy **`roles`** includes `super-admin` → `role: 'admin'`
  - [ ] User has **`vendor`** relationship → `role: 'vendor'` (resolve conflicts with staff `appRole`)
- [ ] Plan **phase-out** of **`appRole`** / deprecated **`roles`** array (keep read-only temporarily vs remove after migration).
- [ ] **Buyers:** Evega has no `buyers` collection yet. Decide: keep enum value **`buyer`** for future parity, or hide until B2B buyer profiles exist; document the decision.
- [ ] **Admin UI:** hide **`vendor`** / **`vendorRole`** when `role` is `admin` or `bdo` (staff users).

---

## 2. Payload Admin access (EvegaSupply behavior)

- [ ] **`users.access.admin`:** only **`role === 'admin'`** may use Payload Admin (`bdo`, `vendor`, `buyer`, `user` denied).

---

## 3. Access helpers (`src/lib/access.ts`)

- [ ] **`isAppAdmin` / `isSuperAdmin`:** use **`user.role === 'admin'`** (plus temporary legacy mapping during migration if needed).
- [ ] **`isBdo`:** **`user.role === 'bdo'`**
- [ ] **`isAppStaff`:** **`admin`** or **`bdo`** for in-app staff routes (e.g. vendor tasks).
- [ ] **`isVendor`:** align with **`user.role === 'vendor'`** and/or **`vendor`** relationship — **one rule**, documented.
- [ ] **Normal / customer:** typically **`user.role === 'user'`** (and **`buyer`** when that product exists).
- [ ] Retire **`appRole`-slug** checks once **`role`** is canonical.

---

## 4. Session & tRPC

- [ ] **`auth.session`** exposes **`role`** without needing populated `appRole`.
- [ ] Audit procedures that used **`appRole`** or extra **`findByID` depth** for roles; switch to **`user.role`**.

---

## 5. UI (navbar, middleware)

- [ ] Navbar: staff links when **`role`** is `admin` or `bdo`; vendor dashboard when **`role`** is `vendor` (consistent with vendor link rules).
- [ ] **`requireAppAdmin` / staff middleware:** allow **`admin`** + **`bdo`** as required.

---

## 6. Collections & `filterOptions`

- [ ] Staff pickers (assign admin/BDO): **`filterOptions: { role: { in: ['admin', 'bdo'] } }`** on `users` where applicable.
- [ ] **Vendor collections** (`VendorTasks`, `VendorTaskMessages`, etc.): access rules use **`role`** / shared helpers.

---

## 7. Seeds

- [ ] Seeded admin user: **`role: 'admin'`**; stop depending on **`roles`** collection docs for app-level admin/BDO if fully replaced by **`role`**.
- [ ] Update **`seed-core`** / **`seed-app-roles`** strategy: **vendor-only** `roles` rows if **`vendorRole`** stays.

---

## 8. `roles` collection cleanup

- [ ] If **`vendorRole`** remains: keep **`roles`** for **vendor** type only; remove or ignore **app**-type role documents.
- [ ] If **`vendorRole`** is dropped later: revisit whether **`roles`** collection is still needed.

---

## 9. Types, tests, documentation

- [ ] Regenerate **`payload-types`**; update tests that mock **`appRole`**.
- [ ] Cross-link **`DETAILED_TASKS.md`** or implementation notes when work starts.

---

## 10. EvegaSupply-only extras (optional)

- [ ] **Joins** on `users` (`supplierProfile` / `buyerCompanyProfile` style) — only if matching vendor/buyer owner UX is added.
- [ ] **Hooks** sync vendor ↔ user (e.g. `syncAllVendorProfilesForUser`): only if same product behavior is required.

---

## Out of scope (unless explicitly added)

- Full **buyers** collection and B2B flows — tracked separately if/when Evega adds them.

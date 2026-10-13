# Super admin: every organisation, by industry

**Audience:** platform administrators, and engineers changing anything that lists data.

A super admin can always see every company on the platform. Before this change, every list mixed
them together in neutral words. There was no way to tell a hotel's receptionist from a hospital's,
or to look at one industry or one company on its own.

## What a super admin (or reseller) gets

| Where | What |
|---|---|
| **"Viewing" strip** under the header | *All organisations* → an **industry** → one **company**. Every page follows it: data, vocabulary, menus. Viewing City Hospital, the portal reads Patients and Doctors and offers the OPD queue. *Show all* returns to everything |
| **Platform overview** (`/platform`, Admin menu) | Totals; then per industry and per company: staff, people, accounts, visits, check-ins, prescriptions. **View** sets the strip |
| **Staff** | An *Organisation* column (company and industry), roles named in each company's words, and *By industry* chips. **Add Staff** while viewing a company pre-selects it |
| **Writes while viewing one company** | What you add belongs to that company: patients, appointments, staff. Viewing *all* or an *industry*, nothing changes |

A reseller gets the same, limited to the companies it created. Every other role sees no strip and
is unaffected.

## How it works

- The portal adds `scopeTenantId` or `scopeIndustry` to each request (`lib/axios.ts`, from
  `store/platform-scope-store.ts`). These are query parameters, not headers, so no CORS or API
  Gateway change was needed.
- The API (`_resolve_platform_scope`) honours them **for `super_admin` and `reseller` only**, after
  checking that the company exists and, for a reseller, that it is theirs. It then narrows inside
  `get_entity_type_index`, the one function every list goes through. A scope can only **narrow**
  what the login may already see, never widen it.
- Companies and resellers are never hidden by a scope: they are what the strip lists.
- Writes use `acting_tenant()`. It returns the scoped company only for platform roles, and checks
  the role again, so a desk login's writes stay in its own tenant whatever it sends.
- List rows carry `tenantName` / `tenantIndustry` for platform roles only.
- A scope saved in the browser for a company that has since been deleted is answered
  `scopeInvalid`. The portal then drops it and retries, so nobody gets stuck on an empty view.
  `/auth/*` never takes a scope.

Tests: `tests/test_platform_scope.py` (backend) and `store/platform-scope-store.test.ts` (web).

## Good to know

- Records created by a super admin while viewing *All organisations* belong to no company.
  The overview counts them as "belong to no organisation", and they show only under *All*. View the
  company first, then add.
- The header already overflows by about 50 px at exactly 1024 px wide for platform roles. That
  predates this change, and the strip adds no width.

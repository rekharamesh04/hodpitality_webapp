# Pharmacy module — what the screens need from the backend

**Status:** the UI in this repo is a static prototype. Three routes exist and render
`lib/mock/pharmacy.ts`; no pharmacy endpoint is called anywhere. This document is the
contract the prototype was built against, so the API can be written without guessing at
shapes and the screens can be wired without rework.

**Audience:** the backend team building `prescriptions` in `hospitality_lambda.py`, and the
frontend engineer who replaces the mock with real hooks.

---

## 1. What already exists, and what this adds

`prescriptions` was already declared as an `IndustryModule` in `constants/industry.ts` and
granted to `healthcare` — but nothing was ever built behind it. This change fills that gap on
the frontend only.

| Added | Path | Notes |
| --- | --- | --- |
| Worklist | `app/(dashboard)/prescriptions/page.tsx` | Queue-driven table |
| Detail | `app/(dashboard)/prescriptions/[id]/page.tsx` | Clinical / insurance / history / audit |
| Pickup counter | `app/(dashboard)/pickup/page.tsx` | Identity verification and release |
| Types | `types/prescription.ts` | Every shape below |
| Labels & tones | `constants/prescription.ts` | Statuses, queues, severities, ladder |
| Mock data | `lib/mock/pharmacy.ts` | **Delete once hooks exist** |
| Shared UI | `components/prescriptions/*` | Status badge, controlled badge, alert list, stepper |
| Nav | `constants/navigation.ts` | Two entries gated on `module: 'prescriptions'` |
| Vocabulary | `constants/industry.ts` | New `pharmacy` pack |

### One thing to action before release

`constants/industry.ts` now contains a `pharmacy` slug. **The backend allow-lists industry
slugs and answers 400 to anything it does not hold.** The frontend is safe on its own —
`normalizeIndustry` folds an unknown stored value onto the default — but the industry picker
on the company form will offer "Pharmacy" the moment this ships, and saving it would fail.

Add the slug in all three places, as the existing comment in that file requires:

1. `INDUSTRIES` in `hospitality_lambda.py`
2. `constants/industry.ts` (done)
3. `utils/terminology.ts` in the mobile app

Until then, a pharmacy tenant can run on the `healthcare` industry, which already carries the
`prescriptions` module — the screens work, the words just say "Hospital" and "Doctor".

---

## 2. The design decisions the API has to support

Three choices are baked into these screens. Each one implies something about the backend.

### 2.1 Face recognition is one rung of a ladder, not the gate

The pickup screen offers five verification methods as equals: face match, government ID, date
of birth, one-time code, staff attestation. A failed face match offers the next rung rather
than ending the visit.

This is not a UI preference. A biometric false negative — a mask, bad light, a patient who
aged — must never be the thing standing between someone and their medication. The camera also
breaks, and patients decline enrolment.

**What this means for the API:** verification is its own resource with a method and an
outcome (§5.3). It is *not* a boolean on the pickup call, and the pickup endpoint must accept
a release verified by any method.

### 2.2 Nothing identifiable renders before identity is established

The pickup screen masks medication names behind a placeholder until a verification passes.
A counter-facing screen otherwise leaks what the person in front of it is collecting to
everyone queuing behind them.

**What this means for the API:** `GET /pickup/sessions/{id}/prescriptions` must not return
drug names until the session holds a passed verification. If the server sends them early,
the mask is decoration.

### 2.3 The system advises; the pharmacist decides

Clinical alerts never block a fill on their own. Severe and contraindicated alerts require a
recorded override with a reason and a name — the record of judgement, not a silent pass.

**What this means for the API:** the screening result is data, not a veto. The fill endpoint
accepts an override array and rejects a fill whose blocking alerts are unaddressed — with a
422 naming them, not a 403.

---

## 3. Conventions these endpoints must follow

Taken from the existing modules so the pharmacy API behaves like the rest of the product.

- **Base URL** — `NEXT_PUBLIC_API_URL`, the same API Gateway stage as everything else.
- **Auth** — `Authorization: Bearer <Cognito ID token>`, attached by `lib/axios.ts`. A 401
  triggers the shared single-flight refresh; do not invent a module-specific auth path.
- **Tenancy** — `tenant_id` comes from the token. Never accept it in a request body.
- **List envelope** — `{ data, total, page, limit }`. `unwrapList` / `unwrapPage` in
  `lib/axios.ts` already read it.
- **Errors** — real HTTP codes with `{ "error": "..." }`. The axios interceptor lifts that
  string onto `err.backendMessage`, which is what every hook shows the user. A `200` with a
  failure flag in the body will be treated as success.
- **Images** — presign via `POST /uploads/presigned-url`, PUT to S3, then post the `s3_key`.
  Never post base64 to the API. `services/checkin.service.ts` is the working example.
- **Roles** — `constants/roles.ts`. `doctor`/`practitioner` is the pharmacist,
  `nurse`/`assistant` is the technician. Do not add pharmacy-specific role ids; the token's
  `custom:role` is allow-listed backend-side and a new id means migrating live logins.

Add to `API_ENDPOINTS` in `constants/index.ts`:

```ts
PRESCRIPTIONS: '/prescriptions',
PICKUP:        '/pickup',
DRUGS:         '/drugs',
```

And to `QUERY_KEYS`:

```ts
PRESCRIPTIONS:       ['prescriptions'],
PRESCRIPTION_DETAIL: (id: string) => ['prescriptions', id],
PRESCRIPTION_QUEUES: ['prescriptions', 'queues'],
PICKUP_SESSION:      (id: string) => ['pickup', id],
```

---

## 4. Data model

DynamoDB single-table, matching the existing `PK` / `entity_type` convention.

| Entity | PK | entity_type | Notes |
| --- | --- | --- | --- |
| Prescription | `RX#<id>` | `prescription` | The fill record |
| Drug | `DRUG#<ndc>` | `drug` | Reference data, tenant-independent |
| Clinical alert | `RX#<id>` / `ALERT#<id>` | `clinical_alert` | Child of the prescription |
| Claim | `RX#<id>` / `CLAIM#<id>` | `insurance_claim` | One row per submission attempt |
| Representative | `PATIENT#<id>` / `REP#<id>` | `authorized_rep` | Child of the patient |
| Face enrolment | `PATIENT#<id>` | `face_enrollment` | Template id only — never the image |
| Pickup session | `PICKUP#<id>` | `pickup_session` | Short-lived; TTL after ~2h |
| Verification | `PICKUP#<id>` / `VERIFY#<id>` | `verification_attempt` | Including failures |
| Audit event | `AUDIT#<date>` / `<ts>#<id>` | `audit_event` | Append-only |

The patient is **not** a new entity. It is the existing guest record (`GUEST#<id>`), which
already carries `face_enrolled` and `face_photo_url`. `Prescription.patientId` is a guest id.
Adding a parallel patient table would split the person in two.

Field-by-field shapes are in `types/prescription.ts` — treat that file as the schema.

Three fields to get right:

- **`status`** is a closed union (§6). Unlike a guest `category`, this is the product's own
  state machine, not tenant vocabulary, so it must be validated on write.
- **`drug.schedule`** — `none | CII | CIII | CIV | CV`. Drives what the counter is allowed to
  do, so it has to be on every prescription payload, not looked up separately.
- **`alerts[].overriddenBy` / `overrideReason`** — never null on an overridden alert. This is
  the audit answer to "why was this dispensed anyway".

---

## 5. Endpoints

### 5.1 Prescriptions

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/prescriptions` | The worklist |
| `GET` | `/prescriptions/{id}` | Detail — **writes an audit event** |
| `POST` | `/prescriptions` | Manual intake (paper, phone, fax) |
| `PATCH` | `/prescriptions/{id}` | Data entry corrections |
| `POST` | `/prescriptions/{id}/verify` | Pharmacist verification → `filling` |
| `POST` | `/prescriptions/{id}/hold` | → `on_hold`, reason required |
| `POST` | `/prescriptions/{id}/cancel` | → `cancelled`, reason required |
| `POST` | `/prescriptions/{id}/ready` | → `ready`, assigns a will-call bin |
| `POST` | `/prescriptions/{id}/return-to-stock` | Reverses the claim too |
| `POST` | `/prescriptions/{id}/transfer` | Out to another pharmacy |
| `GET` | `/prescriptions/queues` | Counts per queue, for the tiles |
| `GET` | `/prescriptions/{id}/history` | Previous fills of the same Rx |

`GET /prescriptions` query parameters — all of these are applied **server-side**. The
worklist currently filters in the browser because it reads a fixed mock; at real volume a
pharmacy has thousands of rows and the `FULL_LIST_LIMIT = 1000` trick used by the check-ins
page will quietly truncate the list.

```
queue=intake|review|insurance|problem|filling|ready|closed
status=<PrescriptionStatus>      repeatable
search=<patient|rxNumber|drug|ndc|prescriber>
prescriberNpi=<npi>
source=<PrescriptionSource>
controlledOnly=true
page=1&limit=25
sort=severity|waiting|created     default: severity then waiting
```

The default sort matters: the screen orders by worst unresolved alert, then longest waiting.
That is the "what should I pick up next" question, and it cannot be answered correctly from
one page of results if the server sorts differently.

`GET /prescriptions/queues` returns the tile counts in one call:

```json
{ "all": 128, "intake": 14, "review": 9, "insurance": 6,
  "problem": 11, "filling": 22, "ready": 58, "closed": 8 }
```

### 5.2 Clinical screening

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/prescriptions/{id}/screen` | Run screening, persist the alerts |
| `POST` | `/prescriptions/{id}/alerts/{alertId}/override` | Record a pharmacist's decision |
| `POST` | `/prescriptions/{id}/notes` | Pharmacist note on the fill |

Screening runs against the patient's active medications, allergies, age and fill history, and
raises the kinds in `AlertKind`: interaction, allergy, duplicate therapy, dose range, age,
pregnancy, early refill, quantity.

Override request:

```json
{ "reason": "Prescriber confirmed INR monitoring weekly; patient advised to stop OTC NSAIDs." }
```

A reason under a few meaningful characters should be rejected with 422. An override with no
reason is not a record of judgement.

`POST /prescriptions/{id}/verify` must return **422** — not 403 — when unaddressed severe or
contraindicated alerts remain, listing them:

```json
{ "error": "Unresolved blocking alerts",
  "alerts": [{ "id": "al-4", "severity": "contraindicated", "title": "Second opioid within 30 days" }] }
```

403 would mean the pharmacist lacks permission. They do not: they have not finished the work.

### 5.3 Identity verification

This is the part most likely to be built wrongly, so it is spelled out.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/pickup/sessions` | Open a session for a patient |
| `GET` | `/pickup/sessions/{id}` | Current state, including verification status |
| `POST` | `/pickup/sessions/{id}/verify` | Attempt one rung of the ladder |
| `GET` | `/pickup/sessions/{id}/prescriptions` | **Gated on a passed verification** |
| `POST` | `/pickup/sessions/{id}/release` | Complete the handover |
| `POST` | `/pickup/sessions/{id}/abandon` | Walked away — closes the session |

`POST /pickup/sessions/{id}/verify` takes one method per call:

```jsonc
// face — s3_key, following the existing facial check-in contract
{ "method": "face", "s3_key": "uploads/face_pickup/<uuid>.jpg", "subject": "patient" }

// government ID
{ "method": "government_id", "idType": "drivers_license", "idLast4": "4417", "state": "CA" }

// date of birth
{ "method": "date_of_birth", "value": "1958-03-14" }

// one-time code
{ "method": "one_time_code", "code": "448201" }

// staff attestation — reason mandatory
{ "method": "staff_attestation", "reason": "Known to this pharmacy for eight years." }
```

Response, whatever the method:

```json
{ "attemptId": "v-2", "outcome": "verified", "method": "face",
  "confidence": 96.8, "threshold": 92,
  "sessionVerified": true, "at": "2026-09-24T18:22:04Z", "by": "T. Nkemelu, CPhT" }
```

Rules:

1. **A failed attempt is a `200` with `outcome: "failed"`, not a `4xx`.** A below-threshold
   face match is a normal, expected event at a pharmacy counter — the operator moves to the
   next rung. Only a malformed request, an unreadable image or a missing session is an error
   status. This differs from the existing `/check-ins/facial-recognition` endpoint, which
   returns 404 for "no match"; that is right for an unattended kiosk and wrong here.
2. **Every attempt is persisted, failures included.** A pattern of failed attempts against
   one patient is exactly what a later review needs to see. The verification trail in the
   side rail renders this list.
3. **`sessionVerified` is the server's decision, never the client's.** The mask is a
   courtesy; the gate is `GET .../prescriptions` refusing to return drug names.
4. **The threshold is configuration, not a constant.** `DEFAULT_FACE_MATCH_THRESHOLD = 92` in
   `constants/prescription.ts` is a placeholder. Serve it per tenant from pharmacy settings
   and return it on every face response so the UI can show "96.8% vs 92% threshold".
5. **Controlled substances require a photo-ID check at handover regardless** of how identity
   was verified earlier. The release call carries that separately (§5.5).

### 5.4 Face enrolment

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/patients/{id}/face` | Enrol from an `s3_key` |
| `DELETE` | `/patients/{id}/face` | Delete the template |
| `GET` | `/patients/{id}/face` | State only — never the template |
| `POST` | `/patients/{id}/face/opt-out` | Record a refusal |

`GET /guests/{id}/face` already exists in spirit — `services/guest.service.ts` enrols and
unenrols a guest face for check-in. **Reuse it.** A second face store for the same person
means two templates to keep in step and two things to delete on a deletion request.

Four requirements:

- **Opt-out is a first-class state**, not an absent record. `FaceEnrollmentState` has
  `opted_out` so the pickup screen can say "this patient opted out" rather than "not
  enrolled" — a different conversation at the counter.
- **Enrolment needs recorded notice and consent**, with a timestamp and the text version
  shown. Store it alongside the template.
- **`DELETE` deletes the template and the source image**, not just a flag. A patient asking
  for their face to be removed is asking for the biometric to be gone.
- **Retention is a policy field**, not "forever". Templates for patients with no activity for
  N months should expire to `expired`, which the UI already renders.

### 5.5 Representatives and release

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/patients/{id}/representatives` | List |
| `POST` | `/patients/{id}/representatives` | Add, with scope and expiry |
| `PATCH` | `/patients/{id}/representatives/{repId}` | Edit |
| `DELETE` | `/patients/{id}/representatives/{repId}` | Revoke — soft, keep the history |

The release call:

```json
{ "prescriptionIds": ["rx-3", "rx-5"],
  "collectedBy": { "type": "representative", "representativeId": "rep-1" },
  "counsellingOffered": true,
  "counsellingAccepted": false,
  "photoIdChecked": true,
  "payment": { "method": "card", "amount": 12.00 } }
```

The server re-checks, and does not trust the client's filtering:

- the session is verified;
- the representative is `active` and not past `expiresOn`;
- `scope: 'listed'` covers every requested Rx number;
- `allowControlled` is true if any item is controlled;
- `photoIdChecked` is true if any item is controlled;
- every prescription is `ready` and belongs to this patient.

Any failure is a **409** naming the specific prescription, so the counter can drop that one
item and release the rest rather than losing the whole transaction.

On success: each prescription moves to `picked_up`, a payment row is written through the
existing `/payments` module, and one audit event is written **per prescription released**.

### 5.6 Insurance

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/prescriptions/{id}/claim` | Submit |
| `POST` | `/prescriptions/{id}/claim/reverse` | Reverse on return-to-stock |
| `GET` | `/prescriptions/{id}/claim` | Latest response |
| `POST` | `/prescriptions/{id}/prior-auth` | Open a PA case |

Store the NCPDP reject code as well as the readable reason — `75` (prior auth), `79` (refill
too soon), `70` (not covered). Staff learn the codes and search on them.

### 5.7 Audit

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/audit` | Filter by patient, prescription, actor, action, date |
| `GET` | `/prescriptions/{id}/audit` | This record's trail |

**Reads are events too.** The point of the log is to answer "who saw this patient's record",
which a write-only log cannot. `GET /prescriptions/{id}` writes an audit event.

Log at minimum: login and failed login; patient lookup; prescription view, create, modify,
cancel; clinical override with reason; face enrol, delete, opt-out; every verification
attempt including failures; release; claim submit and reverse; representative change;
permission change; any export.

Append-only. No endpoint may edit or delete an audit row.

---

## 6. Status model

```
received → data_entry → clinical_review → insurance → filling → ready → picked_up
```

Off the line, at any point: `problem`, `on_hold`, `cancelled`, `expired`, `transferred`,
`returned_to_stock`.

`PRESCRIPTION_PIPELINE` in `constants/prescription.ts` is the happy path; `isExceptionStatus`
tells the stepper to draw an interruption instead of progress. Collapsing the two would make
"on hold" look like forward movement.

Validate transitions server-side. The UI will not offer an illegal one, but the UI is not a
security boundary — the same rule the existing `module` gating comment makes about nav items.

---

## 7. Integrations

Put each behind an interface. Every one of these gets replaced at some point, and a pharmacy
switching PBM vendors should not be a rewrite.

| Concern | What it does | Note |
| --- | --- | --- |
| e-Prescribing | Inbound e-Rx | Certification is a lead-time item — start early |
| Drug database | NDC, interactions, allergies, dosing | Licensed data. **Do not hand-roll** |
| Claims / PBM | NCPDP D.0 claims | Per-plan BIN/PCN routing |
| Face matching | Enrol, match, delete | AWS Rekognition is already in use for check-in |
| State PDMP | Controlled-substance history | Per-state, mandatory in most |
| Payments | Copays and refunds | Existing `/payments` module |
| Notifications | Ready, delayed, refill due | PHI-aware (§8) |

The clinical alert shapes in `types/prescription.ts` are vendor-neutral on purpose — map the
vendor's response onto `ClinicalAlert` at the boundary rather than letting their field names
reach the UI.

---

## 8. Compliance requirements that shape the code

Not a legal review — these are the ones with direct engineering consequences. Get the actual
requirements confirmed with counsel, particularly the state-specific biometric ones.

**HIPAA.** A pharmacy is typically a covered entity. Encrypt PHI at rest and in transit,
enforce minimum-necessary access by role, keep the audit trail, and have a BAA with every
vendor that touches PHI — including the face-matching provider and any analytics tool.

**Biometric privacy is state-specific and stricter than HIPAA alone.** Illinois BIPA and
Texas CUBI impose written-notice-and-consent requirements, retention schedules and, in
Illinois, a private right of action. Build notice text, consent timestamp, retention period
and deletion as fields from day one; they are close to impossible to backfill.

**Notifications carry PHI.** "Your prescription is ready" plus a phone number is protected
information. Make message templates configurable, default to naming no medication, and record
the patient's channel preference and consent.

**No third-party trackers on authenticated pages.** HHS has warned specifically that tracking
technologies on pages behind a login can disclose PHI, including prescription and billing
information. Keep analytics off `/prescriptions`, `/prescriptions/*` and `/pickup` unless it
is self-hosted and covered by the risk analysis.

**Controlled substances** bring their own layer: DEA rules on electronic prescribing, PDMP
reporting, ID checks at handover, and stricter audit retention.

---

## 9. Suggested build order

**Phase 1 — a pharmacy can actually run on it.** Prescription CRUD and the status machine;
worklist with server-side filtering, sorting and paging; detail page; face enrol / verify /
delete reusing the guest face store; the full verification ladder; representatives; the
pickup session and release flow; audit logging including reads; RBAC and MFA.

Note what is *not* in Phase 1: insurance. A pharmacy cannot go live without claims, but the
identity and dispensing flow can be built and tested against cash pricing first, and claims
are the piece with the longest vendor lead time.

**Phase 2 — the things that make it economic.** Claims submission and rejection handling;
prior authorization; e-prescribing intake; drug database and the real interaction engine;
refill requests; notifications; payment integration; transfers.

**Phase 3 — scale and polish.** Multi-location; inventory; adherence and med sync; PDMP;
operational analytics; OCR-assisted fax and paper intake; the patient-facing app.

---

## 10. Replacing the mock

When the API lands:

1. Add `services/prescription.service.ts` and `services/pickup.service.ts`, following
   `services/checkin.service.ts` — especially its presign-then-post-`s3_key` image handling.
2. Add `hooks/usePrescriptions.ts` and `hooks/usePickup.ts`, following
   `hooks/useCheckins.ts` — including its per-status-code error mapping, which is the pattern
   the verification ladder needs.
3. Export both from `hooks/index.ts`.
4. Replace the `MOCK_*` imports in the three pages with those hooks, and add the
   loading / error / empty branches the other pages already have (`TableSkeleton`,
   `ErrorState`, `EmptyState`).
5. Delete `lib/mock/pharmacy.ts`. Nothing else imports it, so the compiler will point at
   every place that still has to change.
6. Replace each `notWired(...)` call with the real mutation. Searching for `notWired` finds
   every unimplemented action in the module.

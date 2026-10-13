# Hospital (healthcare) module: requirements, screens and flow

**Status:** built and live. The backend is deployed to `hospitality-app` (ap-south-1). The web
screens ship with the next Amplify build of this repo. `healthcare` is now the fourth industry
that can be chosen in the company form, after pharmacy, wellness and hospitality.

**Audience:** product, the desk-training lead, and the engineers who will extend the module.
Section 2 is written as business-analyst requirements. Section 5 maps each requirement to the
code that implements it.

---

## 1. The problem

An outpatient department (OPD) runs on one question: **who does each doctor see next?**

The product already answered "who is booked" (the calendar) and "who walked in" (check-ins).
Neither answers the OPD's question:

- The patient booked for 10:00 who arrives at 10:40 is behind the walk-in who arrived at 10:05.
- An emergency is ahead of both.
- A patient recognised at the entrance by face, with no appointment, is in the building and on
  nobody's list.

Pharmacy, spa and hotel each got a flagship screen for their core loop. A hospital had only the
vocabulary (Patient, Doctor, Hospital). This module gives it the screen.

## 2. Requirements

### 2.1 Personas

| Persona | Role id | Uses |
|---|---|---|
| Receptionist | `receptionist`, `staff` | Registers, books, checks in, takes walk-ins, takes payment |
| Nurse | `nurse` / `assistant` | Triage: vitals and priority |
| Doctor | `doctor` / `practitioner` | Their own queue, calls patients in, prescribes, ends consultations |
| Hospital admin | `company_admin` | Everything above; reopens a closed consultation |
| Patient | none | Has no login. Sees a token on the waiting-room screen |

No new role ids. A new id would mean migrating live Cognito logins (see `constants/roles.ts`).

### 2.2 The hospital day, end to end

```
 Register patient ─► Book appointment ─► Arrive ─► Triage ─► Queue ─► Consult ─► Prescribe ─► Pay ─► Pharmacy
   /guests            /calendar         face, QR,  (nurse)   token    doctor      /prescriptions   /payments  /pickup
                      (walk-ins skip)   desk, or            order    in-progress
                                        walk-in
```

| # | Step | Where | What happens to the record |
|---|---|---|---|
| 1 | Register | `/guests` | Patient row created; optional face photo (webcam **or smart glasses**) with consent |
| 2 | Book (optional) | `/calendar`, or "Book appointment" on the queue | Appointment `scheduled` for a doctor and slot |
| 3a | Arrive by face/QR | Entrance kiosk `/check-ins`, or "Check in by face" on the queue | Check-in row. The patient's next open booking today becomes `arrived` with `arrivedAt` stamped, which is their **token** |
| 3b | Arrive at the desk | Queue → patient → **Check in** | The same, through `POST /check-ins` with the appointment id |
| 3c | Walk-in | Queue → **Walk-in** | An appointment is booked for *now* with the chosen doctor, then the patient is checked in. One action |
| 3d | Recognised, no booking | Queue → "Checked in, no doctor yet" → **Assign** | As 3c, but the existing check-in is reused, so no second visit is logged |
| 4 | Triage | Queue → patient → **Triage** | `triage` (BP, pulse, temperature °F, SpO₂, weight, complaint) and `visitPriority` stored on the appointment |
| 5 | Call in | Lane → **Call next**, or patient → **Call in** | `in-progress`, with `consultStartedAt` stamped (so waiting time is measured) |
| 6 | Prescribe | Patient → **Write prescription** | Prescription form opens with the patient and the consulting doctor pre-filled, and the prescription is linked to this consultation (`appointmentId`). The visit then lists *Prescribed this visit*; the pharmacy fills it at `/pickup` |
| 7 | End consultation | Patient → Update Status → **End session…** | `completed` or `incomplete`, and the fee in the same step. Only an admin can reopen |
| 8 | Pay | Patient → **Record payment**, or `/payments` | Consultation payment against the patient |
| 9 | Pharmacy | `/pickup` | Existing collection counter (healthcare already had the prescriptions module) |
| 10 | Leave | `/check-ins` checkout, or the nightly sweep | Check-in closed |

A booking whose day passes without an arrival is closed as `no-show`. The backend does this the
next time the patient checks in, or the desk can mark it.

### 2.3 Functional requirements and acceptance criteria

**FR-1 Queue per doctor.** One lane per doctor with visits on the chosen date, each showing:
- *With doctor*
- *Waiting* (in calling order)
- *Booked, not arrived*
- *Seen*, plus *cancelled / no-show* (collapsed)

- AC: visits with no doctor get their own lane, last, flagged amber.
- AC: a doctor signing in sees **their own lane** by default (matched by email to their staff
  row), and can switch to everyone.

**FR-2 Tokens.** A patient's token is their position in the arrival order for that doctor, that day.
- AC: the token never changes once given. A cancellation or no-show does not renumber anyone
  behind them.
- AC: arrival time is stamped by the server once and cannot be edited through any endpoint.

**FR-3 Calling order.** Waiting patients are ordered Emergency, then Urgent, then Routine, then by
token.
- AC: triage priority overrides the patient's standing category for this visit.
- AC: before triage, a patient registered as *Emergency* is treated as an emergency, and one
  the industry flags as priority (tier *Priority*) as urgent.

**FR-4 Call next.** One button per lane calls the first waiting patient in.
- AC: it is disabled, with the reason shown, while the doctor still has someone in, when nobody is
  waiting, and on any date other than today.
- AC: a specific patient can still be called in directly.

**FR-5 Triage.** BP, pulse, temperature, SpO₂, weight and complaint. Every field is optional.
- AC: implausible readings are refused with the allowed range, e.g. pulse 20–250, SpO₂ 50–100,
  temperature 90–110 °F, and BP written as `120/80`.
- AC: who recorded it and when are kept. Choosing Emergency moves the patient to the front.

**FR-6 Walk-ins.** Patient, doctor, optional service and fee, priority and complaint, in one dialog.
- AC: two walk-ins for the same doctor in the same minute both succeed. The API reserves one slot
  per doctor per minute, so the second moves to the next free minute.
- AC: a patient already on site is not checked in a second time.

**FR-7 Unassigned arrivals.** Anyone checked in today, still on site, with no live booking, is
listed with **Assign**.

**FR-8 Live board.** Today's board refreshes every 15 s while visible, and wait times tick every
30 s. Other dates are read-only for queue actions.

**FR-9 Wait time.** Shown per waiting patient, amber from 30 min and red from 60 min. The header
shows average wait (arrival → called in) and the longest current wait.
- AC: a patient with no recorded arrival time shows "—", never 0.

**FR-10 Emergency alert.** A red banner lists every emergency still waiting, with token and doctor.

**FR-11 Waiting-room display.** A full-screen board for a TV: per doctor, the token now being seen
and the next four.
- AC: **tokens only, no names or the word "Emergency"** on the public screen. Urgency is shown
  by colour alone.

**FR-12 Clinical safety.** Allergy notes are shown in an amber "read before treating" block on the
selected patient, and flagged in the lane as *allergy*.

**FR-13 Closed consultations stay closed.** Only a company admin can reopen or change a completed or
incomplete consultation. This now also holds for `PUT /appointments/{id}`, which previously let the
desk bypass the rule.

**FR-14 Smart glasses.** Every face step (registration photo, enrol, find by face, face check-in,
pharmacy face verification, OPD face check-in) offers **Smart glasses** next to the webcam. See
[SMART_GLASSES_WEB.md](SMART_GLASSES_WEB.md).

### 2.4 Non-functional

- **Tenant isolation:** unchanged. Every read is the existing tenant-scoped list. Every write goes
  through an existing guarded endpoint, except the glasses relay, which is scoped to one *user*.
- **Module gating:** `/opd` belongs to the new `opd` module, which is granted to `healthcare` and
  `other`. The page refuses to render for any other industry (`ModuleGate`). The API's route gate
  covers `opd` too. `ENFORCE_INDUSTRY_MODULES` is **on** in the live function, so that gate is real.
- **Privacy:** the waiting-room screen shows no names. The relay's upload file names carry a
  request id, never a patient name.
- **Phones:** the board works at 390 px wide with no horizontal scroll. The bottom tab bar shows
  *Queue*.

## 3. Screens

### 3.1 OPD Queue (`/opd`)

```
┌ Workflow trail: 1 Register · 2 Book · [3 OPD Queue] · 4 Prescriptions · 5 Pharmacy · 6 Payments ┐
│ OPD Queue                         [date] [⟳] [Waiting-room display] [Book] [Check in by face] [Walk-in] │
│ Doctor: (Everyone) (Dr Rao (me)) (Dr Singh) …                                                    │
│ [Waiting 4] [With doctor 2] [Seen 2] [Not arrived 2] [Average wait 34m] [Longest wait now 64m]  │
│ ⚠ 1 emergency patient waiting — Token 5 · Suresh Patel for Dr Rao                                │
│ ⚠ Checked in, no doctor yet:  Anil Gupta 07:49 · Facial Recognition            [Assign]          │
│ ┌ Dr Asha Rao · OPD 1 ─────────── [Call next] ┐  ┌ Dr Leela Menon · Paediatrics ─ [Call next] ┐  │
│ │ WITH DOCTOR   (2) Ravi Kumar · triaged       │  │ WITH DOCTOR  (2) Baby Aarav                 │  │
│ │ WAITING       (5) Suresh Patel EMERGENCY 12m │  │ WAITING      Queue is clear.                │  │
│ │               (4) Fatima Sheikh URGENT  38m  │  │ Show 1 seen                                 │  │
│ │               (3) Meena Iyer · triaged  64m  │  └─────────────────────────────────────────────┘  │
│ │ BOOKED        15:30 Kavya Nair               │                                                   │
│ └──────────────────────────────────────────────┘                                                   │
│ ┌ Token 5 · Suresh Patel · EMERGENCY · Waiting ───────────────────────────────────── [Close] ┐   │
│ │ ⚠ Allergies — read before treating: Penicillin — anaphylaxis                                │   │
│ │ Triage: not triaged yet          Arrived 07:46 · Waiting 12 min · Room OPD 1 · Fee 500       │   │
│ │ [Call in] [Triage] [Update Status ▾] [Record payment] [Patient record] [Payment records]     │   │
│ └─────────────────────────────────────────────────────────────────────────────────────────────┘   │
```

Actions offered on the selected patient, by stage:

| Stage | Actions |
|---|---|
| Not arrived (today only) | Check in · Update Status (cancel, no-show) |
| Waiting | **Call in** · Triage · Update Status · Record payment |
| With doctor | **Write prescription** · Update triage · Update Status → End session · Record payment |
| Seen | Write prescription · **Record payment** if fee outstanding · Reopen (admin) |

### 3.2 Dialogs

- **Walk-in / Assign a doctor:** patient (search, or link to register), doctor, service, fee,
  priority (three buttons), complaint → *Add to queue*.
- **Triage:** priority, BP, pulse, temperature, SpO₂, weight, complaint → *Save triage*.
- **Check in by face:** the shared camera dialog, with webcam, upload or *Smart glasses*.

### 3.3 Waiting-room display

A dark full-screen overlay with the clock, then one card per doctor: name, room, **Token N** in
large type, and *Next* tokens. Opened from the queue, it shares the queue's live polling.
Browser full-screen is one click, and Esc closes it.

## 4. Gaps found and closed

| Gap | Before | Now |
|---|---|---|
| Arrival by hand had no time | Marking a booking *arrived* by status alone left `arrivedAt` blank, so the patient had no place in the queue | The server stamps `arrivedAt` on first arrival however it happens, and `consultStartedAt` on call-in |
| Arrival time was editable | `PUT /appointments/{id}` copied any field, including `arrivedAt` and `sessionClosedBy` | Server-stamped fields are ignored on PUT |
| Closed consultation could be rewritten | The status route enforced admin-only reopen; PUT did not | PUT applies the same rule |
| Triage temperature 98.6 | PUT did not convert floats, so DynamoDB rejected the whole write | Values are converted to Decimal |
| Emergency invisible to the list | The appointment list carried names only | The list adds `customerCategory`, `customerTier`, `allergyNotes` and an `isPriority` computed in the tenant's own vocabulary |
| Face-recognised walk-in on nobody's list | Invisible to every doctor | "Checked in, no doctor yet" with Assign |
| Two walk-ins in one minute | The second got 409 from the slot lock | Retries the next minute, up to 5 |
| `in-progress` read "Arrived" | Calendar and mobile labelled a patient with the doctor as arrived, or grey | Labelled *In progress* on web and mobile |
| Prescription not tied to the visit | The backend stored `appointmentId`, but the form never sent it | Sent from the OPD, but only while the patient is unchanged; the visit shows its prescriptions |
| Healthcare not selectable | Vocabulary only, no screens, disabled in the picker | Workflow, flagship screen, enabled |

## 5. Where it lives

| Concern | File |
|---|---|
| Queue rules (stages, tokens, order, waits, walk-in slots, vitals limits) | `constants/opd.ts`, tested in `constants/opd.test.ts` |
| Actions (check in, call in, triage, walk-in) | `hooks/useOpd.ts` |
| Page | `app/(dashboard)/opd/page.tsx` |
| Dialogs and display | `components/opd/*` |
| Module, nav, workflow | `constants/industry.ts`, `constants/navigation.ts`, `constants/workflow.ts` |
| Backend stamps, PUT guard, list enrichment | `hospitality_lambda.py`: `STAGE_STAMPS`, `SERVER_STAMPED_APPOINTMENT_FIELDS`, `_enrich_with_names(with_person_flags=True)` |
| Backend tests | `tests/test_hospital_opd.py` |
| Vocabulary parity | `python check_industry_parity.py` (all three copies identical) |

## 5a. US practice model: the patient's pharmacy, the kiosk, and checkout

Added after the October 2026 review with Rekha and Ramesh.

**The patient's own pharmacy.** In the US the doctor's office and the pharmacy are separate
providers; a CVS on the ground floor is not the hospital's. So:

- A patient has a **preferred pharmacy**, set on their record (patient page → *Preferred pharmacy*),
  chosen from the platform's pharmacy directory (`GET /pharmacies`).
- **Write prescription** offers **Send to pharmacy**, defaulting to that pharmacy. An existing
  prescription has *Send to the patient's pharmacy* on its page.
- Sending (`POST /prescriptions/{id}/send`) gives the pharmacy **its own copy** in its own company:
  - the patient is matched by email, then phone, or created at the pharmacy;
  - the copy goes into the pharmacy's worklist as *From City Hospital*;
  - a notification goes to the pharmacy.

  Its pickup counter and payments work unchanged. Tenant isolation is untouched: neither side reads
  the other's records.
- The hospital's prescription shows **Sent → Collected / Cancelled**, reported back when the
  pharmacy hands it over.
- Only a typed, active prescription can be sent, once, and only to a live pharmacy.

**Reception kiosk** (`/kiosk`, menu *Reception Kiosk*). An iPad at the entrance, signed in by
staff, full screen with no portal menus. The patient taps *Start* and scans their face, and the
kiosk decides from today's records:

| Their situation | The kiosk |
|---|---|
| Not checked in | Checks them in, then shows the doctor and **token** |
| Checked in, waiting or with the doctor | "You're already checked in" |
| Consultation finished | **Checkout**: the fee, then *Pay by card* / *Pay at the reception desk*; checks them out |
| Face not recognised | "Please see the reception desk" |

Only the first name appears on screen. Results clear after 12 s. *Staff* (top right) leaves kiosk
mode. Lock the iPad to the browser with iOS **Guided Access**.

**Checkout fee.** The visit's own fee when one was set (a booked consultation, a co-pay), otherwise
the organisation's **standard visit fee** (Settings → Organization → *Checkout & billing*,
default **100**). Insurance is not calculated. *Insurance — coming soon* is shown disabled, and
payments carry `payer: "self"`, ready for a payer integration. **There is no card-terminal
integration yet:** *Pay by card* records the fee as paid by card on the clinic's existing terminal.
A payment gateway plugs in at one function (`payByCard` in the kiosk page).

**Workflow.** The last hospital step is now **Payment & checkout**.

## 6. Not built yet, deliberately

Each needs a decision or data the product does not have yet. The queue works without them.

1. **Hospital number (UHID/MRN).** A sequential, human-readable patient number needs a
   server-side counter per tenant. The record id is not fit to read aloud.
2. **Inpatient admission, wards and beds.** `Inpatient` exists as a category, but there is no
   admission, transfer or discharge record. This is its own module.
3. **Lab and radiology orders** from the consultation, and their results on the patient record.
   Results can be attached today as documents.
4. **Visitor passes for admitted patients** (who is visiting whom, visiting hours).
5. **Queue announcements:** a chime and spoken token on the display, and SMS when a token is 3
   away. This needs a PHI-safe template and channel consent.
6. **Insurance / TPA** pre-authorisation and claims.
7. **The same queue in the staff mobile app.** Today the mobile app carries the vocabulary and
   the glasses Desk Link. A doctor's own queue on the phone is the obvious next screen.

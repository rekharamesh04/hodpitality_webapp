# HeyCyan smart glasses in the web portal

**Short answer:** the portal cannot talk to the glasses directly, and no browser can. It *can*
use them through the staff member's own Android phone, and that is what is built.

## 1. Why not directly

The mobile app's native module (`modules/heycyan-glasses` in the mobile repo) shows how the glasses
deliver a photo:

1. **Bluetooth LE** command to the vendor SDK (`glassesControl` `0x02 0x01 0x01`) fires the shutter.
2. The photo stays on the glasses. The phone sends *transfer mode*, then forms a **Wi-Fi Direct
   (P2P) group** with the glasses.
3. The phone downloads the newest JPEG over **plain HTTP** from the glasses' P2P address
   (`http://<ip>/files/...`).

| Step | Possible in a browser? |
|---|---|
| BLE command | Partly. Web Bluetooth exists in desktop Chrome and Edge only (not Safari, Firefox or iOS). It would need the vendor's proprietary framing re-implemented from an Android `.aar` |
| Wi-Fi Direct group | **No.** There is no Wi-Fi Direct API on the web |
| `http://` download from a LAN address | **No.** An HTTPS page may not fetch it (mixed content and private-network rules) |

Web Bluetooth alone could take a photo the browser can never retrieve. So a direct integration is
not possible, and the relay below is the only reliable design.

## 2. How it works: the phone as relay

```
 Web portal (desk PC)                 Backend (hospitality-app)            Android phone (same user)
 ────────────────────                 ─────────────────────────            ─────────────────────────
 [Smart glasses] clicked ──POST /glasses-captures──► pending
                                      inbox[user] = request   ◄──GET /glasses-captures/next (every 3 s)
                                                              ──► request
                                      capturing ◄──POST …/{id}/claim (atomic)
                                                                     3-2-1 countdown → BLE shutter →
                                                                     Wi-Fi Direct copy → S3 upload
                                      captured  ◄──POST …/{id}/complete {s3_key}
 polls GET …/{id} every 2 s ─────────►  s3_key + signed photoUrl
 fetches photo → JPEG data URL
 → the SAME enrol / check-in / lookup it does with a webcam photo
```

The portal hands the photo to the existing face flow unchanged, so duplicate-face handling,
consent, the match threshold and check-in rules all apply exactly as they do for a webcam photo.

### Rules the backend enforces

- **Per user.** A request is only ever offered to the phone signed in as the *same* Cognito user.
  Anyone else gets 404 for it.
- **One at a time.** A new request cancels the user's unfinished one, so a stale photo never
  arrives.
- **Atomic claim.** A conditional write means two phones cannot both take the same request.
- **Expiry.** A request must be picked up within 2 min and finished within 3 min of the claim, or
  it reads `expired`. No clean-up job is needed.
- **Key ownership.** The completed key must be an image this tenant uploaded
  (`uploads/<tenant>/…`, `.jpg`/`.png`, not `documents/`).
- **No industry gate.** Glasses are a desk accessory for any industry.

Endpoints: `POST /glasses-captures`, `GET /glasses-captures/next`, `GET /glasses-captures/{id}`,
`POST /glasses-captures/{id}/claim|complete|fail|cancel|received`. They reach the Lambda through the
existing Cognito-authorised `{proxy+}` resource, so **no API Gateway change was needed**.

## 3. Using it

**Phone (once per shift):** EntryFlow app → **Profile → Smart Glasses → Desk Link** → connect the
glasses → **Start Desk Link**. Keep the screen open and the phone unlocked. Wi-Fi must be on; no
network has to be joined.

**Portal:** sign in as the same person. On any photo step choose **Smart glasses**. The dialog
shows *Waiting for your phone…*, then *Your phone is taking the photo — look at the person now*.
The photo then appears for review like a webcam capture, and *Submit* continues as normal.

Where it appears:
- registration photo
- Enrol Face (patient and account pages, and the list)
- Find by face
- Check-ins → facial check-in
- Pharmacy pickup → face verification
- OPD Queue → Check in by face

## 4. Failure handling

| Situation | What the portal says | What to do |
|---|---|---|
| Desk Link not open | "Your phone did not pick this up…" (after 2 min) | Open Desk Link on the phone |
| Glasses busy (recording, transferring, updating) | The native message, e.g. "The glasses are recording video." | Finish that, then *Try again* |
| Glasses disconnected | Desk Link returns to Connect on the phone | Reconnect |
| Capture or transfer slow | "The photo took too long…" (3 min after the claim) | Keep the glasses close to the phone |
| Cancelled on either side | Dialog returns to the webcam | — |

The phone deletes its copy of the photo as soon as it has uploaded it or given up.

## 5. Limits and follow-ups

- **Android only**, in builds that include the native module (not Expo Go, not iOS). That is a
  property of the vendor SDK.
- **The phone screen must stay open.** Polling stops in the background. A foreground service or
  push wake-up would lift this, and is the natural next step.
- Once the portal has the photo it calls `POST /glasses-captures/{id}/received`, and the backend
  deletes the phone's upload (a face is biometric data; the portal keeps only what it re-uploads
  through its own flow). A capture the portal never fetches still leaves its upload behind.
- The mobile `glasses-photo` screen still carries its own copy of the connect step.
  `components/GlassesConnectPanel.tsx` is that step as a component. Move the screen onto it the
  next time someone can test with a pair of glasses in hand.
